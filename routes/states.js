const express = require('express');
const router = express.Router();
const axios = require('axios');
const Opinion = require('../models/Opinion');

// ─── Reuters API ──────────────────────────────────────────────────────────────
// Check your RapidAPI playground to confirm the exact endpoint path and
// response shape. Adjust REUTERS_HOST, the url, and params as needed.
const REUTERS_HOST = 'reuters-api.p.rapidapi.com';

async function fetchNews(stateName) {
  try {
    const response = await axios.get(`https://${REUTERS_HOST}/category?url=https%3A%2F%2Fwww.reuters.com%2Fworld%2Fafrica%2F`, {
      params: { query: `${stateName} policy`, size: '10' },
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': REUTERS_HOST
      }
    });
    const data = response.data;
    // Handle common response shapes from RapidAPI news endpoints
    return data.articles ?? data.results ?? data.items ?? (Array.isArray(data) ? data : []);
  } catch (err) {
    console.error('Reuters API error:', err.response?.status, err.message);
    return [];
  }
}
// ─────────────────────────────────────────────────────────────────────────────

router.get('/:state', async (req, res) => {
  const stateName = decodeURIComponent(req.params.state);
  const [articles, opinions] = await Promise.all([
    fetchNews(stateName),
    Opinion.find({ state: stateName }).sort({ createdAt: -1 }).limit(50)
  ]);
  res.render('state', { stateName, articles, opinions });
});

router.post('/:state/opinion', async (req, res) => {
  const stateName = decodeURIComponent(req.params.state);
  const { name, topic, opinion } = req.body;
  if (opinion && opinion.trim()) {
    await new Opinion({
      state:   stateName,
      name:    name?.trim() || 'Anonymous',
      topic:   topic?.trim() || '',
      opinion: opinion.trim()
    }).save().catch(err => console.error('Save error:', err));
  }
  res.redirect(`/state/${encodeURIComponent(stateName)}`);
});

module.exports = router;
