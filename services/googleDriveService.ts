import { Application } from '../types';

// FIX: Add type definitions for Google API and Identity Services to the global window object.
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

// IMPORTANT: Replace with your own Google Cloud project's credentials.
// You can create them here: https://console.cloud.google.com/apis/credentials
const CLIENT_ID = '1067849573023-lrfn8lctob06i8sk2urlntbqahr2pbe8.apps.googleusercontent.com';
const API_KEY = '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'; // This is a browser key

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

const FILENAME = 'gemini-job-tracker-data.json';

// FIX: Use `any` for the token client type as the `google` namespace is not available at compile time.
let tokenClient: any | null = null;
let gapiInited = false;
let gisInited = false;

// --- Initialization ---

/**
 * Dynamically loads the gapi script.
 */
export function loadGapiScript(callback: () => void) {
  if (window.gapi) {
    callback();
    return;
  }
  const script = document.createElement('script');
  script.src = 'https://apis.google.com/js/api.js';
  script.async = true;
  script.defer = true;
  script.onload = callback;
  document.body.appendChild(script);
}

/**
 * Initializes the GAPI client.
 */
export function initGapiClient(callback: () => void) {
  if (CLIENT_ID === 'YOUR_CLIENT_ID.apps.googleusercontent.com' || API_KEY === 'YOUR_API_KEY') {
    console.warn("Google Drive Sync is not configured. Please provide your Client ID and API Key in `services/googleDriveService.ts`.");
    return;
  }
  window.gapi.load('client', async () => {
    await window.gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
    callback();
  });
}

/**
 * Updates the sign-in status based on the user's token.
 */
export function updateTokenStatus(callback: (isSignedIn: boolean) => void) {
  const gisScript = document.createElement('script');
  gisScript.src = 'https://accounts.google.com/gsi/client';
  gisScript.async = true;
  gisScript.defer = true;
  gisScript.onload = () => {
     tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (tokenResponse) => {
            callback(!!tokenResponse.access_token);
        },
    });
    gisInited = true;
  }
  document.body.appendChild(gisScript);
}


// --- Authentication ---

/**
 *  Sign in the user upon button click.
 */
export function handleAuthClick() {
  if (gapiInited && gisInited && tokenClient) {
    if (window.gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
      tokenClient.requestAccessToken({prompt: ''});
    }
  } else {
    console.error("GAPI or GIS not initialized yet.");
  }
}

/**
 *  Sign out the user upon button click.
 */
export function handleSignoutClick() {
  const token = window.gapi.client.getToken();
  if (token !== null) {
    window.google.accounts.oauth2.revoke(token.access_token, () => {});
    window.gapi.client.setToken(null);
  }
}

// --- File Operations ---

/**
 * Finds the data file in the user's Drive.
 * @returns {Promise<string | null>} The file ID or null if not found.
 */
export async function findFile(): Promise<string | null> {
  try {
    const response = await window.gapi.client.drive.files.list({
      q: `name='${FILENAME}' and trashed=false`,
      spaces: 'drive',
      fields: 'files(id, name)',
    });
    if (response.result.files && response.result.files.length > 0) {
      return response.result.files[0].id!;
    }
    return null;
  } catch(e) {
      handleAuthClick();
      throw new Error("Could not search for file. Your session might have expired. Please try again.");
  }
}

/**
 * Gets the content of the data file.
 * @param {string} fileId The ID of the file.
 * @returns {Promise<Application[]>} The parsed application data.
 */
export async function getFileContent(fileId: string): Promise<Application[]> {
  const response = await window.gapi.client.drive.files.get({
    fileId: fileId,
    alt: 'media',
  });
  try {
      return JSON.parse(response.body) as Application[];
  } catch(e) {
      console.error("Failed to parse remote file content:", e);
      return []; // Return empty array if file is corrupted or empty
  }
}

/**
 * Updates the content of an existing data file.
 * @param {string} fileId The ID of the file to update.
 * @param {Application[]} content The new content.
 */
export async function updateFileContent(fileId: string, content: Application[]) {
  const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
  
  const formData = new FormData();
  formData.append('metadata', new Blob([JSON.stringify({ mimeType: 'application/json' })], { type: 'application/json' }));
  formData.append('file', blob);

  await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`, {
    method: 'PATCH',
    headers: new Headers({ 'Authorization': 'Bearer ' + window.gapi.client.getToken().access_token }),
    body: formData,
  });
}

/**
 * Creates a new data file in Google Drive.
 * @param {Application[]} content The initial content.
 */
export async function createFile(content: Application[]) {
  const fileMetadata = {
    name: FILENAME,
    mimeType: 'application/json',
    parents: ['root'],
  };
  const file = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });

  const formData = new FormData();
  formData.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
  formData.append('file', file);
  
  await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: new Headers({ 'Authorization': 'Bearer ' + window.gapi.client.getToken().access_token }),
      body: formData
  });
}
