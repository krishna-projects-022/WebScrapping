import express from 'express';
import axios from 'axios';
const router = express.Router();

// TODO: Store these securely in environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/integrations/sheets/callback';
const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
].join(' ');

// In-memory token storage for demo (replace with DB in production)
let googleTokens = {};

// Step 1: Redirect user to Google OAuth
router.get('/auth', (req, res) => {
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(GOOGLE_SCOPES)}&access_type=offline&prompt=consent`;
  res.redirect(authUrl);
});

// Step 2: Handle OAuth callback
router.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('Missing code');
  try {
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', null, {
      params: {
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    googleTokens = tokenRes.data; // Store tokens (replace with user-specific storage)
    res.send('Google Sheets connected! You can close this window.');
  } catch (err) {
    res.status(500).send('OAuth error: ' + err.message);
  }
});

// Step 3: Status endpoint
router.get('/status', (req, res) => {
  if (googleTokens.access_token) {
    res.json({ connected: true });
  } else {
    res.json({ connected: false });
  }
});

// Step 4: Send data to Google Sheets (demo: append row)
router.post('/send', async (req, res) => {
  const { spreadsheetId, range, values } = req.body;
  if (!googleTokens.access_token) return res.status(401).json({ error: 'Not connected to Google Sheets' });
  try {
    const result = await axios.post(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append`,
      { values: [values] },
      {
        params: { valueInputOption: 'RAW' },
        headers: { Authorization: `Bearer ${googleTokens.access_token}` },
      }
    );
    res.json({ success: true, result: result.data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
