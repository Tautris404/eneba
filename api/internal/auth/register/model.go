package register

type registerRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type confirmationRequest struct {
	ID   string `json:"id"`
	Code string `json:"code"`
}

type resendRequest struct {
	ID string `json:"id"`
}

type registerResponse struct {
	ID string `json:"id"`
}
type pendingConfirmation struct {
	passwordHash string
	codeHash     []byte
	attempts     int
	emailsSent   int
	coolingDown  bool
}
