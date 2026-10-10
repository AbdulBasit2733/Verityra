# Verityra Razorpay Payments Integration

## 1. Flow Overview

Verityra integrates Razorpay payments with server-side order generation and signature verification:

1. **Order Creation (`actions/registration-actions.ts`)**:
   - `createRazorpayOrderAction(testSeriesId)` initiates the order directly on the server.
   - Price is verified from the database (client-supplied prices are strictly ignored).
   - A `Payment` record with status `PENDING` is stored in the database.

2. **Client Checkout**:
   - The student opens Razorpay modal with `orderId` and `key_id`.

3. **Signature Verification & Entitlement Grant**:
   - `verifyPaymentAndRegisterAction(...)` receives `razorpayOrderId`, `razorpayPaymentId`, and `razorpaySignature`.
   - Computes HMAC SHA-256 signature server-side.
   - Atomically updates payment to `COMPLETED` and unlocks the candidate's `TestRegistration`.

## 2. Webhooks & Idempotency (`/api/webhooks/razorpay`)

- Incoming webhooks (`order.paid`, `payment.captured`) are validated using `RAZORPAY_WEBHOOK_SECRET`.
- Every event is recorded in the `WebhookEvent` table.
- If an event has already been marked as `PROCESSED`, it is acknowledged with HTTP 200 without granting duplicate registrations.
