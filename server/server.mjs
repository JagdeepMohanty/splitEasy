
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './model/user.js';
import Expense from './model/expense.js';
import Settlement from './model/settlement.js';
import auth from './middleware/auth.js';


const app = express();
app.use(cors({
  origin: ['http://localhost:3000', "https://spliteasy.onrender.com"],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json());


mongoose.connect('mongodb+srv://jagdeep0718:Jagdeep1807@cluster1.gur3w4v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1')
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));  

// User routes
app.post('/api/users/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });
    user = new User({ name, email, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    const payload = { user: { id: user.id } };
    jwt.sign(payload, 'secret', { expiresIn: 3600 }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
    const payload = { user: { id: user.id } };
    jwt.sign(payload, 'secret', { expiresIn: 3600 }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.get('/api/users/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Friends routes
app.post('/api/friends/add', auth, async (req, res) => {
  const { friendEmail } = req.body;
  try {
    const friend = await User.findOne({ email: friendEmail });
    if (!friend) return res.status(404).json({ msg: 'User not found' });
    if (req.user.id === friend.id)
      return res.status(400).json({ msg: 'Cannot add yourself as friend' });
    const currentUser = await User.findById(req.user.id);
    if (currentUser.friends.includes(friend.id))
      return res.status(400).json({ msg: 'Already friends' });
    currentUser.friends.push(friend.id);
    await currentUser.save();
    friend.friends.push(currentUser.id);
    await friend.save();
    res.json({ msg: 'Friend added' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.get('/api/friends', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friends', 'name email');
    res.json(user.friends);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Expense routes
app.post('/api/expenses', auth, async (req, res) => {
  const { description, amount, participants } = req.body;
  try {
    const expense = new Expense({
      description,
      amount,
      payer: req.user.id,
      participants,
    });
    await expense.save();
    res.json(expense);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.get('/api/expenses', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({
      $or: [{ payer: req.user.id }, { participants: req.user.id }],
    })
      .populate('payer', 'name')
      .populate('participants', 'name');
    res.json(expenses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Settlement routes
app.post('/api/settlements', auth, async (req, res) => {
  const { toUserId, amount } = req.body;
  try {
    const settlement = new Settlement({
      fromUser: req.user.id,
      toUser: toUserId,
      amount,
    });
    await settlement.save();
    res.json(settlement);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.get('/api/settlements', auth, async (req, res) => {
  try {
    const settlements = await Settlement.find({
      $or: [{ fromUser: req.user.id }, { toUser: req.user.id }],
    })
      .populate('fromUser', 'name')
      .populate('toUser', 'name');
    res.json(settlements);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Debt tracker route
app.get('/api/debts', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friends', 'name');
    const friends = user.friends;
    const debts = [];
    for (let friend of friends) {
      let F_owes_me = 0;
      const expensesIPaid = await Expense.find({
        payer: req.user.id,
        participants: friend.id,
      });
      for (let exp of expensesIPaid) {
        F_owes_me += exp.amount / exp.participants.length;
      }
      const expensesFriendPaid = await Expense.find({
        payer: friend.id,
        participants: req.user.id,
      });
      for (let exp of expensesFriendPaid) {
        F_owes_me -= exp.amount / exp.participants.length;
      }
      const settlementsFriendToMe = await Settlement.find({
        fromUser: friend.id,
        toUser: req.user.id,
      });
      for (let sett of settlementsFriendToMe) {
        F_owes_me += sett.amount;
      }
      const settlementsMeToFriend = await Settlement.find({
        fromUser: req.user.id,
        toUser: friend.id,
      });
      for (let sett of settlementsMeToFriend) {
        F_owes_me -= sett.amount;
      }
      debts.push({ friendId: friend.id, friendName: friend.name, amount: F_owes_me });
    }
    res.json(debts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));