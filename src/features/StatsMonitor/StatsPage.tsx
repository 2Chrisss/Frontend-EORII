import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const styles = {
  page: { padding: 20, fontFamily: 'Inter, Roboto, system-ui, -apple-system, "Segoe UI", Arial', background: '#f7fafc', minHeight: '100vh' } as React.CSSProperties,
  card: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 8px 24px rgba(0,0,0,0.06)', marginBottom: 20 } as React.CSSProperties,
  stat: { flex: 1, padding: 24, borderRadius: 8, background: '#fff', textAlign: 'center', border: '1px solid #e2e8f0' } as React.CSSProperties,
  back: { padding: '8px 16px', borderRadius: 8, border: 'none', background: '#2a78d4', color: '#fff', cursor: 'pointer', fontWeight: 600 } as React.CSSProperties,
  gridChartsRow: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 } as React.CSSProperties,
  dateInput: { padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, fontWeight: 500, cursor: 'pointer' } as React.CSSProperties,
  filterContainer: { display: 'flex', alignItems: 'center', gap: 12 } as React.CSSProperties,
  statsRow: { display: 'flex', gap: 12 } as React.CSSProperties,
  statsCard: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 8px 24px rgba(0,0,0,0.06)', marginBottom: 20 } as React.CSSProperties,
};

const CARACTERISTICAS = {
  NIVEL_BATERIA: 3,
  TEMPERATURA_BATERIA: 4,
  ESTADO_OPERATIVO: 6,
  TEMPERATURA_MOTOR: 7,
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
  nivelBateria: number;
  temperaturaBateria: number;
  temperaturaMotor: number;
}

interface TiempoOperativoPorRobot {
  nombre: string;
  tiempoOperativo: number;
}

interface TemperaturaPromedioPorRobot {
  nombre: string;
  tempBateria: number;
  tempMotor: number;
}

const getToday = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const StatsPage: React.FC = () => {
  const navigate = useNavigate();
  const [robotsStats, setRobotsStats] = useState<RobotStats[]>([]);
  const [historialBateria, setHistorialBateria] = useState<any[]>([]);
  const [registrosRaw, setRegistrosRaw] = useState<RegistroRobot[]>([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(getToday());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tiempoOperativoPorRobot, setTiempoOperativoPorRobot] = useState<TiempoOperativoPorRobot[]>([]);
  const [temperaturaPromedioPorRobot, setTemperaturaPromedioPorRobot] = useState<TemperaturaPromedioPorRobot[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!fechaSeleccionada) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`http://3.238.250.34:3000/api/registrosXdia?fecha=${fechaSeleccionada}`);
        const data = await response.json();
        
        if (data.success && data.datos) {
          setRegistrosRaw(data.datos);
          const stats = procesarRegistros(data.datos);
          setRobotsStats(stats);
          const historial = procesarHistorialBateria(data.datos);
          setHistorialBateria(historial);
          const tiempoOp = calcularTiempoOperativo(data.datos);
          setTiempoOperativoPorRobot(tiempoOp);
          const tempPromedio = calcularTemperaturaPromedio(data.datos);
          setTemperaturaPromedioPorRobot(tempPromedio);
        } else {
          setRegistrosRaw([]);
          setRobotsStats([]);
          setHistorialBateria([]);
          setTiempoOperativoPorRobot([]);
          setTemperaturaPromedioPorRobot([]);
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos. Intente nuevamente.');
        setRegistrosRaw([]);
        setRobotsStats([]);
        setHistorialBateria([]);
        setTiempoOperativoPorRobot([]);
        setTemperaturaPromedioPorRobot([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fechaSeleccionada]);

  const handleFechaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFechaSeleccionada(e.target.value);
  };

  const procesarRegistros = (registros: RegistroRobot[]): RobotStats[] => {
    const robotsMap: { [key: number]: RobotStats } = {};
    const ROBOTS_VALIDOS = [1, 2];

    registros
      .filter(reg => ROBOTS_VALIDOS.includes(reg.idRobot))
      .forEach(reg => {
        if (!robotsMap[reg.idRobot]) {
          robotsMap[reg.idRobot] = {
            id: reg.idRobot,
            nivelBateria: 0,
            temperaturaBateria: 0,
            temperaturaMotor: 0,
          };
        }

        const valor = reg.valorCaracteristica;
        const robot = robotsMap[reg.idRobot];

        switch (reg.idCaracteristica) {
          case CARACTERISTICAS.NIVEL_BATERIA:
            robot.nivelBateria = parseFloat(valor) || 0;
            break;
          case CARACTERISTICAS.TEMPERATURA_BATERIA:
            robot.temperaturaBateria = parseFloat(valor) || 0;
            break;
          case CARACTERISTICAS.TEMPERATURA_MOTOR:
            robot.temperaturaMotor = parseFloat(valor) || 0;
            break;
        }
      });

    return Object.values(robotsMap);
  };

  const procesarHistorialBateria = (registros: RegistroRobot[]) => {
    const ROBOTS_VALIDOS = [1, 2];
    const bateriaRegistros = registros.filter(
      r => r.idCaracteristica === CARACTERISTICAS.NIVEL_BATERIA && ROBOTS_VALIDOS.includes(r.idRobot)
    );
    const agrupado: { [key: string]: { tiempo: string; totalBateria: number; count: number } } = {};
    
    bateriaRegistros.forEach(reg => {
      const fecha = new Date(reg.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
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
      .slice(-20);
  };

  const calcularTiempoOperativo = (registros: RegistroRobot[]): TiempoOperativoPorRobot[] => {
    const ROBOTS_VALIDOS = [1, 2];
    const tiemposPorRobot: { [key: number]: number } = { 1: 0, 2: 0 };

    ROBOTS_VALIDOS.forEach(robotId => {
      const estadoRegistros = registros
        .filter(r => r.idCaracteristica === CARACTERISTICAS.ESTADO_OPERATIVO && r.idRobot === robotId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      if (estadoRegistros.length < 2) return;

      let inicioOperativo: Date | null = null;

      estadoRegistros.forEach(reg => {
        const estaOperativo = reg.valorCaracteristica === 'true' || reg.valorCaracteristica === '1';
        const timestamp = new Date(reg.timestamp);

        if (estaOperativo && !inicioOperativo) {
          inicioOperativo = timestamp;
        } else if (!estaOperativo && inicioOperativo) {
          const duracion = (timestamp.getTime() - inicioOperativo.getTime()) / 60000;
          tiemposPorRobot[robotId] += duracion;
          inicioOperativo = null;
        }
      });

      // Si sigue operativo al final del día, contar hasta el último registro
      if (inicioOperativo !== null && estadoRegistros.length > 0) {
        const ultimoRegistro = new Date(estadoRegistros[estadoRegistros.length - 1].timestamp);
        const duracion = (ultimoRegistro.getTime() - (inicioOperativo as Date).getTime()) / 60000;
        tiemposPorRobot[robotId] += duracion;
      }
    });

    return ROBOTS_VALIDOS.map(robotId => ({
      nombre: `Robot ${robotId}`,
      tiempoOperativo: Math.round(tiemposPorRobot[robotId])
    }));
  };


  const calcularTemperaturaPromedio = (registros: RegistroRobot[]): TemperaturaPromedioPorRobot[] => {
    const ROBOTS_VALIDOS = [1, 2];
    const tempsPorRobot: { [key: number]: { bateria: number[]; motor: number[] } } = {
      1: { bateria: [], motor: [] },
      2: { bateria: [], motor: [] }
    };

    registros
      .filter(reg => ROBOTS_VALIDOS.includes(reg.idRobot))
      .forEach(reg => {
        const valor = parseFloat(reg.valorCaracteristica) || 0;
        
        if (reg.idCaracteristica === CARACTERISTICAS.TEMPERATURA_BATERIA) {
          tempsPorRobot[reg.idRobot].bateria.push(valor);
        } else if (reg.idCaracteristica === CARACTERISTICAS.TEMPERATURA_MOTOR) {
          tempsPorRobot[reg.idRobot].motor.push(valor);
        }
      });

    return ROBOTS_VALIDOS.map(robotId => {
      const temps = tempsPorRobot[robotId];
      const promBateria = temps.bateria.length > 0 
        ? temps.bateria.reduce((a, b) => a + b, 0) / temps.bateria.length 
        : 0;
      const promMotor = temps.motor.length > 0 
        ? temps.motor.reduce((a, b) => a + b, 0) / temps.motor.length 
        : 0;

      return {
        nombre: `Robot ${robotId}`,
        tempBateria: Math.round(promBateria),
        tempMotor: Math.round(promMotor)
      };
    });
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const total = robotsStats.length;
  const avgBattery = robotsStats.length 
    ? Math.round(robotsStats.reduce((s, r) => s + r.nivelBateria, 0) / robotsStats.length) 
    : 0;
  
  const avgTemperatura = temperaturaPromedioPorRobot.length > 0
    ? Math.round(
        temperaturaPromedioPorRobot.reduce((s, r) => s + r.tempBateria, 0) / temperaturaPromedioPorRobot.length
      )
    : 0;
  const totalRegistros = registrosRaw.length;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Dashboard de Monitoreo de Robots</h2>
          <div style={styles.filterContainer}>
            <label htmlFor="fecha" style={{ fontSize: 14, fontWeight: 500, color: '#555' }}>
              Fecha:
            </label>
            <input
              type="date"
              id="fecha"
              value={fechaSeleccionada}
              onChange={handleFechaChange}
              style={styles.dateInput}
              max={getToday()}
            />
            <button type="button" onClick={() => navigate(-1)} style={styles.back}>Volver</button>
          </div>
        </div>

        <div style={{ marginBottom: 16, fontSize: 14, color: '#666' }}>
          Mostrando estadísticas del: <strong style={{ color: '#2a78d4' }}>{formatearFecha(fechaSeleccionada)}</strong>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: 20, color: '#2a78d4' }}>
            Cargando datos...
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: 20, color: '#d9534f', background: '#f8d7da', borderRadius: 8 }}>
            {error}
          </div>
        )}

        {!loading && !error && registrosRaw.length === 0 && (
          <div style={{ textAlign: 'center', padding: 20, color: '#856404', background: '#fff3cd', borderRadius: 8 }}>
            No hay registros para la fecha seleccionada.
          </div>
        )}
      </div>

      {!loading && registrosRaw.length > 0 && (
        <>
          <div style={styles.statsCard}>
            <div style={styles.statsRow}>
              <div style={styles.stat}>
                <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Total Registros del Dia</div>
                <div style={{ fontSize: 36, fontWeight: 700, color: '#000000ff' }}>{totalRegistros}</div>
              </div>

              <div style={styles.stat}>
                <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Bateria Media</div>
                <div style={{ fontSize: 36, fontWeight: 700, color: '#2a78d4' }}>{avgBattery}%</div>
              </div>

              <div style={styles.stat}>
                <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Temperatura Media de Bateria</div>
                <div style={{ fontSize: 36, fontWeight: 700, color: '#2a78d4' }}>{avgTemperatura}°C</div>
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={{ marginTop: 0, fontSize: 18 }}>Evolucion de Bateria Promedio</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={historialBateria}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="tiempo" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="bateria" stroke="#2a78d4" strokeWidth={2} name="Bateria %" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={styles.gridChartsRow}>
            <div style={styles.card}>
              <h3 style={{ marginTop: 0, fontSize: 18 }}>Tiempo Operativo Total por Robot</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={tiempoOperativoPorRobot}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="nombre" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="tiempoOperativo" fill="#27ae60" name="Tiempo (min)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={styles.card}>
              <h3 style={{ marginTop: 0, fontSize: 18 }}>Temperatura Promedio del Dia por Robot</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={temperaturaPromedioPorRobot}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="nombre" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="tempBateria" fill="#f39c12" name="Bateria °C" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="tempMotor" fill="#d9534f" name="Motor °C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StatsPage;