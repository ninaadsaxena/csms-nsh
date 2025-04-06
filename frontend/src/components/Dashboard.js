import React, { useState, useEffect, useCallback } from 'react';
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

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch items, containers, and waste items
      const [itemsResponse, containersResponse, wasteResponse] = await Promise.all([
        getItems(),
        getContainers(),
        identifyWaste()
      ]);
      
      // Check for API errors
      if (!itemsResponse.success || !containersResponse.success || !wasteResponse.success) {
        throw new Error('One or more API requests failed');
      }
      
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
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return <div className="space-loader"></div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  return (
    <div className="dashboard starry-background">
      <h2>Dashboard</h2>
      
      <div className="grid">
        <div className="space-card">
          <div className="card-header">
            <h3 className="card-title">Inventory Overview</h3>
          </div>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.totalItems}</div>
              <div className="stat-label">Total Items</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.totalContainers}</div>
              <div className="stat-label">Total Containers</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.wasteItems}</div>
              <div className="stat-label">Waste Items</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.highPriorityItems}</div>
              <div className="stat-label">High Priority Items</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.expiringItems}</div>
              <div className="stat-label">Expiring Soon</div>
            </div>
          </div>
        </div>
        
        <div className="space-card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>
          <div className="action-buttons">
            <Link to="/placement" className="cosmic-button">New Placement</Link>
            <Link to="/search" className="cosmic-button">Search & Retrieve</Link>
            <Link to="/waste" className="cosmic-button">Waste Management</Link>
            <Link to="/logs" className="cosmic-button">System Logs</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
