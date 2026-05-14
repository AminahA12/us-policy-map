const express = require('express');
const router = express.Router();
const axios = require('axios');
const Opinion = require('../models/Opinion');

async function fetchNews(stateName) {
  try {
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: `"${stateName}" policy`,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 10
      },
      headers: { 'X-Api-Key': process.env.NEWSAPI_KEY }
    });
    return response.data.articles ?? [];
  } catch (err) {
    console.error('NewsAPI error:', err.response?.status, err.response?.data?.message || err.message);
    return [];
  }
}

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
