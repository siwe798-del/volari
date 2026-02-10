import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Confirmation = () => {
    const navigate = useNavigate();
    const [bookingId, setBookingId] = useState<string>('');
    const [email, setEmail] = useState<string>('');

    useEffect(() => {
        const storedPayment = localStorage.getItem('paymentInfo');
        if (storedPayment) {
            const payment = JSON.parse(storedPayment);
            setBookingId(payment.bookingId || 'PENDING');
            setEmail(payment.email || '');
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full text-center">
                <div className="mb-6">
                    <svg className="w-24 h-24 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-800 mb-4">¡Reserva Confirmada!</h1>
                
                {bookingId && (
                    <p className="text-xl text-gray-700 font-semibold mb-2">
                        Código de reserva: <span className="text-deep-blue">{bookingId}</span>
                    </p>
                )}

                <p className="text-gray-600 text-lg mb-8">
                    Su pago ha sido procesado exitosamente. Hemos enviado los detalles de su vuelo y el comprobante de pago a <span className="font-bold">{email}</span>.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
                    <h3 className="text-blue-800 font-bold text-lg mb-2">Próximos pasos</h3>
                    <ul className="list-disc list-inside text-blue-700 space-y-2">
                        <li>Revise su correo electrónico para ver su itinerario.</li>
                        <li>Realice el check-in 48 horas antes de su vuelo.</li>
                        <li>Prepare sus documentos de viaje.</li>
                    </ul>
                </div>

                <button 
                    onClick={() => {
                        localStorage.removeItem('info');
                        localStorage.removeItem('paymentInfo');
                        navigate('/');
                    }}
                    className="bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition duration-300 cursor-pointer"
                >
                    Volver al Inicio
                </button>
            </div>
            
            <footer className="mt-12 text-gray-500 text-sm">
                © {new Date().getFullYear()} LATAM Airlines Group. Todos los derechos reservados.
            </footer>
        </div>
    );
};

export default Confirmation;
