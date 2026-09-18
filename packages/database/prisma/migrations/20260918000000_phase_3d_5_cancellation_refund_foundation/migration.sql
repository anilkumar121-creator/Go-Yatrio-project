-- CreateEnum
CREATE TYPE "CancellationReasonType" AS ENUM ('CUSTOMER_INITIATED', 'ADMIN_INITIATED', 'SYSTEM_TIMEOUT', 'NO_SHOW', 'PAYMENT_FAILURE');

-- CreateEnum
CREATE TYPE "CancellationSource" AS ENUM ('CUSTOMER', 'GUEST', 'ADMIN', 'SYSTEM');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED');

-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('GUEST_CANCELLATION');

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "cancellationPenaltyAmount" DECIMAL(12,2),
ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "cancellationReasonType" "CancellationReasonType",
ADD COLUMN     "cancellationSource" "CancellationSource",
ADD COLUMN     "cancelledByUserId" TEXT,
ADD COLUMN     "refundableAmount" DECIMAL(12,2);

-- CreateTable
CREATE TABLE "cancellation_records" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "cancellationSource" "CancellationSource" NOT NULL,
    "reasonType" "CancellationReasonType" NOT NULL,
    "reasonText" TEXT,
    "cancelledByUserId" TEXT,
    "totalBookingAmount" DECIMAL(12,2) NOT NULL,
    "totalPaidAmount" DECIMAL(12,2) NOT NULL,
    "penaltyAmount" DECIMAL(12,2) NOT NULL,
    "refundableAmount" DECIMAL(12,2) NOT NULL,
    "appliedPolicyId" TEXT,
    "policySnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cancellation_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refunds" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
    "idempotencyKey" TEXT NOT NULL,
    "providerRefundId" TEXT,
    "failureReason" TEXT,
    "providerMetadata" JSONB,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cancellation_policies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cancellation_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cancellation_policy_rules" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "hoursBeforeMin" INTEGER,
    "hoursBeforeMax" INTEGER,
    "penaltyPercentage" DECIMAL(5,2),
    "penaltyFlatAmount" DECIMAL(12,2),
    "penaltyBasis" TEXT NOT NULL DEFAULT 'TOTAL',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "cancellation_policy_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_records" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT,
    "identifier" TEXT NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "otpHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cancellation_records_bookingId_key" ON "cancellation_records"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "refunds_idempotencyKey_key" ON "refunds"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "refunds_providerRefundId_key" ON "refunds"("providerRefundId");

-- CreateIndex
CREATE INDEX "refunds_bookingId_idx" ON "refunds"("bookingId");

-- CreateIndex
CREATE INDEX "refunds_paymentId_idx" ON "refunds"("paymentId");

-- CreateIndex
CREATE INDEX "cancellation_policies_serviceType_isActive_idx" ON "cancellation_policies"("serviceType", "isActive");

-- CreateIndex
CREATE INDEX "cancellation_policy_rules_policyId_idx" ON "cancellation_policy_rules"("policyId");

-- CreateIndex
CREATE INDEX "otp_records_identifier_purpose_idx" ON "otp_records"("identifier", "purpose");

-- CreateIndex
CREATE INDEX "otp_records_bookingId_idx" ON "otp_records"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_gatewayTransactionId_key" ON "payments"("gatewayTransactionId");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_cancelledByUserId_fkey" FOREIGN KEY ("cancelledByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cancellation_records" ADD CONSTRAINT "cancellation_records_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cancellation_records" ADD CONSTRAINT "cancellation_records_cancelledByUserId_fkey" FOREIGN KEY ("cancelledByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cancellation_policy_rules" ADD CONSTRAINT "cancellation_policy_rules_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "cancellation_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otp_records" ADD CONSTRAINT "otp_records_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

