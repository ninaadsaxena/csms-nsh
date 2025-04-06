import React, { useState, useEffect } from 'react';
import { getPlacementRecommendations, getContainers } from '../services/api';

const PlacementView = () => {
  const [containers, setContainers] = useState([]);
  const [newItem, setNewItem] = useState({
    itemId: '',
    name: '',
    width: 0,
    depth: 0,
    height: 0,
    mass: 0,
    priority: 50,
    expiryDate: '',
    usageLimit: 1,
    preferredZone: ''
  });
  const [placements, setPlacements] = useState([]);
  const [rearrangements, setRearrangements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    const fetchContainers = async () => {
      try {
        const response = await getContainers();
        setContainers(response.containers || []);
      } catch (error) {
        setMessage('Failed to load containers: ' + error.message);
        setMessageType('error');
      }
    };

    fetchContainers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem({
      ...newItem,
      [name]: name === 'width' || name === 'depth' || name === 'height' || name === 'mass' || name === 'priority' || name === 'usageLimit' 
        ? Number(value) 
        : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const response = await getPlacementRecommendations({
        items: [newItem],
        containers: []
      });
      
      if (response.success) {
        setPlacements(response.placements || []);
        setRearrangements(response.rearrangements || []);
        setMessage('Placement recommendations generated successfully!');
        setMessageType('success');
      } else {
        setMessage('Failed to generate placement recommendations.');
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
    <div className="placement-view">
      <h2>Placement Recommendations</h2>
      
      {message && (
        <div className={`alert alert-${messageType}`}>
          {message}
        </div>
      )}
      
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Add New Item</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="itemId">Item ID</label>
              <input
                type="text"
                id="itemId"
                name="itemId"
                value={newItem.itemId}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={newItem.name}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="width">Width (cm)</label>
              <input
                type="number"
                id="width"
                name="width"
                value={newItem.width}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="depth">Depth (cm)</label>
              <input
                type="number"
                id="depth"
                name="depth"
                value={newItem.depth}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="height">Height (cm)</label>
              <input
                type="number"
                id="height"
                name="height"
                value={newItem.height}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="mass">Mass (kg)</label>
              <input
                type="number"
                id="mass"
                name="mass"
                value={newItem.mass}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="priority">Priority (1-100)</label>
              <input
                type="number"
                id="priority"
                name="priority"
                value={newItem.priority}
                onChange={handleInputChange}
                min="1"
                max="100"
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="expiryDate">Expiry Date</label>
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                value={newItem.expiryDate}
                onChange={handleInputChange}
              />
              <small>Leave empty if not applicable</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="usageLimit">Usage Limit</label>
              <input
                type="number"
                id="usageLimit"
                name="usageLimit"
                value={newItem.usageLimit}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="preferredZone">Preferred Zone</label>
            <select
              id="preferredZone"
              name="preferredZone"
              value={newItem.preferredZone}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a zone</option>
              {Array.from(new Set(containers.map(container => container.zone))).map(zone => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>
          </div>
          
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Processing...' : 'Generate Placement Recommendations'}
          </button>
        </form>
      </div>
      
      {placements.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Placement Recommendations</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item ID</th>
                <th>Container ID</th>
                <th>Position</th>
              </tr>
            </thead>
            <tbody>
              {placements.map((placement, index) => (
                <tr key={index}>
                  <td>{placement.itemId}</td>
                  <td>{placement.containerId}</td>
                  <td>
                    Start: ({placement.position.startCoordinates.width}, 
                    {placement.position.startCoordinates.depth}, 
                    {placement.position.startCoordinates.height}) <br />
                    End: ({placement.position.endCoordinates.width}, 
                    {placement.position.endCoordinates.depth}, 
                    {placement.position.endCoordinates.height})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {rearrangements.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Rearrangement Plan</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>Step</th>
                <th>Action</th>
                <th>Item ID</th>
                <th>From Container</th>
                <th>To Container</th>
              </tr>
            </thead>
            <tbody>
              {rearrangements.map((step, index) => (
                <tr key={index}>
                  <td>{step.step}</td>
                  <td>{step.action}</td>
                  <td>{step.itemId}</td>
                  <td>{step.fromContainer}</td>
                  <td>{step.toContainer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PlacementView;
