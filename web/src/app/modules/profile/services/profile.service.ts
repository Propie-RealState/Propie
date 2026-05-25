import { apiFetch }
from "../../../../lib/api";

export async function updateMyProfile(
  data: {
    phone?: string;
    location?: string;
    bio?: string;
  },
) {

  return apiFetch(
    "/profile/me",
    {
      method: "PUT",

      body:
        JSON.stringify(data),
    },
  );
}