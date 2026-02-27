export interface ComplianceBalance {
  id: string;
  amountGco2eq: number;
}

export default class CreatePoolUseCase {
  private balances: ComplianceBalance[];

  constructor(balances: ComplianceBalance[]) {
    this.balances = balances.map((b) => ({ ...b })); // deep copy to avoid mutation
  }

  execute(): ComplianceBalance[] {
    this.verifySum();
    return this.redistributeBalances();
  }

  private verifySum(): void {
    const total = this.balances.reduce((sum, b) => sum + b.amountGco2eq, 0);
    if (total < 0) {
      throw new Error(
        `Invalid pool: sum of amountGco2eq is ${total}, must be >= 0.`
      );
    }
  }

  private redistributeBalances(): ComplianceBalance[] {
    // Sort descending: positives first, negatives last
    const sorted = [...this.balances].sort(
      (a, b) => b.amountGco2eq - a.amountGco2eq
    );

    let left = 0; // pointer to largest positive
    let right = sorted.length - 1; // pointer to largest negative (most negative)

    while (left < right) {
      const positive = sorted[left];
      const negative = sorted[right];

      // If right pointer is no longer negative, we're done
      if (negative.amountGco2eq >= 0) break;

      const deficit = Math.abs(negative.amountGco2eq);

      if (positive.amountGco2eq >= deficit) {
        // This positive can fully cover the deficit
        positive.amountGco2eq -= deficit;
        negative.amountGco2eq = 0;
        right--;

        // If positive is now 0, advance left pointer
        if (positive.amountGco2eq === 0) left++;
      } else {
        // This positive is not enough; use it all and move to next positive
        negative.amountGco2eq += positive.amountGco2eq;
        positive.amountGco2eq = 0;
        left++;
      }
    }

    return sorted;
  }
}