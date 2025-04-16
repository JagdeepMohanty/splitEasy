
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import './Friends.css';

const Friends = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [friendEmail, setFriendEmail] = useState('');

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

  const handleAddFriend = () => {
    axios
      .post('/api/friends/add', { friendEmail }, { headers: { 'x-auth-token': token } })
      .then(() => {
        setFriendEmail('');
        axios
          .get('/api/friends', { headers: { 'x-auth-token': token } })
          .then((res) => setFriends(res.data));
      })
      .catch((err) => alert(err.response?.data.msg || 'Failed to add friend'));
  };

  if (!user) return null;

  return (
    <div className="friends-container">
      <h2>Your Friends</h2>
      <div className="add-friend">
        <input
          type="email"
          placeholder="Friend's Email"
          value={friendEmail}
          onChange={(e) => setFriendEmail(e.target.value)}
        />
        <button onClick={handleAddFriend}>Add Friend</button>
      </div>
      <div className="friends-list">
        {friends.length === 0 ? (
          <p>No friends added yet.</p>
        ) : (
          friends.map((friend) => (
            <div key={friend._id} className="friend-card">
              <span>{friend.name}</span>
              <span className="email">{friend.email}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Friends;