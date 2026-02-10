import React, { useState, useEffect } from 'react';
import '../css/seats.css';

interface SeatMapProps {
    flightId?: string;
    flightRoute: string; // e.g., "MEX - CUN"
    selectedSeat: string | undefined;
    onSelectSeat: (seat: string) => void;
    onClose: () => void;
}

const SeatMap: React.FC<SeatMapProps> = ({ flightId, flightRoute, selectedSeat, onSelectSeat, onClose }) => {
    const [occupiedSeats, setOccupiedSeats] = useState<string[]>([]);
    const rows = 30;
    const aisles = ['A', 'B', 'C', 'D', 'E', 'F'];

    useEffect(() => {
        // Simulate fetching occupied seats based on flightId
        // In a real app, this would be an API call
        const generateOccupiedSeats = () => {
            const occupied: string[] = [];
            
            for (let r = 1; r <= rows; r++) {
                for (const aisle of aisles) {
                    // Randomly mark seats as occupied (approx 30% occupancy)
                    if (Math.random() > 0.7) {
                        occupied.push(`${r}${aisle}`);
                    }
                }
            }
            return occupied;
        };

        setOccupiedSeats(generateOccupiedSeats());
    }, [flightId]);

    const handleSeatClick = (seatId: string) => {
        if (occupiedSeats.includes(seatId)) return;
        onSelectSeat(seatId);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]" style={{backgroundColor: '#fff', borderRadius: '12px', width: '90%', maxWidth: '500px', maxHeight: '90vh', display: 'flex', flexDirection: 'column'}}>
                
                {/* Header */}
                <div className="text-white p-4 flex justify-between items-center" style={{backgroundColor: '#8A2BE2', color: 'white', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                        <h3 className="m-0 text-lg font-bold">Selecciona tu asiento</h3>
                        <p className="m-0 text-sm opacity-80">{flightRoute}</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-gray-300 bg-transparent border-none cursor-pointer text-xl">
                        &times;
                    </button>
                </div>

                {/* Legend */}
                <div className="p-4 border-b border-gray-200" style={{padding: '16px', borderBottom: '1px solid #eee'}}>
                    <div className="seat-legend">
                        <div className="legend-item">
                            <div className="legend-box available"></div>
                            <span>Disponible</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-box occupied"></div>
                            <span>Ocupado</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-box selected"></div>
                            <span>Seleccionado</span>
                        </div>
                    </div>
                </div>

                {/* Seat Grid */}
                <div className="overflow-y-auto p-4 flex-1 bg-gray-50" style={{overflowY: 'auto', padding: '20px', backgroundColor: '#f9f9f9'}}>
                    <div className="seat-map-container">
                        {/* Plane Nose/Front Indicator */}
                        <div className="w-full text-center text-gray-400 mb-4 text-sm" style={{width: '100%', textAlign: 'center', color: '#999', marginBottom: '15px'}}>Frente del avión</div>

                        {Array.from({ length: rows }, (_, i) => i + 1).map(row => (
                            <div key={row} className="seat-row">
                                <div className="flex gap-2 mr-4" style={{display: 'flex', marginRight: '15px'}}>
                                    {['A', 'B', 'C'].map(col => {
                                        const seatId = `${row}${col}`;
                                        const isOccupied = occupiedSeats.includes(seatId);
                                        const isSelected = selectedSeat === seatId;
                                        
                                        return (
                                            <div 
                                                key={seatId}
                                                className={`seat ${isOccupied ? 'occupied' : ''} ${isSelected ? 'selected' : ''}`}
                                                onClick={() => handleSeatClick(seatId)}
                                                title={`Asiento ${seatId}`}
                                            >
                                                {seatId}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="seat-aisle">{row}</div>

                                <div className="flex gap-2 ml-4" style={{display: 'flex', marginLeft: '15px'}}>
                                    {['D', 'E', 'F'].map(col => {
                                        const seatId = `${row}${col}`;
                                        const isOccupied = occupiedSeats.includes(seatId);
                                        const isSelected = selectedSeat === seatId;
                                        
                                        return (
                                            <div 
                                                key={seatId}
                                                className={`seat ${isOccupied ? 'occupied' : ''} ${isSelected ? 'selected' : ''}`}
                                                onClick={() => handleSeatClick(seatId)}
                                                title={`Asiento ${seatId}`}
                                            >
                                                {seatId}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-white flex justify-between items-center" style={{padding: '16px', borderTop: '1px solid #eee'}}>
                    <div>
                        <span className="text-gray-500 text-sm block">Asiento seleccionado:</span>
                        <span className="text-lg font-bold" style={{color: '#8A2BE2'}}>{selectedSeat || 'Ninguno'}</span>
                    </div>
                    <button 
                        onClick={onClose}
                        disabled={!selectedSeat}
                        className={`px-6 py-2 rounded font-bold text-white transition-colors ${!selectedSeat ? 'bg-gray-300 cursor-not-allowed' : 'hover:opacity-90 cursor-pointer'}`}
                        style={{
                            padding: '10px 24px', 
                            borderRadius: '4px', 
                            border: 'none',
                            backgroundColor: selectedSeat ? '#8A2BE2' : '#ccc',
                            color: 'white',
                            cursor: selectedSeat ? 'pointer' : 'not-allowed'
                        }}
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SeatMap;
