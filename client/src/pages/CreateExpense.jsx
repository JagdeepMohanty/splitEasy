
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import './CreateExpense.css';

const CreateExpense = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);

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
    const participants = [...selectedFriends, user._id];
    axios
      .post(
        '/api/expenses',
        { description, amount: parseFloat(amount), participants },
        { headers: { 'x-auth-token': token } }
      )
      .then(() => navigate('/'))
      .catch((err) => alert('Failed to add expense'));
  };

  if (!user) return null;

  return (
    <div className="expense-form">
      <h2>Add New Expense</h2>
      <input
        type="text"
        placeholder="Description (e.g., Dinner)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="number"
        placeholder="Amount (₹)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <select
        multiple
        value={selectedFriends}
        onChange={(e) => {
          const options = e.target.options;
          const selected = [];
          for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
              selected.push(options[i].value);
            }
          }
          setSelectedFriends(selected);
        }}
      >
        {friends.map((friend) => (
          <option key={friend._id} value={friend._id}>
            {friend.name}
          </option>
        ))}
      </select>
      <button onClick={handleSubmit}>Add Expense</button>
    </div>
  );
};

export default CreateExpense;