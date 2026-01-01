import React, { useState } from 'react';
import { Settlement } from '../types';
import './Form.css';

interface AddSettlementFormProps {
  onAdd: (newSettlement: Omit<Settlement, 'id' | 'isDeleted'>) => void;
  onClose: () => void;
}

interface NewSettlementEntry {
  itemDate: string;
  companyName: string;
  amount: number;
}

const AddSettlementForm: React.FC<AddSettlementFormProps> = ({ onAdd, onClose }) => {
  const [newSettlement, setNewSettlement] = useState<NewSettlementEntry>({
    itemDate: '', companyName: '', amount: 0
  });

  const handleChange = (field: keyof NewSettlementEntry, value: string | number) => {
    setNewSettlement(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isAmountValid = !isNaN(newSettlement.amount) && newSettlement.amount > 0;
    if (!newSettlement.itemDate || !newSettlement.companyName || !isAmountValid) {
      alert('모든 항목의 날짜, 회사명, 금액은 필수 입력이며, 금액은 유효한 숫자여야 합니다.');
      return;
    }

    onAdd({
      itemDate: newSettlement.itemDate,
      companyName: newSettlement.companyName,
      amount: newSettlement.amount,
      isPaid: false,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2>새 정산 항목 추가</h2>
      <div className="form-content-scrollable">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="itemDate">날짜</label>
            <input
              id="itemDate"
              type="date"
              value={newSettlement.itemDate}
              onChange={(e) => handleChange('itemDate', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="companyName">회사명</label>
            <input
              id="companyName"
              type="text"
              value={newSettlement.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="amount">금액</label>
            <input
              id="amount"
              type="text"
              value={newSettlement.amount === 0 ? '' : newSettlement.amount.toLocaleString('ko-KR')}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/[^0-9]/g, '');
                handleChange('amount', rawValue === '' ? 0 : Number(rawValue));
              }}
              onBlur={(e) => {
                const formattedValue = Number(e.target.value.replace(/[^0-9]/g, '')).toLocaleString('ko-KR');
                e.target.value = formattedValue === '0' ? '' : formattedValue;
              }}
              onFocus={(e) => {
                e.target.value = newSettlement.amount === 0 ? '' : String(newSettlement.amount);
              }}
              required
            />
          </div>
        </div>
      </div>
      <div className="form-actions">
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" className="button-primary">저장</button>
          <button type="button" onClick={onClose} className="button-secondary">취소</button>
        </div>
      </div>
    </form>
  );
};

export default AddSettlementForm;
