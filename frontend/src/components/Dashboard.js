import React, { useState, useEffect } from 'react';
import { getItems, getContainers, identifyWaste } from '../services/api';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    totalContainers: 0,
    wasteItems: 0,
    highPriorityItems: 0,
    expiringItems: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch items, containers, and waste items
        const [itemsResponse, containersResponse, wasteResponse] = await Promise.all([
          getItems(),
          getContainers(),
          identifyWaste()
        ]);
        
        const items = itemsResponse.items || [];
        const containers = containersResponse.containers || [];
        const wasteItems = wasteResponse.wasteItems || [];
        
        // Calculate high priority items (priority > 80)
        const highPriorityItems = items.filter(item => item.priority > 80).length;
        
        // Calculate items expiring in the next 7 days
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        
        const expiringItems = items.filter(item => {
          if (!item.expiryDate || item.expiryDate === 'N/A') return false;
          const expiryDate = new Date(item.expiryDate);
          return expiryDate > today && expiryDate <= nextWeek;
        }).length;
        
        setStats({
          totalItems: items.length,
          totalContainers: containers.length,
          wasteItems: wasteItems.length,
          highPriorityItems,
          expiringItems
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      
      <div className="grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Inventory Overview</h3>
          </div>
          <div className="stat-grid">
            <div className="stat-item">
              <div className="stat-value">{stats.totalItems}</div>
              <div className="stat-label">Total Items</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
