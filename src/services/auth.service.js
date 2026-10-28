import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';

const genToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

export const register = async (data) => {
  const exists = await User.findOne({ email: data.email });
  if (exists) throw new ApiError(400, 'User already exists');
  const user = await User.create(data);
  const token = genToken(user._id);
  return { user: { id: user._id, name: user.name, email: user.email, role: user.role }, token };
};

export const login = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new ApiError(401, 'Invalid credentials');
  const match = await user.comparePassword(password);
  if (!match) throw new ApiError(401, 'Invalid credentials');
  const token = genToken(user._id);
  return { user: { id: user._id, name: user.name, email: user.email, role: user.role }, token };
};