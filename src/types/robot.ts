
export interface Robot {
  id: string;
  Posicion_X: number; 
  Posicion_Y: number;
  Nivel_Bateria: number; 
  Temperatura_Bateria: number;
  Estado_Carga: boolean;

  
}

export interface ChargingStationType {
  id: string;
  x: number;
  y: number;
  temperature: number;
  status: 'occupied'| 'not-occupied'
}