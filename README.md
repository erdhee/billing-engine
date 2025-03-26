# Billing Engine

## About

It's only a minimal sample for billing engine, it does not contains any real auth mechanism and complex payment system. It's more like a high-level of Billing Engine system where includes several parts:

###### Public Routes ("/public")

This route represent endpoint to be used for client app (borrowers) where they will be able to:

1. Request loan: **[POST]** `/public/loan/`
2. Get detail loan: **[GET]** `/public/loan/${id}`
3. Get outstanding from specific loan: **[GET]** `/public/loan/${id}/outstanding`
4. Get loan status (related to delinquent status): **[GET]** `/public/loan/${id}/status`
5. Make a payment: **[POST]** `/public/loan/${id}/pay`

Several notes need to be observe carefully:

1. When borrower request loan, the loan is not immediately active. The internal team have to process the loan, and move the status from `PENDING` &rarr; `APPROVED` &rarr; `DISBURSED`. Once the status is disbursed, all the billings will be created immediately based on give loan configuration. We assume that the amount will be paid by user for each invoices is using static amount, hence there should not be the case where the amount is greater than the amount stated in the invoice.
2. Borrowers will be able to request multiple loan **ONLY IF** the other loan has passed `PENDING` state (either `APPROVED`, `DISBURSED`, `COMPLETED`, or `CLOSED`)
3. When borrower make a payment, it's not immediately mark the billing status to be paid. When user hit the endpoint, it will create an invoice which contains one or multiple billings. By having so, it allows borrowers to who skip the billings several times, which means having multiple outstanding balance to pay multiple billing at once.

###### Private Routes ("/private")

This route represent endpoint to be used by internal system (Backoffice / Dashboard) where the internal team have to process and manage loans requested by the borrowers. For now, there are only 2 endpoints available:

1. Approve Loan: **[PATCH]** `/private/loan/${id}/approve`
2. Disburse Loan: **[PATCH]** `/private/loan/${id}/disburse`

Several notes need to be observe carefully:

1. When approving loan, it's only change the status from `PENDING` to `APPROVE`. We assume there the internal team won't be able to change the loan configuration at any step right now. But by having this step, it allows to do so in the future.
2. When disbursinng loan, the existing system is not handle the process to disburse, but instead it's only manage to create multiple billing at once, and activate the loan itself.

###### Hook Routes ("/hook")

This route represent endpoint to be used by external parties (eg: Payment gateway). For the case of borrower make a payment, system will only create an invoice where we expect the payment gateway will trigger a webhook to our endpoint to notify when borrower is really make a payment for given invoice.

1. Mark as Paid: **POST** `hook/payment/paid`

When this endpoint trigger, ideally system will perform check to the payment gateway using the refId to ensure the payment is actually happenend. But in this example, that process is not available. It's only mark the invoice and billing status as `PAID`. And if there are no more active billing, system will immediately mark the loan as `COMPLETED` as well.

We utilize **PGCron** in this example to check the invoice expiration, and mark the invoice status as `EXPIRED` if the time exceeded.

## Tech Stack

This billing engine use:

1. [Hono Framework](https://hono.dev/)
2. Typescript
3. [Supabase](https://supabase.com/)

Hence, in order to run this application locally in your machine, you have to install [Supabase](https://supabase.com/) in your machine and have [Docker](https://www.docker.com/) installed as well.

###### Why Hono?

Because we're aiming for rapid development. We're totally aware that Go is very good at performance, but writing complete system with Go for this test will be quite time consuming due to quite lack of devex. I'm not against Go. I love Go with their performance and excellent memory management, but only for this test, i prefer typescript-based framework to speed up things.

###### Why Supabase?

Because we don't need to put extra effort to setup data layer. Supabase is using Postgresql, so I think to reduce the effort to setup, we can simply use Supabase.

###### How to run this project?

1. Run `npm install` to install all dependencies
2. Ensure you already have Docker and Supabase installed & running on your machine.
3. Run `supabase start` to start Supabase locally. It will run the initial migrations and seed the database.
4. Copy `.env.sample` to `.env` and change the value of `SUPABASE_URL` and `SUPABASE_ANON_KEY` match with the configuration on your local machine. Please check via `supabase status` command and copy `API Url` and `anon key` from the output.
5. Run `npm run dev` to start the project.
6. You'll find `Billing Enginen - Insomnia.yaml` in the root directory. Import it to Insomnia and start testing.

## Database Design

![DB Design](https://github.com/user-attachments/assets/b0f2b875-6f2b-427a-b3f2-f08364859d3f)

Complete structure can be found [here](https://dbdiagram.io/d/Billing-Engine-67e167ff75d75cc84440f021)

## Other Notes

1. The data layer is heavily depends on the supabase SDK. While supabase SDK does not support transactional operations, we're using **plpgsql** to handle the transactional operations.
2. You may notice that we also have several **views** in the database to simplify the query.
3. If you want to start over from scratch, you can simply run `supabase db reset`.
4. The JWT Token being set in Insomnia is kinda static to match with the seed data. Please adjust accordingly when needed.

## Testing Flow

###### Basic Flow

1. Hit **[POST]** `public/loan/' to create a loan.
2. Hit **[PATCH]** `private/loan/${id}/approve` to approve the loan.
3. Hit **[PATCH]** `private/loan/${id}/disburse` to disburse the loan.

###### Check Outstanding

1. Once loan has been disbursed, the very first billing will be on H+7. So, we need to change the billing date manually on DB so we can check the outstanding balance.
2. Run `supabase status` and check `Studio URL` to change the data from supabase studio editor.
3. Once the data has been updated, hit **[GET]** `private/loan/${id}/outstanding` to check the outstanding balance.

###### Check Delinquent Status

1. Because delinquent status is based on the outstanding, or in this case is the number of active billings that not being paid yet, so we need to adjust another record on `billings` table, so at least we have 2 active billings.
2. Once the data has been updated, hit **[GET]** `private/loan/${id}/status` to check the delinquent status.

###### Make Payment

1. Because from the latest testing state, we have at least 2 billings, so we'll expect the amount to be paid by borrowers must be the sum of the billing's amount.
2. Hit **[POST]** `private/loan/${id}/pay` to make a payment. The response will contains total amount need to be paid by the borrower and the also the expiry date.
3. Hit **[POST]** `hook/payment/paid` to mark the invoice as paid. The default `tenure_week` is 50, so the `loans` won't be `COMPLETED` until all billings are paid.
