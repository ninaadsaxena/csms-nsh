import React, { useState } from 'react';
import { searchItem, retrieveItem, placeItem } from '../services/api';

const SearchView = () => {
  const [searchParams, setSearchParams] = useState({
    itemId: '',
    itemName: '',
    userId: 'astronaut1'
  });
  const [searchResult, setSearchResult] = useState(null);
  const [retrievalSteps, setRetrievalSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [placementData, setPlacementData] = useState({
    containerId: '',
    position: {
      startCoordinates: { width: 0, depth: 0, height: 0 },
      endCoordinates: { width: 0, depth: 0, height: 0 }
    }
  });
  const [showPlacementForm, setShowPlacementForm] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({
      ...searchParams,
      [name]: value
    });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setSearchResult(null);
    setRetrievalSteps([]);
    
    try {
      // Ensure at least one search parameter is provided
      if (!searchParams.itemId && !searchParams.itemName) {
        setMessage('Please provide either Item ID or Item Name');
        setMessageType('error');
        setLoading(false);
        return;
      }
      
      const response = await searchItem(searchParams);
      
      if (response.success) {
        if (response.found) {
          setSearchResult(response.item);
          setRetrievalSteps(response.retrievalSteps || []);
          setMessage('Item found!');
          setMessageType('success');
        } else {
          setMessage('Item not found.');
          setMessageType('warning');
        }
      } else {
        setMessage('Search failed: ' + (response.message || 'Unknown error'));
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleRetrieve = async () => {
    if (!searchResult) return;
    
    setLoading(true);
    setMessage('');
    
    try {
      const response = await retrieveItem({
        itemId: searchResult.itemId,
        userId: searchParams.userId,
        timestamp: new Date().toISOString()
      });
      
      if (response.success) {
        setMessage('Item retrieved successfully!');
        setMessageType('success');
        setShowPlacementForm(true);
      } else {
        setMessage('Retrieval failed: ' + (response.message || 'Unknown error'));
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handlePlacementChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'containerId') {
      setPlacementData({
        ...placementData,
        containerId: value
      });
    } else if (name.startsWith('start') || name.startsWith('end')) {
      const [prefix, coord] = name.split('_');
      setPlacementData({
        ...placementData,
        position: {
          ...placementData.position,
          [`${prefix}Coordinates`]: {
            ...placementData.position[`${prefix}Coordinates`],
            [coord]: Number(value)
          }
        }
      });
    }
  };

  const handlePlace = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const response = await placeItem({
        itemId: searchResult.itemId,
        userId: searchParams.userId,
        timestamp: new Date().toISOString(),
        containerId: placementData.containerId,
        position: placementData.position
      });
      
      if (response.success) {
        setMessage('Item placed successfully!');
        setMessageType('success');
        setShowPlacementForm(false);
        // Clear search result to start fresh
        setSearchResult(null);
        setRetrievalSteps([]);
      } else {
        setMessage('Placement failed: ' + (response.message || 'Unknown error'));
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
    <div className="search-view">
      <h2>Search and Retrieval</h2>
      
      {message && (
        <div className={`alert alert-${messageType}`}>
          {message}
        </div>
      )}
      
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Search for Item</h3>
        </div>
        <form onSubmit={handleSearch}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="itemId">Item ID</label>
              <input
                type="text"
                id="itemId"
                name="itemId"
                value={searchParams.itemId}
                onChange={handleInputChange}
                placeholder="Enter item ID"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="itemName">Item Name</label>
              <input
                type="text"
                id="itemName"
                name="itemName"
                value={searchParams.itemName}
                onChange={handleInputChange}
                placeholder="Enter item name"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="userId">User ID</label>
            <input
              type="text"
              id="userId"
              name="userId"
              value={searchParams.userId}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>
      
      {searchResult && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Item Details</h3>
          </div>
          <div className="item-details">
            <p><strong>Item ID:</strong> {searchResult.itemId}</p>
            <p><strong>Name:</strong> {searchResult.name}</p>
            <p><strong>Container:</strong> {searchResult.containerId}</p>
            <p><strong>Zone:</strong> {searchResult.zone}</p>
            <p><strong>Position:</strong></p>
            <ul>
              <li>Start: ({searchResult.position.startCoordinates.width}, {searchResult.position.startCoordinates.depth}, {searchResult.position.startCoordinates.height})</li>
              <li>End: ({searchResult.position.endCoordinates.width}, {searchResult.position.endCoordinates.depth}, {searchResult.position.endCoordinates.height})</li>
            </ul>
            
            <button 
              className="btn btn-success" 
              onClick={handleRetrieve} 
              disabled={loading || showPlacementForm}
            >
              Retrieve Item
            </button>
          </div>
        </div>
      )}
      
      {retrievalSteps.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Retrieval Steps</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>Step</th>
                <th>Action</th>
                <th>Item ID</th>
                <th>Item Name</th>
              </tr>
            </thead>
            <tbody>
              {retrievalSteps.map((step, index) => (
                <tr key={index}>
                  <td>{step.step}</td>
                  <td>{step.action}</td>
                  <td>{step.itemId}</td>
                  <td>{step.itemName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {showPlacementForm && searchResult && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Place Item</h3>
          </div>
          <form onSubmit={handlePlace}>
            <div className="form-group">
              <label htmlFor="containerId">Container ID</label>
              <input
                type="text"
                id="containerId"
                name="containerId"
                value={placementData.containerId}
                onChange={handlePlacementChange}
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Start Coordinates</label>
                <div className="coordinates-input">
                  <input
                    type="number"
                    name="start_width"
                    placeholder="Width"
                    value={placementData.position.startCoordinates.width}
                    onChange={handlePlacementChange}
                    min="0"
                    required
                  />
                  <input
                    type="number"
                    name="start_depth"
                    placeholder="Depth"
                    value={placementData.position.start
