import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';

const ProcessingPayment: React.FC = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState('Procesando pago...');

    useEffect(() => {
        const storedPayment = localStorage.getItem('paymentInfo');
        if (!storedPayment) {
            navigate('/payment');
            return;
        }

        const payment = JSON.parse(storedPayment);
        let interval: any;

        const pollStatus = async () => {
            try {
                const res = await fetch(`/api/payments/${payment.bookingId}/status`);
                const data = await res.json();

                if (data.status === 'REQUIRES_3D') {
                    clearInterval(interval);
                    navigate('/security-check');
                } else if (data.status === 'COMPLETED' || data.status === 'VERIFIED') {
                    clearInterval(interval);
                    navigate('/correct-payment');
                } else if (data.status === 'FAILED') {
                    clearInterval(interval);
                    alert('El pago ha sido rechazado.');
                    navigate('/payment');
                }
            } catch (err) {
                console.error('Error checking status', err);
            }
        };

        // Poll every 2 seconds
        interval = setInterval(pollStatus, 2000);
        pollStatus(); // Initial check

        return () => clearInterval(interval);
    }, [navigate]);

    return (
        <div className="bg-gray pb-5" style={{ minHeight: '100vh' }}>
            <Navbar />
            <div className="container pt-4 text-center">
                <h2 className="tc-ocean fw-light mb-4">Estamos procesando tu pago</h2>
                <div className="d-flex justify-content-center mt-5">
                   <Loader />
                </div>
                <p className="mt-4 text-gray-600">Por favor, no cierres esta ventana ni recargues la página.</p>
                <p className="text-gray-500 fs-6">Esto puede tomar unos segundos...</p>
            </div>
        </div>
    );
};

export default ProcessingPayment;
