// import { login } from "../controllers/auth.controller.js";

export default function authRoutes(app) {
  app.post("/login", async (request, reply) => {
    return login(request, reply);
  });

  //   example for protected route with JWT authentication
  app.post(
    "/login",
    { preHandler: app.authenticate },
    async (request, reply) => {
      return login(request, reply);
    },
  );
}
