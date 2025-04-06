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
