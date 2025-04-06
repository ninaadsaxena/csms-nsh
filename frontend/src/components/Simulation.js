import React, { useState, useEffect, useCallback } from 'react';
import { simulateDay, getItems } from '../services/api';

const Simulation = () => {
  const [currentDate, setCurrentDate] = useState('');
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [daysToSimulate, setDaysToSimulate] = useState(1);
  const [simulationResults, setSimulationResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const fetchItems = useCallback(async () => {
    try {
      const response = await getItems();
      if (response.success) {
        setItems(response.items || []);
        // Get current date from the first API call
        if (response.currentDate) {
          setCurrentDate(response.currentDate);
        }
      }
    } catch (error) {
      setMessage('Error fetching items: ' + error.message);
      setMessageType('error');
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleItemSelection = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleSimulateDay = async () => {
    setLoading(true);
    setMessage('');
    setSimulationResults(null);
    
    try {
      const response = await simulateDay({
        itemsUsed: selectedItems
      });
      
      if (response.success) {
        setCurrentDate(response.newDate);
        setSimulationResults(response.changes);
        setMessage('Day simulated successfully!');
        setMessageType('success');
        // Clear selected items after simulation
        setSelectedItems([]);
        // Refresh items list
        fetchItems();
      } else {
        setMessage('Simulation failed: ' + (response.message || 'Unknown error'));
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateDays = async () => {
    setLoading(true);
    setMessage('');
    setSimulationResults(null);
    
    try {
      let finalResults = {
        itemsUsed: [],
        itemsExpired: [],
        itemsOutOfUses: []
      };
      let latestDate = currentDate;
      
      // Simulate multiple days
      for (let i = 0; i < daysToSimulate; i++) {
        const response = await simulateDay({
          itemsUsed: selectedItems
        });
        
        if (response.success) {
          latestDate = response.newDate;
          
          // Accumulate results
          finalResults.itemsUsed = [...finalResults.itemsUsed, ...response.changes.itemsUsed];
          finalResults.itemsExpired = [...finalResults.itemsExpired, ...response.changes.itemsExpired];
          finalResults.itemsOutOfUses = [...finalResults.itemsOutOfUses, ...response.changes.itemsOutOfUses];
        } else {
          throw new Error(response.message || 'Unknown error');
        }
      }
      
      setCurrentDate(latestDate);
      setSimulationResults(finalResults);
      setMessage(`${daysToSimulate} days simulated successfully!`);
      setMessageType('success');
      // Clear selected items after simulation
      setSelectedItems([]);
      // Refresh items list
      fetchItems();
    } catch (error) {
      setMessage('Error: ' + error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="simulation">
      <h2>Time Simulation</h2>
      
      <div className="current-date-display">
        <h3>Current Date: {currentDate}</h3>
      </div>
      
      {message && (
        <div className={`alert alert-${messageType}`}>
          {message}
        </div>
      )}
      
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Select Items to Use</h3>
        </div>
        <div className="items-grid">
          {items.map(item => (
            <div 
              key={item.itemId} 
              className={`item-card ${selectedItems.includes(item.itemId) ? 'selected' : ''}`}
              onClick={() => handleItemSelection(item.itemId)}
            >
              <h4>{item.name}</h4>
              <p>ID: {item.itemId}</p>
              <p>Uses Remaining: {item.usesRemaining}</p>
              {item.expiryDate && item.expiryDate !== 'N/A' && (
                <p>Expires: {new Date(item.expiryDate).toLocaleDateString()}</p>
              )}
            </div>
          ))}
        </div>
        
        <div className="simulation-controls">
          <button 
            className="btn" 
            onClick={handleSimulateDay} 
            disabled={loading}
          >
            Simulate 1 Day
          </button>
          
          <div className="multi-day-simulation">
            <input 
              type="number" 
              min="1" 
              max="30" 
              value={daysToSimulate} 
              onChange={(e) => setDaysToSimulate(parseInt(e.target.value))}
            />
            <button 
              className="btn btn-secondary" 
              onClick={handleSimulateDays} 
              disabled={loading}
            >
              Simulate Multiple Days
            </button>
          </div>
        </div>
      </div>
      
      {simulationResults && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Simulation Results</h3>
          </div>
          
          <div className="simulation-results">
            <h4>Items Used</h4>
            {simulationResults.itemsUsed.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Item ID</th>
                    <th>Name</th>
                    <th>Uses Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {simulationResults.itemsUsed.map((item, index) => (
                    <tr key={index}>
                      <td>{item.itemId}</td>
                      <td>{item.name}</td>
                      <td>{item.usesRemaining}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No items used.</p>
            )}
            
            <h4>Items Expired</h4>
            {simulationResults.itemsExpired.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Item ID</th>
                    <th>Name</th>
                    <th>Expiry Date</th>
                  </tr>
                </thead>
                <tbody>
                  {simulationResults.itemsExpired.map((item, index) => (
                    <tr key={index}>
                      <td>{item.itemId}</td>
                      <td>{item.name}</td>
                      <td>{item.expiryDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No items expired.</p>
            )}
            
            <h4>Items Out of Uses</h4>
            {simulationResults.itemsOutOfUses.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Item ID</th>
                    <th>Name</th>
                  </tr>
                </thead>
                <tbody>
                  {simulationResults.itemsOutOfUses.map((item, index) => (
                    <tr key={index}>
                      <td>{item.itemId}</td>
                      <td>{item.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No items out of uses.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Simulation;
