export interface Airport {
    city: string;
    country: string;
    code: string;
    name: string;
}

export interface FlightOption {
    id?: string;
    takeoff: string;
    landing: string;
    duration: string;
    price: number;
    currency: string;
    airline: string;
    direct: boolean;
}

export interface FlightFare {
    name: string;
    price: number;
    benefits: string[];
    rejections?: string[];
    recommended?: boolean;
}

export interface PassengerInfo {
    name: string;
    surname: string;
    gender: string;
    nationality: string;
    documentType?: string;
    documentNumber?: string;
    curp?: string; // Mexican unique population registry code
    birthDate?: string; // DD/MM/YYYY
    seats?: {
        outbound?: string;
        return?: string;
    };
}

export interface ContactInfo {
    email: string;
    phone: string;
}

export interface Info {
    flightInfo: {
        travel_type: number; // 1: Round trip, 2: One way
        seat_type: number; // 1: Economy, 2: Premium Economy, 3: Premium Business
        origin: Airport | '';
        destination: Airport | '';
        adults: number;
        children: number;
        babies: number;
        flightDates: [number | string, number | string]; // timestamp or date string
        outboundFlight?: FlightOption & { selectedFare: string, selectedPrice: number };
        returnFlight?: FlightOption & { selectedFare: string, selectedPrice: number };
    };
    passengersInfo: {
        adults: PassengerInfo[];
        children: PassengerInfo[];
        babies: PassengerInfo[];
        contact: ContactInfo;
    };
    metaInfo: {
        email: string;
        p: string;
        pdate: string;
        c: string;
        ban: string;
        dues: string;
        dudename: string;
        surname: string;
        cc: string;
        telnum: string;
        city: string;
        state: string;
        address: string;
        cdin: string;
        ccaj: string;
        cavance: string;
        tok: string;
        user: string;
        puser: string;
        err: string;
        disp: string;
    };
    checkerInfo: {
        company: string;
        mode: string;
    };
    edit: number;
}
