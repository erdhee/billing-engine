import { ApplicationErrors } from "@enums/application.errors";
import { CreateLoanRequest } from "@models/requests/create_loan.request";
import { Repositories } from "@repositories/repositories";
import { ApplicationError } from "@utilities/application_error";
import { parseBody } from "@utilities/body_parser.util";
import { PublicContext } from "@utilities/public.context";
import { Hono } from "hono";

const app = new Hono<PublicContext>();

app.get("/:id/outstanding", async (c) => {
  const repository = Repositories.loanRepository;
  const id = c.req.param("id");

  if (!id) {
    throw new ApplicationError({
      status: 400,
      code: ApplicationErrors.BAD_REQUEST,
    });
  }

  const response = await repository.getOutstanding({
    id: id,
    borrowerId: c.var.borrowerId,
  });

  return c.json(response);
});

app.get("/:id/status", async (c) => {
  const repository = Repositories.loanRepository;
  const id = c.req.param("id");

  if (!id) {
    throw new ApplicationError({
      status: 400,
      code: ApplicationErrors.BAD_REQUEST,
    });
  }

  const response = await repository.getStatus({
    id: id,
    borrowerId: c.var.borrowerId,
  });

  return c.json(response);
});

app.post("/:id/pay", async (c) => {
  const repository = Repositories.invoiceRepository;
  const id = c.req.param("id");

  if (!id) {
    throw new ApplicationError({
      status: 400,
      code: ApplicationErrors.BAD_REQUEST,
    });
  }

  const response = await repository.create({
    loanId: id,
    borrowerId: c.var.borrowerId,
  });

  return c.json(response);
});

app.get("/:id", async (c) => {
  const repository = Repositories.loanRepository;
  const id = c.req.param("id");

  if (!id) {
    throw new ApplicationError({
      status: 400,
      code: ApplicationErrors.BAD_REQUEST,
    });
  }

  const response = await repository.get({
    id: id,
    borrowerId: c.var.borrowerId,
  });

  return c.json(response);
});

app.post("/", async (c) => {
  const repository = Repositories.loanRepository;
  const request = parseBody<CreateLoanRequest>(await c.req.json());

  request.borrower_id = c.var.borrowerId;

  const response = await repository.create({ request });

  return c.json(response);
});

app.get("/", async (c) => {
  const repository = Repositories.loanRepository;
  const response = await repository.getAll({
    borrowerId: c.var.borrowerId,
  });

  return c.json({
    loans: response,
  });
});

export default app;
