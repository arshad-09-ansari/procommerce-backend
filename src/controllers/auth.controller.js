import * as authService from '../services/auth.service.js';
import { asyncHandler } from '../utils/ApiError.js';

export const register = asyncHandler(async (req, res) => {
  const data = await authService.register(req.body);
  res.status(201).json({ success: true, ...data });
});
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const data = await authService.login(email, password);
  res.json({ success: true, ...data });
});
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});
export const logout = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Logged out' });
});
export const forgotPassword = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Reset link sent (mock) for ' + req.body.email });
});
export const refreshToken = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Token refresh logic with Redis' });
});