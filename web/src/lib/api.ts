const API_URL =
  'http://localhost:3000';

export async function apiFetch(
  path: string,
  options?: RequestInit,
  _retry = false
) {

  // ====================================================
  // ACCESS TOKEN
  // ====================================================

  const accessToken =
    localStorage.getItem(
      'accessToken'
    );

  // ====================================================
  // REQUEST
  // ====================================================

  const response =
    await fetch(
      `${API_URL}${path}`,
      {
        ...options,

        headers: {
          'Content-Type':
            'application/json',

          Authorization:
            accessToken
              ? `Bearer ${accessToken}`
              : '',

          ...options?.headers,
        },
      }
    );

  // ====================================================
  // PARSE RESPONSE
  // ====================================================

  const data =
    await response.json();

  // ====================================================
  // GLOBAL 401 DETECTION
  // ====================================================

  if (
    response.status === 401 &&
    !_retry
  ) {

    console.warn(
      'Access token expired. Refreshing session...'
    );

    try {

      // ================================================
      // REFRESH TOKEN
      // ================================================

      const refreshToken =
        localStorage.getItem(
          'refreshToken'
        );

      // ================================================
      // NO REFRESH TOKEN
      // ================================================

      if (!refreshToken) {

        throw new Error(
          'NO_REFRESH_TOKEN'
        );
      }

      // ================================================
      // REFRESH REQUEST
      // ================================================

      const refreshResponse =
        await fetch(
          `${API_URL}/auth/refresh`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              refreshToken,
            }),
          }
        );

      const refreshData =
        await refreshResponse.json();

      // ================================================
      // REFRESH FAILED
      // ================================================

      if (!refreshResponse.ok) {
        throw refreshData;
      }

      // ================================================
      // SAVE NEW TOKENS
      // ================================================

      localStorage.setItem(
        'accessToken',
        refreshData.data.accessToken
      );

      localStorage.setItem(
        'refreshToken',
        refreshData.data.refreshToken
      );

      // ================================================
      // RETRY ORIGINAL REQUEST
      // ================================================

      return apiFetch(
        path,
        options,
        true
      );

    } catch (error) {

      console.error(
        'Refresh session failed',
        error
      );

      // ================================================
      // CLEANUP SESSION
      // ================================================

      localStorage.removeItem(
        'accessToken'
      );

      localStorage.removeItem(
        'refreshToken'
      );

      window.location.href =
        '/ingresar';

      throw error;
    }
  }

  // ====================================================
  // OTHER ERRORS
  // ====================================================

  if (!response.ok) {
    throw data;
  }

  // ====================================================
  // SUCCESS
  // ====================================================

  return data;
}
