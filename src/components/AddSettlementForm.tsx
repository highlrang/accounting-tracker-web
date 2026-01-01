import React, { useState, useRef, useEffect } from 'react';
import { Settlement } from '../types';
import './Form.css';

interface AddSettlementFormProps {
  onAdd: (newSettlements: Omit<Settlement, 'id' | 'isDeleted'>[]) => void;
  onClose: () => void;
}

interface NewSettlementEntry {
  itemDate: string;
  companyName: string;
  amount: number;
}

const AddSettlementForm: React.FC<AddSettlementFormProps> = ({ onAdd, onClose }) => {
  const [entries, setEntries] = useState<NewSettlementEntry[]>([
    { itemDate: '', companyName: '', amount: 0 }
  ]);
  const scrollableContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollableContainerRef.current) {
      scrollableContainerRef.current.scrollTop = scrollableContainerRef.current.scrollHeight;
    }
  }, [entries]);

  const handleEntryChange = (index: number, field: keyof Omit<NewSettlementEntry, 'description'>, value: string | number) => {
    const newEntries = [...entries];
    if (field === 'amount') {
        newEntries[index][field] = Number(value);
    } else {
        newEntries[index][field] = value as any;
    }
    setEntries(newEntries);
  };

  const handleAddRow = () => {
    setEntries([...entries, { itemDate: '', companyName: '', amount: 0 }]);
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
    const validEntries = entries.filter(entry => {
      const isAmountValid = !isNaN(entry.amount) && entry.amount > 0;
      return entry.itemDate && entry.companyName && isAmountValid;
    });

    if (validEntries.length !== entries.length) {
      alert('모든 항목의 날짜, 회사명, 금액은 필수 입력이며, 금액은 유효한 숫자여야 합니다.');
      return;
    }

    if (validEntries.length > 0) {
      const newSettlements: Omit<Settlement, 'id' | 'isDeleted'>[] = validEntries.map(entry => ({
        itemDate: entry.itemDate,
        companyName: entry.companyName,
        amount: entry.amount,
        isPaid: false,
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
      <div ref={scrollableContainerRef} className="form-content-scrollable">
        {entries.map((entry, index) => (
          <div key={index} className="form-row">
            <div className="form-group">
              <label htmlFor={`itemDate-${index}`}>날짜</label>
              <input
                id={`itemDate-${index}`}
                type="date"
                value={entry.itemDate}
                onChange={(e) => handleEntryChange(index, 'itemDate', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor={`companyName-${index}`}>회사명</label>
              <input
                id={`companyName-${index}`}
                type="text"
                value={entry.companyName}
                onChange={(e) => handleEntryChange(index, 'companyName', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor={`amount-${index}`}>금액</label>
              <input
                id={`amount-${index}`}
                type="text"
                value={entry.amount === 0 ? '' : entry.amount.toLocaleString('ko-KR')}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/[^0-9]/g, ''); // 숫자만 남기기
                  handleEntryChange(index, 'amount', rawValue === '' ? 0 : Number(rawValue));
                }}
                onBlur={(e) => {
                  const formattedValue = Number(e.target.value.replace(/[^0-9]/g, '')).toLocaleString('ko-KR');
                  e.target.value = formattedValue === '0' ? '' : formattedValue; // 0이면 빈 문자열로, 아니면 포맷팅된 값으로
                }}
                onFocus={(e) => {
                  e.target.value = entry.amount === 0 ? '' : String(entry.amount); // 포커스 시 숫자만 보이도록
                }}
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
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" className="button-primary">저장</button>
          <button type="button" onClick={onClose} className="button-secondary">취소</button>
        </div>
      </div>
    </form>
  );
};

export default AddSettlementForm;
