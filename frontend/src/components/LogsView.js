import React, { useState, useEffect, useCallback } from 'react';
import { getLogs } from '../services/api';

const LogsView = () => {
  const [logs, setLogs] = useState([]);
  const [filterParams, setFilterParams] = useState({
    startDate: '',
    endDate: '',
    itemId: '',
    userId: '',
    actionType: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Use useCallback to memoize the fetchLogs function
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getLogs(filterParams);
      if (response.success) {
        setLogs(response.logs);
      } else {
        setMessage('Failed to fetch logs');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  }, [filterParams]); // Add filterParams as a dependency

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]); // Add fetchLogs as a dependency

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterParams({
      ...filterParams,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  return (
    <div className="logs-view">
      <h2>System Logs</h2>
      
      {message && (
        <div className={`alert alert-${messageType}`}>
          {message}
        </div>
      )}
      
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Filter Logs</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={filterParams.startDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={filterParams.endDate}
                onChange={handleFilterChange}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="itemId">Item ID</label>
              <input
                type="text"
                id="itemId"
                name="itemId"
                value={filterParams.itemId}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="userId">User ID</label>
              <input
                type="text"
                id="userId"
                name="userId"
                value={filterParams.userId}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="actionType">Action Type</label>
              <select
                id="actionType"
                name="actionType"
                value={filterParams.actionType}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                <option value="placement">Placement</option>
                <option value="retrieval">Retrieval</option>
                <option value="rearrangement">Rearrangement</option>
                <option value="disposal">Disposal</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Loading...' : 'Apply Filters'}
          </button>
        </form>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Log Entries</h3>
        </div>
        {logs.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action Type</th>
                <th>User ID</th>
                <th>Item ID</th>
                <th>Container ID</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={index}>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                  <td>{log.actionType}</td>
                  <td>{log.userId}</td>
                  <td>{log.itemId || 'N/A'}</td>
                  <td>{log.containerId || 'N/A'}</td>
                  <td>{JSON.stringify(log.details)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No logs found.</p>
        )}
      </div>
    </div>
  );
};

export default LogsView;
