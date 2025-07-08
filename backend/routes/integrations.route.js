import express from 'express';
import axios from 'axios';

const router = express.Router();

// TODO: Replace with your real Salesforce app credentials
const CLIENT_ID = process.env.SALESFORCE_CLIENT_ID || 'YOUR_SALESFORCE_CLIENT_ID';
const CLIENT_SECRET = process.env.SALESFORCE_CLIENT_SECRET || 'YOUR_SALESFORCE_CLIENT_SECRET';
const REDIRECT_URI = process.env.SALESFORCE_REDIRECT_URI || 'http://localhost:5000/api/integrations/salesforce/callback';

// Step 1: Redirect user to Salesforce OAuth
router.get('/salesforce/auth', (req, res) => {
  const url = `https://login.salesforce.com/services/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
  res.redirect(url);
});

// Step 2: Handle Salesforce OAuth callback
router.get('/salesforce/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const response = await axios.post('https://login.salesforce.com/services/oauth2/token', null, {
      params: {
        grant_type: 'authorization_code',
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
      },
    });
    // TODO: Store response.data.access_token and response.data.instance_url in your DB for the user
    res.send('Salesforce connected! You can close this window.');
  } catch (err) {
    res.status(500).send('Salesforce auth failed');
  }
});

export default router;
