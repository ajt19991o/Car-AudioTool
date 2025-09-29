export interface VehicleCorporation {
  corporation: string;
  makes: string[];
}

export interface AudioComponent {
  id: string;
  name: string;
  type: string;
  category: string;
  price: number;
  specs?: {
    rms_wattage?: number;
    peak_wattage?: number;
    size?: string;
  };
  purchase_links?: { vendor: string; url: string }[];
}

export interface VehicleSpecs {
  years: number[];
  speakers: Record<string, string>;
  cabinDimensions?: {
    frontToRearLength?: number;
    width?: number;
    height?: number;
  };
}

export interface VehicleFitmentSummary {
  recommendedSpeakers: { location: string; size: string }[];
  compatibleComponentTypes: string[];
  notes?: string;
}
