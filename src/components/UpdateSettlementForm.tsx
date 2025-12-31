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
  const [date, setDate] = useState(settlement.date);
  const [company, setCompany] = useState(settlement.company);
  const [amount, setAmount] = useState(settlement.amount);
  const [paid, setPaid] = useState(settlement.paid);

  useEffect(() => {
    setDate(settlement.date);
    setCompany(settlement.company);
    setAmount(settlement.amount);
    setPaid(settlement.paid);
  }, [settlement]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !company || isNaN(amount) || amount <= 0) {
      alert('모든 항목의 날짜, 회사명, 금액은 필수 입력이며, 금액은 유효한 숫자여야 합니다.');
      return;
    }
    onUpdate({ ...settlement, date, company, amount, paid });
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
            <label htmlFor="date">날짜</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="company">회사명</label>
            <input
              id="company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
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
            <label htmlFor="paid">입금여부</label>
            <select
              id="paid"
              value={paid ? 'paid' : 'unpaid'}
              onChange={(e) => setPaid(e.target.value === 'paid')}
              className="filter-select"
            >
              <option value="paid">입금완료</option>
              <option value="unpaid">미입금</option>
            </select>
          </div>
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="button-primary">저장</button>
        <button type="button" onClick={onClose} className="button-secondary">취소</button>
        <button type="button" onClick={handleDelete} className="button-danger">삭제</button>
      </div>
    </form>
  );
};

export default UpdateSettlementForm;
