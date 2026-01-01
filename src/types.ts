export interface Settlement {
  id: number;
  itemDate: string;
  companyName: string;
  isPaid: boolean;
  amount: number;
  isDeleted?: boolean;
}
