import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const styles = {
  page: { padding: 20, fontFamily: 'Inter, Roboto, system-ui, -apple-system, "Segoe UI", Arial', background: '#f7fafc', minHeight: '100vh' } as React.CSSProperties,
  card: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 8px 24px rgba(0,0,0,0.06)', marginBottom: 20 } as React.CSSProperties,
  row: { display: 'flex', gap: 12, alignItems: 'center' } as React.CSSProperties,
  stat: { flex: 1, padding: 12, borderRadius: 8, background: 'linear-gradient(180deg,#fff,#fbfdff)', textAlign: 'center', border: '1px solid #e2e8f0' } as React.CSSProperties,
  back: { padding: '8px 16px', borderRadius: 8, border: 'none', background: '#2a78d4', color: '#fff', cursor: 'pointer', fontWeight: 600 } as React.CSSProperties,
  gridCharts: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 } as React.CSSProperties,
};

const COLORS = ['#2a78d4', '#2a9d4f', '#f39c12', '#d9534f', '#9b59b6'];

interface RobotData {
  id: number;
  Nivel_Bateria: number;
  Estado_Carga: boolean;
  Temperatura: number;
  timestamp: string;
}

const StatsPage: React.FC = () => {
  const navigate = useNavigate();
  const [robots, setRobots] = useState<RobotData[]>([]);
  const [historialBateria, setHistorialBateria] = useState<any[]>([]);

  // Cargar datos desde tu API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://100.31.143.7:3000/api/obtenerTodo');
        const data = await response.json();
        
        if (data.success) {
          // Procesar datos según tu estructura
          setRobots(data.datos);
          
          // Generar historial para gráfica (últimos 10 registros por robot)
          const historial = procesarHistorial(data.datos);
          setHistorialBateria(historial);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Actualiza cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  // Función para procesar historial de batería
  const procesarHistorial = (datos: any[]) => {
    // Agrupar por timestamp y calcular promedio de batería
    const agrupado: any = {};
    datos.forEach(d => {
      if (d.nombreCaracteristica === 'Nivel_Bateria') {
        const fecha = new Date(d.fechaRegistro).toLocaleTimeString();
        if (!agrupado[fecha]) {
          agrupado[fecha] = { tiempo: fecha, totalBateria: 0, count: 0 };
        }
        agrupado[fecha].totalBateria += Number(d.valorCaracteristica);
        agrupado[fecha].count++;
      }
    });

    return Object.values(agrupado).map((g: any) => ({
      tiempo: g.tiempo,
      bateria: Math.round(g.totalBateria / g.count)
    })).slice(-10); // Últimos 10 puntos
  };

  // Calcular estadísticas
  const total = robots.length;
  const charging = robots.filter(r => r.Estado_Carga === true).length;
  const avgBattery = robots.length 
    ? Math.round(robots.reduce((s, r) => s + Number(r.Nivel_Bateria), 0) / robots.length) 
    : 0;

  // Datos para gráfico de barras (batería por robot)
  const dataBateria = robots.map(r => ({
    nombre: `Robot ${r.id}`,
    bateria: Number(r.Nivel_Bateria)
  }));

  // Datos para gráfico de pie (estado de carga)
  const dataPie = [
    { name: 'Cargando', value: charging },
    { name: 'No cargando', value: total - charging }
  ];

  // Datos para gráfico de temperatura
  const dataTemperatura = robots.map(r => ({
    nombre: `Robot ${r.id}`,
    temperatura: Number(r.Temperatura)
  }));

  return (
    <div style={styles.page}>
      {/* Header con estadísticas rápidas */}
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>📊 Dashboard de Robots</h2>
          <button type="button" onClick={() => navigate(-1)} style={styles.back}>← Volver</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          <div style={styles.stat}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Total Robots</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#2a78d4' }}>🤖 {total}</div>
          </div>

          <div style={styles.stat}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Cargando</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#2a9d4f' }}>⚡ {charging}</div>
          </div>

          <div style={styles.stat}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Batería Media</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#f39c12' }}>🔋 {avgBattery}%</div>
          </div>

          <div style={styles.stat}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Última actualización</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#666' }}>{new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      {/* Gráficos en grid responsivo */}
      <div style={styles.gridCharts}>
        
        {/* Gráfico de línea: Evolución de batería */}
        <div style={styles.card}>
          <h3 style={{ marginTop: 0, fontSize: 18 }}>📈 Evolución de Batería Promedio</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={historialBateria}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="tiempo" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="bateria" stroke="#2a78d4" strokeWidth={2} name="Batería %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de barras: Nivel de batería individual */}
        <div style={styles.card}>
          <h3 style={{ marginTop: 0, fontSize: 18 }}>🔋 Nivel de Batería por Robot</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dataBateria}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="nombre" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="bateria" fill="#2a9d4f" name="Batería %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de pie: Estado de carga */}
        <div style={styles.card}>
          <h3 style={{ marginTop: 0, fontSize: 18 }}>⚡ Estado de Carga</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={dataPie}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry:any) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {dataPie.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de barras: Temperatura */}
        <div style={styles.card}>
          <h3 style={{ marginTop: 0, fontSize: 18 }}>🌡️ Temperatura por Robot</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dataTemperatura}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="nombre" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="temperatura" fill="#f39c12" name="Temperatura °C" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default StatsPage;