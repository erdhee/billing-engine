import { ApplicationErrors } from "@enums/application.errors";
import { Repositories } from "@repositories/repositories";
import { ApplicationError } from "@utilities/application_error";
import { Hono } from "hono";

const app = new Hono();

app.patch("/:id/approve", async (c) => {
  const repository = Repositories.loanRepository;
  const id = c.req.param("id");

  if (!id) {
    throw new ApplicationError({
      status: 400,
      code: ApplicationErrors.BAD_REQUEST,
    });
  }

  const response = await repository.approve({
    id: id,
  });

  return c.json(response);
});

app.patch("/:id/disburse", async (c) => {
  const repository = Repositories.loanRepository;
  const id = c.req.param("id");

  if (!id) {
    throw new ApplicationError({
      status: 400,
      code: ApplicationErrors.BAD_REQUEST,
    });
  }

  const response = await repository.disburse({
    id: id,
  });

  return c.json(response);
});

export default app;
