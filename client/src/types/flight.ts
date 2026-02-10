export interface FlightOption {
    takeoff: string;
    landing: string;
    duration: string;
    price: number;
    currency: string;
    id?: string;
    airline?: string;
    direct?: boolean;
    selectedFare?: string;
    selectedPrice?: number;
    superOffer?: boolean;
}

export interface FlightFare {
  name: string;
  price: number;
  currency: string;
  benefits: string[];
  type: 'basic' | 'light' | 'full' | 'premium';
}
