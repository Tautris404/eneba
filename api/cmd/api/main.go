package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"eneba/api/internal/auth/authsessions"
	"eneba/api/internal/auth/login"
	"eneba/api/internal/auth/register"
	"eneba/api/internal/database"
	"eneba/api/internal/email"
	"eneba/api/internal/home"
	"eneba/api/internal/httpapi"
	"eneba/api/internal/orders"
	"eneba/api/internal/store"
)

func main() {
	authMiddleware, err := httpapi.NewAuthMiddleware()
	if err != nil {
		log.Fatal(err)
	}

	db, err := database.Connect()
	if err != nil {
		log.Fatal(err)
	} else {
		log.Println("successfully connected to the database")
	}
	defer db.Close()

	repo := register.NewRegistrationRepository(db)
	sender, err := email.NewSender()
	if err != nil {
		log.Fatal(err)
	}
	codeSecret := os.Getenv("CONFIRMATION_SECRET")
	sessionService := authsessions.NewSessionService(authsessions.NewSessionRepository(db), authMiddleware)
	service, err := register.NewRegistrationService(repo, sender, codeSecret, sessionService)
	if err != nil {
		log.Fatal(err)
	}
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	go service.CleanExpiredConfirmations(ctx)
	handler := register.NewRegistrationHandler(service)
	loginService := login.NewLoginService(login.NewLoginRepository(db), sender, codeSecret, sessionService)
	go loginService.CleanExpiredCodes(ctx)
	loginHandler := login.NewLoginHandler(loginService)
	sessionHandler := authsessions.NewSessionHandler(sessionService)
	storeService := store.NewStoreService(store.NewStoreRepository(db))
	storeHandler := store.NewStoreHandler(storeService)
	homeHandler := home.NewHandler(home.NewService(home.NewRepository(db)))
	orderService, err := orders.NewService(orders.NewRepository(db))
	if err != nil {
		log.Fatal(err)
	}
	go orderService.ReleaseExpiredReservations(ctx)
	orderHandler := orders.NewHandler(orderService)
	router := httpapi.NewRouter(authMiddleware, handler.Register, handler.ConfirmRegistration, handler.ResendConfirmation,
		loginHandler.Login, loginHandler.RequestCode, loginHandler.ConfirmCode, loginHandler.ResendCode,
		sessionHandler.Refresh, sessionHandler.Logout, storeHandler.Products, storeHandler.ProductDetails, storeHandler.SearchProducts,
		orderHandler.Create, orderHandler.List, orderHandler.Details, orderHandler.ValidateDiscount, orderHandler.StripeWebhook,
		homeHandler.Banners, homeHandler.Shortcuts, homeHandler.GiftCards, homeHandler.Genres)

	log.Println("server running on :8080")

	err = http.ListenAndServe(":8080", router)
	if err != nil {
		log.Fatal(err)
	}
}
