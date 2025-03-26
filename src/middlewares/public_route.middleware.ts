import { ApplicationErrors } from "@enums/application.errors";
import { ApplicationError } from "@utilities/application_error";
import { PublicContext } from "@utilities/public.context";
import { MiddlewareHandler } from "hono";
import * as jwt from "jsonwebtoken";

interface PublicRouteJwtPayload extends jwt.JwtPayload {
  borrowerId?: string;
}

export const publicRouteMiddleware: MiddlewareHandler<PublicContext> = async (
  c,
  next,
) => {
  const token = c.req.header("Authorization")?.split(" ")[1];
  const key = process.env.JWT_KEY;

  if (!token) {
    throw new ApplicationError({
      status: 401,
      code: ApplicationErrors.UNAUTHORIZED,
    });
  }

  if (!key) {
    throw new ApplicationError({
      status: 500,
      code: ApplicationErrors.INVALID_CREDENTIALS,
    });
  }

  try {
    const decoded = jwt.verify(token, key, {
      algorithms: ["HS256"],
    }) as PublicRouteJwtPayload;
    const borrowerId = decoded.borrowerId;

    if (!borrowerId) {
      throw new ApplicationError({
        status: 401,
        code: ApplicationErrors.UNAUTHORIZED,
      });
    }

    c.set("borrowerId", borrowerId);
    await next();
  } catch (e) {
    if (e instanceof ApplicationError) {
      throw e;
    }

    throw new ApplicationError({
      status: 401,
      code: ApplicationErrors.UNAUTHORIZED,
    });
  }
};
