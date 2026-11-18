package orders

import (
	"context"
	"fmt"
	"log"
	"sort"
	"strings"
	"time"

	stripe "github.com/stripe/stripe-go/v87"
)

const (
	checkoutDuration = 35 * time.Minute
	cleanupInterval  = 10 * time.Minute
	maxOrderItems    = 50
)

type Service struct {
	repo      *Repository
	stripe    stripeCheckout
	keyCipher digitalKeyCipher
}

func NewService(repo *Repository) (*Service, error) {
	checkout, err := newStripeCheckout()
	if err != nil {
		return nil, err
	}
	keyCipher, err := newDigitalKeyCipher()
	if err != nil {
		return nil, err
	}
	return &Service{repo: repo, stripe: checkout, keyCipher: keyCipher}, nil
}

func (s *Service) create(ctx context.Context, userID int64, input orderRequest) (orderResponse, error) {
	items, err := normalizeItems(input.Items)
	if err != nil {
		return orderResponse{}, err
	}
	var discount discountResponse
	if input.DiscountCode != nil {
		discount, err = s.validateDiscount(ctx, *input.DiscountCode)
		if err != nil {
			return orderResponse{}, err
		}
	}
	return s.createCheckoutOrder(ctx, userID, input.Items[0].OfferID, items, discount.DiscountPercent)
}

func normalizeItems(items []requestedItem) ([]requestedItem, error) {
	total := 0
	quantities := make(map[int64]int)
	for _, item := range items {
		if item.OfferID <= 0 || item.Quantity < 1 || item.Quantity > maxOrderItems-total {
			return nil, errInvalidItems
		}
		total += item.Quantity
		quantities[item.OfferID] += item.Quantity
	}
	if total == 0 {
		return nil, errInvalidItems
	}
	normalized := make([]requestedItem, 0, len(quantities))
	for id, quantity := range quantities {
		normalized = append(normalized, requestedItem{OfferID: id, Quantity: quantity})
	}
	sort.Slice(normalized, func(i, j int) bool {
		return normalized[i].OfferID < normalized[j].OfferID
	})
	return normalized, nil
}

func (s *Service) createCheckoutOrder(ctx context.Context, userID, firstOfferID int64, items []requestedItem, discountPercent int) (orderResponse, error) {
	tx, order, err := s.repo.beginCheckoutOrder(ctx, userID, firstOfferID, items, checkoutDuration, discountPercent)
	if err != nil {
		return orderResponse{}, err
	}
	defer tx.Rollback(ctx)

	if order.Cents < 50 {
		return orderResponse{}, errOrderNotPayable
	}
	session, err := s.stripe.createSession(ctx, order)
	if err != nil {
		return orderResponse{}, fmt.Errorf("%w: %v", errCheckoutUnavailable, err)
	}
	if err := commitCheckoutOrder(ctx, tx, order.ID, session.ID, session.URL); err != nil {
		return orderResponse{}, err
	}
	return orderResponse{ID: order.ID, CheckoutURL: session.URL}, nil
}

func (s *Service) list(ctx context.Context, userID int64) ([]orderSummary, error) {
	return s.repo.listUserOrders(ctx, userID)
}

func (s *Service) details(ctx context.Context, userID, orderID int64) (orderDetails, error) {
	order, rows, err := s.repo.findUserOrder(ctx, userID, orderID)
	if err != nil {
		return orderDetails{}, err
	}
	order.OrderedProducts = make([]orderedProduct, 0, len(rows))
	for _, row := range rows {
		key, err := s.keyCipher.decryptDigitalKey(row.KeyCiphertext)
		if err != nil {
			return orderDetails{}, err
		}
		order.OrderedProducts = append(order.OrderedProducts, orderedProduct{
			ImageURL: row.ImageURL, Name: row.Name, Price: row.Price, Seller: row.Seller, Key: key,
		})
	}
	return order, nil
}

func (s *Service) validateDiscount(ctx context.Context, code string) (discountResponse, error) {
	code = strings.TrimSpace(code)
	if code == "" {
		return discountResponse{}, errInvalidDiscount
	}
	return s.repo.findDiscount(ctx, code)
}

func (s *Service) handleStripeWebhook(ctx context.Context, payload []byte, signature string) error {
	session, err := s.stripe.webhookSession(payload, signature)
	if err != nil || session == nil {
		return err
	}
	return s.applyCheckoutSession(ctx, session)
}

func (s *Service) applyCheckoutSession(ctx context.Context, session *stripe.CheckoutSession) error {
	switch {
	case session.Status == stripe.CheckoutSessionStatusComplete && session.PaymentStatus == stripe.CheckoutSessionPaymentStatusPaid:
		if err := s.repo.completeCheckout(ctx, session.ID, session.AmountTotal, string(session.Currency)); err != nil {
			return fmt.Errorf(msgCheckoutSessionError, session.ID, err)
		}
	case session.Status == stripe.CheckoutSessionStatusExpired && session.PaymentStatus == stripe.CheckoutSessionPaymentStatusUnpaid:
		return s.repo.expireCheckout(ctx, session.ID)
	}
	return nil
}

func (s *Service) ReleaseExpiredReservations(ctx context.Context) {
	ticker := time.NewTicker(cleanupInterval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			queryCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
			err := s.releaseExpiredReservations(queryCtx)
			cancel()
			if err != nil {
				log.Printf(logReservationCleanupError, err)
			}
		}
	}
}

func (s *Service) releaseExpiredReservations(ctx context.Context) error {
	if err := s.repo.releaseExpired(ctx); err != nil {
		return err
	}
	sessionIDs, err := s.repo.findOverdueCheckoutSessions(ctx)
	if err != nil {
		return err
	}
	for _, id := range sessionIDs {
		session, err := s.stripe.retrieveSession(ctx, id)
		if err == nil {
			err = s.applyCheckoutSession(ctx, session)
		}
		if err != nil {
			log.Printf(logReservationCleanupError, fmt.Errorf(msgCheckoutSessionError, id, err))
		}
		if ctx.Err() != nil {
			return ctx.Err()
		}
	}
	return nil
}
