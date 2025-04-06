import React, { useState, useEffect, useCallback } from 'react';
import { identifyWaste, getWasteReturnPlan, completeUndocking } from '../services/api';

const WasteManagement = () => {
  const [wasteItems, setWasteItems] = useState([]);
  const [returnPlan, setReturnPlan] = useState(null);
  const [undockingData, setUndockingData] = useState({
    undockingContainerId: '',
    undockingDate: new Date().toISOString().split('T')[0],
    maxWeight: 100
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const fetchWasteItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await identifyWaste();
      if (response.success) {
        setWasteItems(response.wasteItems || []);
        if (response.wasteItems.length === 0) {
          setMessage('No waste items found.');
          setMessageType('info');
        }
      } else {
        setMessage('Failed to fetch waste items.');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWasteItems();
  }, [fetchWasteItems]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUndockingData({
      ...undockingData,
      [name]: value
    });
  };

  const handleCreateReturnPlan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const response = await getWasteReturnPlan(undockingData);
      
      if (response.success) {
        setReturnPlan(response);
        setMessage('Return plan created successfully!');
        setMessageType('success');
      } else {
        setMessage('Failed to create return plan: ' + (response.message || 'Unknown error'));
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteUndocking = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await completeUndocking({
        undockingContainerId: undockingData.undockingContainerId,
        timestamp: new Date().toISOString()
      });
      
      if (response.success) {
        setMessage(`Undocking completed successfully! ${response.itemsRemoved} items removed.`);
        setMessageType('success');
        setReturnPlan(null);
        // Refresh waste items list
        fetchWasteItems();
      } else {
        setMessage('Failed to complete undocking: ' + (response.message || 'Unknown error'));
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="waste-management">
      <h2>Waste Management</h2>
      
      {message && (
        <div className={`alert alert-${messageType}`}>
          {message}
        </div>
      )}
      
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Waste Items</h3>
          <button 
            className="btn btn-secondary" 
            onClick={fetchWasteItems} 
            disabled={loading}
          >
            Refresh
          </button>
        </div>
        
        {wasteItems.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Item ID</th>
                <th>Name</th>
                <th>Reason</th>
                <th>Container</th>
                <th>Position</th>
              </tr>
            </thead>
            <tbody>
              {wasteItems.map((item, index) => (
                <tr key={index}>
                  <td>{item.itemId}</td>
                  <td>{item.name}</td>
                  <td>{item.reason}</td>
                  <td>{item.containerId}</td>
                  <td>
                    {item.position ? (
                      <>
                        Start: ({item.position.startCoordinates.width}, 
                        {item.position.startCoordinates.depth}, 
                        {item.position.startCoordinates.height}) <br />
                        End: ({item.position.endCoordinates.width}, 
                        {item.position.endCoordinates.depth}, 
                        {item.position.endCoordinates.height})
                      </>
                    ) : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No waste items found.</p>
        )}
      </div>
      
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Create Return Plan</h3>
        </div>
        <form onSubmit={handleCreateReturnPlan}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="undockingContainerId">Undocking Container ID</label>
              <input
                type="text"
                id="undockingContainerId"
                name="undockingContainerId"
                value={undockingData.undockingContainerId}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="undockingDate">Undocking Date</label>
              <input
                type="date"
                id="undockingDate"
                name="undockingDate"
                value={undockingData.undockingDate}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="maxWeight">Max Weight (kg)</label>
              <input
                type="number"
                id="maxWeight"
                name="maxWeight"
                value={undockingData.maxWeight}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>
          </div>
          
          <button type="submit" className="btn" disabled={loading || wasteItems.length === 0}>
            {loading ? 'Processing...' : 'Create Return Plan'}
          </button>
        </form>
      </div>
      
      {returnPlan && (
        <>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Return Plan</h3>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Step</th>
                  <th>Item ID</th>
                  <th>Item Name</th>
                  <th>From Container</th>
                  <th>To Container</th>
                </tr>
              </thead>
              <tbody>
                {returnPlan.returnPlan.map((step, index) => (
                  <tr key={index}>
                    <td>{step.step}</td>
                    <td>{step.itemId}</td>
                    <td>{step.itemName}</td>
                    <td>{step.fromContainer}</td>
                    <td>{step.toContainer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Return Manifest</h3>
            </div>
            <div className="manifest-details">
              <p><strong>Undocking Container:</strong> {returnPlan.returnManifest.undockingContainerId}</p>
              <p><strong>Undocking Date:</strong> {returnPlan.returnManifest.undockingDate}</p>
              <p><strong>Total Items:</strong> {returnPlan.returnManifest.returnItems.length}</p>
              <p><strong>Total Volume:</strong> {returnPlan.returnManifest.totalVolume} cm³</p>
              <p><strong>Total Weight:</strong> {returnPlan.returnManifest.totalWeight} kg</p>
              
              <h4>Items</h4>
              <table>
                <thead>
                  <tr>
                    <th>Item ID</th>
                    <th>Name</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {returnPlan.returnManifest.returnItems.map((item, index) => (
                    <tr key={index}>
                      <td>{item.itemId}</td>
                      <td>{item.name}</td>
                      <td>{item.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <button 
                className="btn btn-success" 
                onClick={handleCompleteUndocking} 
                disabled={loading}
              >
                Complete Undocking
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WasteManagement;
