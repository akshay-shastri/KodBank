# 🏦 KodBank - Ultra-Premium Banking Platform

A modern, secure, and elegant banking application built with Next.js, featuring ultra-premium glassmorphism UI and enterprise-grade security.

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

## ✨ Features

### 🔐 Security
- **httpOnly Cookie Authentication** - JWT tokens stored securely in httpOnly cookies
- **Rate Limiting** - Protection against brute force attacks
- **Environment Validation** - Startup checks for required configuration
- **Structured Logging** - Complete audit trail for all transactions
- **Atomic Transactions** - MongoDB sessions ensure data consistency

### 💎 Premium UI/UX
- **Ultra-Premium Glassmorphism** - Frosted glass panels with layered depth
- **Dark Theme** - Elegant dark mode with ambient lighting
- **Smooth Animations** - Micro-interactions and transitions
- **Responsive Design** - Works seamlessly on all devices
- **Privacy Toggle** - Hide/show balance with eye icon
- **Profile Menu** - Elegant dropdown with logout functionality

### 💰 Banking Features
- **Account Management** - View balance and account details
- **Deposits** - Add funds to your account
- **Withdrawals** - Withdraw funds securely
- **Transfers** - Send money to other accounts
- **Transaction History** - View all your transactions with filters
- **Real-time Updates** - Instant balance updates

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- npm/yarn/pnpm

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/kodbank.git
cd kodbank
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create `.env.local` file in the root directory:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your-secret-key-min-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-characters
NODE_ENV=development
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
```
http://localhost:3000
```

## 🏗️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB Atlas** - Cloud database
- **Mongoose** - MongoDB ODM
- **JWT** - Secure authentication

### Security
- **bcrypt** - Password hashing
- **Zod** - Input validation
- **Rate Limiting** - Request throttling
- **httpOnly Cookies** - XSS protection

## 📁 Project Structure

```
kodbank/
├── app/
│   ├── api/
│   │   ├── auth/          # Authentication endpoints
│   │   ├── account/       # Account operations
│   │   └── transactions/  # Transaction history
│   ├── dashboard/         # Main dashboard
│   ├── login/            # Login page
│   └── signup/           # Signup page
├── components/           # Reusable components
├── lib/                  # Utilities and helpers
├── models/              # MongoDB schemas
└── middleware.ts        # Route protection
```

## 🔒 Security Features

### Authentication
- JWT access tokens (15 min expiry)
- JWT refresh tokens (7 days expiry)
- httpOnly cookies (XSS protection)
- SameSite=Strict (CSRF protection)

### Rate Limiting
- Login: 5 requests/minute per IP
- Transfer: 10 requests/minute per IP
- Automatic cleanup of expired entries

### Data Protection
- Password hashing with bcrypt
- Input validation with Zod
- Atomic MongoDB transactions
- Structured audit logging

## 🎨 Design System

### Glassmorphism Layers
- **Background**: Deep gradient (slate → indigo → black)
- **Ambient Glows**: Soft radial highlights
- **Glass Cards**: Frosted panels with backdrop blur
- **Interactive Elements**: Semi-transparent with hover effects

### Color Palette
- **Primary**: Indigo (600-500)
- **Accent**: Purple (600-500)
- **Success**: Green (400)
- **Error**: Red (400)
- **Info**: Blue (400)

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Account
- `GET /api/account/me` - Get account details
- `POST /api/account/deposit` - Deposit funds
- `POST /api/account/withdraw` - Withdraw funds
- `POST /api/account/transfer` - Transfer funds

### Transactions
- `GET /api/transactions` - Get transaction history

## 🧪 Development

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Lint Code
```bash
npm run lint
```

## 🚢 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker
```bash
docker build -t kodbank .
docker run -p 3000:3000 kodbank
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
