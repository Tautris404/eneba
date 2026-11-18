package store

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewStoreRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) findSearchProducts(ctx context.Context, search string) ([]searchProduct, error) {
	rows, err := r.db.Query(ctx, `
		WITH matches AS (
			SELECT p.id, p.slug, p.cover_image_url, p.name, p.sold_count
			FROM products p
			WHERE lower(p.name) LIKE '%' || lower($1) || '%'
				OR (char_length($1) >= 4 AND lower(p.name) %> lower($1))
			ORDER BY p.sold_count DESC, p.id
			LIMIT 6
		), prices AS (
			SELECT DISTINCT ON (o.product_id) o.product_id, o.price, o.discounted_price
			FROM offers o
			JOIN matches m ON m.id = o.product_id
			WHERE o.quantity > 0
			ORDER BY o.product_id, COALESCE(o.discounted_price, o.price), o.id
		)
		SELECT m.slug, m.cover_image_url, m.name, p.price::float8, p.discounted_price::float8
		FROM matches m
		LEFT JOIN prices p ON p.product_id = m.id
		ORDER BY m.sold_count DESC, m.id
	`, search)
	if err != nil {
		return nil, err
	}
	return pgx.CollectRows(rows, pgx.RowToStructByPos[searchProduct])
}

func (r *Repository) findStoreProducts(ctx context.Context, filters productFilters, limit, offset int64) (productPage, error) {
	var result productPage
	err := r.db.QueryRow(ctx, `
	WITH product_prices AS (
		SELECT DISTINCT ON (product_id)
			product_id, price, discounted_price,
			COALESCE(discounted_price, price) AS effective_price
		FROM offers
		WHERE quantity > 0
			AND (NOT $13::boolean OR discounted_price IS NOT NULL)
		ORDER BY product_id, effective_price, id
	),
	product_matches AS (
		SELECT p.id, p.name, p.slug, p.cover_image_url, p.created_at, p.sold_count,
			p.product_type_id, p.platform_id, pl.name AS platform_name,
			pl.image_url AS platform_image_url, prices.price, prices.discounted_price, prices.effective_price,
			array_remove(ARRAY[
				CASE WHEN $4 <> '' AND NOT EXISTS (
					SELECT 1 FROM product_countries pc WHERE pc.product_id = p.id AND pc.country_code = $4
				) THEN 'country' END,
				CASE WHEN COALESCE(cardinality($5::text[]), 0) > 0 AND NOT (pt.slug = ANY($5))
					THEN 'product_type' END,
				CASE WHEN COALESCE(cardinality($6::text[]), 0) > 0 AND NOT EXISTS (
					SELECT 1 FROM product_operating_systems pos
					JOIN operating_systems os ON os.id = pos.operating_system_id
					WHERE pos.product_id = p.id AND os.slug = ANY($6)
				) THEN 'operating_system' END,
				CASE WHEN COALESCE(cardinality($7::text[]), 0) > 0 AND NOT (pl.slug = ANY($7))
					THEN 'platform' END,
				CASE WHEN COALESCE(cardinality($8::text[]), 0) > 0 AND NOT EXISTS (
					SELECT 1 FROM product_genres pg
					JOIN genres g ON g.id = pg.genre_id
					WHERE pg.product_id = p.id AND g.slug = ANY($8)
				) THEN 'genre' END,
				CASE WHEN COALESCE(cardinality($9::text[]), 0) > 0 AND NOT EXISTS (
					SELECT 1 FROM product_regions pr
					JOIN regions r ON r.id = pr.region_id
					WHERE pr.product_id = p.id AND r.slug = ANY($9)
				) THEN 'region' END
			], NULL) AS unmatched_groups
		FROM products p
		JOIN product_types pt ON pt.id = p.product_type_id
		JOIN platforms pl ON pl.id = p.platform_id
		LEFT JOIN product_prices prices ON prices.product_id = p.id
		WHERE ($1 = '' OR lower(p.name) LIKE '%' || lower($1) || '%'
			OR (char_length($1) >= 4 AND lower(p.name) %> lower($1)))
			AND (NULLIF($2, '') IS NULL OR prices.effective_price >= NULLIF($2, '')::numeric)
			AND (NULLIF($3, '') IS NULL OR prices.effective_price <= NULLIF($3, '')::numeric)
			AND (NOT $13::boolean OR prices.product_id IS NOT NULL)
	),
	filtered_products AS (
		SELECT * FROM product_matches WHERE cardinality(unmatched_groups) = 0
	),
	product_page AS (
		SELECT p.*, row_number() OVER (ORDER BY
			CASE WHEN $10 = 'price_asc' THEN p.effective_price END ASC NULLS LAST,
			CASE WHEN $10 = 'price_desc' THEN p.effective_price END DESC NULLS LAST,
			CASE WHEN $10 = 'date_asc' THEN p.created_at END ASC NULLS LAST,
			CASE WHEN $10 = 'date_desc' THEN p.created_at END DESC NULLS LAST,
			CASE WHEN $10 = 'popularity' THEN p.sold_count END DESC,
			CASE WHEN $10 = 'alphabet_asc' THEN lower(p.name) END ASC,
			CASE WHEN $10 = 'alphabet_desc' THEN lower(p.name) END DESC,
			p.id ASC) AS position
		FROM filtered_products p
		ORDER BY position
		LIMIT $11 OFFSET $12
	),
	filter_counts AS (
		SELECT 'country' AS category, c.code AS value, c.name AS label, count(*) AS count
		FROM product_matches p JOIN product_countries pc ON pc.product_id = p.id
		JOIN countries c ON c.code = pc.country_code
		WHERE p.unmatched_groups <@ ARRAY['country']
		GROUP BY c.code, c.name
		UNION ALL
		SELECT 'product_type', pt.slug, pt.name, count(*)
		FROM product_matches p JOIN product_types pt ON pt.id = p.product_type_id
		WHERE p.unmatched_groups <@ ARRAY['product_type']
		GROUP BY pt.slug, pt.name
		UNION ALL
		SELECT 'operating_system', os.slug, os.name, count(*)
		FROM product_matches p JOIN product_operating_systems pos ON pos.product_id = p.id
		JOIN operating_systems os ON os.id = pos.operating_system_id
		WHERE p.unmatched_groups <@ ARRAY['operating_system']
		GROUP BY os.slug, os.name
		UNION ALL
		SELECT 'platform', pl.slug, pl.name, count(*)
		FROM product_matches p JOIN platforms pl ON pl.id = p.platform_id
		WHERE p.unmatched_groups <@ ARRAY['platform']
		GROUP BY pl.slug, pl.name
		UNION ALL
		SELECT 'genre', g.slug, g.name, count(*)
		FROM product_matches p JOIN product_genres pg ON pg.product_id = p.id
		JOIN genres g ON g.id = pg.genre_id
		WHERE p.unmatched_groups <@ ARRAY['genre']
		GROUP BY g.slug, g.name
		UNION ALL
		SELECT 'region', r.slug, r.name, count(*)
		FROM product_matches p JOIN product_regions pr ON pr.product_id = p.id
		JOIN regions r ON r.id = pr.region_id
		WHERE p.unmatched_groups <@ ARRAY['region']
		GROUP BY r.slug, r.name
	),
	filter_groups AS (
		SELECT category, jsonb_agg(
			jsonb_strip_nulls(jsonb_build_object(
				'value', value, 'label', label,
				'count', CASE WHEN category <> 'country' THEN count END
			)) ORDER BY CASE WHEN category <> 'country' THEN count END DESC, label, value
		) AS options
		FROM filter_counts
		GROUP BY category
	)

	SELECT COALESCE(jsonb_agg(jsonb_build_object(
		'slug', p.slug, 'name', p.name, 'price', p.price, 'cover_image_url', p.cover_image_url,
		'platform_name', p.platform_name, 'platform_image_url', p.platform_image_url,
		'discounted_price', p.discounted_price,
		'discount_percent', round(100 * (p.price - p.discounted_price) / p.price)::integer,
		'regions', ARRAY(
			SELECT r.name FROM product_regions pr
			JOIN regions r ON r.id = pr.region_id
			WHERE pr.product_id = p.id
			ORDER BY r.id
		)
	) ORDER BY p.position), '[]'::jsonb),
	(SELECT count(*) FROM filtered_products),
	'{"country":[],"product_type":[],"operating_system":[],"platform":[],"genre":[],"region":[]}'::jsonb
		|| COALESCE((SELECT jsonb_object_agg(category, options) FROM filter_groups), '{}'::jsonb)
	FROM product_page p`,
		filters.search, filters.minPrice, filters.maxPrice, filters.country,
		filters.productTypes, filters.operatingSystems, filters.platforms, filters.genres, filters.regions,
		filters.sort, limit, offset, filters.deals,
	).Scan(&result.Products, &result.Total, &result.Filters)
	return result, err
}

func (r *Repository) findProductDetails(ctx context.Context, slug string) (productDetails, error) {
	var product productDetails
	err := r.db.QueryRow(ctx, `
	SELECT p.slug, p.name, p.description, p.cover_image_url,
		jsonb_build_array(jsonb_build_object(
			'name', pl.name,
			'image_url', pl.image_url,
			'website_url', pl.website_url
		)),
		ARRAY(
			SELECT os.name FROM product_operating_systems pos
			JOIN operating_systems os ON os.id = pos.operating_system_id
			WHERE pos.product_id = p.id ORDER BY os.name
		),
		ARRAY(
			SELECT g.name FROM product_genres pg
			JOIN genres g ON g.id = pg.genre_id
			WHERE pg.product_id = p.id ORDER BY g.name
		),
		ARRAY(
			SELECT r.name FROM product_regions pr
			JOIN regions r ON r.id = pr.region_id
			WHERE pr.product_id = p.id ORDER BY r.id
		),
		ARRAY(
			SELECT c.name FROM product_countries pc
			JOIN countries c ON c.code = pc.country_code
			WHERE pc.product_id = p.id ORDER BY c.name
		),
		(SELECT COALESCE(jsonb_agg(jsonb_build_object(
			'id', o.id,
			'price', o.price,
			'discounted_price', o.discounted_price,
			'discount', round(100 * (o.price - o.discounted_price) / o.price)::integer,
			'seller_name', s.name,
			'seller_image_url', s.image_url)
			ORDER BY COALESCE(o.discounted_price, o.price), o.id), 
			'[]'::jsonb)
		FROM offers o
		JOIN sellers s ON s.id = o.seller_id
		WHERE o.product_id = p.id AND o.quantity > 0)
	FROM products p
	JOIN platforms pl ON pl.id = p.platform_id
	WHERE p.slug = $1
`, slug).Scan(
		&product.Slug, &product.Name, &product.Description, &product.CoverImageURL,
		&product.Platforms, &product.OperatingSystems, &product.Genres,
		&product.Regions, &product.Countries, &product.Offers,
	)
	return product, err
}
