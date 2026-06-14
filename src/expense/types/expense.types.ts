export interface ExpenseWithDetails {
  id: string;
  task: string;
  amount: number;
  date: Date;
  createdAt: Date;
  category: {
    id: string;
    name: string;
  };
  addedBy: {
    id: string;
    name: string;
    email: string;
  };
}
