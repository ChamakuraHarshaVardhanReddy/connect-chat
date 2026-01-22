# Connect Chat - Real-Time Chat Application

A modern real-time chat application built with the MERN stack (MongoDB, Express.js, React, Node.js), featuring WebSocket communication, message persistence, and a beautiful responsive UI.

![Connect Chat](https://img.shields.io/badge/Connect%20Chat-v1.0.0-00b4d8)

## Features

- 🔐 **User Authentication** - Secure signup/login with email and password (JWT-based)
- 💬 **Real-time Messaging** - Instant message delivery with Socket.IO WebSocket technology
- 📢 **Chat Rooms** - Create and join public/private chat rooms
- 👥 **Direct Messages** - Private one-on-one conversations
- 📎 **Media Sharing** - Send images and files (images, PDFs, documents)
- 💾 **Message Persistence** - All messages are saved in MongoDB for chat history
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- 🌙 **Dark Theme** - Modern dark UI with teal accents

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | ^18.3.1 | Frontend framework |
| TypeScript | ^5.8.3 | Type-safe JavaScript |
| Vite | ^5.4.19 | Build tool & dev server |
| Tailwind CSS | ^3.4.17 | Utility-first CSS |
| Framer Motion | ^12.26.2 | Animations |
| React Router | ^6.30.1 | Client-side routing |
| Socket.IO Client | ^4.6.1 | WebSocket client for real-time communication |
| shadcn/ui | latest | UI component library |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | >=18.0.0 | JavaScript runtime |
| Express.js | ^4.18.2 | Web server framework |
| MongoDB | Latest | NoSQL database |
| Mongoose | ^8.0.3 | MongoDB object modeling |
| Socket.IO | ^4.6.1 | WebSocket server for real-time communication |
| JWT | ^9.0.2 | Authentication tokens |
| bcryptjs | ^2.4.3 | Password hashing |
| Multer | ^1.4.5 | File upload handling |

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0 (LTS recommended)
- **npm** >= 9.0.0 or **yarn** >= 1.22.0
- **MongoDB** >= 6.0.0 (local installation or MongoDB Atlas account)

Check your versions:
```bash
node --version
npm --version
mongod --version  # If MongoDB is installed locally
```

> 📖 **New to MongoDB Atlas?** Check out the detailed step-by-step guide: [MONGODB_ATLAS_SETUP.md](./MONGODB_ATLAS_SETUP.md)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <YOUR_GIT_URL>
cd connect-chat-main
```

### 2. Backend Setup

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/connect-chat
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLIENT_URL=http://localhost:5173
```

**Note:** 
- If using MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string
- Change `JWT_SECRET` to a secure random string in production
- Create the `uploads` directory in the server folder: `mkdir server/uploads`

Start the backend server:

```bash
npm run dev
```

The server will run on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal, navigate to the project root, and install dependencies:

```bash
npm install
```

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 4. MongoDB Setup

#### Option A: MongoDB Atlas (Cloud) - Recommended

**📖 For detailed step-by-step instructions, see: [MONGODB_ATLAS_SETUP.md](./MONGODB_ATLAS_SETUP.md)**

Quick steps:
1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new M0 FREE cluster
3. Create a database user and whitelist your IP (or 0.0.0.0/0 for development)
4. Get your connection string and add it to `server/.env`

#### Option B: Local MongoDB

1. Install MongoDB locally from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS (with Homebrew)
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```
3. Use connection string: `mongodb://localhost:27017/connect-chat`

## Available Scripts

### Frontend
| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality |
| `npm run test` | Run test suite |

### Backend
| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with nodemon (auto-restart) |

## Project Structure

```
connect-chat-main/
├── server/                 # Backend server
│   ├── models/             # MongoDB models (User, Room, Message, DirectMessage)
│   ├── routes/             # API routes (auth, rooms, messages, upload)
│   ├── middleware/         # Authentication middleware
│   ├── socket/             # Socket.IO configuration
│   ├── uploads/            # Uploaded files directory
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── chat/           # Chat-specific components
│   │   └── ui/             # shadcn/ui components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions and API client
│   ├── pages/              # Page components
│   ├── App.tsx             # Root component
│   ├── index.css           # Global styles
│   └── main.tsx            # Entry point
├── tailwind.config.ts      # Tailwind configuration
├── vite.config.ts          # Vite configuration
└── package.json            # Frontend dependencies
```

## Database Schema

The application uses MongoDB with the following collections:

### Users
- `_id`: ObjectId
- `name`: String (required)
- `email`: String (required, unique)
- `password`: String (hashed, required)
- `avatar`: String (optional)
- `online`: Boolean
- `lastSeen`: Date
- `createdAt`: Date
- `updatedAt`: Date

### Rooms
- `_id`: ObjectId
- `name`: String (required, unique)
- `description`: String
- `type`: String (enum: 'public', 'private')
- `createdBy`: ObjectId (ref: User)
- `members`: [ObjectId] (ref: User)
- `lastMessage`: ObjectId (ref: Message)
- `lastMessageAt`: Date
- `createdAt`: Date
- `updatedAt`: Date

### Messages
- `_id`: ObjectId
- `content`: String (optional if media exists)
- `sender`: ObjectId (ref: User, required)
- `room`: ObjectId (ref: Room, required if not directMessage)
- `directMessage`: ObjectId (ref: DirectMessage, required if not room)
- `media`: Object (optional)
  - `url`: String
  - `type`: String (enum: 'image', 'file')
  - `filename`: String
  - `size`: Number
- `readBy`: [Object] (optional)
- `createdAt`: Date
- `updatedAt`: Date

### DirectMessages
- `_id`: ObjectId
- `participants`: [ObjectId] (ref: User, exactly 2)
- `lastMessage`: ObjectId (ref: Message)
- `lastMessageAt`: Date
- `createdAt`: Date
- `updatedAt`: Date

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Rooms
- `GET /api/rooms` - Get all rooms user is member of
- `POST /api/rooms` - Create a new room
- `GET /api/rooms/:id` - Get a single room
- `POST /api/rooms/:id/join` - Join a room

### Messages
- `GET /api/messages/room/:roomId` - Get messages for a room
- `GET /api/messages/dm/:dmId` - Get messages for a direct message conversation

### Upload
- `POST /api/upload` - Upload a file (images, documents)

## WebSocket Events

### Client → Server
- `join-room` - Join a room
- `leave-room` - Leave a room
- `send-message` - Send a message to a room
- `send-direct-message` - Send a direct message
- `typing` - Indicate user is typing
- `stop-typing` - Indicate user stopped typing

### Server → Client
- `new-message` - New message in a room
- `new-direct-message` - New direct message
- `user-online` - User came online
- `user-offline` - User went offline
- `user-joined-room` - User joined a room
- `user-left-room` - User left a room
- `user-typing` - User is typing
- `user-stop-typing` - User stopped typing

## Deployment

### Backend Deployment

1. Set environment variables on your hosting platform
2. Ensure MongoDB is accessible (use MongoDB Atlas for cloud)
3. Deploy to platforms like:
   - Heroku
   - Railway
   - Render
   - AWS EC2
   - DigitalOcean

### Frontend Deployment

1. Build the production bundle:
   ```bash
   npm run build
   ```

2. Deploy the `dist/` folder to:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - Firebase Hosting

3. Update `VITE_API_URL` in production environment variables

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or Atlas connection string is correct
- Check firewall settings if using Atlas
- Verify network access in Atlas IP whitelist

### Socket.IO Connection Issues
- Ensure backend server is running
- Check CORS settings in `server.js`
- Verify `CLIENT_URL` matches your frontend URL

### File Upload Issues
- Ensure `server/uploads` directory exists
- Check file size limits (default: 10MB)
- Verify file types are allowed

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

---

Built with ❤️ using MongoDB, Express.js, React, and Node.js
