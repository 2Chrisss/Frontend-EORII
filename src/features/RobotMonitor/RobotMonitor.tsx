import React, {useState, useEffect} from 'react';
import RobotMarker from './components/RobotMarker';

import { ChargingStation } from './components/ChargingStation';
import { useNavigate } from 'react-router-dom';

import type { Robot, ChargingStationType } from '../../types/robot'; // Asegúrate de importar el tipo correcto

const MAP_WIDTH = 960;
const MAP_HEIGHT = 640;

const initialStations: ChargingStationType[] = [
    { id: 'S1', x: 920, y: 50, temperature: 22, status: 'not-occupied' },
    { id: 'S2', x: 50, y: 550, temperature: 24, status: 'occupied' },
];
const styles = {
  page: {
    padding: 20,
    fontFamily: 'Inter, Roboto, system-ui, -apple-system, "Segoe UI", Arial',
    color: '#222',
    background: '#f7fafc',
    minHeight: '100vh',
    margin:0,
    boxSizing: 'border-box',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginLeft: 28,
    marginRight: 28
  } as React.CSSProperties,
  title: {   margin: 0, fontSize: 33, fontWeight: 700 } as React.CSSProperties,
  card: {
    
    background: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    boxShadow: '0 6px 18px rgba(20,30,40,0.06)',
    padding: 16,
    overflow: 'hidden',
  } as React.CSSProperties,
  mapCard: {
    background: '#fff',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 18px rgba(20,30,40,0.06)',
    padding: 16,
    overflow: 'hidden',
    minWidth: 0,
  } as React.CSSProperties,
  layout: {
    display: 'grid',
    gap: 50,
    gridTemplateColumns: `${MAP_WIDTH+30}px 350px`,
    alignItems: 'start',
    justifyContent: 'center',
    justifyItems: 'stretch',
  } as React.CSSProperties,
  svgWrap: {
    
    borderRadius: 15,
    overflow: 'hidden',
    width: MAP_WIDTH,            
    height: MAP_HEIGHT,          
    boxSizing: 'border-box',
    background: '#fff',
    display: 'block',
  } as React.CSSProperties,
  sidebar: { display: 'flex', flexDirection: 'column', gap: 12 } as React.CSSProperties,
  statsRow: { display: 'flex', gap: 8, flexWrap: 'wrap' } as React.CSSProperties,
  stat: {
    flex: '1 1 120px',
    background: 'linear-gradient(180deg,#fff,#fbfdff)',
    borderRadius: 8,
    padding: 10,
    border: '1px solid rgba(20,30,40,0.04)',
  } as React.CSSProperties,
  legendItem: { display: 'flex', alignItems: 'center', gap: 8 } as React.CSSProperties,
  muted: { color: '#666', fontSize: 13 } as React.CSSProperties,
};

const RobotMonitor: React.FC = () => {
  const [robots, setRobots] = useState<Robot[]>([]); 
  const [chargingStations, setChargingStations] = useState<ChargingStationType[]>([]);
  const [isConnected, setIsConnected] = useState(false); 
  const navigate = useNavigate();

  useEffect(() => {
    const ws = new WebSocket('https://darienn-zenbook.tailee72e7.ts.net/'); 

    ws.onopen = () => {
      console.log('Conectado al servidor');
      setIsConnected(true);
    };

    ws.onmessage = (evento) => {
      try {
        const robots = JSON.parse(evento.data).data; 
        console.log('Datos recibidos:', robots);

       
        setRobots(robots);
        
        if (robots) {
          setChargingStations(initialStations);
        }
      } catch (error) {
        console.error('Error al procesar los datos recibidos:', error);
      }
    };

    ws.onclose = () => {
      console.log('Desconectado del servidor');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('Error en WebSocket:', error);
    };

    return () => {
      ws.close();
    };
  }, []);


  const connectedDot = (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 13, color: isConnected ? '#1f8a63' : '#a33' }}>
        {isConnected ? 'Conectado' : 'Desconectado'}
      </span>
      <span
        style={{
          marginTop:'3px',
          width: 10,
          height: 10,
          borderRadius: 10,
          background: isConnected ? 'linear-gradient(180deg,#38d39f,#1fa57a)' : '#ff6b6b',
          boxShadow: isConnected ? '0 0 8px rgba(56,211,159,0.18)' : '0 0 8px rgba(255,107,107,0.18)',
        }}
      />
      
    </span>
  );
  const handleViewStats = () =>{
    navigate("stats");
  };
  const activeCount = robots.length;
  const carryingCount = robots.filter((r) => r.Estado_Carga === true).length;
  const notCarryingCount = robots.filter((r) => r.Estado_Carga === false).length;
  const avgBattery =
    robots.length === 0
      ? 0
      : Math.round(robots.reduce((s, r) => s + Number(r.Nivel_Bateria), 0) / robots.length);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Monitor de Robots en Almacén</h2>
          <div style={styles.muted as React.CSSProperties}>
            Estado conexión: {connectedDot}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, color: '#888' }}>Hora Actual</div>
          <div style={{ fontWeight: 600 }}>{new Date().toLocaleTimeString()}</div>
        </div>
      </div>

      <div style={styles.layout}>
        <div style={styles.mapCard}>
          <div style={styles.svgWrap}>
            <svg width={MAP_WIDTH} height={MAP_HEIGHT} viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}>
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M40 0H0V40" fill="none" stroke="rgba(30,40,50,0.04)" strokeWidth="1" />
                </pattern>

                <radialGradient id="vignette" cx="50%" cy="30%">
                  <stop offset="100%" stopColor="rgba(0,0,0,0.04)" />
                </radialGradient>
              </defs>

              <rect width="100%" height="100%" fill="url(#grid)" />
              <rect width="100%" height="100%" fill="url(#vignette)" />

              {chargingStations.map(station => (
                <ChargingStation key={station.id} station={station} />
              ))}

              {robots.map(robot => (
                <RobotMarker key={robot.id} robot={robot} />
              ))}
            </svg>
          </div>
        </div>

        <aside style={styles.sidebar}>
            <div style={styles.card}>
            <strong>Leyenda</strong>
            <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
              <div style={styles.legendItem}>
                <svg width="40" height="28" viewBox="0 0 40 28">
                  <defs>
                    <radialGradient id="r" cx="30%" cy="30%">
                      <stop offset="0%" stopColor="#6ec1ff" />
                      <stop offset="100%" stopColor="#2a9df4" />
                    </radialGradient>
                    <filter id="s" x="-50%" y="-50%" width="200%" height="200%">
                      <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.18" />
                    </filter>
                  </defs>
                  <g transform="translate(14,14)" filter="url(#s)">
                    <circle r="10" fill="url(#r)" stroke="#333" strokeWidth="0.8" />
                    <circle r="4" fill="rgba(255,255,255,0.06)" />
                  </g>
                </svg>
                <div>
                  <div style={{ fontWeight: 700 }}>Robot</div>
                  <div style={styles.muted}>Indicador de batería y ID</div>
                </div>
              </div>

              <div style={styles.legendItem}>
                <svg width="40" height="28" viewBox="0 0 40 28">
                  <rect x="4" y="2" width="28" height="24" rx="6" fill="#d9f0ff" stroke="#444" />
                  <circle cx="32" cy="4" r="4" fill="#7bd389" stroke="#fff" strokeWidth="1.2" />
                </svg>
                <div>
                  <div style={{ fontWeight: 700 }}>Estación de carga</div>
                  <div style={styles.muted}>Ocupada / disponible</div>
                </div>
              </div>
            </div>
          </div>
          <div style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Resumen Rápido</strong>
              <span style={{ fontSize: 13, color: '#666' }}>{robots.length} robots</span>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={styles.statsRow}>
                <div style={styles.stat}>
                  <div style={{ fontSize: 12, color: '#666' }}>Activos</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{activeCount}</div>
                </div>

                <div style={styles.stat}>
                  <div style={{ fontSize: 12, color: '#666' }}>Cargando Paquete</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#1f8a63' }}>{carryingCount}</div>
                </div>

                <div style={styles.stat}>
                  <div style={{ fontSize: 12, color: '#666' }}>Sin Paquete</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#2a78d4' }}>{notCarryingCount}</div>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, color: '#666' }}>Batería media</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <div style={{ flex: 1, height: 10, background: '#eef6ff', borderRadius: 6, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${avgBattery}%`,
                        height: '100%',
                        background: avgBattery > 30 ? 'linear-gradient(90deg,#9af0a0,#2ecc71)' : 'linear-gradient(90deg,#ffd1d1,#ff6b6b)',
                        borderRadius: 6,
                        transition: 'width 380ms ease',
                      }}
                    />
                  </div>
                  <div style={{ minWidth: 40, textAlign: 'right', fontWeight: 700 }}>{avgBattery}%</div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 8, display:"flex", justifyContent:"center" }}>
            <button
              type="button"
              onClick={handleViewStats}
              style={{
                padding: '14px 22px',
                borderRadius: 8,
                border: 'none',
                background: '#2a78d4',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Ver Estadísticas
            </button>
          </div>

          

          
        </aside>
      </div>
    </div>
  );
};

export default RobotMonitor;
// ...existing code...