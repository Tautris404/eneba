package home

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) findBanners(ctx context.Context) ([]banner, error) {
	rows, err := r.db.Query(ctx, `
		SELECT title, wide_image_url, collapsed_image_url
		FROM home_banners
		ORDER BY position
	`)
	if err != nil {
		return nil, err
	}
	return pgx.CollectRows(rows, pgx.RowToStructByPos[banner])
}

func (r *Repository) findShortcuts(ctx context.Context) ([]shortcut, error) {
	rows, err := r.db.Query(ctx, `
		SELECT name, icon_url, link_url
		FROM home_shortcuts
		ORDER BY position
	`)
	if err != nil {
		return nil, err
	}
	return pgx.CollectRows(rows, pgx.RowToStructByPos[shortcut])
}

func (r *Repository) findGiftCards(ctx context.Context) ([]giftCard, error) {
	rows, err := r.db.Query(ctx, `
		SELECT name, image_url, link_url
		FROM home_gift_cards
		ORDER BY position
	`)
	if err != nil {
		return nil, err
	}
	return pgx.CollectRows(rows, pgx.RowToStructByPos[giftCard])
}

func (r *Repository) findGenres(ctx context.Context) ([]genre, error) {
	rows, err := r.db.Query(ctx, `
		SELECT g.name, count(pg.product_id) AS product_count,
			COALESCE(i.icon_url, '/uploads/home/games.svg') AS icon_url,
			'/store/all?sort=popularity&genre=' || g.slug AS link_url
		FROM genres g
		JOIN product_genres pg ON pg.genre_id = g.id
		LEFT JOIN home_genre_icons i ON i.genre_id = g.id
		GROUP BY g.id, g.name, g.slug, i.icon_url
		ORDER BY count(pg.product_id) DESC, g.name, g.slug
	`)
	if err != nil {
		return nil, err
	}
	return pgx.CollectRows(rows, pgx.RowToStructByPos[genre])
}
