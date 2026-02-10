import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/correct-payment.css';

const CorrectPayment = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Optional: Clear sensitive data from local storage if needed here
  }, []);

  const handleContinue = () => {
    // Navigate to the final confirmation page with booking details
    navigate('/confirmation');
  };

  return (
    <div className="correct-payment-container">
      <div className="correct-payment-card">
        <svg className="success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <h1 className="success-title">¡Pago Exitoso!</h1>
        <p className="success-message">
          Tu pago ha sido procesado y validado correctamente. 
          Hemos confirmado tu transacción de manera segura.
        </p>
        <button className="continue-button" onClick={handleContinue}>
          Ver Detalles de Reserva
        </button>
      </div>
    </div>
  );
};

export default CorrectPayment;
