import { serve } from "@hono/node-server";
import { publicRouteMiddleware } from "@middlewares/public_route.middleware";
import { responseFormatter } from "@middlewares/response_formatter.middleware";
import hookRoute from "@routes/hook/hook.route";
import privateLoanRoute from "@routes/private/loan.route";
import publicLoanRoute from "@routes/public/loan.route";
import * as dotenv from "dotenv";
import { Hono } from "hono";
import * as path from "path";

const app = new Hono();

dotenv.config({ path: path.resolve(__dirname, "../.env") });
app.use("*", responseFormatter);

/**
 * Let's assume this is an API being used by the client side
 * It requires JWT token to check if the user is authorized to access the API
 */

const publicApi = new Hono();
publicApi.use("*", publicRouteMiddleware);
publicApi.route("/loan", publicLoanRoute);

/**
 * Let's assume this is an API being used by internal system (dashboard)
 * I'm going to skip auth for now, let's assume the user is authorized to access the API
 */

const privateApi = new Hono();
privateApi.route("/loan", privateLoanRoute);

/**
 * Let's assume this is an API being used by 3rd party (eg: payment gateway)
 * I'm going to skip auth for now, let's assume the user is authorized to access the API
 */

const hookApi = new Hono();
hookApi.route("/payment", hookRoute);

app.route("/public", publicApi);
app.route("/private", privateApi);
app.route("/hook", hookApi);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
