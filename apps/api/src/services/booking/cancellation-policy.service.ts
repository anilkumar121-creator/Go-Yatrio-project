import { Prisma, ServiceType } from "@prisma/client";
import { prisma } from "../../db.js";
import { AppError } from "../../utils/app-error.js";

export type PolicyEvaluationResult = {
  penaltyAmount: Prisma.Decimal;
  refundableAmount: Prisma.Decimal;
  policySnapshot: Record<string, unknown>;
  appliedPolicyId: string | null;
};

export class CancellationPolicyService {
  /**
   * Evaluates the cancellation penalty and refundable amount based on active policies.
   *
   * Policy Window Semantics:
   * hoursBefore >= (hoursBeforeMin || 0) AND (hoursBeforeMax === null || hoursBefore < hoursBeforeMax)
   * This provides a deterministic boundary.
   */
  static async evaluatePolicy(params: {
    serviceType: ServiceType;
    totalAmount: Prisma.Decimal;
    advanceAmount: Prisma.Decimal;
    grossPaid: Prisma.Decimal;
    existingRefunds: Prisma.Decimal;
    relevantDate: Date; // e.g. pickupDate for cab
    tx?: Prisma.TransactionClient;
  }): Promise<PolicyEvaluationResult> {
    const {
      serviceType,
      totalAmount,
      advanceAmount,
      grossPaid,
      existingRefunds,
      relevantDate,
      tx,
    } = params;

    const netPaid = grossPaid.sub(existingRefunds);

    if (netPaid.lt(0)) {
      throw new AppError("Invalid financial state: net paid cannot be negative", 500);
    }

    // 1. Fetch active policy
    const dbClient = tx || prisma;
    const activePolicies = await dbClient.cancellationPolicy.findMany({
      where: {
        serviceType,
        isActive: true,
      },
      include: {
        rules: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (activePolicies.length === 0) {
      throw new AppError(
        `No active cancellation policy found for service type ${serviceType}`,
        400,
      );
    }

    if (activePolicies.length > 1) {
      throw new AppError(
        `Ambiguous policy configuration: multiple active policies for service type ${serviceType}`,
        500,
      );
    }

    const policy = activePolicies[0];

    // 2. Calculate hours before relevant date
    const now = new Date();
    const timeDiffMs = relevantDate.getTime() - now.getTime();
    const hoursBefore = timeDiffMs / (1000 * 60 * 60);

    // 3. Find matching rule
    let matchedRule = null;

    for (const rule of policy.rules) {
      const minMatch = rule.hoursBeforeMin === null || hoursBefore >= rule.hoursBeforeMin;
      const maxMatch = rule.hoursBeforeMax === null || hoursBefore < rule.hoursBeforeMax;

      if (minMatch && maxMatch) {
        matchedRule = rule;
        break; // Deterministic: first match based on sortOrder
      }
    }

    if (!matchedRule) {
      throw new AppError(
        `No applicable cancellation rule found for hoursBefore=${hoursBefore.toFixed(2)}`,
        400,
      );
    }

    // 4. Calculate penalty
    let penaltyAmount = new Prisma.Decimal(0);

    if (matchedRule.penaltyPercentage && matchedRule.penaltyFlatAmount) {
      throw new AppError(
        `Rule misconfiguration: cannot specify both percentage and flat penalty`,
        500,
      );
    }

    const basisAmount = matchedRule.penaltyBasis === "ADVANCE" ? advanceAmount : totalAmount;

    if (matchedRule.penaltyPercentage) {
      penaltyAmount = basisAmount.mul(matchedRule.penaltyPercentage).div(100);
    } else if (matchedRule.penaltyFlatAmount) {
      penaltyAmount = new Prisma.Decimal(matchedRule.penaltyFlatAmount);
    }

    // Ensure penalty doesn't exceed total booking amount
    if (penaltyAmount.gt(totalAmount)) {
      penaltyAmount = totalAmount;
    }

    // 5. Calculate refundable amount
    let refundableAmount = netPaid.sub(penaltyAmount);
    if (refundableAmount.lt(0)) {
      refundableAmount = new Prisma.Decimal(0); // Cannot refund more than paid
    }

    return {
      penaltyAmount,
      refundableAmount,
      policySnapshot: policy as unknown as Record<string, unknown>,
      appliedPolicyId: policy.id,
    };
  }
}
