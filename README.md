# Eneba storefront

A digital goods storefront with a React UI (`ui/`), a Go API (`api/`), and PostgreSQL.

## Run locally

### Docker

Install Docker with Compose. From the project root, copy `.env.example` to `.env`.

Complete the Stripe and Gmail setup below, then start the app.

```sh
docker compose up -d --build
```

Open [localhost:5173](http://localhost:5173). Use `docker compose logs -f api` to follow API logs and `docker compose down` to stop the app.

### Stripe

The API uses Stripe to create checkout sessions. Stripe sends payment updates back to the app through a webhook.

1. Open the Stripe Dashboard, switch to your sandbox, and go to [API keys](https://dashboard.stripe.com/apikeys). Reveal the **Secret key** starting with `sk_test_` and paste it into `STRIPE_SECRET_KEY` in `.env`. The API uses this key to create test payments.
2. Install the [Stripe CLI](https://docs.stripe.com/cli/install), sign in to the same sandbox, and start the listener.

   ```sh
   stripe login
   stripe listen --forward-to http://localhost:8080/api/payments/stripe/webhook
   ```

3. Copy the signing secret starting with `whsec_` from the listener output into `STRIPE_WEBHOOK_SECRET` in `.env`. The API uses it to verify that payment updates came from Stripe. Keep this terminal open while testing.

For [Stripe test payments](https://docs.stripe.com/testing), use the test card number **`4242 4242 4242 4242`**, any future expiry date, and any three-digit CVC.

### Gmail

The API sends registration and sign-in codes through Gmail. Enable 2-Step Verification on the Google account you want to send from. Open [App passwords](https://myaccount.google.com/apppasswords), give the app a name such as `Eneba local`, and generate a password. [Google setup instructions](https://support.google.com/accounts/answer/185833)

Fill in these fields in `.env`.

- `SMTP_USER` is the full Gmail address the API signs in with, such as `you@gmail.com`.
- `SMTP_PASSWORD` is the 16-character app password Google generated. Paste it without spaces.
- `SMTP_FROM` is the sender address shown on the emails. Use the same address as `SMTP_USER`.

You can use another SMTP provider by updating the host, port, credentials, and sender address in `.env` to match its settings.
