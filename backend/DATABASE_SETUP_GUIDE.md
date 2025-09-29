# 🚀 UDISE Database Setup Guide

## 📋 **Prerequisites**

1. **MongoDB Atlas Cluster** - Create a free cluster
2. **Kaggle Dataset** - Download the schools dataset
3. **Node.js** - Version 18+ installed

## 🔧 **Step 1: MongoDB Atlas Setup**

### **1.1 Create Cluster**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (M0 Sandbox is free)
4. Choose a region close to you

### **1.2 Get Connection String**
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with `udise-dashboard`

**Example Connection String:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/udise-dashboard?retryWrites=true&w=majority
```

### **1.3 Whitelist IP Address**
1. Go to "Network Access" in Atlas
2. Add your current IP address
3. Or add `0.0.0.0/0` for all IPs (less secure)

## 📥 **Step 2: Download Kaggle Dataset**

### **2.1 Get Dataset**
1. Go to [Kaggle Schools Dataset](https://www.kaggle.com/datasets/hritikakolkar/schools)
2. Download the CSV file
3. Save it as `schools.csv` in the `data/` folder

### **2.2 Create Data Directory**
```bash
mkdir data
# Place schools.csv in the data folder
```

## 🚀 **Step 3: Run Setup Scripts**

### **3.1 Set Environment Variables**
Create a `.env` file in the server directory:
```env
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/udise-dashboard?retryWrites=true&w=majority
DB_NAME=udise-dashboard
JWT_AUTH_SECRET=your_jwt_secret_here
JWT_AUTH_EXPIRATION=1d
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRATION=7d
NODE_ENV=development
```

### **3.2 Run Database Setup**
```bash
# Test connection and create sample data
node setup-database.js
```

### **3.3 Import Real Data**
```bash
# Import Kaggle dataset (make sure schools.csv is in data/ folder)
node import-kaggle-data.js
```

## 📊 **Step 4: Verify Setup**

### **4.1 Check Database**
1. Go to MongoDB Atlas
2. Click "Browse Collections"
3. You should see a `schools` collection
4. Check the document count

### **4.2 Test APIs**
```bash
# Start the server
npm start

# Test endpoints
curl http://localhost:5000/api/v1/schools
curl http://localhost:5000/api/v1/schools/distribution
curl http://localhost:5000/api/v1/schools/filters?type=states
```

## 🔧 **Troubleshooting**

### **Connection Issues**
- Check your connection string
- Verify IP is whitelisted
- Ensure cluster is running

### **Data Import Issues**
- Check if CSV file exists in `data/` folder
- Verify file format and encoding
- Check MongoDB connection

### **Performance Issues**
- Create indexes for better performance
- Use batch processing for large datasets
- Monitor Atlas cluster metrics

## 📈 **Expected Results**

After successful setup:
- ✅ **Database**: Connected to MongoDB Atlas
- ✅ **Collection**: `schools` collection created
- ✅ **Data**: 8 lakh+ school records imported
- ✅ **Indexes**: Performance indexes created
- ✅ **APIs**: All endpoints working
- ✅ **Frontend**: Ready to connect

## 🎯 **Next Steps**

1. **Test Backend APIs** - Verify all endpoints work
2. **Connect Frontend** - Update API URLs
3. **Deploy to Production** - Render + Vercel
4. **Monitor Performance** - Check Atlas metrics

## 📞 **Support**

If you encounter issues:
1. Check the console logs
2. Verify MongoDB Atlas settings
3. Ensure all dependencies are installed
4. Check file permissions

---

**🎉 Ready to build the UDISE Dashboard!**
