export function getAccessTokenSecret() {
  return (
    process.env.JWT_SECRET ||
    process.env.LOCAL_JWT_SECRET ||
    process.env.DEPLOY_JWT_SECRET
  );
}

export function getRefreshTokenSecret() {
  return (
    process.env.JWT_REFRESH_SECRET ||
    process.env.LOCAL_JWT_REFRESH_SECRET ||
    process.env.DEPLOY_JWT_REFRESH_SECRET
  );
}
