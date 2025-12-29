export interface Settlement {
  id: number;
  date: string;
  company: string;
  notes: string;
  paid: boolean;
  amount: number;
}
