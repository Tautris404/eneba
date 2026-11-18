package orders

import "errors"

var (
	errInvalidDigitalKeyEncryptionKey = errors.New("DIGITAL_KEY_ENCRYPTION_KEY must be a base64-encoded 32-byte key")
	errMissingDigitalKeyEncryptionKey = errors.New("DIGITAL_KEY_ENCRYPTION_KEY is required to decrypt purchased keys")
	errDecryptDigitalKey              = errors.New("could not decrypt digital key")
	errMissingStripeReturnBaseURL     = errors.New("STRIPE_RETURN_BASE_URL is required")
	errInvalidStripeReturnBaseURL     = errors.New("STRIPE_RETURN_BASE_URL must be an absolute HTTP or HTTPS URL without credentials, a query or a fragment")
	errMissingStripeSecretKey         = errors.New("STRIPE_SECRET_KEY is required")
	errInvalidStripeSecretKey         = errors.New("STRIPE_SECRET_KEY must be a Stripe secret or restricted API key")
	errMissingStripeWebhookSecret     = errors.New("STRIPE_WEBHOOK_SECRET is required")
	errInvalidStripeWebhookSecret     = errors.New("STRIPE_WEBHOOK_SECRET must be a Stripe webhook signing secret")
	errInvalidStripeWebhook           = errors.New("invalid stripe webhook")
	errStripePaymentMismatch          = errors.New("stripe payment does not match the order")
	errOrderNotPayable                = errors.New("order is no longer payable")
	errCheckoutUnavailable            = errors.New("could not start stripe checkout")
	errInvalidOrderID                 = errors.New("invalid order id")
	errOrderNotFound                  = errors.New("order not found")
	errInvalidItems                   = errors.New("order must contain between 1 and 50 units with valid offer ids and quantities")
	errInvalidDiscount                = errors.New("invalid discount code")
	errExpiredDiscount                = errors.New("discount code has expired")
	errUnavailable                    = errors.New("offer has insufficient available stock")
)

const (
	logOrderError              = "orders: %v"
	msgOrderError              = "could not complete order request"
	logReservationCleanupError = "release expired order reservations: %v"
	msgCheckoutSessionError    = "checkout session %s: %w"
)
