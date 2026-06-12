import { seedE2eData } from "./helpers/seed";

export default async function globalSetup() {
  await seedE2eData();
}
