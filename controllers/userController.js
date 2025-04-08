import { createUser, findUserByEmail, findUserByUsername, verifyUserCredentials } from '../models/userModel.js';
import { generateToken } from '../util/auth.js';

// Controller for user signup
export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide username, email and password' 
      });
    }

    // Check if user already exists
    const existingEmail = findUserByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ 
        success: false, 
        message: 'Email already in use' 
      });
    }

    const existingUsername = findUserByUsername(username);
    if (existingUsername) {
      return res.status(409).json({ 
        success: false, 
        message: 'Username already taken' 
      });
    }

    // Create new user
    const newUser = await createUser({ username, email, password });

    // Generate JWT token
    const token = generateToken(newUser);

    // Return user data without password
    const { password: userPassword, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      data: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Controller for user login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    // Verify user credentials
    const result = await verifyUserCredentials(email, password);
    
    if (!result.isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generate JWT token
    const token = generateToken(result.user);
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: result.user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
}; 