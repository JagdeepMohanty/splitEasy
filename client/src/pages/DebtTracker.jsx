
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import './DebtTracker.css';

const DebtTracker = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [debts, setDebts] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      axios
        .get('/api/debts', { headers: { 'x-auth-token': token } })
        .then((res) => setDebts(res.data))
        .catch((err) => console.error(err));
    }
  }, [user, token, navigate]);

  if (!user) return null;

  return (
    <div className="debt-tracker">
      <h2>Debt Tracker</h2>
      {debts.length === 0 ? (
        <p>No debts to track.</p>
      ) : (
        <div className="debt-list">
          {debts.map((debt) => (
            <div key={debt.friendId} className="debt-card">
              <span className={debt.amount > 0 ? 'owe-you' : 'you-owe'}>
                {debt.friendName}: {debt.amount > 0 ? 'Owes you' : 'You owe'} ₹
                {Math.abs(debt.amount).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DebtTracker;