export interface VehicleCorporation {
  corporation: string;
  makes: string[];
}

export interface AudioComponent {
  id: string;
  brand?: string;
  name: string;
  type: string;
  category: string;
  price: number;
  description?: string;
  specs?: {
    rms_wattage?: number;
    peak_wattage?: number;
    size?: string;
    channels?: number;
    impedance?: string;
    preamp_voltage?: string;
    awg?: string;
    length?: string;
    compatibility?: string[];
  };
  fitment?: {
    speakerSizes?: string[];
    locations?: string[];
  };
  tags?: string[];
  purchase_links?: { vendor: string; url: string }[];
}

export interface VehicleModelOption {
  model: string;
  years?: number[];
  trims?: string[];
}

export interface VehicleSpecs {
  make?: string;
  model?: string;
  years: number[];
  trims?: string[];
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
