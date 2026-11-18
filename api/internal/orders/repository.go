package orders

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) beginCheckoutOrder(ctx context.Context, userID, firstOfferID int64, items []requestedItem, duration time.Duration, discountPercent int) (pgx.Tx, checkoutOrder, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, checkoutOrder{}, err
	}
	order, err := prepareCheckoutOrder(ctx, tx, userID, firstOfferID, items, duration, discountPercent)
	if err != nil {
		_ = tx.Rollback(ctx)
		return nil, checkoutOrder{}, err
	}
	return tx, order, nil
}

func prepareCheckoutOrder(ctx context.Context, tx pgx.Tx, userID, firstOfferID int64, items []requestedItem, duration time.Duration, discountPercent int) (checkoutOrder, error) {
	order, err := insertOrder(ctx, tx, userID, firstOfferID, duration)
	if err != nil {
		return checkoutOrder{}, err
	}
	for _, item := range items {
		if err := reserveOffer(ctx, tx, order.ID, item, discountPercent, order.ExpiresAt); err != nil {
			return checkoutOrder{}, err
		}
	}
	err = tx.QueryRow(ctx, `
		SELECT (COALESCE(sum(unit_price), 0) * 100)::bigint
		FROM order_items
		WHERE order_id = $1
	`, order.ID).Scan(&order.Cents)
	return order, err
}

func insertOrder(ctx context.Context, tx pgx.Tx, userID, firstOfferID int64, duration time.Duration) (checkoutOrder, error) {
	var order checkoutOrder
	err := tx.QueryRow(ctx, `
		INSERT INTO orders (user_id, title, expires_at)
		SELECT $1, p.name, date_trunc('second', statement_timestamp()) + make_interval(secs => $3)
		FROM offers o
		JOIN products p ON p.id = o.product_id
		WHERE o.id = $2
		RETURNING id, title, expires_at
	`, userID, firstOfferID, duration.Seconds()).Scan(&order.ID, &order.Title, &order.ExpiresAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return checkoutOrder{}, errUnavailable
	}
	return order, err
}

func reserveOffer(ctx context.Context, tx pgx.Tx, orderID int64, item requestedItem, discountPercent int, reservedUntil time.Time) error {
	var price string
	err := tx.QueryRow(ctx, `
		UPDATE offers SET quantity = quantity - $2
		WHERE id = $1 AND quantity >= $2
		RETURNING round(COALESCE(discounted_price, price) * (100 - $3::integer) / 100, 2)::text
	`, item.OfferID, item.Quantity, discountPercent).Scan(&price)
	if errors.Is(err, pgx.ErrNoRows) {
		return errUnavailable
	}
	if err != nil {
		return err
	}

	for range item.Quantity {
		if err := reserveOrderKey(ctx, tx, orderID, item.OfferID, price, reservedUntil); err != nil {
			return err
		}
	}
	return nil
}

func reserveOrderKey(ctx context.Context, tx pgx.Tx, orderID, offerID int64, price string, reservedUntil time.Time) error {
	result, err := tx.Exec(ctx, `
		WITH available_key AS (
			SELECT id FROM digital_keys
			WHERE offer_id = $2 AND NOT sold AND order_item_id IS NULL
			ORDER BY id LIMIT 1 FOR UPDATE
		), item AS (
			INSERT INTO order_items (order_id, offer_id, unit_price)
			SELECT $1, $2, $3::text::numeric
			FROM available_key
			RETURNING id
		)
		UPDATE digital_keys SET order_item_id = item.id, reserved_until = $4
		FROM available_key, item
		WHERE digital_keys.id = available_key.id
	`, orderID, offerID, price, reservedUntil)
	if err == nil && result.RowsAffected() == 0 {
		return errUnavailable
	}
	return err
}

func commitCheckoutOrder(ctx context.Context, tx pgx.Tx, orderID int64, sessionID, checkoutURL string) error {
	_, err := tx.Exec(ctx, `
		UPDATE orders
		SET stripe_checkout_session_id = $2, stripe_checkout_url = $3
		WHERE id = $1
	`, orderID, sessionID, checkoutURL)
	if err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func (r *Repository) completeCheckout(ctx context.Context, sessionID string, amount int64, currency string) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	var orderID, expectedAmount int64
	err = tx.QueryRow(ctx, `
		UPDATE orders o SET is_paid = true, stripe_checkout_url = NULL
		WHERE o.stripe_checkout_session_id = $1 AND NOT o.is_paid
		RETURNING o.id, (
			SELECT (COALESCE(sum(i.unit_price), 0) * 100)::bigint
			FROM order_items i WHERE i.order_id = o.id
		)
	`, sessionID).Scan(&orderID, &expectedAmount)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil
	}
	if err != nil {
		return err
	}
	if amount != expectedAmount || currency != "eur" {
		return errStripePaymentMismatch
	}
	if err := sellReservedKeys(ctx, tx, orderID); err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func sellReservedKeys(ctx context.Context, tx pgx.Tx, orderID int64) error {
	_, err := tx.Exec(ctx, `
		WITH sold_keys AS (
			UPDATE digital_keys k SET sold = true, reserved_until = NULL
			FROM order_items i
			WHERE i.order_id = $1 AND k.order_item_id = i.id AND NOT k.sold
			RETURNING k.offer_id
		), quantities AS (
			SELECT o.product_id, count(*) AS sold_count
			FROM sold_keys k JOIN offers o ON o.id = k.offer_id
			GROUP BY o.product_id
		), locked_products AS (
			SELECT p.id FROM products p JOIN quantities q ON q.product_id = p.id
			ORDER BY p.id FOR UPDATE OF p
		)
		UPDATE products p SET sold_count = p.sold_count + q.sold_count
		FROM locked_products l JOIN quantities q ON q.product_id = l.id
		WHERE p.id = l.id
	`, orderID)
	return err
}

func (r *Repository) expireCheckout(ctx context.Context, sessionID string) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	var orderID int64
	err = tx.QueryRow(ctx, `
		UPDATE orders
		SET stripe_checkout_url = NULL
		WHERE stripe_checkout_session_id = $1
		RETURNING id
	`, sessionID).Scan(&orderID)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil
	}
	if err != nil {
		return err
	}
	if err := releaseCheckoutKeys(ctx, tx, orderID); err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func releaseCheckoutKeys(ctx context.Context, tx pgx.Tx, orderID int64) error {
	_, err := tx.Exec(ctx, `
		WITH locked_offers AS (
			SELECT o.id FROM offers o
			WHERE o.id IN (SELECT offer_id FROM order_items WHERE order_id = $1)
			ORDER BY o.id FOR UPDATE
		), released AS (
			UPDATE digital_keys k SET order_item_id = NULL, reserved_until = NULL
			FROM locked_offers o, order_items i
			WHERE i.order_id = $1 AND k.offer_id = o.id AND k.order_item_id = i.id
			RETURNING k.offer_id
		), quantities AS (
			SELECT offer_id, count(*) AS released_count FROM released GROUP BY offer_id
		)
		UPDATE offers o SET quantity = o.quantity + q.released_count
		FROM quantities q WHERE o.id = q.offer_id
	`, orderID)
	return err
}

func (r *Repository) listUserOrders(ctx context.Context, userID int64) ([]orderSummary, error) {
	rows, err := r.db.Query(ctx, `
		SELECT o.id, o.created_at,
			CASE
				WHEN o.is_paid THEN 'paid'
				WHEN o.expires_at <= statement_timestamp() THEN 'cancelled'
				ELSE 'pending'
			END,
			o.title, 'Stripe'::text AS payment_method, COALESCE(sum(i.unit_price), 0)::float8
		FROM orders o
		LEFT JOIN order_items i ON i.order_id = o.id
		WHERE o.user_id = $1
		GROUP BY o.id
		ORDER BY o.created_at DESC, o.id DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	return pgx.CollectRows(rows, pgx.RowToStructByPos[orderSummary])
}

func (r *Repository) findUserOrder(ctx context.Context, userID, orderID int64) (orderDetails, []orderedProductRow, error) {
	tx, err := r.db.BeginTx(ctx, pgx.TxOptions{IsoLevel: pgx.RepeatableRead, AccessMode: pgx.ReadOnly})
	if err != nil {
		return orderDetails{}, nil, err
	}
	defer tx.Rollback(ctx)

	order, err := findOrderDetails(ctx, tx, userID, orderID)
	if err != nil {
		return orderDetails{}, nil, err
	}
	products, err := findOrderedProducts(ctx, tx, order.ID, order.Status == "paid")
	if err != nil {
		return orderDetails{}, nil, err
	}
	return order, products, tx.Commit(ctx)
}

func findOrderDetails(ctx context.Context, tx pgx.Tx, userID, orderID int64) (orderDetails, error) {
	var order orderDetails
	err := tx.QueryRow(ctx, `
		SELECT o.id, o.created_at,
			CASE
				WHEN o.is_paid THEN 'paid'
				WHEN o.expires_at <= statement_timestamp() THEN 'cancelled'
				ELSE 'pending'
			END,
			'Stripe'::text AS payment_method, COALESCE(sum(i.unit_price), 0)::float8 AS total,
			CASE
				WHEN NOT o.is_paid AND o.expires_at > statement_timestamp() THEN o.stripe_checkout_url
			END
		FROM orders o
		LEFT JOIN order_items i ON i.order_id = o.id
		WHERE o.user_id = $1 AND o.id = $2
		GROUP BY o.id
	`, userID, orderID).Scan(&order.ID, &order.Date, &order.Status, &order.PaymentMethod, &order.TotalAmount, &order.CheckoutURL)
	if errors.Is(err, pgx.ErrNoRows) {
		return orderDetails{}, errOrderNotFound
	}
	return order, err
}

func findOrderedProducts(ctx context.Context, tx pgx.Tx, orderID int64, paid bool) ([]orderedProductRow, error) {
	rows, err := tx.Query(ctx, `
		SELECT p.cover_image_url, p.name, i.unit_price::float8, s.name, k.key_ciphertext
		FROM order_items i
		JOIN offers f ON f.id = i.offer_id
		JOIN products p ON p.id = f.product_id
		JOIN sellers s ON s.id = f.seller_id
		LEFT JOIN digital_keys k ON $2 AND k.order_item_id = i.id AND k.sold
		WHERE i.order_id = $1
		ORDER BY i.id
	`, orderID, paid)
	if err != nil {
		return nil, err
	}
	return pgx.CollectRows(rows, pgx.RowToStructByPos[orderedProductRow])
}

func (r *Repository) findDiscount(ctx context.Context, code string) (discountResponse, error) {
	var discount discountResponse
	var expired bool
	err := r.db.QueryRow(ctx, `
		SELECT discount_percent, expires_at IS NOT NULL AND expires_at <= statement_timestamp()
		FROM discount_codes WHERE lower(code) = lower($1)
	`, code).Scan(&discount.DiscountPercent, &expired)
	if errors.Is(err, pgx.ErrNoRows) {
		return discountResponse{}, errInvalidDiscount
	}
	if err != nil {
		return discountResponse{}, err
	}
	if expired {
		return discountResponse{}, errExpiredDiscount
	}
	return discount, nil
}

func (r *Repository) releaseExpired(ctx context.Context) error {
	// Locking offers to avoid deadlocks
	_, err := r.db.Exec(ctx, `
		WITH locked_offers AS (
			SELECT o.id FROM offers o
			WHERE EXISTS (
				SELECT 1 FROM digital_keys k
				JOIN order_items i ON i.id = k.order_item_id
				JOIN orders ord ON ord.id = i.order_id
				WHERE k.offer_id = o.id AND NOT k.sold AND k.reserved_until <= statement_timestamp()
					AND NOT ord.is_paid AND ord.stripe_checkout_session_id IS NULL
			)
			ORDER BY o.id FOR UPDATE OF o
		), released AS (
			UPDATE digital_keys k SET order_item_id = NULL, reserved_until = NULL
			FROM locked_offers o, order_items i JOIN orders ord ON ord.id = i.order_id
			WHERE k.offer_id = o.id AND NOT k.sold AND k.reserved_until <= statement_timestamp()
				AND k.order_item_id = i.id AND NOT ord.is_paid AND ord.stripe_checkout_session_id IS NULL
			RETURNING k.offer_id
		), quantities AS (
			SELECT offer_id, count(*) AS released_count FROM released GROUP BY offer_id
		)
		UPDATE offers o SET quantity = o.quantity + q.released_count
		FROM quantities q WHERE o.id = q.offer_id
	`)
	return err
}

func (r *Repository) findOverdueCheckoutSessions(ctx context.Context) ([]string, error) {
	rows, err := r.db.Query(ctx, `
		SELECT o.stripe_checkout_session_id
		FROM orders o
		WHERE o.expires_at <= statement_timestamp() AND NOT o.is_paid
			AND o.stripe_checkout_session_id IS NOT NULL
			AND EXISTS (
				SELECT 1 FROM order_items i
				JOIN digital_keys k ON k.order_item_id = i.id
				WHERE i.order_id = o.id AND NOT k.sold
			)
		ORDER BY o.expires_at, o.id
	`)
	if err != nil {
		return nil, err
	}
	return pgx.CollectRows(rows, pgx.RowTo[string])
}
