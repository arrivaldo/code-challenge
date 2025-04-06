import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { db } from "./db.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from 'cloudinary';
import { uploadSingle } from './middleware/multer.js';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const app = express();
const saltRounds = 10;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Helper function to generate GUID
function generateGUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Image Upload Endpoint
app.post('/api/upload', uploadSingle('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: 'user-profiles',
          resource_type: 'auto',
          allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
          transformation: [
            { width: 500, height: 500, crop: 'limit' },
            { quality: 'auto:good' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          resolve(result);
        }
      );
      
      uploadStream.end(req.file.buffer);
    });

    res.json({ 
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
});

// Register Route
app.post("/api/auth/register", async (req, res) => {
  try {
    const {
      name,
      company,
      email,
      password,
      phone,
      address,
      age,
      eyeColor,
      balance,
      picture // This comes from the frontend (either Cloudinary URL or placeholder)
    } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }

    await db.read();

    // Check if user exists
    const existingUser = db.data.users.find(user => user.email === email);
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: "User already exists" 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user object
    const newUser = {
      _id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      guid: generateGUID(),
      isActive: true,
      balance: balance || "$1,000.00",
      picture: picture || "http://placehold.it/32x32", // Use provided URL or default
      picturePublicId: null, // Will be set if Cloudinary upload was done
      age: age || 25,
      eyeColor: eyeColor || "brown",
      name: {
        first: name?.first || (typeof name === 'string' ? name.split(' ')[0] : "User"),
        last: name?.last || (typeof name === 'string' ? name.split(' ')[1] : "Anonymous")
      },
      company: company || "Freelance",
      email,
      password: hashedPassword,
      phone: phone || "+1 (000) 000-0000",
      address: address || "123 Main Street, Anytown, USA",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to database
    db.data.users.push(newUser);
    await db.write();

    // Return response without sensitive data
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ 
      success: true, 
      message: "User registered successfully",
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Registration failed",
      error: error.message
    });
  }
});

// Login Route
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }

    await db.read();
    const user = db.data.users.find(user => user.email === email);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ 
      success: true, 
      message: "Login successful",
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Login failed",
      error: error.message
    });
  }
});

// Profile Route
app.get("/api/auth/profile", async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email parameter is required" 
      });
    }

    await db.read();
    const user = db.data.users.find(user => user.email === email);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ 
      success: true, 
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch profile",
      error: error.message
    });
  }
});

// Update Profile Route (optional - for future use)
app.put("/api/auth/profile", async (req, res) => {
  try {
    const { email, updates } = req.body;
    
    if (!email || !updates) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and updates are required" 
      });
    }

    await db.read();
    const userIndex = db.data.users.findIndex(user => user.email === email);
    
    if (userIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Update user data
    db.data.users[userIndex] = {
      ...db.data.users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await db.write();

    const { password: _, ...updatedUser } = db.data.users[userIndex];
    res.json({ 
      success: true, 
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update profile",
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false, 
    message: "Internal server error",
    error: err.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Cloudinary config:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'not set',
    api_secret: process.env.CLOUDINARY_API_SECRET ? '***' + process.env.CLOUDINARY_API_SECRET.slice(-4) : 'not set'
  });
});