import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, PassengerInfo, ContactInfo } from '../types';
import SeatMap from '../components/SeatMap';
import Loader from '../components/Loader';

interface PassengerFormProps {
    passenger: PassengerInfo;
    index: number;
    type: 'adults' | 'children' | 'babies';
    onChange: (type: 'adults' | 'children' | 'babies', index: number, field: keyof PassengerInfo, value: any) => void;
    isOpen: boolean;
    onToggle: () => void;
    title: string;
    errors: {[key: string]: string};
    onOpenSeatMap: (leg: 'outbound' | 'return') => void;
    hasReturnFlight: boolean;
}

const PassengerForm: React.FC<PassengerFormProps> = ({ 
    passenger, index, type, onChange, isOpen, onToggle, title, errors, onOpenSeatMap, hasReturnFlight 
}) => {
    const countries = [
        'México', 'Colombia', 'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Costa Rica', 'Ecuador', 
        'El Salvador', 'España', 'Estados Unidos', 'Guatemala', 'Honduras', 
        'Nicaragua', 'Panamá', 'Paraguay', 'Perú', 'República Dominicana', 'Uruguay', 'Venezuela'
    ];
    
    return (
        <div className="mb-4" style={{ width: '85%', margin: '0 auto' }}>
            <div 
                role="button"
                onClick={onToggle}
                className={`btn-closed-accordion shadow-1 mt-2 d-flex align-items-center justify-space-between p-3 bg-white border-none rounded cursor-pointer ${errors[`${type}-${index}`] ? 'border-red-500 border-2' : ''}`}
                style={{width: '100%'}}
            >
                <div className="d-flex align-items-center">
                    <svg className="tc-ocean-2 mr-1" xmlns="http://www.w3.org/2000/svg" width="22px" height="32px" viewBox="0 0 32 32" fill="none" focusable="false">
                        <path d="M14.0075 2.40103C12.7448 2.40103 11.6507 2.85248 10.7435 3.76441C9.83625 4.67635 9.38712 5.76667 9.38712 7.04526C9.38712 8.32386 9.83625 9.41418 10.7435 10.3261C11.6507 11.238 12.7448 11.6895 14.0075 11.6895C15.2701 11.6895 16.3642 11.238 17.2715 10.3261C18.1787 9.41418 18.6278 8.32386 18.6278 7.04526C18.6278 5.76667 18.1787 4.67635 17.2715 3.76441C16.3642 2.85248 15.2701 2.40103 14.0075 2.40103ZM7.39864 7.04526C7.39864 5.23461 8.04169 3.68412 9.32779 2.3938C10.6139 1.10348 12.1627 0.458313 14.0075 0.458313C15.8522 0.458313 17.4011 1.10348 18.6871 2.3938C19.9732 3.68412 20.6163 5.23461 20.6163 7.04526C20.6163 8.85592 19.9732 10.4064 18.6871 11.6967C17.4011 12.987 15.8522 13.6322 14.0075 13.6322C12.1627 13.6322 10.6139 12.987 9.32779 11.6967C8.04169 10.4064 7.39864 8.85592 7.39864 7.04526ZM25.0232 23.3259C24.3814 22.0163 23.4116 20.9142 22.1051 20.0108C20.7986 19.1075 19.3496 18.6559 17.7495 18.6559H10.2654C8.66532 18.6559 7.21633 19.1075 5.90984 20.0108C4.60334 20.9142 3.63353 22.0163 2.99173 23.3259C2.34993 24.6355 2.02942 26.0271 2.02942 27.5097C2.02942 27.7667 2.11584 27.9904 2.29653 28.1717C2.47721 28.353 2.70014 28.4397 2.95627 28.4397H25.0587C25.3148 28.4397 25.5377 28.353 25.6584 28.1717C25.8391 27.9904 25.9855 27.7667 25.9855 27.5097C25.9855 26.0271 25.665 24.6355 25.0232 23.3259ZM4.78393 24.1977C5.23455 23.2783 5.91845 22.5057 6.83564 21.8712C7.75282 21.2368 8.89115 20.9195 10.2654 20.9195H17.7495C19.1238 20.9195 20.2621 21.2368 21.1793 21.8712C22.0965 22.5057 22.7804 23.2783 23.231 24.1977C23.6816 25.1171 23.9065 26.0941 23.9065 27.1287H4.10842C4.10842 26.0941 4.33332 25.1171 4.78393 24.1977Z" fill="currentColor"></path>
                    </svg>
                    <div>
                        <p className="m-0 fw-light tc-gray-smoke">{title}</p>
                        {(passenger.seats?.outbound || passenger.seats?.return) && (
                            <p className="m-0 text-xs text-green-600">
                                {passenger.seats.outbound ? `Ida: ${passenger.seats.outbound}` : ''}
                                {passenger.seats.outbound && passenger.seats.return ? ' | ' : ''}
                                {passenger.seats.return ? `Vuelta: ${passenger.seats.return}` : ''}
                            </p>
                        )}
                    </div>
                </div>
                <svg className={`tc-pink arrow-open ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 20 20" fill="none" focusable="false" style={{transition: 'transform 0.3s'}}>
                    <path fill="currentColor" d="M16.611 5.382L10.011 12l-6.6-6.618-1.4 1.4 8 8 8-8z"></path>
                </svg>
            </div>
            
            {isOpen && (
                <div className="bg-white p-3 form-passenger border-l-4 border-deep-blue">
                    <div className="form-grid">
                        <div className="input-container">
                            <input 
                                required 
                                type="text" 
                                className="input-field w-full"
                                value={passenger.name}
                                onChange={(e) => onChange(type, index, 'name', e.target.value)}
                            />
                            <label>Nombre</label>
                        </div>
                        <div className="input-container">
                            <input 
                                required 
                                type="text" 
                                className="input-field w-full"
                                value={passenger.surname || ''}
                                onChange={(e) => onChange(type, index, 'surname', e.target.value)}
                            />
                            <label>Apellido</label>
                        </div>
                        <div className="select-container">
                            <select 
                                className="input-field w-full"
                                value={passenger.gender}
                                onChange={(e) => onChange(type, index, 'gender', e.target.value)}
                            >
                                <option value="Masculino">Masculino</option>
                                <option value="Femenino">Femenino</option>
                            </select>
                            <label>Género</label>
                        </div>
                        <div className="select-container">
                            <select 
                                className="input-field w-full"
                                value={passenger.nationality}
                                onChange={(e) => onChange(type, index, 'nationality', e.target.value)}
                            >
                                {countries.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <label>Nacionalidad</label>
                        </div>
                        <div className="select-container">
                            <select 
                                className="input-field w-full"
                                value={passenger.documentType}
                                onChange={(e) => onChange(type, index, 'documentType', e.target.value)}
                            >
                                <option value="Cédula de ciudadanía">Cédula de ciudadanía</option>
                                <option value="Pasaporte">Pasaporte</option>
                                <option value="INE">INE</option>
                                <option value="Cédula Profesional">Cédula Profesional</option>
                                <option value="CURP">CURP</option>
                            </select>
                            <label>Tipo de documento</label>
                        </div>
                        <div className="input-container">
                            <input 
                                required 
                                type="text" 
                                className="input-field w-full"
                                value={passenger.documentNumber}
                                onChange={(e) => onChange(type, index, 'documentNumber', e.target.value)}
                            />
                            <label>Número de documento</label>
                        </div>
                        
                        {/* CURP Field - Only if nationality is Mexico */}
                        {passenger.nationality === 'México' && (
                            <div className="input-container">
                                <div className="input-with-icon">
                                    <input 
                                        required 
                                        type="text" 
                                        className={`input-field w-full ${errors[`${type}-${index}-curp`] ? 'border-red-500' : ''}`}
                                        value={passenger.curp || ''}
                                        onChange={(e) => onChange(type, index, 'curp', e.target.value.toUpperCase())}
                                        maxLength={18}
                                        style={{textTransform: 'uppercase'}}
                                    />
                                    <label>CURP</label>
                                </div>
                                {errors[`${type}-${index}-curp`] && (
                                    <p className="text-red-500 text-xs mt-1 m-0">{errors[`${type}-${index}-curp`]}</p>
                                )}
                            </div>
                        )}

                        <div className="input-container">
                            <input 
                                required 
                                type="date" 
                                className="input-field w-full"
                                value={passenger.birthDate}
                                onChange={(e) => onChange(type, index, 'birthDate', e.target.value)}
                            />
                            <label>Fecha de nacimiento</label>
                        </div>
                    </div>

                    {/* Seat Selection Section */}
                    <div className="mt-6 pt-2">
                        <div style={{
                            backgroundColor: '#F8F9FA',
                            borderRadius: '16px',
                            padding: '24px',
                            border: '1px solid #E9ECEF',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                        }}>
                            <div className="flex items-center mb-2">
                                <div style={{
                                    backgroundColor: 'rgba(138, 43, 226, 0.1)',
                                    padding: '8px',
                                    borderRadius: '50%',
                                    marginRight: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8A2BE2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M7 13v-3a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3"></path>
                                        <path d="M4.7 17a2 2 0 0 1 2 1.7v1.6a2 2 0 0 0 2 2h6.6a2 2 0 0 0 2-2v-1.6a2 2 0 0 1 2-1.7"></path>
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-bold m-0" style={{color: '#333', fontSize: '18px'}}>Selección de Asientos</h4>
                                    <p className="text-gray-500 text-sm m-0 mt-1">Elige tu lugar favorito para viajar</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap mt-4" style={{gap: '12px', justifyContent: 'center'}}>
                                <div 
                                    role="button"
                                    onClick={() => onOpenSeatMap('outbound')}
                                    className="seat-card"
                                    style={{
                                        flex: '1 1 auto',
                                        minWidth: '200px',
                                        maxWidth: '100%',
                                        backgroundColor: 'white',
                                        borderRadius: '12px',
                                        padding: '14px 16px',
                                        border: passenger.seats?.outbound ? '2px solid #8A2BE2' : '1px solid #E0E0E0',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        transition: 'all 0.3s ease',
                                        position: 'relative'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 10px 20px rgba(138, 43, 226, 0.1)';
                                        if (!passenger.seats?.outbound) e.currentTarget.style.borderColor = '#8A2BE2';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)';
                                        if (!passenger.seats?.outbound) e.currentTarget.style.borderColor = '#E0E0E0';
                                    }}
                                    aria-label="Seleccionar asiento para vuelo de ida"
                                >
                                    <div className="flex items-center">
                                        <div style={{
                                            width: '4px',
                                            height: '40px',
                                            backgroundColor: passenger.seats?.outbound ? '#8A2BE2' : '#E0E0E0',
                                            borderRadius: '2px',
                                            marginRight: '12px'
                                        }}></div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Vuelo de Ida</span>
                                            <span style={{
                                                fontSize: '15px', 
                                                fontWeight: '600',
                                                color: passenger.seats?.outbound ? '#8A2BE2' : '#333'
                                            }}>
                                                {passenger.seats?.outbound || 'Seleccionar asiento'}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{
                                        color: '#8A2BE2',
                                        backgroundColor: 'rgba(138, 43, 226, 0.05)',
                                        padding: '6px',
                                        borderRadius: '8px'
                                    }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="9 18 15 12 9 6"></polyline>
                                        </svg>
                                    </div>
                                </div>

                                {hasReturnFlight && (
                                    <div 
                                        role="button"
                                        onClick={() => onOpenSeatMap('return')}
                                        className="seat-card"
                                        style={{
                                            flex: '1 1 auto',
                                            minWidth: '200px',
                                            maxWidth: '100%',
                                            backgroundColor: 'white',
                                            borderRadius: '12px',
                                            padding: '14px 16px',
                                            border: passenger.seats?.return ? '2px solid #8A2BE2' : '1px solid #E0E0E0',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            transition: 'all 0.3s ease',
                                            position: 'relative'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 10px 20px rgba(138, 43, 226, 0.1)';
                                            if (!passenger.seats?.return) e.currentTarget.style.borderColor = '#8A2BE2';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)';
                                            if (!passenger.seats?.return) e.currentTarget.style.borderColor = '#E0E0E0';
                                        }}
                                        aria-label="Seleccionar asiento para vuelo de vuelta"
                                    >
                                        <div className="flex items-center">
                                            <div style={{
                                                width: '4px',
                                                height: '40px',
                                                backgroundColor: passenger.seats?.return ? '#8A2BE2' : '#E0E0E0',
                                                borderRadius: '2px',
                                                marginRight: '12px'
                                            }}></div>
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Vuelo de Vuelta</span>
                                                <span style={{
                                                    fontSize: '15px', 
                                                    fontWeight: '600',
                                                    color: passenger.seats?.return ? '#8A2BE2' : '#333'
                                                }}>
                                                    {passenger.seats?.return || 'Seleccionar asiento'}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{
                                            color: '#8A2BE2',
                                            backgroundColor: 'rgba(138, 43, 226, 0.05)',
                                            padding: '6px',
                                            borderRadius: '8px'
                                        }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="9 18 15 12 9 6"></polyline>
                                            </svg>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const PassengersInfo = () => {
    const navigate = useNavigate();
    const [info, setInfo] = useState<Info | null>(null);
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Seat Map State
    const [seatMapConfig, setSeatMapConfig] = useState<{
        isOpen: boolean;
        passengerIndex: number;
        passengerType: 'adults' | 'children' | 'babies';
        leg: 'outbound' | 'return';
    } | null>(null);

    const [formData, setFormData] = useState<{
        adults: PassengerInfo[];
        children: PassengerInfo[];
        babies: PassengerInfo[];
        contact: ContactInfo;
    }>({
        adults: [],
        children: [],
        babies: [],
        contact: { email: '', phone: '' }
    });

    useEffect(() => {
        const storedInfo = localStorage.getItem('info');
        if (storedInfo) {
            const parsedInfo: Info = JSON.parse(storedInfo);
            setInfo(parsedInfo);

            const initPassengers = (count: number, current: PassengerInfo[]) => {
                if (current.length === count) return current;
                return Array(count).fill(null).map((_, i) => current[i] || {
                    name: '',
                    surname: '',
                    gender: 'Masculino',
                    nationality: 'México',
                    documentType: 'Cédula de ciudadanía',
                    documentNumber: '',
                    birthDate: '',
                    curp: '',
                    seats: { outbound: '', return: '' }
                });
            };

            setFormData({
                adults: initPassengers(parsedInfo.flightInfo.adults, parsedInfo.passengersInfo?.adults || []),
                children: initPassengers(parsedInfo.flightInfo.children, parsedInfo.passengersInfo?.children || []),
                babies: initPassengers(parsedInfo.flightInfo.babies, parsedInfo.passengersInfo?.babies || []),
                contact: parsedInfo.passengersInfo?.contact || { email: '', phone: '' }
            });
            
            setOpenAccordion('adult-0');
        } else {
            navigate('/');
        }
    }, [navigate]);

    if (!info) return null;

    const { origin, destination, flightDates, adults, children, babies } = info.flightInfo;
    const totalPassengers = adults + children + babies;
    const hasReturnFlight = info.flightInfo.travel_type === 1; // Assuming 1 is round trip

    const formatDate = (timestamp: number | string) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return `${days[date.getDay()].toLowerCase()}. ${date.getDate()} de ${months[date.getMonth()].toLowerCase()}`;
    };

    const dateString = flightDates[1] !== 0 
        ? `${formatDate(flightDates[0])} a ${formatDate(flightDates[1])}`
        : formatDate(flightDates[0]);

    const handleInputChange = (type: 'adults' | 'children' | 'babies', index: number, field: keyof PassengerInfo, value: any) => {
        setFormData(prev => ({
            ...prev,
            [type]: prev[type].map((p, i) => i === index ? { ...p, [field]: value } : p)
        }));

        // Validate CURP in real-time
        if (field === 'curp') {
            const curpRegex = /^[A-Z]{4}[0-9]{6}[H,M][A-Z]{5}[A-Z0-9]{2}$/;
            const isValid = curpRegex.test(value);
            setFormErrors(prev => ({
                ...prev,
                [`${type}-${index}-curp`]: isValid ? '' : 'Formato de CURP inválido (18 caracteres)'
            }));
        }
    };

    const handleContactChange = (field: keyof ContactInfo, value: string) => {
        setFormData(prev => ({
            ...prev,
            contact: { ...prev.contact, [field]: value }
        }));
    };

    const toggleAccordion = (id: string) => {
        setOpenAccordion(openAccordion === id ? null : id);
    };

    const handleOpenSeatMap = (type: 'adults' | 'children' | 'babies', index: number, leg: 'outbound' | 'return') => {
        setSeatMapConfig({
            isOpen: true,
            passengerIndex: index,
            passengerType: type,
            leg: leg
        });
    };

    const handleSeatSelection = (seat: string) => {
        if (!seatMapConfig) return;
        
        const { passengerType, passengerIndex, leg } = seatMapConfig;
        
        setFormData(prev => {
            const updatedPassengers = [...prev[passengerType]];
            const passenger = { ...updatedPassengers[passengerIndex] };
            
            passenger.seats = {
                ...passenger.seats,
                [leg]: seat
            };
            
            updatedPassengers[passengerIndex] = passenger;
            
            return {
                ...prev,
                [passengerType]: updatedPassengers
            };
        });
        
        // Don't close modal here, let user confirm
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const errors: {[key: string]: string} = {};
        
        // Validation logic
        if (!formData.contact.email.includes('@') || !formData.contact.email.includes('.')) {
            errors.email = 'Email inválido';
        }
        if (formData.contact.phone.length !== 10) {
            errors.phone = 'El teléfono debe tener 10 dígitos';
        }

        // Validate Passengers
        ['adults', 'children', 'babies'].forEach((type) => {
            // @ts-ignore
            formData[type].forEach((p: PassengerInfo, i: number) => {
                if (p.nationality === 'México') {
                    const curpRegex = /^[A-Z]{4}[0-9]{6}[H,M][A-Z]{5}[A-Z0-9]{2}$/;
                    if (!p.curp || !curpRegex.test(p.curp)) {
                        errors[`${type}-${i}-curp`] = 'CURP inválida o faltante';
                        // Open the accordion where error is
                        if (!openAccordion) setOpenAccordion(`${type}-${i}`);
                    }
                }
            });
        });

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            setIsSubmitting(false);
            alert('Por favor corrija los errores en el formulario.');
            return;
        }
        
        // Simulate API call/loading
        await new Promise(resolve => setTimeout(resolve, 3000));

        const updatedInfo: Info = {
            ...info,
            passengersInfo: {
                adults: formData.adults,
                children: formData.children,
                babies: formData.babies,
                contact: formData.contact
            }
        };

        setInfo(updatedInfo);
        localStorage.setItem('info', JSON.stringify(updatedInfo));
        
        navigate('/payment');
    };

    const getFlightTitle = () => {
        if (!seatMapConfig) return '';
        const { leg } = seatMapConfig;
        if (leg === 'outbound') {
            return `Vuelo de Ida: ${typeof origin === 'object' ? origin.city : origin} - ${typeof destination === 'object' ? destination.city : destination}`;
        } else {
            return `Vuelo de Vuelta: ${typeof destination === 'object' ? destination.city : destination} - ${typeof origin === 'object' ? origin.city : origin}`;
        }
    };

    const getCurrentSelectedSeat = () => {
        if (!seatMapConfig) return undefined;
        const { passengerType, passengerIndex, leg } = seatMapConfig;
        // @ts-ignore
        return formData[passengerType][passengerIndex].seats?.[leg];
    };

    return (
        <div className="bg-gray min-h-screen pb-20 font-sans">
             {isSubmitting && <Loader />}
             {/* Navbar */}
            <nav className="p-fixed border-box p-3 w-full z-50 top-0 left-0 shadow-md" style={{backgroundColor: '#FFFFFF'}}>
                <div className="d-flex justify-space-between align-items-center max-w-6xl mx-auto">
                    <div className="d-flex align-items-center">
                        <div style={{backgroundImage: 'url(/assets/logos/logovolaris.png)', width: '110px', height: '32px', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center'}} aria-label="Logo Volaris" role="img"></div>
                        <div style={{width: '1px', height: '24px', backgroundColor: '#E0E0E0', margin: '0 15px'}}></div>
                        <div style={{backgroundImage: 'url(/assets/logos/invexbancologo.png)', width: '105px', height: '35px', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center'}} aria-label="Logo Invex" role="img"></div>
                    </div>
            
                    <div className="d-flex justify-content-center align-items-center">
                        
                    </div>
                </div>
                <div className="mt-2 d-flex rounded-white justify-space-between align-items-center cursor-pointer max-w-6xl mx-auto" onClick={() => navigate('/')} style={{boxShadow: '0 4px 6px rgba(0,0,0,0.1)', backgroundColor: '#F5F5F5', border: '1px solid #E0E0E0'}}>
                    <div className="pl-2">
                        <p className="fs-5 fw-bolder mt-2 mb-0" id="label-travel" style={{color: '#333333'}}>
                            {origin && typeof origin !== 'string' ? origin.city : ''} {'>'} {destination && typeof destination !== 'string' ? destination.city : ''}
                        </p>
                        <p className="fs-5 fw-light mt-0 mb-1" id="label-dates" style={{color: '#666666'}}>
                            {dateString}
                        </p>
                    </div>
                    <div className="border-left-bold pr-3 d-flex align-items-center">
                        <span id="label-passengers" className="fs-2 font-bold" style={{color: '#333333'}}>{totalPassengers}</span>
                        <span className="ml-2 text-sm text-gray-500">Pasajeros</span>
                    </div>
                </div>
            </nav>

            <main className="container-passengers bg-gray p-3 max-w-4xl mx-auto" style={{marginTop: '140px'}}>
                <h1 className="fw-lighter fw-light tc-ocean fs-1 pt-3 m-0 mb-4 text-3xl">Información de Pasajeros</h1>

                <form onSubmit={handleSubmit}>
                    {formData.adults.map((adult, index) => (
                        <PassengerForm 
                            key={`adult-${index}`}
                            passenger={adult}
                            index={index}
                            type="adults"
                            onChange={handleInputChange}
                            isOpen={openAccordion === `adult-${index}`}
                            onToggle={() => toggleAccordion(`adult-${index}`)}
                            title={`Adulto ${index + 1}`}
                            errors={formErrors}
                            onOpenSeatMap={(leg) => handleOpenSeatMap('adults', index, leg)}
                            hasReturnFlight={hasReturnFlight}
                        />
                    ))}

                    {formData.children.map((child, index) => (
                        <PassengerForm 
                            key={`child-${index}`}
                            passenger={child}
                            index={index}
                            type="children"
                            onChange={handleInputChange}
                            isOpen={openAccordion === `child-${index}`}
                            onToggle={() => toggleAccordion(`child-${index}`)}
                            title={`Niño ${index + 1}`}
                            errors={formErrors}
                            onOpenSeatMap={(leg) => handleOpenSeatMap('children', index, leg)}
                            hasReturnFlight={hasReturnFlight}
                        />
                    ))}

                    {formData.babies.map((baby, index) => (
                        <PassengerForm 
                            key={`baby-${index}`}
                            passenger={baby}
                            index={index}
                            type="babies"
                            onChange={handleInputChange}
                            isOpen={openAccordion === `baby-${index}`}
                            onToggle={() => toggleAccordion(`baby-${index}`)}
                            title={`Bebé ${index + 1}`}
                            errors={formErrors}
                            onOpenSeatMap={(leg) => handleOpenSeatMap('babies', index, leg)}
                            hasReturnFlight={hasReturnFlight}
                        />
                    ))}

                    <div className="mt-8">
                        <h2 className="fs-4 tc-ocean-2 fw-light mb-3 text-xl">Información de contacto</h2>
                        <div className="bg-white p-6 rounded shadow-1">
                            <div className="form-grid">
                                <div className="input-container">
                                    <input 
                                        required 
                                        type="email" 
                                        className="input-field w-full"
                                        value={formData.contact.email}
                                        onChange={(e) => handleContactChange('email', e.target.value)}
                                    />
                                    <label>Correo electrónico</label>
                                </div>
                                <div className="input-container">
                                    <input 
                                        required 
                                        type="tel" 
                                        className="input-field w-full"
                                        value={formData.contact.phone}
                                        onChange={(e) => handleContactChange('phone', e.target.value)}
                                        maxLength={10}
                                    />
                                    <label>Número de teléfono (10 dígitos)</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div 
                        className={`btn-success mt-6 shadow-lg ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
                        onClick={(e) => !isSubmitting && handleSubmit(e as any)}
                        role="button"
                        style={{cursor: isSubmitting ? 'wait' : 'pointer', textAlign: 'center', display: 'block'}}
                    >
                        Continuar al pago
                    </div>
                </form>
            </main>

            {/* Seat Map Modal */}
            {seatMapConfig && (
                <SeatMap 
                    flightRoute={getFlightTitle()}
                    selectedSeat={getCurrentSelectedSeat()}
                    onSelectSeat={handleSeatSelection}
                    onClose={() => setSeatMapConfig(null)}
                />
            )}
        </div>
    );
};

export default PassengersInfo;
