import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import PlacementView from './components/PlacementView';
import SearchView from './components/SearchView';
import WasteManagement from './components/WasteManagement';
import Simulation from './components/Simulation';
import LogsView from './components/LogsView';
import ThreeDView from './components/ThreeDView';
import './App.css';
import { getCurrentDate } from './services/api';

function App() {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const fetchCurrentDate = async () => {
      try {
        const date = await getCurrentDate();
        setCurrentDate(date);
      } catch (error) {
        console.error('Error fetching current date:', error);
      }
    };

    fetchCurrentDate();
  }, []);

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>Cargo Stowage Management System</h1>
          <div className="current-date">Current Date: {currentDate}</div>
        </header>
        <nav className="app-nav">
          <ul>
            <li>
              <Link to="/">Dashboard</Link>
            </li>
            <li>
              <Link to="/placement">Placement</Link>
            </li>
            <li>
              <Link to="/search">Search & Retrieval</Link>
            </li>
            <li>
              <Link to="/waste">Waste Management</Link>
            </li>
            <li>
              <Link to="/simulation">Simulation</Link>
            </li>
            <li>
              <Link to="/logs">Logs</Link>
            </li>
            <li>
              <Link to="/3d-view">3D View</Link>
            </li>
          </ul>
        </nav>
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/placement" element={<PlacementView />} />
            <Route path="/search" element={<SearchView />} />
            <Route path="/waste" element={<WasteManagement />} />
            <Route path="/simulation" element={<Simulation />} />
            <Route path="/logs" element={<LogsView />} />
            <Route path="/3d-view" element={<ThreeDView />} />
          </Routes>
        </main>
        <footer className="app-footer">
          <p>National Space Hackathon 2025 - Cargo Stowage Management System</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
