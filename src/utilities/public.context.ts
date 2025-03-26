import { Context } from "hono";

export type PublicContext = Context & {
  Variables: {
    borrowerId: string;
  };
};
