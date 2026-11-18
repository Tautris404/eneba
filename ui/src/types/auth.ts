export type TokenPair = {
  access_token: string;
  refresh_token: string;
};

export type Session = {
  accessToken: string;
  refreshToken: string;
  email: string | null;
};
