// Tạm thời tắt hoàn toàn Redis cache, chỉ giữ lại mock cacheService và middleware cache

export const cacheService = {
  get: async () => null,
  set: async () => {},
  del: async () => {},
  exists: async () => false,
  ttl: async () => -1,
  flush: async () => {},
  increment: async () => 0,
  mget: async () => [],
  mset: async () => {},
};

export const cache = (options: { ttl?: number; key?: string }) => {
  return async (req: any, res: any, next: any): Promise<void> => {
    // Không cần truyền tham số cho mock cacheService
    try {
      const cached = await cacheService.get();
      if (cached) {
        res.json(JSON.parse(cached));
        return;
      }
      const originalJson = res.json;
      res.json = function(body: any) {
        cacheService.set();
        return originalJson.call(this, body);
      };
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// Mock cache service không dùng Redis
export const mockCacheService = {
  get: async () => null,
  set: async () => {},
  del: async () => {},
  exists: async () => false,
  ttl: async () => -1,
  flush: async () => {},
  increment: async () => 0,
  mget: async () => [],
  mset: async () => {},
}; 