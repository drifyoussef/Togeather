import React from 'react';
import './ErrorMessage.css';
import { RxCross2 } from "react-icons/rx";

interface ErrorMessageProps {
  error: string | null;
  onClose?: () => void;
  type?: 'error' | 'warning' | 'success' | 'info';
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, onClose, type = 'error' }) => {
  if (!error) return null;

  return (
    <div className={`error-message ${type}`}>
      <span className="error-text">{error}</span>
      {onClose && (
        <button className="error-close" onClick={onClose} type="button"><RxCross2 className='error-close-icon' />
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
