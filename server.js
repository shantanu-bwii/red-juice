import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDb from './config/db.js';
import cors from 'cors';

dotenv.config();
const app = express();

connectDb();

app.use(express.json());
app.use(cors());

const adminPassword = process.env.PASSWORD;

const Schema = mongoose.Schema;
const AddressSchema = new Schema(
  {
    name: String,
    address: String,
  },
  { timestamps: true }
);

const Address = mongoose.model('Address', AddressSchema);

const admin2FA = (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  if (password === adminPassword) {
    req.isCorrectPassword = true;
    next();
  } else {
    req.isCorrectPassword = false;
    next();
  }
};

app.post('/api/v1/admin-auth', admin2FA, (req, res) => {
  if (req.isCorrectPassword) {
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
});

app.get('/api/v1', async (req, res) => {
  try {
    const names = await Address.find();
    res.json(names);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/v1', async (req, res) => {
  try {
    const { name, address } = req.body;
    const newAddress = new Address({ name, address });
    const savedAddress = await newAddress.save();
    res.status(201).json(savedAddress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/v1/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const deletedAddress = await Address.findOneAndDelete({ address });

    if (!deletedAddress) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
