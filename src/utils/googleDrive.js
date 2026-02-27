const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const SCOPES = "https://www.googleapis.com/auth/drive.file";

let tokenClient = null;
let currentAccessToken = null;

export function isGoogleAvailable() {
  return typeof google !== "undefined" && google.accounts && !!CLIENT_ID;
}

export function initTokenClient(onSuccess, onError) {
  if (!isGoogleAvailable()) {
    onError?.(new Error("Google Drive is not configured. A Google Cloud client ID is required."));
    return;
  }

  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (response) => {
      if (response.error) {
        onError?.(new Error(response.error));
        return;
      }
      currentAccessToken = response.access_token;
      onSuccess?.(response.access_token);
    },
  });
}

export function requestAccessToken() {
  if (!tokenClient) {
    throw new Error("Token client not initialized.");
  }
  tokenClient.requestAccessToken();
}

export function getAccessToken() {
  return currentAccessToken;
}

export async function uploadToDrive(blob, filename, mimeType) {
  if (!currentAccessToken) {
    throw new Error("Not authenticated with Google.");
  }

  const metadata = { name: filename, mimeType };
  const form = new FormData();
  form.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" })
  );
  form.append("file", blob);

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${currentAccessToken}` },
      body: form,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Upload failed with status ${response.status}`
    );
  }

  return response.json();
}
