import React from 'react';
import { useNavigate } from 'react-router-dom';

const styles = {
  page: { padding: 20, fontFamily: 'Inter, Roboto, system-ui, -apple-system, "Segoe UI", Arial', background: '#f7fafc', minHeight: '100vh' } as React.CSSProperties,
  card: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 8px 24px rgba(0,0,0,0.06)', maxWidth: 880, margin: '20px auto' } as React.CSSProperties,
  row: { display: 'flex', gap: 12, alignItems: 'center' } as React.CSSProperties,
  stat: { flex: 1, padding: 12, borderRadius: 8, background: 'linear-gradient(180deg,#fff,#fbfdff)', textAlign: 'center' } as React.CSSProperties,
  back: { padding: '8px 12px', borderRadius: 8, border: 'none', background: '#2a78d4', color: '#fff', cursor: 'pointer' } as React.CSSProperties,
};

const StatsPage: React.FC = () => {
  const navigate = useNavigate();
  const { robots } = useRobotMonitorData();

  const total = robots.length;
  const charging = robots.filter(r => r.Estado_Carga === true).length;
  const avgBattery = robots.length ? Math.round(robots.reduce((s, r) => s + Number(r.Nivel_Bateria), 0) / robots.length) : 0;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Estadísticas rápidas</h2>
          <div>
            <button type="button" onClick={() => navigate(-1)} style={styles.back}>Volver</button>
          </div>
        </div>

        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          <div style={styles.stat}>
            <div style={{ fontSize: 12, color: '#666' }}>Robots</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{total}</div>
          </div>

          <div style={styles.stat}>
            <div style={{ fontSize: 12, color: '#666' }}>Cargando</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{charging}</div>
          </div>

          <div style={styles.stat}>
            <div style={{ fontSize: 12, color: '#666' }}>Batería media</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{avgBattery}%</div>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <h4 style={{ margin: '8px 0' }}>Estaciones de carga</h4>
          <div style={{ display: 'grid', gap: 8 }}>
            {chargingStations.map(s => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 10, borderRadius: 8, background: '#fafafa', border: '1px solid #eee' }}>
                <div>{s.id}</div>
                <div style={{ color: s.status === 'occupied' ? '#d9534f' : '#2a9d4f' }}>{s.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;