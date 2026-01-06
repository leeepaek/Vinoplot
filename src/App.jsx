import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MapExplorer from './pages/MapExplorer';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MapExplorer />} />
      </Routes>
    </Router>
  );
}

export default App;
