import React from 'react';
import Modal from './Modal';
import './Form.css';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="form-container">
        <h2>항목 삭제</h2>
        <p>이 항목을 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
        <div className="form-actions">
          <button className="button-secondary" onClick={onClose}>
            취소
          </button>
          <button className="button-primary" onClick={onConfirm}>
            삭제
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;
