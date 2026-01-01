import { Settlement } from './types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface FetchSettlementsParams {
  page?: number;
  size?: number;
  startDate?: string;
  endDate?: string;
  companyName?: string;
  isPaid?: boolean;
}

interface FetchSettlementsResult {
  settlements: Settlement[];
  totalCount: number;
}

export const fetchSettlements = async ({
  page = 0,
  size = 20,
  startDate,
  endDate,
  companyName,
  isPaid,
}: FetchSettlementsParams): Promise<FetchSettlementsResult> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('size', size.toString());
  params.append('sort', 'itemDate,DESC');

  if (startDate) {
    params.append('startDate', startDate);
  }
  if (endDate) {
    params.append('endDate', endDate);
  }
  if (companyName) {
    params.append('companyName', companyName);
  }
  if (isPaid !== null && isPaid !== undefined) {
    params.append('isPaid', String(isPaid));
  }

  const response = await fetch(`${BASE_URL}/api/account-items?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();

  const settlements: Settlement[] = data.content.map((item: any) => ({
    id: item.id,
    itemDate: item.itemDate,
    companyName: item.companyName,
    amount: item.amount,
    isPaid: item.isPaid
  }));

  return { settlements, totalCount: data.totalElements };
};

export const addSettlements = async (newSettlementItems: Omit<Settlement, 'id'>[]): Promise<Settlement[]> => {
  const results: Settlement[] = [];
  for (const item of newSettlementItems) {
    const response = await fetch(`${BASE_URL}/api/account-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        itemDate: item.itemDate,
        companyName: item.companyName,
        amount: item.amount,
        isPaid: item.isPaid
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const addedItem = await response.json();
    results.push({
      id: addedItem.id,
      itemDate: addedItem.itemDate,
      companyName: addedItem.companyName,
      amount: addedItem.amount,
      isPaid: addedItem.isPaid,
    });
  }
  return results;
};

export const updateSettlement = async (updatedSettlement: Settlement): Promise<Settlement> => {
  const response = await fetch(`${BASE_URL}/api/account-items/${updatedSettlement.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      itemDate: updatedSettlement.itemDate,
      companyName: updatedSettlement.companyName,
      amount: updatedSettlement.amount,
      isPaid: updatedSettlement.isPaid
    }),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return {
    id: data.id,
    itemDate: data.itemDate,
    companyName: data.companyName,
    amount: data.amount,
    isPaid: data.isPaid
  };
};

export const updateSettlementsStatus = async (ids: number[], paidStatus: boolean): Promise<number[]> => {
  const results: number[] = [];
  for (const id of ids) {
    // fetch the current settlement to get all its fields
    const currentSettlementResponse = await fetch(`${BASE_URL}/api/account-items/${id}`);
    if (!currentSettlementResponse.ok) {
      console.error(`Failed to fetch settlement with id ${id}. Status: ${currentSettlementResponse.status}`);
      continue;
    }
    const currentSettlementData = await currentSettlementResponse.json();

    const updatedSettlement: Settlement = {
      id: currentSettlementData.id,
      itemDate: currentSettlementData.itemDate,
      companyName: currentSettlementData.companyName,
      amount: currentSettlementData.amount,
      isPaid: paidStatus
    };

    await updateSettlement(updatedSettlement); // Use the single update function
    results.push(id);
  }
  return results;
};

export const deleteSettlement = async (id: number): Promise<void> => {
  const response = await fetch(`${BASE_URL}/api/account-items/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};
