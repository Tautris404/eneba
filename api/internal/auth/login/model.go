package login

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type confirmCodeRequest struct {
	ID   string `json:"id"`
	Code string `json:"code"`
}

type codeRequest struct {
	Email string `json:"email"`
}

type resendCodeRequest struct {
	ID string `json:"id"`
}

type codeResponse struct {
	ID string `json:"id"`
}

type account struct {
	id           int64
	email        string
	passwordHash string
	locked       bool
}
