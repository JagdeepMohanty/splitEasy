
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [debts, setDebts] = useState([]);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      axios
        .get('/api/debts', { headers: { 'x-auth-token': token } })
        .then((res) => setDebts(res.data))
        .catch((err) => console.error(err));
      axios
        .get('/api/expenses', { headers: { 'x-auth-token': token } })
        .then((res) => setExpenses(res.data.slice(0, 5)))
        .catch((err) => console.error(err));
    }
  }, [user, token, navigate]);

  if (!user) return null;

  return (
    <div className="dashboard">
      <h1>Welcome, {user.name}!</h1>
      <div className="dashboard-grid">
        <div className="debts-section">
          <h2>Your Debts</h2>
          {debts.length === 0 ? (
            <p>No debts to display.</p>
          ) : (
            debts.map((debt) => (
              <div key={debt.friendId} className="debt-card">
                <span className={debt.amount > 0 ? 'owe-you' : 'you-owe'}>
                  {debt.friendName}: {debt.amount > 0 ? 'Owes you' : 'You owe'} ₹
                  {Math.abs(debt.amount).toFixed(2)}
                </span>
              </div>
            ))
          )}
        </div>
        <div className="expenses-section">
          <h2>Recent Expenses</h2>
          {expenses.length === 0 ? (
            <p>No recent expenses.</p>
          ) : (
            expenses.map((exp) => (
              <div key={exp._id} className="expense-card">
                <span>{exp.description}</span>
                <span>₹{exp.amount.toFixed(2)}</span>
                <span className="payer">Paid by: {exp.payer.name}</span>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="actions">
        <button onClick={() => navigate('/create-expense')}>
          Add Expense
        </button>
        <button onClick={() => navigate('/settle')}>Settle Debt</button>
      </div>
    </div>
  );
};

export default Dashboard;