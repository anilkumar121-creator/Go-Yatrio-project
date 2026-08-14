import { loginAdmin } from "../services/auth.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { sendSuccess } from "../utils/api-response.js";
import { loginSchema } from "../validators/schemas.js";

export const login = asyncHandler(async (request, response) => {
  const credentials = loginSchema.parse(request.body);
  const result = await loginAdmin(credentials.email, credentials.password);

  sendSuccess(response, result);
});
