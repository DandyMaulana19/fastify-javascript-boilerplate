export default async function redisHook(app) {
  app.addHook("onReady", async () => {
    try {
      await app.redis.ping();
      app.log.info("Redis connected");
    } catch (err) {
      app.log.error("Redis connection failed:", err);
    }
  });
}
