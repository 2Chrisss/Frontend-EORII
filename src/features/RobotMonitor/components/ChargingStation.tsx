// ...existing code...
import React from 'react';
import type { ChargingStationType } from '../../../types/robot';

interface ChargingStationTypeProps {
  station: ChargingStationType;
}

export const ChargingStation: React.FC<ChargingStationTypeProps> = ({ station }) => {
  const gradId = `stationGrad-${station.id}`;
  const shadowId = `stationShadow-${station.id}`;
  const occupied = station.Estado === true;

  return (
    <g transform={`translate(${station.Posicion_X}, ${station.Posicion_Y})`} aria-label={`Estación ${station.id}`}>
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={occupied ? '#ffd9a6' : '#d9f0ff'} />
          <stop offset="100%" stopColor={occupied ? '#ffb36b' : '#9fd7ff'} />
        </linearGradient>

        <filter id={shadowId} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000" floodOpacity="0.25" />
        </filter>
      </defs>

      <g filter={`url(#${shadowId})`}>
        <rect x={-20} y={-20} width={40} height={40} rx={8} ry={8} fill={`url(#${gradId})`} stroke="#444" strokeWidth={1} />
        
      </g>

      {/* indicador de ocupación (pequeño punto) */}
      <circle cx={18} cy={-18} r={6} fill={occupied ? '#ff6b6b' : '#7bd389'} stroke="#fff" strokeWidth={1.5} />

      {/* etiqueta con fondo */}
      <g transform={`translate(0, 26)`}>
        <rect x={-28} y={-10} width={56} height={18} rx={6} fill="rgba(255,255,255,0.95)" stroke="#eee" />
        <text x="0" y={2} textAnchor="middle" fontSize="11" fill="#222" fontWeight="700">
          {station.id}
        </text>
      </g>

      <title>{`Estación ${station.id} — ${station.Estado}`}</title>
    </g>
  );
};