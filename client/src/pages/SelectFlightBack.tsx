import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { InfoContext } from '../App';
import FlightCard from '../components/FlightCard';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import { FlightOption, FlightFare } from '../types/flight';
import { Airport } from '../types';

const SelectFlightBack: React.FC = () => {
  const { info, setInfo } = useContext(InfoContext);
  const navigate = useNavigate();
  const [selectedFlightIndex, setSelectedFlightIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if critical info is missing
  useEffect(() => {
    if (!info.flightInfo.origin || !info.flightInfo.destination || info.flightInfo.travel_type !== 1) {
      navigate('/');
    }
  }, [info, navigate]);

  const origin = info.flightInfo.origin as Airport;
  const destination = info.flightInfo.destination as Airport;

  // Mock flight data
  const flights: FlightOption[] = [
    {
      takeoff: '5:00 a. m.',
      landing: '6:15 a. m.',
      duration: '1 h 15 min',
      price: 499,
      currency: 'MXN',
      superOffer: true
    },
    {
      takeoff: '8:30 a. m.',
      landing: '9:45 a. m.',
      duration: '1 h 15 min',
      price: 650,
      currency: 'MXN',
      superOffer: true
    },
    {
      takeoff: '11:15 a. m.',
      landing: '12:30 p. m.',
      duration: '1 h 15 min',
      price: 550,
      currency: 'MXN',
      superOffer: true
    },
    {
      takeoff: '2:45 p. m.',
      landing: '4:00 p. m.',
      duration: '1 h 15 min',
      price: 499,
      currency: 'MXN',
      superOffer: true
    },
    {
      takeoff: '6:20 p. m.',
      landing: '7:35 p. m.',
      duration: '1 h 15 min',
      price: 750,
      currency: 'MXN'
    },
    {
      takeoff: '9:40 p. m.',
      landing: '10:55 p. m.',
      duration: '1 h 15 min',
      price: 520,
      currency: 'MXN',
      superOffer: true
    }
  ];

  const handleFlightSelect = (index: number) => {
    if (selectedFlightIndex === index) {
      setSelectedFlightIndex(null);
    } else {
      setSelectedFlightIndex(index);
    }
  };

  const handleFareSelect = async (flight: FlightOption, fare: FlightFare) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 3000));

    const updatedInfo = {
      ...info,
      flightInfo: {
        ...info.flightInfo,
        returnFlight: {
            ...flight,
            id: 'mock-id-back-' + selectedFlightIndex,
            airline: 'LATAM Airlines',
            direct: true,
            selectedFare: fare.name,
            selectedPrice: fare.price
        }
      }
    };

    setInfo(updatedInfo);
    localStorage.setItem('info', JSON.stringify(updatedInfo));
    navigate('/passengers-info');
  };

  if (!origin || !destination) return null;

  return (
    <div className="bg-gray pb-5" style={{ minHeight: '100vh' }}>
        {isLoading && <Loader />}
        <Navbar />
        
        <div className="container pt-4">
            <div className="mb-4">
                <p className="fs-1 tc-ocean fw-light mb-2">Vuelo de regreso</p>
                <div className="d-flex align-items-center">
                    <span className="fs-4 tc-gray-smoke">{destination.city}</span>
                    <span className="mx-2 fs-4 tc-gray-smoke">&gt;</span>
                    <span className="fs-4 tc-gray-smoke">{origin.city}</span>
                </div>
                <p className="fs-5 tc-gray-smoke mt-1">
                    {info.flightInfo.flightDates[1] ? new Date(Number(info.flightInfo.flightDates[1])).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Fecha de regreso'}
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
                        originCode={destination.code}
                        destinationCode={origin.code}
                    />
                ))}
            </div>
        </div>
    </div>
  );
};

export default SelectFlightBack;
