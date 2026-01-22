# MongoDB Atlas Setup Guide - Step by Step

This guide will walk you through setting up MongoDB Atlas (cloud database) and connecting it to the Connect Chat application.

## Prerequisites
- A web browser
- An email address to create a MongoDB Atlas account
- Node.js installed on your computer

---

## Step 1: Create MongoDB Atlas Account

1. **Open your web browser** and go to: https://www.mongodb.com/cloud/atlas/register

2. **Fill in the registration form:**
   - Enter your email address
   - Create a password (must be at least 8 characters)
   - Enter your first and last name
   - Click **"Create your Atlas account"**

3. **Verify your email:**
   - Check your email inbox
   - Click the verification link sent by MongoDB
   - You'll be redirected to the MongoDB Atlas dashboard

---

## Step 2: Create a New Cluster

1. **After logging in**, you'll see the Atlas dashboard
   - Click the **"Build a Database"** button (or "Create" → "Database")

2. **Choose a deployment option:**
   - Select **"M0 FREE"** (Free tier - perfect for development)
   - Click **"Create"**

3. **Choose a cloud provider and region:**
   - Select a cloud provider (AWS, Google Cloud, or Azure)
   - Choose a region closest to your location (e.g., `us-east-1` for US East)
   - Click **"Create Cluster"**

4. **Wait for cluster creation:**
   - This takes 3-5 minutes
   - You'll see a progress indicator
   - The cluster name will be something like "Cluster0"

---

## Step 3: Create Database User

1. **While the cluster is being created**, you'll see a security setup screen
   - If you don't see it, click **"Database Access"** in the left sidebar

2. **Create a database user:**
   - Click **"Add New Database User"** button
   - Choose **"Password"** authentication method
   - Enter a username (e.g., `chatadmin`)
   - Click **"Autogenerate Secure Password"** or create your own
   - **IMPORTANT:** Copy and save this password! You'll need it later.
   - Under "Database User Privileges", select **"Read and write to any database"**
   - Click **"Add User"**

---

## Step 4: Configure Network Access (Whitelist IP)

1. **Click "Network Access"** in the left sidebar

2. **Add IP Address:**
   - Click **"Add IP Address"** button
   - For development, click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - **Note:** For production, you should restrict this to specific IPs
   - Click **"Confirm"**

   ⚠️ **Security Note:** Allowing access from anywhere is fine for development but should be restricted in production.

---

## Step 5: Get Your Connection String

1. **Go back to "Database"** in the left sidebar
   - Click **"Connect"** button on your cluster

2. **Choose connection method:**
   - Select **"Connect your application"**

3. **Copy the connection string:**
   - You'll see a connection string that looks like:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - **Replace `<username>`** with your database username (e.g., `chatadmin`)
   - **Replace `<password>`** with your database password (the one you saved in Step 3)
   - **Copy the entire connection string**

   Example of final connection string:
   ```
   mongodb+srv://chatadmin:MyPassword123@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
   ```

4. **Add database name to connection string:**
   - Add `/connect-chat` before the `?` in the connection string
   - Final string should look like:
     ```
     mongodb+srv://chatadmin:MyPassword123@cluster0.abc123.mongodb.net/connect-chat?retryWrites=true&w=majority
     ```

---

## Step 6: Configure the Backend Server

1. **Navigate to the server folder:**
   ```bash
   cd connect-chat-main/server
   ```

2. **Create a `.env` file:**
   - If you're on Windows, you can create it using:
     ```bash
     New-Item -ItemType File -Path .env
     ```
   - Or create it manually using a text editor

3. **Open the `.env` file** and add the following:
   ```env
   PORT=5000
   MONGODB_URI=your_connection_string_here
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-long-and-random
   CLIENT_URL=http://localhost:5173
   ```

4. **Replace `your_connection_string_here`** with the connection string you copied in Step 5

   Example `.env` file:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://chatadmin:MyPassword123@cluster0.abc123.mongodb.net/connect-chat?retryWrites=true&w=majority
   JWT_SECRET=my-super-secret-jwt-key-12345-abcdefghijklmnopqrstuvwxyz
   CLIENT_URL=http://localhost:5173
   ```

5. **Save the `.env` file**

---

## Step 7: Install Backend Dependencies

1. **Make sure you're in the server directory:**
   ```bash
   cd connect-chat-main/server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

   This will install all required packages (Express, Mongoose, Socket.IO, etc.)

3. **Wait for installation to complete** (this may take 1-2 minutes)

---

## Step 8: Install Frontend Dependencies

1. **Open a new terminal window** (keep the server terminal open)

2. **Navigate to the project root:**
   ```bash
   cd connect-chat-main
   ```

3. **Install frontend dependencies:**
   ```bash
   npm install
   ```

   This will install React, TypeScript, Socket.IO client, and other frontend packages

---

## Step 9: Create Frontend Environment File

1. **In the project root** (connect-chat-main folder), create a `.env` file

2. **Add the following content:**
   ```env
   VITE_API_URL=http://localhost:5000
   ```

3. **Save the file**

---

## Step 10: Start the Backend Server

1. **In the server terminal**, make sure you're in the server directory:
   ```bash
   cd connect-chat-main/server
   ```

2. **Start the server:**
   ```bash
   npm run dev
   ```

   You should see:
   ```
   ✅ Connected to MongoDB
   🚀 Server running on port 5000
   📡 Socket.IO server ready
   ```

   ✅ **If you see these messages, your MongoDB connection is working!**

   ❌ **If you see connection errors:**
   - Check that your connection string is correct
   - Verify your database username and password
   - Make sure your IP is whitelisted in MongoDB Atlas
   - Check that your cluster is running (green status in Atlas dashboard)

---

## Step 11: Start the Frontend Server

1. **In a new terminal window**, navigate to the project root:
   ```bash
   cd connect-chat-main
   ```

2. **Start the frontend:**
   ```bash
   npm run dev
   ```

   You should see:
   ```
   VITE v5.x.x  ready in xxx ms

   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```

---

## Step 12: Open the Application

1. **Open your web browser**

2. **Navigate to:** http://localhost:5173

3. **You should see the Connect Chat homepage**

4. **Click "Get Started" or "Sign In"**

5. **Create a new account:**
   - Enter your name
   - Enter your email
   - Enter a password (at least 6 characters)
   - Click "Create Account"

6. **You'll be redirected to the chat interface!**

---

## Troubleshooting Common Issues

### Issue: "MongoServerError: Authentication failed"
**Solution:**
- Double-check your username and password in the connection string
- Make sure there are no extra spaces
- Verify the user exists in MongoDB Atlas (Database Access section)

### Issue: "MongooseServerSelectionError: connect ECONNREFUSED"
**Solution:**
- Check that your IP address is whitelisted in Network Access
- Verify your cluster is running (check Atlas dashboard)
- Try using "Allow Access from Anywhere" (0.0.0.0/0) for testing

### Issue: "Invalid connection string"
**Solution:**
- Make sure you replaced `<username>` and `<password>` in the connection string
- Verify the connection string includes `/connect-chat` before the `?`
- Check for any special characters that need URL encoding

### Issue: Backend server won't start
**Solution:**
- Make sure you're in the `server` directory
- Verify `node_modules` folder exists (run `npm install` again)
- Check that port 5000 is not already in use
- Verify your `.env` file is in the `server` folder

### Issue: Frontend can't connect to backend
**Solution:**
- Verify backend is running on port 5000
- Check that `VITE_API_URL=http://localhost:5000` is in the root `.env` file
- Make sure CORS is configured (it should be in the server code)
- Try accessing http://localhost:5000/api/health in your browser

### Issue: Socket.IO connection fails
**Solution:**
- Make sure both frontend and backend are running
- Check browser console for errors
- Verify `CLIENT_URL` in server `.env` matches your frontend URL
- Check that Socket.IO is properly initialized

---

## Verifying MongoDB Connection

### Method 1: Check Server Logs
When you start the backend server, you should see:
```
✅ Connected to MongoDB
```

### Method 2: Check Atlas Dashboard
1. Go to MongoDB Atlas dashboard
2. Click on your cluster
3. Click "Collections" tab
4. After creating a user or sending a message, you should see collections appear:
   - `users`
   - `rooms`
   - `messages`
   - `directmessages`

### Method 3: Test API Endpoint
1. Open browser
2. Go to: http://localhost:5000/api/health
3. You should see: `{"status":"ok","message":"Server is running"}`

---

## Quick Reference: File Locations

```
connect-chat-main/
├── server/
│   ├── .env                    ← Backend environment variables
│   ├── package.json
│   └── server.js
├── .env                        ← Frontend environment variables
├── package.json
└── README.md
```

---

## Next Steps

Once everything is running:

1. **Create your first chat room:**
   - Click the "+" button next to "Channels"
   - Enter a room name (e.g., "general")
   - Click "Create"

2. **Send your first message:**
   - Select a room
   - Type a message
   - Press Enter or click Send

3. **Upload a file:**
   - Click the paperclip or image icon
   - Select a file
   - It will be uploaded and sent

4. **Test with multiple users:**
   - Open the app in an incognito/private window
   - Create another account
   - Send messages between accounts

---

## Security Notes for Production

When deploying to production:

1. **Change JWT_SECRET** to a long, random string
2. **Restrict IP whitelist** in MongoDB Atlas to your server IP only
3. **Use environment variables** for all sensitive data
4. **Enable MongoDB Atlas encryption** at rest
5. **Use strong database passwords**
6. **Enable MongoDB Atlas monitoring and alerts**

---

## Need Help?

- **MongoDB Atlas Documentation:** https://docs.atlas.mongodb.com/
- **MongoDB Community Forums:** https://developer.mongodb.com/community/forums/
- **Check server logs** for detailed error messages
- **Check browser console** (F12) for frontend errors

---

**Congratulations!** 🎉 You've successfully set up MongoDB Atlas and connected it to your Connect Chat application!
