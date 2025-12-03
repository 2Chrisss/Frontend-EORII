import { Routes, Route } from 'react-router-dom';
import RobotMonitor from './features/RobotMonitor/RobotMonitor';
import StatsPage from './features/StatsMonitor/StatsPage';
function App() {
  return (
    <Routes>
      <Route path="/" element={<RobotMonitor />} />
      <Route path="/stats" element={<StatsPage />} />
      <Route path="*" element={<div>Not Found</div>} />
    </Routes>
  );
}

export default App;