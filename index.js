import "dotenv/config";
import fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import formbody from "@fastify/formbody";
import multipart from "@fastify/multipart";
import fastifyRedis from "@fastify/redis";
import fastifyCors from "@fastify/cors";
import authRoutes from "./src/routes/auth.route.js";
import redisHook from "./src/hooks/redis.js";
import { errorResponse } from "./src/utils/response.js";

const app = fastify({ logger: true });

app.register(fastifyRedis, { url: process.env.REDIS_URL });
app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET,
});
app.register(redisHook);
app.register(formbody);
app.register(multipart, {
  attachFieldsToBody: true,
  limits: { fileSize: 10000000 },
});
app.register(fastifyCors, {
  origin: true,
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH", "OPTIONS"],
});

app.decorate("authenticate", async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch {
    return errorResponse(reply, "token required", null, 401);
  }
});

app.register(authRoutes, { prefix: "/api/auth" });

const start = async () => {
  try {
    await app.ready();

    const address = await app.listen({
      port: 3001,
      host: process.env.HOST || "0.0.0.0",
    });

    app.log.info(`Server listening at ${address}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
