const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

class AuthController {
  // Register new user
  async register(req, res) {
    try {
      const { name, email, password, role } = req.body;

      // Check if user exists
      const existingUser = await db.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const result = await db.query(
        `INSERT INTO users (name, email, password, role) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, name, email, role, created_at`,
        [name, email, hashedPassword, role || 'Warehouse Staff']
      );

      const user = result.rows[0];

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Server error during registration' });
    }
  }

  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const result = await db.query(
        'SELECT id, name, email, password, role FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const user = result.rows[0];

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      res.json({
        success: true,
        token,
        user: {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Server error during login' });
    }
  }

  // Request OTP for password reset
  async requestOTP(req, res) {
    try {
      const { email } = req.body;

      // Check if user exists
      const result = await db.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Email not found' });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store OTP
      await db.query(
        `INSERT INTO otps (email, otp, expires_at) VALUES ($1, $2, $3)`,
        [email, otp, expiresAt]
      );

      // In production, send OTP via email
      // For development, return it
      console.log(`OTP for ${email}: ${otp}`);

      res.json({
        success: true,
        message: 'OTP sent to email',
        // Remove this in production
        otp: process.env.NODE_ENV === 'development' ? otp : undefined,
      });
    } catch (error) {
      console.error('Request OTP error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Verify OTP
  async verifyOTP(req, res) {
    try {
      const { email, otp } = req.body;

      const result = await db.query(
        `SELECT id FROM otps 
         WHERE email = $1 AND otp = $2 AND expires_at > NOW() AND used = FALSE 
         ORDER BY created_at DESC LIMIT 1`,
        [email, otp]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }

      // Mark OTP as used
      await db.query('UPDATE otps SET used = TRUE WHERE id = $1', [result.rows[0].id]);

      res.json({
        success: true,
        message: 'OTP verified successfully',
      });
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Reset password
  async resetPassword(req, res) {
    try {
      const { email, password } = req.body;

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update password
      await db.query(
        'UPDATE users SET password = $1, updated_at = NOW() WHERE email = $2',
        [hashedPassword, email]
      );

      res.json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Get current user
  async getCurrentUser(req, res) {
    try {
      const result = await db.query(
        'SELECT id, name, email, role, avatar FROM users WHERE id = $1',
        [req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        success: true,
        user: result.rows[0],
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
}

module.exports = new AuthController();
