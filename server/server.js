const http = require('http');
const { Server } = require('socket.io');

const PORT = 3000;

const server = http.createServer();
const io = new Server(server, { cors: { origin: '*' } });

let robots = [
  { id: 'R1', x: 100, y: 100, temperature: 22, batteryStatus: 90, carryStatus: 'not-carrying', status: 'idle' },
  { id: 'R2', x: 300, y: 200, temperature: 23, batteryStatus: 60, carryStatus: 'carrying', status: 'moving' },
];

let stations = [
  { id: 'S1', x: 920, y: 50, temperature: 22, status: 'not-occupied' },
  { id: 'S2', x: 50, y: 550, temperature: 24, status: 'occupied' },
];

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function randomDelta() { return Math.floor(Math.random() * 21) - 10; } 

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.emit('initialRobots', robots);
  socket.emit('initialChargingStations', stations);

  socket.on('requestChargingStations', () => {
    socket.emit('initialChargingStations', stations);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

setInterval(() => {
  robots = robots.map(r => {
    const nx = clamp(r.x + randomDelta(), 0, 800);
    const ny = clamp(r.y + randomDelta(), 0, 600);
    const temperature = clamp(r.temperature + (Math.random() > 0.5 ? 1 : -1), 20, 30);
    const batteryStatus = clamp(r.batteryStatus - Math.floor(Math.random() * 3), 0, 100);
    const carryStatus = Math.random() > 0.9 ? (r.carryStatus === 'carrying' ? 'not-carrying' : 'carrying') : r.carryStatus;
    return { ...r, x: nx, y: ny, temperature, batteryStatus, carryStatus };
  });

  robots.forEach(r => io.emit('robotUpdate', r));


}, 1000);

setInterval(() => {
  const idx = Math.floor(Math.random() * stations.length);
  stations[idx] = {
    ...stations[idx],
    temperature: stations[idx].temperature + (Math.random() > 0.5 ? 1 : -1),
    status: Math.random() > 0.7 ? (stations[idx].status === 'occupied' ? 'not-occupied' : 'occupied') : stations[idx].status,
  };
  io.emit('chargingStationUpdate', stations[idx]);
}, 5000);

server.listen(PORT, () => {
  console.log(`Mock middleware escuchando en http://localhost:${PORT}`);
});