const isProduction = process.env.NODE_ENV === "production";

export function getCronSecret(): string {
  const secret = isProduction
    ? process.env.DEPLOY_CRON_SECRET ?? process.env.CRON_SECRET
    : process.env.LOCAL_CRON_SECRET ??
      process.env.CRON_SECRET ??
      "local_dev_cron_secret";

  return secret?.trim() ?? "";
}
