import React, { useState } from 'react';
import { getPlacementRecommendations } from '../services/api';

const PlacementView = () => {
  const [itemData, setItemData] = useState({
    itemId: '',
    name: '',
    type: 'food',
    width: 10,
    height: 10,
    depth: 10,
    weight: 1,
    priority: 50,
    usesRemaining: 1,
    expiryDate: ''
  });
  
  const [recommendations, setRecommendations] = useState([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setItemData({
      ...itemData,
      [name]: name === 'priority' || name === 'width' || name === 'height' || name === 'depth' || name === 'weight' || name === 'usesRemaining' 
        ? Number(value) 
        : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setRecommendations([]);
    setSelectedRecommendation(null);
    
    try {
      const response = await getPlacementRecommendations(itemData);
      
      if (response.success) {
        setRecommendations(response.recommendations || []);
        if (response.recommendations.length === 0) {
          setMessage('No suitable placement locations found.');
          setMessageType('warning');
        } else {
          setMessage('Recommendations generated successfully!');
          setMessageType('success');
        }
      } else {
        setMessage('Failed to generate recommendations: ' + (response.message || 'Unknown error'));
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRecommendationSelect = (recommendation) => {
    setSelectedRecommendation(recommendation);
  };
  
  const handleConfirmPlacement = async () => {
    if (!selectedRecommendation) return;
    
    setLoading(true);
    setMessage('');
    
    try {
      // In a real application, this would call an API to confirm the placement
      // For this example, we'll just simulate a successful placement
      setTimeout(() => {
        setMessage('Item placed successfully!');
        setMessageType('success');
        setLoading(false);
        
        // Reset form for next item
        setItemData({
          itemId: '',
          name: '',
          type: 'food',
          width: 10,
          height: 10,
          depth: 10,
          weight: 1,
          priority: 50,
          usesRemaining: 1,
          expiryDate: ''
        });
        setRecommendations([]);
        setSelectedRecommendation(null);
      }, 1000);
    } catch (error) {
      setMessage('Error: ' + error.message);
      setMessageType('error');
      setLoading(false);
    }
  };
  
  return (
    <div className="placement-view starry-background">
      <h2>New Item Placement</h2>
      
      {message && (
        <div className={`alert alert-${messageType}`}>
          {message}
        </div>
      )}
      
      <div className="space-card">
        <div className="card-header">
          <h3 className="card-title">Item Details</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="itemId">Item ID</label>
              <input
                type="text"
                id="itemId"
                name="itemId"
                value={itemData.itemId}
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
                value={itemData.name}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Type</label>
              <select
                id="type"
                name="type"
                value={itemData.type}
                onChange={handleInputChange}
              >
                <option value="food">Food</option>
                <option value="equipment">Equipment</option>
                <option value="medical">Medical</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <input
                type="number"
                id="priority"
                name="priority"
                value={itemData.priority}
                onChange={handleInputChange}
                min="1"
                max="100"
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
                value={itemData.width}
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
                value={itemData.height}
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
                value={itemData.depth}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="weight">Weight (kg)</label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={itemData.weight}
                onChange={handleInputChange}
                min="0.1"
                step="0.1"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="usesRemaining">Uses Remaining</label>
              <input
                type="number"
                id="usesRemaining"
                name="usesRemaining"
                value={itemData.usesRemaining}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="expiryDate">Expiry Date</label>
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                value={itemData.expiryDate}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <button type="submit" className="cosmic-button" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Recommendations'}
          </button>
        </form>
      </div>
      
      {recommendations.length > 0 && (
        <div className="space-card">
          <div className="card-header">
            <h3 className="card-title">Placement Recommendations</h3>
          </div>
          <div className="recommendations-list">
            {recommendations.map((recommendation, index) => (
              <div 
                key={index} 
                className={`recommendation-item ${selectedRecommendation === recommendation ? 'selected' : ''}`}
                onClick={() => handleRecommendationSelect(recommendation)}
              >
                <p>Container: {recommendation.containerId}</p>
                <p>Position: ({recommendation.position.x}, {recommendation.position.y}, {recommendation.position.z})</p>
                <p>Score: {recommendation.score}</p>
              </div>
            ))}
          </div>
          {selectedRecommendation && (
            <button 
              className="cosmic-button" 
              onClick={handleConfirmPlacement}
              disabled={loading}
            >
              {loading ? 'Confirming...' : 'Confirm Placement'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PlacementView;
