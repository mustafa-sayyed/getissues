import { ApiLogger as logger } from "@packages/shared";
import { asyncHandler } from "../utils/asyncRequest.ts";
import { httpStatusCodes } from "../utils/httpStatusCodes.ts";
import ApiError from "../utils/ApiError.ts";
import {
  runOnboardingPipeline,
  type OnboardingStreamEvent,
} from "../services/onboardingRun.service.ts";

// SSE comment heartbeat so proxies / gateways never see an idle connection
// while a scoring batch is running.
const HEARTBEAT_MS = 15000;

type OutgoingEvent = OnboardingStreamEvent | { type: "error"; message: string };

const runOnboarding = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(httpStatusCodes.UNAUTHORIZED, "Unauthorized");
  }

  const { languages, interests } = req.body;

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders();

  const send = (event: OutgoingEvent) => {
    if (res.writableEnded) return;
    res.write(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
  };

  const heartbeat = setInterval(() => {
    if (!res.writableEnded) {
      res.write(": ping\n\n");
    }
  }, HEARTBEAT_MS);

  req.on("close", () => {
    clearInterval(heartbeat);
  });

  // Everything after headers are sent must stay inside this try/catch:
  // throwing to the global error handler here would attempt a second
  // response on an already-streaming connection.
  try {
    for await (const event of runOnboardingPipeline(
      req.user.id,
      languages,
      interests,
    )) {
      send(event);
    }
  } catch (error) {
    logger.error(
      { error, userId: req.user.id },
      "Onboarding SSE stream failed.",
    );
    send({
      type: "error",
      message: "Something went wrong while finding your matches.",
    });
  } finally {
    clearInterval(heartbeat);
    if (!res.writableEnded) {
      res.end();
    }
  }
});

export { runOnboarding };
