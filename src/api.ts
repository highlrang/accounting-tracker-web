import { Settlement } from './types';

let initialData: Settlement[] = [
  { id: 1, date: '2025-12-01', company: '네이버', paid: true, amount: 1500000 },
  { id: 2, date: '2025-12-02', company: '카카오', paid: false, amount: 250000 },
  { id: 3, date: '2025-12-03', company: '라인', paid: true, amount: 750000 },
  { id: 4, date: '2025-12-04', company: '쿠팡', paid: false, amount: 120000 },
  { id: 5, date: '2025-12-05', company: '배달의민족', paid: true, amount: 320000 },
  { id: 6, date: '2025-12-01', company: 'Google', paid: true, amount: 2500000 },
  { id: 7, date: '2025-12-06', company: 'Apple', paid: false, amount: 980000 },
  { id: 8, date: '2025-12-07', company: 'Microsoft', paid: true, amount: 500000 },
  { id: 9, date: '2025-12-08', company: 'Amazon', paid: false, amount: 1800000 },
  { id: 10, date: '2025-12-09', company: 'Samsung', paid: true, amount: 2200000 },
  { id: 11, date: '2025-12-10', company: 'LG', paid: false, amount: 650000 },
  { id: 12, date: '2025-12-11', company: 'Hyundai', paid: true, amount: 7000000 },
  { id: 13, date: '2025-12-12', company: 'SKT', paid: false, amount: 400000 },
  { id: 14, date: '2025-12-13', company: 'KT', paid: true, amount: 350000 },
  { id: 15, date: '2025-12-14', company: 'Uplus', paid: false, amount: 280000 },
  { id: 16, date: '2025-12-15', company: 'Nexon', paid: true, amount: 1000000 },
  { id: 17, date: '2025-12-16', company: 'NCSoft', paid: false, amount: 900000 },
  { id: 18, date: '2025-12-17', company: 'Smilegate', paid: true, amount: 1100000 },
  { id: 19, date: '2025-12-18', company: 'Kakao Games', paid: false, amount: 700000 },
  { id: 20, date: '2025-12-19', company: 'Pearl Abyss', paid: true, amount: 1300000 },
  { id: 21, date: '2025-12-20', company: 'Devsisters', paid: false, amount: 150000 },
];

interface FetchSettlementsParams {
  offset?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  company?: string;
  paidStatus?: 'all' | 'paid' | 'unpaid';
}

interface FetchSettlementsResult {
  settlements: Settlement[];
  totalCount: number;
}

export const fetchSettlements = ({
  offset = 0,
  limit = 10,
  startDate,
  endDate,
  company,
  paidStatus,
}: FetchSettlementsParams): Promise<FetchSettlementsResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let result = [...initialData];

      if (startDate) {
        result = result.filter(item => item.date >= startDate);
      }
      if (endDate) {
        result = result.filter(item => item.date <= endDate);
      }

      if (company) {
        result = result.filter(item => item.company.toLowerCase().includes(company.toLowerCase()));
      }

      if (paidStatus !== 'all' && paidStatus !== undefined) {
        result = result.filter(item => (paidStatus === 'paid' ? item.paid : !item.paid));
      }

      const totalCount = result.length;
      const paginatedSettlements = result.slice(offset, offset + limit);

      resolve({ settlements: paginatedSettlements, totalCount });
    }, 500); // Simulate network delay
  });
};

export const addSettlements = (newSettlementItems: Omit<Settlement, 'id'>[]): Promise<Settlement[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            let currentMaxId = initialData.length > 0 ? Math.max(...initialData.map(item => item.id)) : 0;
            const addedSettlements: Settlement[] = newSettlementItems.map(item => {
                currentMaxId++;
                return { ...item, id: currentMaxId };
            });
            initialData = [...initialData, ...addedSettlements];
            resolve(addedSettlements);
        }, 300);
    });
}

// Renamed from addSingleSettlement to addSettlement as it's the single add used in UI now
export const addSettlement = (settlement: Omit<Settlement, 'id'>): Promise<Settlement> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newId = initialData.length > 0 ? Math.max(...initialData.map(item => item.id)) + 1 : 1;
            const newSettlement = { ...settlement, id: newId };
            initialData = [...initialData, newSettlement];
            resolve(newSettlement);
        }, 300);
    });
}

export const updateSettlement = (updatedSettlement: Settlement): Promise<Settlement> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = initialData.findIndex(item => item.id === updatedSettlement.id);
            if (index !== -1) {
                initialData[index] = updatedSettlement;
                resolve(updatedSettlement);
            } else {
                reject(new Error('Settlement not found'));
            }
        }, 300);
    });
}

export const updateSettlementsStatus = (ids: number[], paidStatus: boolean): Promise<number[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            initialData = initialData.map(item => 
                ids.includes(item.id) ? { ...item, paid: paidStatus } : item
            );
            resolve(ids);
        }, 300);
    });
}

export const deleteSettlement = (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = initialData.findIndex(item => item.id === id);
            if (index !== -1) {
                initialData.splice(index, 1);
                resolve();
            } else {
                reject(new Error('Settlement not found'));
            }
        }, 300);
    });
}
