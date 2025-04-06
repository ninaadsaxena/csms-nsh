import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs =
