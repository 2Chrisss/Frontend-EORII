import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const styles = {
  page: { padding: 20, fontFamily: 'Inter, Roboto, system-ui, -apple-system, "Segoe UI", Arial', background: '#f7fafc', minHeight: '100vh' } as React.CSSProperties,
  card: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 8px 24px rgba(0,0,0,0.06)', marginBottom: 20 } as React.CSSProperties,
  row: { display: 'flex', gap: 12, alignItems: 'center' } as React.CSSProperties,
  stat: { flex: 1, padding: 12, borderRadius: 8, background: 'linear-gradient(180deg,#fff,#fbfdff)', textAlign: 'center', border: '1px solid #e2e8f0' } as React.CSSProperties,
  back: { padding: '8px 16px', borderRadius: 8, border: 'none', background: '#2a78d4', color: '#fff', cursor: 'pointer', fontWeight: 600 } as React.CSSProperties,
  gridCharts: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 } as React.CSSProperties,
};


// Mapeo de IDs de características según la BD
const CARACTERISTICAS = {
  POSICION_X: 1,
  POSICION_Y: 2,
  NIVEL_BATERIA: 3,
  TEMPERATURA_BATERIA: 4,
  ESTADO_CARGA: 5,
  ESTADO_OPERATIVO: 6,
  TEMPERATURA_MOTOR: 7,
  USO_ENERGIA: 8,
  TEMPERATURA: 9,
  ESTADO: 10,
  CARGA_RAPIDA: 11
};

interface RegistroRobot {
  idRegistro: number;
  idRobot: number;
  idCaracteristica: number;
  valorCaracteristica: string;
  timestamp: string;
}

interface RobotStats {
  id: number;
  posicionX: number;
  posicionY: number;
  nivelBateria: number;
  temperaturaBateria: number;
  estadoCarga: boolean;
  estadoOperativo: boolean;
  temperaturaMotor: number;
  usoEnergia: number;
  temperatura: number;
  estado: boolean;
  cargaRapida: boolean;
}

const StatsPage: React.FC = () => {
  const navigate = useNavigate();
  const [robotsStats, setRobotsStats] = useState<RobotStats[]>([]);
  const [historialBateria, setHistorialBateria] = useState<any[]>([]);
  const [registrosRaw, setRegistrosRaw] = useState<RegistroRobot[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://3.238.250.34:3000/api/obtenerTodo');
        const data = await response.json();
        
        if (data.success && data.datos) {
          setRegistrosRaw(data.datos);
          const stats = procesarRegistros(data.datos);
          setRobotsStats(stats);
          const historial = procesarHistorialBateria(data.datos);
          setHistorialBateria(historial);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Actualizar cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  // Procesar registros de la BD al formato de estadísticas por robot
  const procesarRegistros = (registros: RegistroRobot[]): RobotStats[] => {
    const robotsMap: { [key: number]: RobotStats } = {};

    // IDs de robots válidos (excluir estaciones de carga)
    const ROBOTS_VALIDOS = [1, 2];

    // Agrupar por robot y obtener el último valor de cada característica
    registros
      .filter(reg => ROBOTS_VALIDOS.includes(reg.idRobot)) // Solo robots 1 y 2
      .forEach(reg => {
        if (!robotsMap[reg.idRobot]) {
          robotsMap[reg.idRobot] = {
            id: reg.idRobot,
            posicionX: 0,
            posicionY: 0,
            nivelBateria: 0,
            temperaturaBateria: 0,
            estadoCarga: false,
            estadoOperativo: false,
            temperaturaMotor: 0,
            usoEnergia: 0,
            temperatura: 0,
            estado: false,
            cargaRapida: false
          };
        }

        const valor = reg.valorCaracteristica;
        const robot = robotsMap[reg.idRobot];

        switch (reg.idCaracteristica) {
          case CARACTERISTICAS.POSICION_X:
            robot.posicionX = parseFloat(valor) || 0;
            break;
          case CARACTERISTICAS.POSICION_Y:
            robot.posicionY = parseFloat(valor) || 0;
            break;
          case CARACTERISTICAS.NIVEL_BATERIA:
            robot.nivelBateria = parseFloat(valor) || 0;
            break;
          case CARACTERISTICAS.TEMPERATURA_BATERIA:
            robot.temperaturaBateria = parseFloat(valor) || 0;
            break;
          case CARACTERISTICAS.ESTADO_CARGA:
            robot.estadoCarga = valor === 'true' || valor === '1';
            break;
          case CARACTERISTICAS.ESTADO_OPERATIVO:
            robot.estadoOperativo = valor === 'true' || valor === '1';
            break;
          case CARACTERISTICAS.TEMPERATURA_MOTOR:
            robot.temperaturaMotor = parseFloat(valor) || 0;
            break;
          case CARACTERISTICAS.USO_ENERGIA:
            robot.usoEnergia = parseFloat(valor) || 0;
            break;
          case CARACTERISTICAS.TEMPERATURA:
            robot.temperatura = parseFloat(valor) || 0;
            break;
          case CARACTERISTICAS.ESTADO:
            robot.estado = valor === 'true' || valor === '1';
            break;
          case CARACTERISTICAS.CARGA_RAPIDA:
            robot.cargaRapida = valor === 'true' || valor === '1';
            break;
        }
      });

    return Object.values(robotsMap);
  };

  // Procesar historial de batería para gráfico de línea
  const procesarHistorialBateria = (registros: RegistroRobot[]) => {
    const ROBOTS_VALIDOS = [1, 2];
    const bateriaRegistros = registros.filter(
      r => r.idCaracteristica === CARACTERISTICAS.NIVEL_BATERIA && ROBOTS_VALIDOS.includes(r.idRobot)
    );
    const agrupado: { [key: string]: { tiempo: string; totalBateria: number; count: number } } = {};
    
    bateriaRegistros.forEach(reg => {
      const fecha = new Date(reg.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      if (!agrupado[fecha]) {
        agrupado[fecha] = { tiempo: fecha, totalBateria: 0, count: 0 };
      }
      agrupado[fecha].totalBateria += parseFloat(reg.valorCaracteristica) || 0;
      agrupado[fecha].count++;
    });

    return Object.values(agrupado)
      .map(g => ({
        tiempo: g.tiempo,
        bateria: Math.round(g.totalBateria / g.count)
      }))
      .slice(-15); // Últimos 15 puntos
  };

  // Calcular estadísticas
  const total = robotsStats.length;
  const charging = robotsStats.filter(r => r.estadoCarga).length;
  const operativos = robotsStats.filter(r => r.estadoOperativo || r.estado).length;
  const avgBattery = robotsStats.length 
    ? Math.round(robotsStats.reduce((s, r) => s + r.nivelBateria, 0) / robotsStats.length) 
    : 0;
  const avgTemperatura = robotsStats.length
    ? Math.round(robotsStats.reduce((s, r) => s + (r.temperatura || r.temperaturaBateria || r.temperaturaMotor), 0) / robotsStats.length)
    : 0;

  // Datos para gráfico de barras (batería por robot)
  const dataBateria = robotsStats.map(r => ({
    nombre: `Robot ${r.id}`,
    bateria: Math.round(r.nivelBateria)
  }));


  // Datos para gráfico de temperatura
  const dataTemperatura = robotsStats.map(r => ({
    nombre: `Robot ${r.id}`,
    tempBateria: Math.round(r.temperaturaBateria),
    tempMotor: Math.round(r.temperaturaMotor),
  }));

  // Datos para gráfico de posición (uso de energía)

  return (
    <div style={styles.page}>
      {/* Header con estadísticas rápidas */}
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Dashboard de Monitoreo de Robots</h2>
          <button type="button" onClick={() => navigate(-1)} style={styles.back}>← Volver</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          <div style={styles.stat}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Total Robots</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#2a78d4' }}>{total}</div>
          </div>

          <div style={styles.stat}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Operativos</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#2a9d4f' }}>{operativos}</div>
          </div>

          <div style={styles.stat}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Cargando</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#9b59b6' }}>{charging}</div>
          </div>

          <div style={styles.stat}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Batería Media</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#f39c12' }}>{avgBattery}%</div>
          </div>

          <div style={styles.stat}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Temp. Media</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#d9534f' }}>{avgTemperatura}°C</div>
          </div>

          <div style={styles.stat}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Registros</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#666' }}>{registrosRaw.length}</div>
          </div>
        </div>
      </div>

      {/* Gráficos en grid responsivo */}
      <div style={styles.gridCharts}>
        
        {/* Gráfico de línea: Evolución de batería */}
        <div style={styles.card}>
          <h3 style={{ marginTop: 0, fontSize: 18 }}>Evolución de Batería Promedio</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={historialBateria}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="tiempo" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="bateria" stroke="#2a78d4" strokeWidth={2} name="Batería %" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de barras: Nivel de batería individual */}
        <div style={styles.card}>
          <h3 style={{ marginTop: 0, fontSize: 18 }}>Nivel de Batería por Robot</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dataBateria}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="nombre" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="bateria" fill="#2a9d4f" name="Batería %" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      

        {/* Gráfico de barras: Temperaturas */}
        <div style={styles.card}>
          <h3 style={{ marginTop: 0, fontSize: 18 }}>Temperaturas por Robot</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dataTemperatura}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="nombre" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="tempBateria" fill="#f39c12" name="Batería °C" radius={[4, 4, 0, 0]} />
              <Bar dataKey="tempMotor" fill="#d9534f" name="Motor °C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>


      </div>

      {/* Tabla de resumen de robots */}
      <div style={styles.card}>
        <h3 style={{ marginTop: 0, fontSize: 18 }}>Resumen de Robots</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f7fafc' }}>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Robot</th>
                <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #e2e8f0' }}>Posición</th>
                <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #e2e8f0' }}>Batería</th>
                <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #e2e8f0' }}>Estado Carga</th>
                <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #e2e8f0' }}>Operativo</th>
                <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #e2e8f0' }}>Temp. Batería</th>
                <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #e2e8f0' }}>Temp. Motor</th>
              </tr>
            </thead>
            <tbody>
              {robotsStats.map(robot => (
                <tr key={robot.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: 12, fontWeight: 600 }}> Robot {robot.id}</td>
                  <td style={{ padding: 12, textAlign: 'center' }}>({robot.posicionX}, {robot.posicionY})</td>
                  <td style={{ padding: 12, textAlign: 'center' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: 4, 
                      background: robot.nivelBateria > 50 ? '#d4edda' : robot.nivelBateria > 20 ? '#fff3cd' : '#f8d7da',
                      color: robot.nivelBateria > 50 ? '#155724' : robot.nivelBateria > 20 ? '#856404' : '#721c24'
                    }}>
                      {Math.round(robot.nivelBateria)}%
                    </span>
                  </td>
                  <td style={{ padding: 12, textAlign: 'center' }}>
                    {robot.estadoCarga ? ' Sí' : 'No'}
                  </td>
                  <td style={{ padding: 12, textAlign: 'center' }}>
                    {robot.estadoOperativo || robot.estado ? 'Sí' : 'No'}
                  </td>
                  <td style={{ padding: 12, textAlign: 'center' }}>{Math.round(robot.temperaturaBateria)}°C</td>
                  <td style={{ padding: 12, textAlign: 'center' }}>{Math.round(robot.temperaturaMotor)}°C</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;