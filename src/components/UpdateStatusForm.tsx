import React, { useState, useEffect } from 'react';
import { Settlement } from '../types';
import './Form.css';

interface UpdateStatusFormProps {
  settlement: Settlement;
  onUpdate: (updatedSettlement: Settlement) => void;
  onClose: () => void;
}

const UpdateStatusForm: React.FC<UpdateStatusFormProps> = ({ settlement, onUpdate, onClose }) => {
  const [paid, setPaid] = useState(settlement.paid);

  useEffect(() => {
    setPaid(settlement.paid);
  }, [settlement]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ ...settlement, paid });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2>입금여부 변경</h2>
      <p><strong>회사명:</strong> {settlement.company}</p>
      <div className="form-group">
        <label htmlFor="paidStatus">입금여부</label>
        <select
          id="paidStatus"
          value={paid ? 'paid' : 'unpaid'}
          onChange={(e) => setPaid(e.target.value === 'paid')}
        >
          <option value="paid">입금완료</option>
          <option value="unpaid">미입금</option>
        </select>
      </div>
      <div className="form-actions">
        <button type="submit" className="button-primary">업데이트</button>
        <button type="button" onClick={onClose} className="button-secondary">취소</button>
      </div>
    </form>
  );
};

export default UpdateStatusForm;
