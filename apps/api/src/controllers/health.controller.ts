import { getHealth } from "../services/health.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { sendSuccess } from "../utils/api-response.js";

export const health = asyncHandler(async (_request, response) => {
  sendSuccess(response, await getHealth());
});
