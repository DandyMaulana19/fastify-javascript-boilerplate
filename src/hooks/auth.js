import { errorResponse } from "../utils/response.js";

export function checkRole(allowedRoles = []) {
  return async function (request, reply) {
    const userRole = request.user?.role;
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const hasAccess = roles.includes(userRole);

    if (!hasAccess) {
      return errorResponse(
        reply,
        "Access Denied",
        "You don't have permission to access this resource.",
        403,
      );
    }
  };
}
