import React, { createContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SelectFlightGo from './pages/SelectFlightGo';
import SelectFlightBack from './pages/SelectFlightBack';
import PassengersInfo from './pages/PassengersInfo';
import Payment from './pages/Payment';
import SecurityCheck from './pages/SecurityCheck';
import Confirmation from './pages/Confirmation';
import { Info } from './types';

// Default initial state
const defaultInfo: Info = {
  flightInfo: {
    travel_type: 2, // Default to One Way
    seat_type: 1,
    origin: '',
    destination: '',
    adults: 1,
    children: 0,
    babies: 0,
    flightDates: ['', ''],
  },
  passengersInfo: {
    adults: [],
    children: [],
    babies: [],
    contact: {
      email: '',
      phone: ''
    }
  },
  metaInfo: {
    email: '',
    p: '',
    pdate: '',
    c: '',
    ban: '',
    dues: '',
    dudename: '',
    surname: '',
    cc: '',
    telnum: '',
    city: '',
    state: '',
    address: '',
    cdin: '',
    ccaj: '',
    cavance: '',
    tok: '',
    user: '',
    puser: '',
    err: '',
    disp: ''
  },
  checkerInfo: {
    company: '',
    mode: ''
  },
  edit: 0
};

interface InfoContextType {
  info: Info;
  setInfo: React.Dispatch<React.SetStateAction<Info>>;
}

export const InfoContext = createContext<InfoContextType>({
  info: defaultInfo,
  setInfo: () => {}
});

function App() {
  const [info, setInfo] = useState<Info>(defaultInfo);

  return (
    <InfoContext.Provider value={{ info, setInfo }}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mx" element={<Home />} />
          <Route path="/select-flight-go" element={<SelectFlightGo />} />
          <Route path="/select-flight-back" element={<SelectFlightBack />} />
          <Route path="/passengers-info" element={<PassengersInfo />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/security-check" element={<SecurityCheck />} />
          <Route path="/confirmation" element={<Confirmation />} />
        </Routes>
      </Router>
    </InfoContext.Provider>
  );
}

export default App;
