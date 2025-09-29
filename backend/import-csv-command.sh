#!/bin/bash

# MongoDB Atlas CSV Import Script
# This script will import the CSV directly using mongoimport

echo "=== MONGODB ATLAS CSV IMPORT ==="
echo ""

# MongoDB Atlas connection string
CONNECTION_STRING="mongodb+srv://ajv1520:ajmark321@schoolcluster.v1pfmoq.mongodb.net/udise-dashboard?retryWrites=true&w=majority&appName=SchoolCluster"

# CSV file path
CSV_FILE="/media/aj/Disk D/code test/kuki solutions/schools.csv"

# Database and collection
DATABASE="udise-dashboard"
COLLECTION="schools"

echo "📁 CSV File: $CSV_FILE"
echo "🔗 Database: $DATABASE"
echo "📊 Collection: $COLLECTION"
echo ""

# Check if mongoimport is installed
if ! command -v mongoimport &> /dev/null; then
    echo "❌ mongoimport not found. Installing..."
    
    # Install MongoDB Database Tools
    echo "📦 Installing MongoDB Database Tools..."
    
    # For Ubuntu/Debian
    if command -v apt &> /dev/null; then
        wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
        echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
        sudo apt-get update
        sudo apt-get install -y mongodb-database-tools
    # For macOS
    elif command -v brew &> /dev/null; then
        brew tap mongodb/brew
        brew install mongodb-database-tools
    else
        echo "❌ Please install MongoDB Database Tools manually"
        echo "   Visit: https://docs.mongodb.com/database-tools/installation/"
        exit 1
    fi
fi

echo "✅ mongoimport found"
echo ""

# Import CSV with field mapping
echo "🚀 Starting CSV import..."
echo "⏱️  This may take several minutes for 1.6M+ records..."
echo ""

mongoimport \
  --uri="$CONNECTION_STRING" \
  --db="$DATABASE" \
  --collection="$COLLECTION" \
  --type=csv \
  --file="$CSV_FILE" \
  --headerline \
  --ignoreBlanks \
  --numInsertionWorkers=4 \
  --batchSize=1000

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ CSV import completed successfully!"
    echo "📊 All Indian states and schools imported"
    echo ""
    echo "🔧 Next steps:"
    echo "   1. Run: node setup-indexes.js"
    echo "   2. Test your API endpoints"
    echo "   3. Check your dashboard with all states"
else
    echo ""
    echo "❌ CSV import failed"
    echo "💡 Try running the import again or check your connection"
fi
