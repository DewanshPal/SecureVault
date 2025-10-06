# SecureVault - Password Manager

A secure, privacy-first password manager built with Next.js 15, featuring client-side encryption and a beautiful modern interface.

## 🔒 Features

### Must-haves ✅
- **Password Generator** - Customizable length, character types, exclude look-alikes
- **Simple Authentication** - Email + password with JWT tokens
- **Secure Vault** - Store title, username, password, URL, and notes
- **Client-side Encryption** - All vault data is encrypted on your device using AES encryption
- **Copy to Clipboard** - Auto-clear after 15 seconds for security
- **Search & Filter** - Find your vault items quickly

### Nice-to-haves ✅
- **Dark Mode** - Toggle between light and dark themes
- **Tags/Folders** - Organize your vault items with tags
- **Responsive Design** - Works perfectly on mobile and desktop

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB with Mongoose
- **Authentication**: JWT tokens with bcrypt password hashing
- **Encryption**: AES encryption with crypto-js (client-side)
- **Icons**: Lucide React

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd securevault
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your MongoDB connection string:
   ```env
   MONGODB_URI=mongodb://localhost:27017/securevault
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

4. **Start MongoDB** (if running locally)
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   
   # Or install MongoDB locally
   # https://docs.mongodb.com/manual/installation/
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Security Features

### Client-Side Encryption
- All sensitive vault data is encrypted on your device before being sent to the server
- Encryption key is derived from your password and email using PBKDF2
- Server never sees your plaintext passwords or personal information
- Each user has a unique encryption key

### Password Security
- Passwords are hashed using bcrypt with 12 rounds
- JWT tokens expire after 24 hours
- Clipboard auto-clears after 15 seconds

### Privacy First
- No analytics or tracking
- Minimal data collection
- Open source and transparent

## 📱 Usage

### Creating an Account
1. Click "Sign up" on the login page
2. Enter your email, password, and name
3. Your account is created with client-side encryption automatically set up

### Adding Vault Items
1. Click the "Add Item" button
2. Fill in the details (title is required)
3. Use the built-in password generator for secure passwords
4. Add tags to organize your items
5. All data is encrypted before saving

### Password Generator
- Adjust length with the slider (8-128 characters)
- Toggle character types (uppercase, lowercase, numbers, symbols)
- Option to exclude similar-looking characters (i, l, 1, L, o, 0, O)
- Real-time password strength indicator

### Search and Filter
- Use the search box to find items by title, username, URL, or tags
- Results update in real-time as you type

## 🌙 Dark Mode

Toggle between light and dark themes using the moon/sun icon in the header. Your preference is saved locally.

## 🔧 Development

### Project Structure
```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
├── helper/            # Context providers
├── lib/               # Utilities and configuration
└── model/             # Database models
```

### Key Components
- `AuthContext.tsx` - Authentication state management
- `VaultDashboard.tsx` - Main application interface
- `PasswordGenerator.tsx` - Password generation utility
- `VaultItemForm.tsx` - Add/edit vault items
- `AuthForm.tsx` - Login/signup forms

### API Routes
- `/api/auth/login` - User authentication
- `/api/auth/register` - User registration
- `/api/vault` - CRUD operations for vault items
- `/api/vault/[id]` - Individual vault item operations

## 🧪 Testing the App

1. **Sign up** with a new account
2. **Add a vault item** with the password generator
3. **Verify encryption** - Check the database to see only encrypted blobs
4. **Test copy functionality** - Copy passwords and verify auto-clear
5. **Search functionality** - Add multiple items and test search

## 📦 Building for Production

```bash
npm run build
npm start
```

## 🚢 Deployment

The app can be deployed to any platform that supports Node.js:

- **Vercel** (recommended for Next.js)
- **Railway**
- **Heroku**
- **DigitalOcean App Platform**

Remember to:
1. Set up a production MongoDB database
2. Configure environment variables
3. Change the JWT secret to a strong random value

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Note**: This is a demonstration application. For production use, consider additional security measures like 2FA, audit logging, and regular security reviews.
