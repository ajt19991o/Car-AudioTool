import { type Node, type Edge } from 'reactflow';

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
