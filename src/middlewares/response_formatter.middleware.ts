import { ApplicationError } from "@utilities/application_error";
import type { MiddlewareHandler } from "hono";

export const responseFormatter: MiddlewareHandler = async (c, next) => {
  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  try {
    await next();
    console.log(c.res);
    const response = await c.res.json();
    const status = c.res.status;
    const headers = c.res.headers;

    c.res = new Response(
      JSON.stringify({
        status: status,
        data: response,
      }),
      {
        status: status,
        headers: headers,
      },
    );
  } catch (error) {
    console.log(error);
    if (error instanceof ApplicationError) {
      c.res = new Response(
        JSON.stringify({
          status: error.status,
          code: error.code,
        }),
        {
          status: error.status,
          headers: defaultHeaders,
        },
      );
    } else {
      c.res = new Response(
        JSON.stringify({
          status: 500,
          code: "UNKNOWN_ERROR",
        }),
        {
          status: 500,
          headers: defaultHeaders,
        },
      );
    }
  }
};
