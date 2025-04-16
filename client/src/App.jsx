import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Friends from './pages/Friends';
import CreateExpense from './pages/CreateExpense';
import Settle from './pages/Settle';
import DebtTracker from './pages/DebtTracker';
import './App.css';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <div className="app-container">
        <Navbar/>
        <Routes>
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/" element={<Dashboard/>} />
          <Route path="/friends" element={<Friends/>} />
          <Route path="/create-expense" element={<CreateExpense/>} />
          <Route path="/settle" element={<Settle/>} />
          <Route path="/debts" element={<DebtTracker/>} />
        </Routes>
      </div>
    </BrowserRouter>
  </AuthProvider>
);

export default App;