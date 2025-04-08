import db from '../db/dbService.js';
import bcrypt from 'bcryptjs';

// Function to create a new user
const createUser = async (userData) => {
  try {
    const id = Date.now().toString();
    const createdAt = new Date().toISOString();
    
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const stmt = db.prepare(`
      INSERT INTO users (id, username, email, password, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, userData.username, userData.email, hashedPassword, createdAt);
    
    return {
      id,
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      createdAt
    };
  } catch (error) {
    console.error('Error creating user:', error.message);
    throw error;
  }
};

// Function to verify user credentials
const verifyUserCredentials = async (email, password) => {
  try {
    const user = findUserByEmail(email);
    
    if (!user) {
      return { isValid: false, message: 'User not found' };
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return { isValid: false, message: 'Invalid password' };
    }
    
    return { 
      isValid: true, 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    };
  } catch (error) {
    console.error('Error verifying credentials:', error.message);
    throw error;
  }
};


// Function to find user by email
const findUserByEmail = (email) => {
  try {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  } catch (error) {
    console.error('Error finding user by email:', error.message);
    throw error;
  }
};

// Function to find user by username
const findUserByUsername = (username) => {
  try {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username);
  } catch (error) {
    console.error('Error finding user by username:', error.message);
    throw error;
  }
};

export { 
  createUser, 
  findUserByEmail, 
  findUserByUsername,
  verifyUserCredentials
}; 