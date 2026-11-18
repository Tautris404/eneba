package home

import "context"

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) banners(ctx context.Context) ([]banner, error) {
	return s.repo.findBanners(ctx)
}

func (s *Service) shortcuts(ctx context.Context) ([]shortcut, error) {
	return s.repo.findShortcuts(ctx)
}

func (s *Service) giftCards(ctx context.Context) ([]giftCard, error) {
	return s.repo.findGiftCards(ctx)
}

func (s *Service) genres(ctx context.Context) ([]genre, error) {
	return s.repo.findGenres(ctx)
}
