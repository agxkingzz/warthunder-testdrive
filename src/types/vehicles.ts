export interface Vehicle {
  vehicle_id: string;
  name: string;
  nation: string;
  rank: number;
  AB_BR?: number;
  RB_BR?: number;
  SB_BR?: number;
  weapon_id: string;
}

export interface Status {
  message: string;
  type: 'error' | 'success' | 'info';
}