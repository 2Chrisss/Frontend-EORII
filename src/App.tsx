import { Routes, Route } from 'react-router-dom';
import RobotMonitor from './features/RobotMonitor/RobotMonitor';

function App() {
  return (
    <Routes>
      <Route path="/" element={<RobotMonitor />} />
      <Route path="*" element={<div>Not Found</div>} />
    </Routes>
  );
}

export default App;