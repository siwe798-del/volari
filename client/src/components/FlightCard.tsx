import React from 'react';
import { FlightOption, FlightFare } from '../types/flight';

interface FlightCardProps {
  flight: FlightOption;
  isSelected: boolean;
  onSelect: () => void;
  onFareSelect: (fare: FlightFare) => void;
  originCode: string;
  destinationCode: string;
}

const FlightCard: React.FC<FlightCardProps> = ({
  flight,
  isSelected,
  onSelect,
  onFareSelect,
  originCode,
  destinationCode
}) => {
  const fares: FlightFare[] = [
    {
      name: 'Basic',
      type: 'basic',
      price: flight.price,
      currency: flight.currency,
      benefits: ['Bolso o mochila pequeña', 'Cambio con cargo', 'No aplican beneficios por categorías de socios']
    },
    {
      name: 'Light',
      type: 'light',
      price: flight.price + 550,
      currency: flight.currency,
      benefits: ['Equipaje de mano 10 kg', 'Bolso o mochila pequeña', 'Acumulación de millas']
    },
    {
      name: 'Full',
      type: 'full',
      price: flight.price + 1200,
      currency: flight.currency,
      benefits: ['Equipaje de bodega 23 kg', 'Asiento estándar', 'Cambios sin cargo']
    },
    {
      name: 'Premium Economy',
      type: 'premium',
      price: flight.price + 2500,
      currency: flight.currency,
      benefits: ['Asiento central bloqueado', 'Check-in y embarque preferente', 'Equipaje de bodega 23 kg x2']
    }
  ];

  return (
    <div className={`card mb-3 ${isSelected ? 'border-2-blue' : ''}`} style={isSelected ? {border: '2px solid #ed1650'} : {}}>
      {/* Flight Summary Header */}
      <div 
        className="p-3 cursor-pointer border-bottom"
        onClick={onSelect}
      >
        <div className="d-flex justify-space-between align-items-center">
          <div className="d-flex flex-column">
            <span className="fs-2 fw-bold tc-ocean">{flight.takeoff}</span>
            <span className="tc-gray-smoke">{originCode}</span>
          </div>
          
          <div className="d-flex flex-column align-items-center">
            {flight.superOffer && (
                <span className="badge-super-offer" style={{backgroundColor: '#ed1650', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', marginBottom: '4px', fontWeight: 'bold'}}>SUPER OFFER</span>
            )}
            <span className="fs-6 tc-gray-smoke">Duración</span>
            <span className="tc-gray-smoke fw-bold">{flight.duration}</span>
            <div style={{width: '100px', height: '2px', backgroundColor: '#dcdcdc', margin: '5px 0', position: 'relative'}}>
              <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '8px', height: '8px', backgroundColor: '#ed1650', borderRadius: '50%'}}></div>
            </div>
            <span className="fs-6 tc-blue fw-bold">Directo</span>
          </div>

          <div className="d-flex flex-column text-end">
            <span className="fs-2 fw-bold tc-ocean">{flight.landing}</span>
            <span className="tc-gray-smoke">{destinationCode}</span>
          </div>
        </div>

        {!isSelected && (
          <div className="d-flex justify-content-end mt-3 align-items-center">
             <div className="d-flex flex-column align-items-end">
                <span className="fs-6 tc-green fw-bold">Adulto desde</span>
                <span className="fs-3 fw-bold tc-ocean">
                  {flight.currency} {flight.price.toLocaleString('es-ES')}
                </span>
             </div>
             <button className="ml-3 btn-transparent tc-red" style={{border: 'none', background: 'transparent'}}>
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
               </svg>
             </button>
          </div>
        )}
      </div>

      {/* Expanded Details & Fares */}
      {isSelected && (
        <div className="bg-gray-smoke">
          <div className="p-3 border-bottom bg-gray">
            <div className="d-flex justify-space-between align-items-center">
                <span className="fs-5 tc-gray-smoke">Operado por LATAM Airlines</span>
                <span className="fs-5 tc-gray-smoke">Airbus A320</span>
            </div>
          </div>
          
          <div className="p-3 overflow-x-auto">
            <div className="d-flex" style={{gap: '16px', overflowX: 'auto', paddingBottom: '10px'}}>
              {fares.map((fare, index) => (
                <div key={index} className="card p-3 d-flex flex-column justify-space-between" style={{minWidth: '250px'}}>
                  <div>
                    <h3 className="fs-3 fw-bold tc-ocean mb-3">{fare.name}</h3>
                    <ul className="pl-0" style={{listStyle: 'none'}}>
                      {fare.benefits.map((benefit, i) => (
                        <li key={i} className="d-flex align-items-start mb-2 fs-6 tc-gray-smoke">
                          <svg className="mr-2 tc-green" width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-3 text-center">
                    <div className="fs-2 fw-bold tc-ocean mb-1">
                      {fare.currency} {fare.price.toLocaleString('es-ES')}
                    </div>
                    <button 
                      className="btn-success w-full"
                      style={{padding: '10px', fontSize: '1rem'}} 
                      onClick={() => onFareSelect(fare)}
                    >
                      Elegir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightCard;
