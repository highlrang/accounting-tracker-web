import React, { useState, useEffect } from 'react';
import { Settlement } from '../types';
import './Form.css';

interface UpdateSettlementFormProps {
  settlement: Settlement;
  onUpdate: (updatedSettlement: Settlement) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}

const UpdateSettlementForm: React.FC<UpdateSettlementFormProps> = ({ settlement, onUpdate, onDelete, onClose }) => {
  const [itemDate, setItemDate] = useState(settlement.itemDate);
  const [companyName, setCompanyName] = useState(settlement.companyName);
  const [amount, setAmount] = useState(settlement.amount);
  const [isPaid, setIsPaid] = useState(settlement.isPaid);

  useEffect(() => {
    setItemDate(settlement.itemDate);
    setCompanyName(settlement.companyName);
    setAmount(settlement.amount);
    setIsPaid(settlement.isPaid);
  }, [settlement]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemDate || !companyName || isNaN(amount) || amount <= 0) {
      alert('모든 항목의 날짜, 회사명, 금액은 필수 입력이며, 금액은 유효한 숫자여야 합니다.');
      return;
    }
    onUpdate({ ...settlement, itemDate, companyName, amount, isPaid });
    onClose();
  };

  const handleDelete = () => {
    onDelete(settlement.id);
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2>정산 항목 수정</h2>
      <div className="form-content-scrollable">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="itemDate">날짜</label>
            <input
              id="itemDate"
              type="date"
              value={itemDate}
              onChange={(e) => setItemDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="companyName">회사명</label>
            <input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="amount">금액</label>
            <input
              id="amount"
              type="text"
              value={amount === 0 ? '' : amount.toLocaleString('ko-KR')}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/[^0-9]/g, '');
                setAmount(rawValue === '' ? 0 : Number(rawValue));
              }}
              onBlur={(e) => {
                  const formattedValue = Number(e.target.value.replace(/[^0-9]/g, '')).toLocaleString('ko-KR');
                  e.target.value = formattedValue === '0' ? '' : formattedValue;
              }}
              onFocus={(e) => {
                  e.target.value = amount === 0 ? '' : String(amount);
              }}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="isPaid">입금여부</label>
            <select
              id="isPaid"
              value={isPaid ? 'paid' : 'unpaid'}
              onChange={(e) => setIsPaid(e.target.value === 'paid')}
              className="filter-select"
            >
              <option value="paid">입금완료</option>
              <option value="unpaid">미입금</option>
            </select>
          </div>
        </div>
      </div>
      <div className="form-actions" style={{ justifyContent: 'space-between' }}>
        <button type="button" onClick={handleDelete} className="button-danger">삭제</button>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" className="button-primary">저장</button>
          <button type="button" onClick={onClose} className="button-secondary">취소</button>
        </div>
      </div>
    </form>
  );
};

export default UpdateSettlementForm;
