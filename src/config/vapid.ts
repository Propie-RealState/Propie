const isProduction =
  process.env.NODE_ENV === "production";

export function getVapidConfig() {
  const publicKey = isProduction
    ? process.env.DEPLOY_VAPID_PUBLIC_KEY
    : process.env.LOCAL_VAPID_PUBLIC_KEY ??
      process.env.VAPID_PUBLIC_KEY;

  const privateKey = isProduction
    ? process.env.DEPLOY_VAPID_PRIVATE_KEY
    : process.env.LOCAL_VAPID_PRIVATE_KEY ??
      process.env.VAPID_PRIVATE_KEY;

  const subject = isProduction
    ? process.env.DEPLOY_VAPID_SUBJECT
    : process.env.LOCAL_VAPID_SUBJECT ??
      process.env.VAPID_SUBJECT ??
      "mailto:admin@propie.com";

  return {
    publicKey: publicKey?.trim() ?? "",
    privateKey: privateKey?.trim() ?? "",
    subject: subject?.trim() ?? "mailto:admin@propie.com",
  };
}

export function isPushConfigured() {
  const { publicKey, privateKey } = getVapidConfig();
  return publicKey.length > 0 && privateKey.length > 0;
}
