// Simple in-memory cache (TTL 60s)
const cache = new Map<string, { value: any, expires: number }>();
function setCache(key: string, value: any, ttl = 60000) {
  cache.set(key, { value, expires: Date.now() + ttl });
}
function getCache(key: string) {
  const entry = cache.get(key);
  if (entry && entry.expires > Date.now()) return entry.value;
  cache.delete(key);
  return undefined;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get recent call summaries (within the last X hours) with cache
  app.get('/api/summaries/recent/:hours', async (req, res) => {
    try {
      const hours = parseInt(req.params.hours) || 24;
      const validHours = Math.min(Math.max(1, hours), 72);
      const cacheKey = `summaries:${validHours}`;
      const cached = getCache(cacheKey);
      if (cached) {
        return res.json(cached);
      }
      const summaries = await storage.getRecentCallSummaries(validHours);
      const mapped = summaries.map(s => ({
        id: s.id,
        callId: s.callId,
        roomNumber: s.roomNumber,
        content: s.content,
        timestamp: s.timestamp,
        duration: s.duration
      }));
      const result = {
        success: true,
        count: summaries.length,
        timeframe: `${validHours} hours`,
        summaries: mapped
      };
      setCache(cacheKey, result);
      res.json(result);
    } catch (error) {
      handleApiError(res, error, 'Error retrieving recent call summaries:');
    }
  });

  // Translate text to Vietnamese with cache
  app.post('/api/translate-to-vietnamese', async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Text content is required' });
      }
      const cacheKey = `vi:${text}`;
      const cached = getCache(cacheKey);
      if (cached) {
        return res.json({ success: true, translatedText: cached });
      }
      const translatedText = await translateToVietnamese(text);
      setCache(cacheKey, translatedText);
      res.json({ success: true, translatedText });
    } catch (error) {
      handleApiError(res, error, 'Error translating text to Vietnamese:');
    }
  });
} 