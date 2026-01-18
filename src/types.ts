export interface Settlement {
  id: number;
  itemDate: string;
  origin: string;
  destination: string;
  notes?: string;
  isPaid: boolean;
  amount: number;
  createdAt?: string;
  isDeleted?: boolean;
}
