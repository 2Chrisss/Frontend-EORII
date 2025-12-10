
export interface Robot {
  id: string;
  Posicion_X: number; 
  Posicion_Y: number;
  Nivel_Bateria: number; 
  Temperatura_Bateria: number;
  Estado_Carga: boolean;
  Estado_Operativo: boolean | null;
  Temperatura_Motor: number| null;
  
}

export interface ChargingStationType {
  id: string;
  Posicion_X: number;
  Posicion_Y: number;
  Uso_Energia: number;
  Temperatura: number;
  Estado: boolean ;
  Carga_Rapida: boolean;
}