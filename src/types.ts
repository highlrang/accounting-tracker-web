export interface Settlement {
  id: number;
  itemDate: string;
  origin: string;
  destination: string;
  isPaid: boolean;
  amount: number;
  isDeleted?: boolean;
}
