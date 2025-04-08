# TicketHub Backend

## MongoDB Connection Issue Fix

The error message you're seeing indicates that MongoDB is not installed or running on your local machine. There are two ways to fix this:

### Option 1: Use MongoDB Atlas (Recommended)

MongoDB Atlas is a cloud database service that provides a free tier suitable for development:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free account
2. Create a new cluster (the free tier is sufficient)
3. In the Security section, create a database user with a username and password
4. In Network Access, add your IP address or allow access from anywhere (0.0.0.0/0) for development
5. Once your cluster is created, click 'Connect' and select 'Connect your application'
6. Copy the connection string and update your `.env` file with it

```
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-address>/tickethub?retryWrites=true&w=majority
```

Make sure to replace `<username>`, `<password>`, and `<cluster-address>` with your actual MongoDB Atlas credentials.

### Option 2: Install MongoDB Locally

If you prefer to use MongoDB locally:

1. Download and install [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. Follow the installation instructions for your operating system
3. Start the MongoDB service
4. Keep the default connection string in your `.env` file:

```
MONGO_URI=mongodb://localhost:27017/tickethub
```

## Starting the Application

After fixing the MongoDB connection:

1. Install dependencies (if not already done):
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

The server should now connect to MongoDB successfully and run on port 5000.