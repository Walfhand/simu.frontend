export interface DepreciationTableLine {
  month: string;
  monthlyAmount: number;
  interestShare: number;
  capitalShare: number;
  remainingBalance: number;
}

export interface SimulationResult {
  fixedAnnualRate: number;
  monthlyAmount: number;
  depreciationTableLines: DepreciationTableLine[];
}
