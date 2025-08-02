
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: './config.env' });
const next = require('next');

const { dbQueries, testConnection } = require('./database');

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with original extension
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: function (req, file, cb) {
    // Allow only image and video files
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed!'));
    }
  }
});

nextApp.prepare().then(() => {
  // Routes

  // Health check endpoint
  app.get('/api/health', async (req, res) => {
    try {
      const health = await dbQueries.healthCheck();
      res.json(health);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        data: { connected: false, status: 'unhealthy' }
      });
    }
  });

  // Upload advertisement endpoint
  app.post('/api/upload-ad', upload.single('adFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }

      const { poleType, expiryDate } = req.body;
      const fileName = req.file.filename;
      const filePath = `/uploads/${fileName}`;

      console.log(`📤 Uploading ad for pole ${poleType}: ${fileName}`);

      // Insert into database
      const result = await dbQueries.insertAd(poleType, filePath, req.body.createdBy || 'web-user', expiryDate || null);

      if (result.success) {
        res.json({
          success: true,
          message: 'Advertisement uploaded successfully!',
          data: {
            ...result.data,
            fileUrl: `${req.protocol}://${req.get('host')}${filePath}`,
            fileName: fileName
          }
        });
      } else {
        // If database insert fails, delete the uploaded file
        fs.unlinkSync(req.file.path);
        res.status(500).json(result);
      }

    } catch (error) {
      console.error('❌ Upload error:', error.message);
      
      // Clean up uploaded file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get ads by pole type
  app.get('/api/ads/pole/:poleType', async (req, res) => {
    try {
      const { poleType } = req.params;
      const result = await dbQueries.getAdsByPole(poleType);
      
      if (result.success) {
        // Add full URLs to the response
        const adsWithUrls = result.data.map(ad => ({
          ...ad,
          imageUrl: `${req.protocol}://${req.get('host')}${ad.image}`
        }));
        
        res.json({
          success: true,
          data: adsWithUrls
        });
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get all active ads
  app.get('/api/ads', async (req, res) => {
    try {
      const result = await dbQueries.getAllActiveAds();
      
      if (result.success) {
        // Add full URLs to the response
        const adsWithUrls = result.data.map(ad => ({
          ...ad,
          imageUrl: `${req.protocol}://${req.get('host')}${ad.image}`
        }));
        
        res.json({
          success: true,
          data: adsWithUrls
        });
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Update ad status
  app.put('/api/ads/:adId/status', async (req, res) => {
    try {
      const { adId } = req.params;
      const { isActive, updatedBy } = req.body;
      
      const result = await dbQueries.updateAdStatus(adId, isActive, updatedBy);
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Ad status updated successfully!',
          data: result.data
        });
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Delete ad
  app.delete('/api/ads/:adId', async (req, res) => {
    try {
      const { adId } = req.params;
      
      // First get the ad to find the file path
      const adResult = await dbQueries.getAdsByPole('all'); // We'll filter by ID
      const ad = adResult.data.find(ad => ad.id === adId);
      
      const result = await dbQueries.deleteAd(adId);
      
      if (result.success) {
        // Delete the file from filesystem
        if (ad && ad.image) {
          const filePath = path.join(__dirname, ad.image);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`🗑️ Deleted file: ${filePath}`);
          }
        }
        
        res.json({
          success: true,
          message: 'Ad deleted successfully!',
          data: result.data
        });
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Test database connection
  app.get('/api/test-connection', async (req, res) => {
    try {
      const isConnected = await testConnection();
      res.json({
        success: isConnected,
        message: isConnected ? 'Database connected successfully!' : 'Database connection failed!',
        data: { connected: isConnected }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        data: { connected: false }
      });
    }
  });

  // View database contents (for debugging)
  app.get('/api/debug/contents', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const result = await dbQueries.viewContents(limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Clean database (for testing)
  app.post('/api/debug/clean', async (req, res) => {
    try {
      const result = await dbQueries.cleanDatabase();
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Error handling middleware
  app.use((error, req, res, next) => {
    console.error('❌ Server error:', error.message);
    
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'File too large. Maximum size is 10MB.'
        });
      }
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  });

  // Serve the Next.js app for all other routes
  app.all('*', (req, res) => {
    return handle(req, res);
  });

  // Start the server
  app.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});