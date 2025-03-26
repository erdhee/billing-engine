import { MarkInvoiceRequest } from "@models/requests/mark_invoice.request";
import { Repositories } from "@repositories/repositories";
import { parseBody } from "@utilities/body_parser.util";
import { Hono } from "hono";

const app = new Hono();

app.post("/paid", async (c) => {
  const repository = Repositories.invoiceRepository;
  const param = parseBody<MarkInvoiceRequest>(await c.req.json());
  const response = await repository.markInvoice(param);

  return c.json({
    status: response,
  });
});

export default app;
