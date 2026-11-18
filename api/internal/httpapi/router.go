package httpapi

import "net/http"

func NewRouter(authMiddleware *AuthMiddleware, register, confirm, resend, login, requestLoginCode, confirmLoginCode, resendLoginCode, refresh, logout, products, productDetails, searchProducts, createOrder, listOrders, orderDetails, validateDiscount, stripeWebhook, homeBanners, homeShortcuts, homeGiftCards, homeGenres http.HandlerFunc) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("POST /api/auth/register", register)
	mux.HandleFunc("POST /api/auth/register/confirm", confirm)
	mux.HandleFunc("POST /api/auth/register/resend", resend)
	mux.HandleFunc("POST /api/auth/login", login)
	mux.HandleFunc("POST /api/auth/refresh", refresh)
	mux.HandleFunc("POST /api/auth/logout", logout)
	mux.HandleFunc("POST /api/auth/login/code", requestLoginCode)
	mux.HandleFunc("POST /api/auth/login/code/confirm", confirmLoginCode)
	mux.HandleFunc("POST /api/auth/login/code/resend", resendLoginCode)
	mux.HandleFunc("GET /api/store/products", products)
	mux.HandleFunc("GET /api/store/products/{slug}", productDetails)
	mux.HandleFunc("GET /api/store/search", searchProducts)
	mux.HandleFunc("GET /api/home/banners", homeBanners)
	mux.HandleFunc("GET /api/home/shortcuts", homeShortcuts)
	mux.HandleFunc("GET /api/home/gift-cards", homeGiftCards)
	mux.HandleFunc("GET /api/home/genres", homeGenres)
	mux.HandleFunc("POST /api/orders", authMiddleware.RequireAuth(createOrder))
	mux.HandleFunc("GET /api/orders", authMiddleware.RequireAuth(listOrders))
	mux.HandleFunc("GET /api/orders/{id}", authMiddleware.RequireAuth(orderDetails))
	mux.HandleFunc("POST /api/discount/validate", validateDiscount)
	mux.HandleFunc("POST /api/payments/stripe/webhook", stripeWebhook)
	mux.Handle("GET /uploads/products/", http.StripPrefix("/uploads/products/", http.FileServer(http.Dir("uploads/products"))))
	mux.Handle("GET /uploads/sellers/", http.StripPrefix("/uploads/sellers/", http.FileServer(http.Dir("uploads/sellers"))))
	mux.Handle("GET /uploads/avatars/", http.StripPrefix("/uploads/avatars/", http.FileServer(http.Dir("uploads/avatars"))))
	mux.Handle("GET /uploads/platforms/", http.StripPrefix("/uploads/platforms/", http.FileServer(http.Dir("uploads/platforms"))))
	mux.Handle("GET /uploads/banners/", http.StripPrefix("/uploads/banners/", http.FileServer(http.Dir("uploads/banners"))))
	mux.Handle("GET /uploads/home/", http.StripPrefix("/uploads/home/", http.FileServer(http.Dir("uploads/home"))))
	return mux
}
