type DemoExpense = {
  id: string;
  companyId: string;
  userId: string;
  title: string;
  description: string | null;
  amount: number;
  currency: string;
  category: string;
  receiptUrl: string | null;
  status: string;
  submittedAt: Date;
  reviewedById: string | null;
  reviewedAt: Date | null;
  reviewNotes: string | null;
  paidAt: Date | null;
  user: { name: string; email: string; jobTitle: string; department: string };
  reviewedBy: { name: string } | null;
};

// Module-level store — persists within a serverless instance lifetime
const store: DemoExpense[] = [];

export function getDemoSubmissions(): DemoExpense[] {
  return store;
}

export function addDemoExpense(expense: DemoExpense): void {
  store.unshift(expense);
}
