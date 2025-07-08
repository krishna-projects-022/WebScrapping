import express from 'express';
import axios from 'axios';
const router = express.Router();

// TODO: Store these securely in environment variables
const HUBSPOT_CLIENT_ID = process.env.HUBSPOT_CLIENT_ID;
const HUBSPOT_CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET;
const HUBSPOT_REDIRECT_URI = process.env.HUBSPOT_REDIRECT_URI || 'http://localhost:5000/api/integrations/hubspot/callback';

// In-memory token storage for demo (replace with DB in production)
let hubspotTokens = {};

// Step 1: Redirect user to HubSpot OAuth
router.get('/auth', (req, res) => {
  const authUrl = `https://app.hubspot.com/oauth/authorize?client_id=${HUBSPOT_CLIENT_ID}&scope=contacts%20oauth&redirect_uri=${encodeURIComponent(HUBSPOT_REDIRECT_URI)}`;
  res.redirect(authUrl);
});

// Step 2: Handle OAuth callback
router.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('Missing code');
  try {
    const tokenRes = await axios.post('https://api.hubapi.com/oauth/v1/token', null, {
      params: {
        grant_type: 'authorization_code',
        client_id: HUBSPOT_CLIENT_ID,
        client_secret: HUBSPOT_CLIENT_SECRET,
        redirect_uri: HUBSPOT_REDIRECT_URI,
        code,
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    hubspotTokens = tokenRes.data; // Store tokens (replace with user-specific storage)
    res.send('HubSpot connected! You can close this window.');
  } catch (err) {
    res.status(500).send('OAuth error: ' + err.message);
  }
});

// Step 3: Status endpoint
router.get('/status', (req, res) => {
  if (hubspotTokens.access_token) {
    res.json({ connected: true });
  } else {
    res.json({ connected: false });
  }
});

export default router;
