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

  const [origin, setOrigin] = useState(settlement.origin);

  const [destination, setDestination] = useState(settlement.destination);
  const [notes, setNotes] = useState(settlement.notes ?? '');
  const [amount, setAmount] = useState(settlement.amount);

  const [isPaid, setIsPaid] = useState(settlement.isPaid);



  useEffect(() => {

    setItemDate(settlement.itemDate);

    setOrigin(settlement.origin);

    setDestination(settlement.destination);
    setNotes(settlement.notes ?? '');

    setAmount(settlement.amount);

    setIsPaid(settlement.isPaid);

  }, [settlement]);



  const handleSubmit = (e: React.FormEvent) => {

    e.preventDefault();

    if (!itemDate || !origin || !destination || isNaN(amount) || amount <= 0) {

      alert('모든 항목의 날짜, 출발지, 도착지, 금액은 필수 입력이며, 금액은 유효한 숫자여야 합니다.');

      return;

    }

    onUpdate({ ...settlement, itemDate, origin, destination, notes, amount, isPaid });

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

                      <label htmlFor="notes">비고</label>

                      <input

                        id="notes"

                        type="text"

                        value={notes}

                        onChange={(e) => setNotes(e.target.value)}

                      />

                    </div>

                    <div className="form-group">

                      <label htmlFor="origin">출발지</label>

                      <input

                        id="origin"

                        type="text"

                        value={origin}

                        autoComplete="off"

                        onChange={(e) => setOrigin(e.target.value)}

                        required

                      />

                    </div>

                    <div className="form-group">

                      <label htmlFor="destination">도착지</label>

                      <input

                        id="destination"

                        type="text"

                        value={destination}

                        autoComplete="off"

                        onChange={(e) => setDestination(e.target.value)}

                        required

                      />

                    </div>

                    <div className="form-group">

                      <label htmlFor="amount">금액</label>

                      <input

                        id="amount"

                        type="text"

                        value={amount === 0 ? '' : amount.toLocaleString('ko-KR')}

                        autoComplete="off"

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
