# SmartPole Digital Advertising Backend

A complete backend system for managing digital advertisements on smart poles with PostgreSQL database integration.

## 🚀 Features

- **File Upload**: Upload images and videos for smart poles
- **Database Storage**: PostgreSQL integration with AWS RDS
- **RESTful API**: Complete CRUD operations for advertisements
- **File Management**: Automatic file storage and cleanup
- **Health Monitoring**: Database connection and system health checks
- **CORS Support**: Cross-origin resource sharing enabled
- **Error Handling**: Comprehensive error handling and logging

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database (AWS RDS configured)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone or download the project files**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - The `config.env` file is already configured with your database credentials
   - Database host: `ai-chatbot.c7mkqkyiqpit.ap-south-1.rds.amazonaws.com`
   - Database: `SmartPole`
   - User: `postgres`

4. **Test database connection**
   ```bash
   npm test
   ```

5. **Start the server**
   ```bash
   npm start
   ```

## 🗄️ Database Schema

The system automatically creates the following table structure:

```sql
CREATE TABLE pole_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poletype INTEGER NOT NULL,
  image VARCHAR(500) NOT NULL,
  isactive BOOLEAN DEFAULT true,
  createddate TIMESTAMP DEFAULT NOW(),
  updateddate TIMESTAMP,
  createdby VARCHAR(100) DEFAULT 'web-user',
  updatedby VARCHAR(100)
);
```

## 📡 API Endpoints

### Health & Status
- `GET /api/health` - System health check
- `GET /api/test-connection` - Database connection test

### Advertisement Management
- `POST /api/upload-ad` - Upload new advertisement
- `GET /api/ads` - Get all active advertisements
- `GET /api/ads/pole/:poleType` - Get ads by pole type
- `PUT /api/ads/:adId/status` - Update ad status
- `DELETE /api/ads/:adId` - Delete advertisement

### Debug & Maintenance
- `GET /api/debug/contents` - View database contents
- `POST /api/debug/clean` - Clean test data

## 📤 Upload Format

**Endpoint**: `POST /api/upload-ad`

**Form Data**:
- `adFile`: Image or video file (jpg, png, gif, mp4, mov, avi, webm)
- `poleType`: Pole number (1-8)
- `createdBy`: User identifier (optional)

**Response**:
```json
{
  "success": true,
  "message": "Advertisement uploaded successfully!",
  "data": {
    "id": "uuid",
    "poletype": 1,
    "image": "/uploads/filename.jpg",
    "fileUrl": "http://localhost:3001/uploads/filename.jpg",
    "fileName": "filename.jpg"
  }
}
```

## 🔧 Configuration



## 📁 Project Structure

```
smartpole-backend/
├── server.js              # Main Express server
├── database.js            # Database connection and queries
├── package.json           # Dependencies and scripts
├── config.env             # Environment configuration
├── test-database.js       # Database testing script
├── uploads/               # Uploaded files directory
├── index.html             # Frontend login page
├── dashboard.html         # Frontend dashboard
└── README.md             # This file
```

## 🧪 Testing

### Database Connection Test
```bash
npm test
```

### Manual API Testing
```bash
# Health check
curl http://localhost:3001/api/health

# Test connection
curl http://localhost:3001/api/test-connection

# View database contents
curl http://localhost:3001/api/debug/contents
```

## 🔗 Frontend Integration

The dashboard (`dashboard.html`) is configured to connect to the backend:

- **Upload URL**: `http://localhost:3001/api/upload-ad`
- **CORS**: Enabled for cross-origin requests
- **File Types**: Images (jpg, png, gif) and videos (mp4, mov, avi, webm)
- **Max Size**: 10MB per file

## 🚀 Deployment

### Local Development
```bash
npm run dev  # Uses nodemon for auto-restart
```

### Production
```bash
npm start    # Standard Node.js start
```

## 📊 Monitoring

### Health Check Response
```json
{
  "success": true,
  "data": {
    "connected": true,
    "timestamp": "2024-01-01T00:00:00.000Z",
    "totalAds": 24,
    "activeAds": 20,
    "database": "SmartPole",
    "status": "healthy"
  }
}
```

## 🛡️ Security Features

- **File Type Validation**: Only allowed file types accepted
- **File Size Limits**: Configurable maximum file size
- **SQL Injection Protection**: Parameterized queries
- **Error Handling**: Comprehensive error responses
- **File Cleanup**: Automatic cleanup on failed uploads

## 🔄 File Management

- **Storage**: Files stored in `./uploads/` directory
- **Naming**: Unique filenames with UUID and timestamp
- **Cleanup**: Automatic deletion of files when ads are deleted
- **Serving**: Static file serving via Express

## 📝 Logging

The system provides comprehensive logging:
- Database connection status
- File upload progress
- Error messages with stack traces
- API request/response logging

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check AWS RDS security groups
   - Verify credentials in `config.env`
   - Test with `npm test`

2. **Upload Fails**
   - Check file size (max 10MB)
   - Verify file type (images/videos only)
   - Ensure uploads directory exists

3. **CORS Errors**
   - Backend CORS is enabled
   - Check frontend URL configuration
   - Verify port 3001 is accessible

### Debug Commands
```bash
# Test database connection
node test-database.js

# View server logs
npm start

# Check uploads directory
ls uploads/
```

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review server logs for error messages
3. Test database connection with `npm test`
4. Verify environment configuration

## 📄 License

MIT License - See package.json for details

---

**SmartPole Digital Advertising Backend** - Ready for production deployment! 🚀 
