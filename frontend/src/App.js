import React, { useState, useEffect, useCallback } from 'react';
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

  const addHoverEffects = useCallback(() => {
    const buttons = document.querySelectorAll('.action-button, .cosmic-button');
    
    buttons.forEach(button => {
      const handleMouseEnter = () => {
        button.style.transform = 'translateY(-3px)';
        button.style.boxShadow = '0 10px 20px rgba(91, 33, 182, 0.3)';
      };
      
      const handleMouseLeave = () => {
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      };

      button.addEventListener('mouseenter', handleMouseEnter);
      button.addEventListener('mouseleave', handleMouseLeave);

      // Store the event listeners for cleanup
      button.hoverListeners = { enter: handleMouseEnter, leave: handleMouseLeave };
    });
  }, []);

  useEffect(() => {
    addHoverEffects();
    
    const fetchCurrentDate = async () => {
      try {
        const date = await getCurrentDate();
        setCurrentDate(date);
      } catch (error) {
        console.error('Error fetching current date:', error);
      }
    };

    fetchCurrentDate();

    // Cleanup function
    return () => {
      const buttons = document.querySelectorAll('.action-button, .cosmic-button');
      buttons.forEach(button => {
        if (button.hoverListeners) {
          button.removeEventListener('mouseenter', button.hoverListeners.enter);
          button.removeEventListener('mouseleave', button.hoverListeners.leave);
        }
      });
    };
  }, [addHoverEffects]);

  return (
    <Router>
      <div className="app starry-background">
        <header className="app-header space-card">
          <h1>Cargo Stowage Management System</h1>
          <div className="current-date">Current Date: {currentDate}</div>
        </header>
        <nav className="app-nav space-card">
          <ul>
            <li><Link to="/" className="cosmic-button">Dashboard</Link></li>
            <li><Link to="/placement" className="cosmic-button">Placement</Link></li>
            <li><Link to="/search" className="cosmic-button">Search & Retrieval</Link></li>
            <li><Link to="/waste" className="cosmic-button">Waste Management</Link></li>
            <li><Link to="/simulation" className="cosmic-button">Simulation</Link></li>
            <li><Link to="/logs" className="cosmic-button">Logs</Link></li>
            <li><Link to="/3d-view" className="cosmic-button">3D View</Link></li>
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
        <footer className="app-footer space-card">
          <p>ISS Cargo Stowage Management System - Built by Team Schrödingers Code</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
