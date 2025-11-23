(function() {
  'use strict';

  function getCsrfToken() {
    const match = document.cookie.match(/ct0=([^;]+)/);
    return match ? match[1] : null;
  }

  // Twitter's public Bearer token (same for all users)
  const BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA";

  async function fetchAbout(username) {
    const csrfToken = getCsrfToken();
    if (!csrfToken) {
      console.error('Twitter Flags: Could not get CSRF token');
      return null;
    }

    const variables = { screenName: username };
    const url = "https://x.com/i/api/graphql/XRqGa7EeokUU5kppkh13EA/AboutAccountQuery?variables=" +
      encodeURIComponent(JSON.stringify(variables));

    try {
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          "authorization": `Bearer ${BEARER_TOKEN}`,
          "x-csrf-token": csrfToken,
          "x-twitter-auth-type": "OAuth2Session",
          "x-twitter-active-user": "yes",
          "content-type": "application/json"
        }
      });

      if (!response.ok) return null;

      const json = await response.json();
      return json?.data?.user_result_by_screen_name?.result?.about_profile?.account_based_in ?? null;
    } catch (err) {
      console.error('Twitter Flags: Fetch error', err);
      return null;
    }
  }

  window.addEventListener("message", async (event) => {
    if (event.data?.type !== "TWITTER_FLAGS_REQUEST") return;

    const username = event.data.username;
    const country = await fetchAbout(username);

    window.postMessage({
      type: "TWITTER_FLAGS_RESPONSE",
      username,
      country
    });
  });
})();
