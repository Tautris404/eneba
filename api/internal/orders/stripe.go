package orders

import (
	"context"
	"encoding/json"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	stripe "github.com/stripe/stripe-go/v87"
	"github.com/stripe/stripe-go/v87/webhook"
)

type stripeCheckout struct {
	client        *stripe.Client
	returnBase    string
	webhookSecret string
}

type stripeCheckoutSession struct {
	ID  string
	URL string
}

func newStripeCheckout() (stripeCheckout, error) {
	returnBase := strings.TrimSpace(os.Getenv("STRIPE_RETURN_BASE_URL"))
	if returnBase == "" {
		return stripeCheckout{}, errMissingStripeReturnBaseURL
	}
	if !validStripeReturnBaseURL(returnBase) {
		return stripeCheckout{}, errInvalidStripeReturnBaseURL
	}

	secret := strings.TrimSpace(os.Getenv("STRIPE_SECRET_KEY"))
	if secret == "" {
		return stripeCheckout{}, errMissingStripeSecretKey
	}
	webhookSecret := strings.TrimSpace(os.Getenv("STRIPE_WEBHOOK_SECRET"))
	if webhookSecret == "" {
		return stripeCheckout{}, errMissingStripeWebhookSecret
	}

	return stripeCheckout{
		client:        stripe.NewClient(secret),
		returnBase:    strings.TrimRight(returnBase, "/"),
		webhookSecret: webhookSecret,
	}, nil
}

func (s stripeCheckout) webhookSession(payload []byte, signature string) (*stripe.CheckoutSession, error) {
	event, err := webhook.ConstructEvent(payload, signature, s.webhookSecret)
	if err != nil {
		return nil, errInvalidStripeWebhook
	}

	switch event.Type {
	case stripe.EventTypeCheckoutSessionCompleted, stripe.EventTypeCheckoutSessionExpired:
		if event.Data == nil {
			return nil, errInvalidStripeWebhook
		}
		var session stripe.CheckoutSession
		if err := json.Unmarshal(event.Data.Raw, &session); err != nil || session.ID == "" {
			return nil, errInvalidStripeWebhook
		}
		return &session, nil
	default:
		return nil, nil
	}
}

func (s stripeCheckout) retrieveSession(ctx context.Context, sessionID string) (*stripe.CheckoutSession, error) {
	ctx, cancel := context.WithTimeout(ctx, 15*time.Second)
	defer cancel()
	return s.client.V1CheckoutSessions.Retrieve(ctx, sessionID, nil)
}

func validStripeReturnBaseURL(value string) bool {
	base, err := url.Parse(value)
	return err == nil && (base.Scheme == "http" || base.Scheme == "https") &&
		base.Hostname() != "" && base.User == nil && !strings.ContainsAny(value, "?#")
}

func (s stripeCheckout) createSession(ctx context.Context, order checkoutOrder) (stripeCheckoutSession, error) {
	id := strconv.FormatInt(order.ID, 10)
	// Return to payment confirmation after a successful payment.
	successURL := s.returnBase + "/payment/accept/" + id + "?payment=success"
	// The cart is emptied before the redirect to Stripe, so a cancelled payment returns to the homepage.
	cancelURL := s.returnBase + "/"
	params := &stripe.CheckoutSessionCreateParams{
		Mode:                      stripe.String(string(stripe.CheckoutSessionModePayment)),
		AllowedPaymentMethodTypes: []*string{stripe.String("card")},
		SuccessURL:                stripe.String(successURL),
		CancelURL:                 stripe.String(cancelURL),
		ClientReferenceID:         stripe.String(id),
		Metadata:                  map[string]string{"order_id": id},
		ExpiresAt:                 stripe.Int64(order.ExpiresAt.Unix()),
		LineItems: []*stripe.CheckoutSessionCreateLineItemParams{{
			PriceData: &stripe.CheckoutSessionCreateLineItemPriceDataParams{
				Currency:   stripe.String("eur"),
				UnitAmount: stripe.Int64(order.Cents),
				ProductData: &stripe.CheckoutSessionCreateLineItemPriceDataProductDataParams{
					Name: stripe.String(order.Title),
				},
			},
			Quantity: stripe.Int64(1),
		}},
	}
	params.SetIdempotencyKey("eneba-order-" + id + "-" + strconv.FormatInt(order.ExpiresAt.Unix(), 10))
	ctx, cancel := context.WithTimeout(ctx, 15*time.Second)
	defer cancel()

	session, err := s.client.V1CheckoutSessions.Create(ctx, params)
	if err != nil {
		return stripeCheckoutSession{}, err
	}
	if session.ID == "" || session.URL == "" {
		return stripeCheckoutSession{}, errCheckoutUnavailable
	}
	return stripeCheckoutSession{ID: session.ID, URL: session.URL}, nil
}
