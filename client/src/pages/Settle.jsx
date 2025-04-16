
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import './Settle.css';

const Settle = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [toUserId, setToUserId] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      axios
        .get('/api/friends', { headers: { 'x-auth-token': token } })
        .then((res) => setFriends(res.data))
        .catch((err) => console.error(err));
    }
  }, [user, token, navigate]);

  const handleSubmit = () => {
    axios
      .post(
        '/api/settlements',
        { toUserId, amount: parseFloat(amount) },
        { headers: { 'x-auth-token': token } }
      )
      .then(() => navigate('/'))
      .catch((err) => alert('Failed to settle'));
  };

  if (!user) return null;

  return (
    <div className="settle-form">
      <h2>Settle Debt</h2>
      <select value={toUserId} onChange={(e) => setToUserId(e.target.value)}>
        <option value="">Select Friend</option>
        {friends.map((friend) => (
          <option key={friend._id} value={friend._id}>
            {friend.name}
          </option>
        ))}
      </select>
      <input
        type="number"
        placeholder="Amount (₹)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handleSubmit}>Settle</button>
    </div>
  );
};

export default Settle;