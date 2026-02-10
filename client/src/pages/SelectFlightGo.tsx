import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { InfoContext } from '../App';
import FlightCard from '../components/FlightCard';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import { FlightOption, FlightFare } from '../types/flight';
import { Airport } from '../types';

const SelectFlightGo: React.FC = () => {
  const { info, setInfo } = useContext(InfoContext);
  const navigate = useNavigate();
  const [selectedFlightIndex, setSelectedFlightIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to home if no search criteria (simple check)
  useEffect(() => {
    if (!info.flightInfo.origin || !info.flightInfo.destination) {
      navigate('/');
    }
  }, [info, navigate]);

  const origin = info.flightInfo.origin as Airport;
  const destination = info.flightInfo.destination as Airport;
  
  // Mock flight data based on legacy config
  const flights: FlightOption[] = [
    {
      takeoff: '4:59 a. m.',
      landing: '6:06 a. m.',
      duration: '1 h 7 min',
      price: 499,
      currency: 'MXN',
      superOffer: true
    },
    {
      takeoff: '9:30 a. m.',
      landing: '10:37 a. m.',
      duration: '1 h 7 min',
      price: 650,
      currency: 'MXN',
      superOffer: true
    },
    {
      takeoff: '10:15 a. m.',
      landing: '11:22 a. m.',
      duration: '1 h 7 min',
      price: 550,
      currency: 'MXN',
      superOffer: true
    },
    {
      takeoff: '12:44 p. m.',
      landing: '01:51 p. m.',
      duration: '1 h 7 min',
      price: 499,
      currency: 'MXN',
      superOffer: true
    },
    {
      takeoff: '3:49 p. m.',
      landing: '4:56 p. m.',
      duration: '1 h 7 min',
      price: 750,
      currency: 'MXN'
    },
    {
      takeoff: '8:25 p. m.',
      landing: '9:37 p. m.',
      duration: '1 h 7 min',
      price: 520,
      currency: 'MXN',
      superOffer: true
    }
  ];

  const handleFlightSelect = (index: number) => {
    if (selectedFlightIndex === index) {
      setSelectedFlightIndex(null); // Deselect if already selected
    } else {
      setSelectedFlightIndex(index);
    }
  };

  const handleFareSelect = async (flight: FlightOption, fare: FlightFare) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Save selected flight and fare to context and localStorage
    const updatedInfo = {
      ...info,
      flightInfo: {
        ...info.flightInfo,
        outboundFlight: {
            ...flight,
            id: 'mock-id-' + selectedFlightIndex, // Add required ID
            airline: 'LATAM Airlines', // Add required field
            direct: true, // Add required field
            selectedFare: fare.name,
            selectedPrice: fare.price
        }
      }
    };

    setInfo(updatedInfo);
    localStorage.setItem('info', JSON.stringify(updatedInfo));

    // Navigate to next step
    if (info.flightInfo.travel_type === 1) {
        navigate('/select-flight-back');
    } else {
        navigate('/passengers-info');
    }
  };

  if (!origin || !destination) return null;

  return (
    <div className="bg-gray pb-5" style={{ minHeight: '100vh' }}>
        {isLoading && <Loader />}
        <Navbar />
        
        <div className="container pt-4">
            <div className="mb-4">
                <p className="fs-1 tc-ocean fw-light mb-2">Vuelo de ida</p>
                <div className="d-flex align-items-center">
                    <span className="fs-4 tc-gray-smoke">{origin.city}</span>
                    <span className="mx-2 fs-4 tc-gray-smoke">&gt;</span>
                    <span className="fs-4 tc-gray-smoke">{destination.city}</span>
                </div>
                <p className="fs-5 tc-gray-smoke mt-1">
                    {info.flightInfo.flightDates[0] ? new Date(Number(info.flightInfo.flightDates[0])).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) : ''}
                </p>
            </div>

            <div className="mt-4">
                {flights.map((flight, index) => (
                    <FlightCard
                        key={index}
                        flight={flight}
                        isSelected={selectedFlightIndex === index}
                        onSelect={() => handleFlightSelect(index)}
                        onFareSelect={(fare) => handleFareSelect(flight, fare)}
                        originCode={origin.code}
                        destinationCode={destination.code}
                    />
                ))}
            </div>
        </div>
    </div>
  );
};

export default SelectFlightGo;
