import React, {useState, useEffect} from 'react';
import RobotMarker from './components/RobotMarker';

import { ChargingStation } from './components/ChargingStation';
import { useNavigate } from 'react-router-dom';

import type { Robot, ChargingStationType } from '../../types/robot'; // Asegúrate de importar el tipo correcto

const MAP_WIDTH = 960;
const MAP_HEIGHT = 640;

const initialStations: ChargingStationType[] = [
    { id: 'S1', Posicion_X: 50, Posicion_Y: 50, Uso_Energia: 100, Temperatura: 22, Estado: false, Carga_Rapida: false},
    { id: 'S2', Posicion_X: 920, Posicion_Y: 550,Uso_Energia: 100, Temperatura: 24, Estado: false, Carga_Rapida: true},
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
  const zonasAlmacen = [
    // Centradas en (200, 150), (200, 500) y (700, 320)
    { id: 'estanteria1', x: 200 - 60, y: 150 - 60, width: 120, height: 120, tipo: 'estanteria', label: 'Estantería A' },
    { id: 'estanteria2', x: 200 - 60, y: 500 - 60, width: 120, height: 120, tipo: 'estanteria', label: 'Estantería B' },
    { id: 'dejada', x: 700 - 50, y: 320 - 50, width: 100, height: 100, tipo: 'dejada', label: 'Zona Descarga' },
  ];
  
  useEffect(() => {
    const ws = new WebSocket('https://zenbook.tailee72e7.ts.net/'); 

    ws.onopen = () => {
      console.log('Conectado al servidor');
      setIsConnected(true);
    };

    ws.onmessage = (evento) => {
      try {
        console.log(evento.data)
        const robots = JSON.parse(evento.data).robots.data; 
        const stations = JSON.parse(evento.data).stations.data;
        console.log('Datos recibidos ROBOTS:', robots);
        console.log('Datos recibidos ESTACIONES: ', stations)

       
        setRobots(robots);
        

        setChargingStations(stations);
        
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
    navigate("stats", { state: { fetchData: true } });
  };
  const activeCount = robots.length;
  const carryingCount = robots.filter((r) => r.Estado_Carga === true).length;
  const notCarryingCount = robots.filter((r) => r.Estado_Carga === false).length;
  const chargingCount = robots.filter((r) => r.Estado_Operativo === false).length;
  const notChargingCount = robots.filter((r) => r.Estado_Operativo === true).length;
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
              {/* Gradientes para las zonas */}
                <linearGradient id="estanteriaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#8B4513" />
                  <stop offset="100%" stopColor="#654321" />
                </linearGradient>

                <linearGradient id="dejadaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4CAF50" />
                  <stop offset="100%" stopColor="#2E7D32" />
                </linearGradient>

                {/* Patrón de líneas para estanterías */}
                <pattern id="shelfPattern" width="10" height="10" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="10" x2="10" y2="0" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                </pattern>
              </defs>

              <rect width="100%" height="100%" fill="url(#grid)" />
              <rect width="100%" height="100%" fill="url(#vignette)" />

              {/* Zonas estáticas del almacén */}
              {zonasAlmacen.map(zona => (
                <g key={zona.id}>
                  {/* Rectángulo principal con opacidad */}
                  <rect
                    x={zona.x}
                    y={zona.y}
                    width={zona.width}
                    height={zona.height}
                    rx={8}
                    fill={zona.tipo === 'estanteria' ? 'rgba(139, 69, 19, 0.25)' : 'rgba(76, 175, 80, 0.25)'}
                    stroke={zona.tipo === 'estanteria' ? 'rgba(139, 69, 19, 0.6)' : 'rgba(76, 175, 80, 0.6)'}
                    strokeWidth={2}
                    strokeDasharray={zona.tipo === 'estanteria' ? '0' : '8 4'}
                  />

                  {/* Líneas horizontales para estanterías (simular niveles) */}
                  {zona.tipo === 'estanteria' && (
                    <>
                      <line 
                        x1={zona.x + 10} 
                        y1={zona.y + zona.height * 0.33} 
                        x2={zona.x + zona.width - 10} 
                        y2={zona.y + zona.height * 0.33} 
                        stroke="rgba(139, 69, 19, 0.4)" 
                        strokeWidth={2} 
                      />
                      <line 
                        x1={zona.x + 10} 
                        y1={zona.y + zona.height * 0.66} 
                        x2={zona.x + zona.width - 10} 
                        y2={zona.y + zona.height * 0.66} 
                        stroke="rgba(139, 69, 19, 0.4)" 
                        strokeWidth={2} 
                      />
                    </>
                  )}

                  {/* Icono para zona de descarga */}
                  {zona.tipo === 'dejada' && (
                    <g transform={`translate(${zona.x + zona.width/2}, ${zona.y + zona.height/2 - 5})`}>
                      <polygon 
                        points="0,-12 10,4 -10,4" 
                        fill="rgba(76, 175, 80, 0.6)" 
                      />
                      <rect x={-2} y={4} width={4} height={8} fill="rgba(76, 175, 80, 0.6)" />
                    </g>
                  )}

                  {/* Etiqueta */}
                  <text
                    x={zona.x + zona.width / 2}
                    y={zona.y + zona.height + 18}
                    textAnchor="middle"
                    fontSize={12}
                    fontWeight={600}
                    fill="#555"
                  >
                    {zona.label}
                  </text>
                </g>
              ))}

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
                </svg>
                <div>
                  <div style={{ fontWeight: 700 }}>Estación de carga</div>
                </div>
              </div>
            </div>
          </div>

          {/* Información de cada robot */}
          <div style={styles.card}>
            <strong>Estado de Robots</strong>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {robots.length === 0 ? (
                <div style={{ color: '#888', fontSize: 13, textAlign: 'center', padding: 20 }}>
                  Esperando datos de robots...
                </div>
              ) : (
                robots.map(robot => (
                  <div 
                    key={robot.id} 
                    style={{ 
                      padding: 12, 
                      borderRadius: 8, 
                      background: 'linear-gradient(180deg, #f8fafc, #fff)',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    {/* Encabezado del robot */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>🤖</span>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>Robot {robot.id}</span>
                      </div>
                      <span 
                        style={{ 
                          padding: '2px 8px', 
                          borderRadius: 12, 
                          fontSize: 11, 
                          fontWeight: 600,
                          background: robot.Estado_Operativo ? '#d4edda' : '#fff3cd',
                          color: robot.Estado_Operativo ? '#155724' : '#856404'
                        }}
                      >
                        {robot.Estado_Operativo ? 'Operativo' : 'En carga'}
                      </span>
                    </div>

                    {/* Batería */}
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666', marginBottom: 4 }}>
                        <span> Batería</span>
                        <span style={{ fontWeight: 600 }}>{robot.Nivel_Bateria ?? 0}%</span>
                      </div>
                      <div style={{ height: 6, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            width: `${robot.Nivel_Bateria ?? 0}%`, 
                            height: '100%', 
                            background: (robot.Nivel_Bateria ?? 0) > 50 
                              ? 'linear-gradient(90deg, #38d39f, #2ecc71)' 
                              : (robot.Nivel_Bateria ?? 0) > 20 
                                ? 'linear-gradient(90deg, #f39c12, #e67e22)' 
                                : 'linear-gradient(90deg, #ff6b6b, #d9534f)',
                            borderRadius: 4,
                            transition: 'width 300ms ease'
                          }} 
                        />
                      </div>
                    </div>

                    {/* Posición */}
                    <div style={{ display: 'flex', gap: 12, marginBottom: 6 }}>
                      <div style={{ flex: 1, fontSize: 12 }}>
                        <span style={{ color: '#666' }}>Posición: </span>
                        <span style={{ fontWeight: 600 }}>({Math.round(robot.Posicion_X)}, {Math.round(robot.Posicion_Y)})</span>
                      </div>
                    </div>

                    {/* Temperaturas */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <div style={{ 
                        flex: 1, 
                        fontSize: 11, 
                        padding: '4px 8px', 
                        background: '#fff5f5', 
                        borderRadius: 4,
                        minWidth: 100
                      }}>
                        <span style={{ color: '#666' }}>Batería: </span>
                        <span style={{ 
                          fontWeight: 600, 
                          color: (robot.Temperatura_Bateria ?? 0) > 60 ? '#d9534f' : '#333'
                        }}>
                          {robot.Temperatura_Bateria?.toFixed(1) ?? '--'}°C
                        </span>
                      </div>
                      <div style={{ 
                        flex: 1, 
                        fontSize: 11, 
                        padding: '4px 8px', 
                        background: '#fff5f5', 
                        borderRadius: 4,
                        minWidth: 100
                      }}>
                        <span style={{ color: '#666' }}>Motor: </span>
                        <span style={{ 
                          fontWeight: 600, 
                          color: (robot.Temperatura_Motor ?? 0) > 80 ? '#d9534f' : '#333'
                        }}>
                          {robot.Temperatura_Motor?.toFixed(1) ?? '--'}°C
                        </span>
                      </div>
                    </div>

                    {/* Estado de carga */}
                    {robot.Estado_Carga && (
                      <div style={{ 
                        marginTop: 8, 
                        fontSize: 11, 
                        padding: '4px 8px', 
                        background: '#e8f5e9', 
                        borderRadius: 4,
                        color: '#2e7d32',
                        textAlign: 'center'
                      }}>
                        ⚡ Cargando batería
                      </div>
                    )}
                  </div>
                ))
              )}
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
