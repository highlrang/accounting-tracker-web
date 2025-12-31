import React, { useState } from 'react';
import { Settlement } from '../types';
import './Form.css';

interface AddSettlementFormProps {
  onAdd: (newSettlements: Omit<Settlement, 'id'>[]) => void;
  onClose: () => void;
}

interface NewSettlementEntry {
  date: string;
  company: string;
  amount: number;
}

const AddSettlementForm: React.FC<AddSettlementFormProps> = ({ onAdd, onClose }) => {
  const [entries, setEntries] = useState<NewSettlementEntry[]>([
    { date: '', company: '', amount: 0 }
  ]);

  const handleEntryChange = (index: number, field: keyof NewSettlementEntry, value: string | number) => {
    const newEntries = [...entries];
    // Special handling for amount as it's a number
    if (field === 'amount') {
        newEntries[index][field] = Number(value);
    } else {
        newEntries[index][field] = value as any; // Type assertion for other fields
    }
    setEntries(newEntries);
  };

  const handleAddRow = () => {
    setEntries([...entries, { date: '', company: '', amount: 0 }]);
  };

  const handleRemoveRow = (index: number) => {
    if (entries.length > 1) {
      const newEntries = [...entries];
      newEntries.splice(index, 1);
      setEntries(newEntries);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validEntries = entries.filter(entry => entry.date && entry.company && entry.amount > 0);
    if (validEntries.length > 0) {
      const newSettlements: Omit<Settlement, 'id'>[] = validEntries.map(entry => ({
        ...entry,
        paid: false,
      }));
      onAdd(newSettlements);
      onClose();
    } else {
        alert('날짜, 회사명, 금액은 필수 입력 항목입니다.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2>새 정산 항목 추가</h2>
      <div className="form-content-scrollable">
        {entries.map((entry, index) => (
          <div key={index} className="form-row">
            <div className="form-group">
              <label htmlFor={`date-${index}`}>날짜</label>
              <input
                id={`date-${index}`}
                type="date"
                value={entry.date}
                onChange={(e) => handleEntryChange(index, 'date', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor={`company-${index}`}>회사명</label>
              <input
                id={`company-${index}`}
                type="text"
                value={entry.company}
                onChange={(e) => handleEntryChange(index, 'company', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor={`amount-${index}`}>금액</label>
              <input
                id={`amount-${index}`}
                type="number"
                value={entry.amount}
                onChange={(e) => handleEntryChange(index, 'amount', e.target.value)}
                required
              />
            </div>
            <div className="form-row-actions">
              {entries.length > 1 && (
                <button type="button" className="button-secondary" onClick={() => handleRemoveRow(index)}>
                  삭제
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="form-actions">
        <button type="button" className="button-secondary" onClick={handleAddRow}>
          항목 추가
        </button>
        <button type="submit" className="button-primary">저장</button>
        <button type="button" onClick={onClose} className="button-secondary">취소</button>
      </div>
    </form>
  );
};

export default AddSettlementForm;
