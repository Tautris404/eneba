BEGIN;

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE users (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email text NOT NULL CHECK (email = btrim(email) AND email <> ''),
    password_hash text NOT NULL CHECK (password_hash <> ''),
    login_attempts integer NOT NULL DEFAULT 0 CHECK (login_attempts BETWEEN 0 AND 5),
    login_locked_until timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX users_email_ci_uidx
    ON users (lower(email));

CREATE TABLE login_codes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code_hash bytea NOT NULL CHECK (octet_length(code_hash) = 32),
    sent_at timestamptz NOT NULL DEFAULT statement_timestamp(),
    expires_at timestamptz NOT NULL DEFAULT (statement_timestamp() + interval '5 minutes'),
    emails_sent integer NOT NULL DEFAULT 1 CHECK (emails_sent BETWEEN 1 AND 5)
);

CREATE INDEX login_codes_user_idx ON login_codes (user_id);

CREATE TABLE refresh_tokens (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash bytea NOT NULL UNIQUE CHECK (octet_length(token_hash) = 32),
    created_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL CHECK (expires_at > created_at),
    revoked_at timestamptz CHECK (revoked_at >= created_at)
);

CREATE INDEX refresh_tokens_user_idx
    ON refresh_tokens (user_id);

CREATE INDEX refresh_tokens_expiry_idx
    ON refresh_tokens (expires_at);

CREATE TABLE product_types (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name text NOT NULL UNIQUE CHECK (btrim(name) <> ''),
    slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

CREATE TABLE platforms (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name text NOT NULL UNIQUE CHECK (btrim(name) <> ''),
    slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    image_url text,
    website_url text
);

CREATE TABLE regions (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name text NOT NULL UNIQUE CHECK (btrim(name) <> ''),
    slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

CREATE TABLE countries (
    code text PRIMARY KEY CHECK (code ~ '^[A-Z]{2}$'),
    name text NOT NULL UNIQUE CHECK (btrim(name) <> '')
);

CREATE TABLE genres (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name text NOT NULL UNIQUE CHECK (btrim(name) <> ''),
    slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

CREATE TABLE operating_systems (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name text NOT NULL UNIQUE CHECK (btrim(name) <> ''),
    slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

CREATE TABLE products (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_type_id bigint NOT NULL REFERENCES product_types(id),
    platform_id bigint NOT NULL REFERENCES platforms(id),
    name text NOT NULL CHECK (btrim(name) <> ''),
    slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    description text NOT NULL DEFAULT '',
    cover_image_url text,
    sold_count bigint NOT NULL DEFAULT 0 CHECK (sold_count >= 0),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX products_type_idx
    ON products (product_type_id);

CREATE INDEX products_name_trgm_idx
    ON products USING gin (lower(name) gin_trgm_ops);

CREATE INDEX products_platform_idx ON products (platform_id);

CREATE TABLE product_regions (
    product_id bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    region_id bigint NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, region_id)
);

CREATE INDEX product_regions_region_idx ON product_regions (region_id);

CREATE TABLE product_countries (
    product_id bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    country_code text NOT NULL REFERENCES countries(code) ON DELETE CASCADE,
    PRIMARY KEY (product_id, country_code)
);

CREATE INDEX product_countries_country_idx ON product_countries (country_code);

CREATE TABLE product_genres (
    product_id bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    genre_id bigint NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, genre_id)
);

CREATE INDEX product_genres_genre_idx
    ON product_genres (genre_id);

CREATE TABLE product_operating_systems (
    product_id bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    operating_system_id bigint NOT NULL REFERENCES operating_systems(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, operating_system_id)
);

CREATE INDEX product_operating_systems_os_idx
    ON product_operating_systems (operating_system_id);

CREATE TABLE sellers (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name text NOT NULL CHECK (btrim(name) <> ''),
    image_url text
);

CREATE TABLE offers (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id bigint NOT NULL REFERENCES products(id),
    seller_id bigint NOT NULL REFERENCES sellers(id),
    quantity integer NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    price numeric(10,2) NOT NULL CHECK (price > 0 AND price <> 'NaN'::numeric),
    discounted_price numeric(10,2)
        CHECK (discounted_price > 0 AND discounted_price < price)
);

CREATE INDEX offers_product_price_idx
    ON offers (
        product_id,
        (COALESCE(discounted_price, price))
    );

CREATE TABLE discount_codes (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code text NOT NULL UNIQUE CHECK (code = btrim(code) AND code <> ''),
    discount_percent integer NOT NULL CHECK (discount_percent BETWEEN 1 AND 100),
    expires_at timestamptz
);

CREATE TABLE orders (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id bigint NOT NULL REFERENCES users(id),
    is_paid boolean NOT NULL DEFAULT false,
    title text NOT NULL CHECK (btrim(title) <> ''),
    created_at timestamptz NOT NULL DEFAULT statement_timestamp(),
    expires_at timestamptz NOT NULL CHECK (expires_at > created_at),
    stripe_checkout_session_id text UNIQUE,
    stripe_checkout_url text
);

CREATE INDEX orders_user_idx
    ON orders (user_id);

CREATE TABLE order_items (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id bigint NOT NULL REFERENCES orders(id),
    offer_id bigint NOT NULL REFERENCES offers(id),
    unit_price numeric(10,2) NOT NULL
        CHECK (unit_price >= 0 AND unit_price <> 'NaN'::numeric),
    UNIQUE (id, offer_id)
);

CREATE INDEX order_items_order_idx
    ON order_items (order_id);

CREATE TABLE digital_keys (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    offer_id bigint NOT NULL REFERENCES offers(id),
    key_ciphertext bytea NOT NULL,
    key_fingerprint bytea NOT NULL UNIQUE,
    sold boolean NOT NULL DEFAULT false,
    order_item_id bigint UNIQUE,
    reserved_until timestamptz,
    FOREIGN KEY (order_item_id, offer_id)
        REFERENCES order_items(id, offer_id),
    CHECK (
        (NOT sold AND order_item_id IS NULL AND reserved_until IS NULL)
        OR
        (NOT sold AND order_item_id IS NOT NULL AND reserved_until IS NOT NULL)
        OR
        (sold AND order_item_id IS NOT NULL AND reserved_until IS NULL)
    )
);

CREATE INDEX digital_keys_available_idx
ON digital_keys (offer_id, reserved_until, id)
WHERE NOT sold;

CREATE TABLE pending_confirmations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    code_hash bytea NOT NULL,
    attempts integer NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 5),
    sent_at timestamptz NOT NULL DEFAULT statement_timestamp(),
    emails_sent integer NOT NULL DEFAULT 1 CHECK (emails_sent BETWEEN 1 AND 5),
    expires_at timestamptz NOT NULL DEFAULT (statement_timestamp() + interval '5 minutes')
);
CREATE INDEX pending_confirmations_expiry_idx ON pending_confirmations (expires_at);

CREATE TABLE home_banners (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    position integer NOT NULL UNIQUE,
    title text NOT NULL CHECK (btrim(title) <> ''),
    wide_image_url text NOT NULL,
    collapsed_image_url text NOT NULL
);

CREATE TABLE home_shortcuts (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    position integer NOT NULL UNIQUE,
    name text NOT NULL CHECK (btrim(name) <> ''),
    icon_url text NOT NULL,
    link_url text NOT NULL
);

CREATE TABLE home_gift_cards (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    position integer NOT NULL UNIQUE,
    name text NOT NULL CHECK (btrim(name) <> ''),
    image_url text NOT NULL,
    link_url text NOT NULL
);

CREATE TABLE home_genre_icons (
    genre_id bigint PRIMARY KEY REFERENCES genres(id) ON DELETE CASCADE,
    icon_url text NOT NULL
);

COMMIT;
