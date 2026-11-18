package auth

import "errors"

const (
	LogLogoutError  = "logout: %v"
	MsgLogoutFailed = "could not log out"
)

var ErrInvalidEmail = errors.New("invalid email address")

// register
const (
	MsgRegisterFailed       = "could not register user"
	LogRegisterError        = "register user: %v"
	LogCleanupError         = "clean expired confirmations: %v"
	MsgEmailDelivery        = "could not send the confirmation email, please try again"
	SubjectConfirmationCode = "Your email confirmation code: %s"
)

var (
	ErrEmailTaken                 = errors.New("email is already registered")
	ErrConfirmationPending        = errors.New("registration is already pending for this email")
	ErrInvalidCode                = errors.New("the confirmation code is invalid or has expired")
	ErrConfirmationAttempts       = errors.New("too many incorrect confirmation attempts")
	ErrResendTooSoon              = errors.New("please wait 30 seconds before requesting another code")
	ErrConfirmationEmailLimit     = errors.New("confirmation email limit reached")
	ErrCodeRepeated               = errors.New("generated code matches the current code")
	ErrConfirmationMissing        = errors.New("registration was not found or has expired")
	ErrConfirmationConfig         = errors.New("confirmation code secret must have at least 32 bytes")
	ErrEmailDelivery              = errors.New("confirmation email delivery failed")
	ErrInvalidPassword            = errors.New("password must contain at least 8 characters and at most 72 bytes")
	ErrPasswordNeedsDigitOrSymbol = errors.New("password must contain at least one digit or special character")
	ErrInvalidConfirmationID      = errors.New("invalid confirmation id")
)

// login
var (
	ErrCredentials          = errors.New("invalid email or credentials")
	ErrLoginPassword        = errors.New("provide a password of at most 72 bytes")
	ErrLoginCode            = errors.New("provide a six-digit login code")
	ErrLocked               = errors.New("too many login attempts, please try again later")
	ErrCodeLimit            = errors.New("please wait before requesting another login code")
	ErrRefreshTokenRequired = errors.New("provide a refresh token")
	ErrInvalidRefreshToken  = errors.New("invalid or expired refresh token")
)

const (
	MsgLoginFailed           = "could not complete login"
	LogLoginError            = "login: %v"
	LogLoginCodeCleanupError = "clean expired login codes: %v"
	SubjectLoginCode         = "Your login code: %s"
)
