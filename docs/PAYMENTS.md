# Verityra — Razorpay Payments & Financials Architecture

> **Work Directory**: `verityra4/`  
> **Domain**: Revenue Governance, 7-Day Refund Policy, Webhook Fault-Tolerance & Immutable Audit Ledger.

---

## 1. Flow Overview & Checkout Lifecycle

Verityra integrates Razorpay payments with strict server-side order generation and signature verification:

1. **Order Creation ([`actions/registration-actions.ts`](file:///d:/Abdul%20Basit/Freelance/Verityra/verityra4/actions/registration-actions.ts))**:
   - `createRazorpayOrderAction(testSeriesId)` initiates the order directly on the server.
   - Price in paise (`Math.round(price * 100)`) is fetched from PostgreSQL; client-supplied prices are strictly ignored.
   - A `Payment` record with status `PENDING` is stored in PostgreSQL.

2. **Client Checkout Modal**:
   - The candidate opens the Razorpay checkout modal initialized with `orderId`, `amount`, and `key_id`.

3. **Server-Side HMAC SHA-256 Verification & Entitlement Grant**:
   - `verifyPaymentAndEnrollAction(...)` receives `razorpayOrderId`, `razorpayPaymentId`, and `razorpaySignature`.
   - Computes expected HMAC SHA-256 signature using `crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)`.
   - Upon signature match, an atomic transaction:
     - Updates `Payment.status = COMPLETED`.
     - Creates active `TestRegistration` with `maxAttempts = 3` and `attemptsUsed = 0`.
     - Inserts a `PAYMENT_CAPTURED` event into `PaymentLedger`.

---

## 2. 7-Day Return Policy & Attempt Forfeiture Guard

Verityra enforces a strict **7-Day Return Policy** triggered by administrators via [`actions/payment-actions.ts`](file:///d:/Abdul%20Basit/Freelance/Verityra/verityra4/actions/payment-actions.ts):

### 2.1. Eligibility Criteria
- **Time Window**: Allowed strictly within 7 calendar days ($\le 7 \times 24 \times 60 \times 60 \times 1000\text{ ms}$) from the payment's `createdAt` timestamp.
- **Expired Requests**: Requests on orders $> 7$ days old are blocked by standard UI actions.

### 2.2. Attempt Consumption Guard
- **Zero Attempts Used (`attemptsUsed === 0`)**: The candidate has not accessed test attempts; refund executes immediately upon administrator confirmation.
- **Attempts Used (`attemptsUsed > 0`)**: The candidate has already consumed attempt quotas. The refund dialog displays an amber alert and **strictly requires an explicit forfeiture acknowledgment checkbox** (`confirmedForfeiture: true`).

### 2.3. Atomic Database Transitions
When an administrator triggers a refund:
```ts
await prisma.$transaction(async (tx) => {
  // 1. Update Payment status
  await tx.payment.update({
    where: { id: paymentId },
    data: { status: PaymentStatus.REFUNDED, amountRefunded: payment.amount }
  })
  // 2. Record PaymentRefund record with reason and admin ID
  await tx.paymentRefund.create({
    data: { paymentId, refundId, amount: payment.amount, reason, adminId: user.id, adminNotes }
  })
  // 3. Forfeit registration access
  await tx.testRegistration.update({
    where: { id: registration.id },
    data: { status: RegistrationStatus.CANCELLED, maxAttempts: 0 }
  })
  // 4. Record Immutable Ledger Event
  await tx.paymentLedger.create({
    data: { paymentId, eventType: "REFUND_PROCESSED", actorType: "ADMIN_OVERRIDE", actorName: user.name, ... }
  })
  // 5. Audit Log
  await tx.auditLog.create({
    data: { adminId: user.id, action: "PAYMENT_REFUNDED", targetType: "Payment", targetId: paymentId, ... }
  })
})
```

---

## 3. Webhooks & Idempotency (`/api/webhooks/razorpay`)

- Incoming webhooks (`payment.captured`, `payment.failed`, `refund.processed`) are verified using `RAZORPAY_WEBHOOK_SECRET` against header `x-razorpay-signature`.
- **Idempotency Guarantee**: Every event is tracked in `WebhookEvent`. If `idempotencyKey` has already been processed, the route returns HTTP 200 without duplicate processing.
- Failed payment events log diagnostic details to `PaymentLedger` (`PAYMENT_FAILED`) without granting test access.

---

## 4. Network Fault Tolerance & Auto-Reconciliation

1. **Client Recovery Endpoint ([`/api/payments/verify-status`](file:///d:/Abdul%20Basit/Freelance/Verityra/verityra4/app/api/payments/verify-status/route.ts))**:
   - If a candidate's internet drops immediately after UPI PIN confirmation before the checkout modal fires the frontend callback, the client calls this verification endpoint.
   - Queries Razorpay directly to verify capture status and auto-provisions `TestRegistration`.

2. **Background Reconciliation Action (`reconcilePendingPaymentsAction`)**:
   - Scans orders in `PENDING` status older than 30 minutes.
   - Reconciles against Razorpay's API to detect payments captured on the banking side.

---

## 5. Verification & Testing

Tested thoroughly in [`tests/payments.test.ts`](file:///d:/Abdul%20Basit/Freelance/Verityra/verityra4/tests/payments.test.ts) (8 dedicated invariants):
- HMAC SHA-256 signature calculation and tamper rejection.
- 7-day policy window calculation ($\le 7\text{ days}$ eligible, $> 7\text{ days}$ expired).
- Attempt forfeiture guard blocking unconfirmed refunds.
- Unique idempotency key generation.
- Immutable `PaymentLedger` event payload serialization.
- Auto-reconciler 30-minute threshold logic.
