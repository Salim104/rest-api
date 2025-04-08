import jwt from 'jsonwebtoken';

// Secret key for JWT signing and verification
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Function to generate JWT token
const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '24h' // Token expires in 24 hours
  });
};

// Function to verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export { generateToken, verifyToken };

