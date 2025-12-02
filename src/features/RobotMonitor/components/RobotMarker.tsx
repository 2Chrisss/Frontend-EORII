import React from 'react';
import type { Robot } from '../../../types/robot';

interface RobotMarkerProps {
  robot: Robot;
}

const RobotMarker: React.FC<RobotMarkerProps> = ({ robot }) => {
  const radius = 18;
  const gradId = `robotGrad-${robot.id}`;
  const shadowId = `shadow-${robot.id}`;

  const baseColor =
    robot.Estado_Carga === true ? ['#2ecc71', '#27ae60'] : ['#6ec1ff', '#2a9df4'];

  const batteryPct = Math.max(0, Math.min(100, Number(robot.Nivel_Bateria)));
  const batteryWidth = Math.round((batteryPct / 100) * 28);

  return (
    <g transform={`translate(${robot.Posicion_X}, ${robot.Posicion_Y})`} style={{ cursor: 'pointer' }} aria-label={`Robot ${robot.id}`}>
      <defs>
        <radialGradient id={gradId}>
          <stop offset="0%" stopColor={baseColor[0]} stopOpacity="0.95" />
          <stop offset="70%" stopColor={baseColor[1]} stopOpacity="1" />
        </radialGradient>

        <filter id={shadowId} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.35" />
        </filter>
      </defs>

      <g filter={`url(#${shadowId})`}>
        <circle r={radius} fill={`url(#${gradId})`} stroke="#333" strokeWidth={1} />
        <circle r={radius - 6} fill="rgba(255,255,255,0.06)" />
      </g>

      <g transform={`translate(-17, ${radius + 20})`}>
        <rect x="0" y="0" width="32" height="12" rx="2" ry="2" fill="#222" opacity="0.12" />
        <rect x="1" y="1" width={batteryWidth} height="10" rx="1" ry="1" fill={batteryPct > 30 ? '#a6f3a6' : '#ffb3b3'} stroke="#111" strokeOpacity="0.1" />
        <rect x="32" y="3" width="2" height="6" rx="1" ry="1" fill="#333" />
        <text x="16" y={9} textAnchor="middle" fontSize="7" fill="#0a0a0a" fontWeight="600">
          {batteryPct}%
        </text>
      </g>

      <g transform={`translate(0, ${radius + 12})`}>
        <rect x={-22} y={-10} width={44} height={16} rx={6} fill="rgba(255,255,255,0.9)" stroke="#ddd" />
        <text x="0" y="2" textAnchor="middle" fontSize="10" fill="#222" fontWeight="600">
          {robot.id}
        </text>
      </g>

      <title>{`ID: ${robot.id} — Batería: ${batteryPct}% — Estado: ${robot.Estado_Carga}`}</title>
    </g>
  );
};

export default RobotMarker;
