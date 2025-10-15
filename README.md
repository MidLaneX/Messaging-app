<div align="center">

# 💬 Real-Time Messaging Application

### A modern, feature-rich messaging platform with real-time communication

[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![WebSocket](https://img.shields.io/badge/WebSocket-STOMP-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://stomp-js.github.io/stomp-websocket/)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Architecture](#-architecture) • [Contributing](#-contributing)

</div>

---

## 📖 Overview

A production-ready messaging application inspired by WhatsApp, featuring real-time communication through WebSocket, modern UI/UX design, and seamless integration with authentication services. Built with React 19, TypeScript, and Tailwind CSS for optimal performance and developer experience.

## ⚠️ Prerequisites

Before running this application, ensure you have:

- **Node.js** v16 or higher installed
- **npm** or **pnpm** package manager
- **Backend Services** running:
  - Main app backend on `http://localhost:8080` (Authentication service)
  - Collab service backend on `http://localhost:8090` (Messaging service)
- **User Account** registered in both systems with matching credentials

> 📚 For detailed setup instructions, see [docs/STARTUP_TROUBLESHOOTING.md](docs/STARTUP_TROUBLESHOOTING.md)

## 🚀 Quick Start

### 1️⃣ Clone and Install

```bash
# Clone the repository
git clone https://github.com/MidLaneX/Messaging-app.git
cd messaging-app

# Install dependencies
npm install
# or using pnpm (recommended)
pnpm install
```

### 2️⃣ Configure Environment

```bash
# Create environment file
cp .env .env.local

# Edit .env.local with your backend URLs
REACT_APP_API_URL="http://localhost:8090"
REACT_APP_WS_URL="ws://localhost:8090"
REACT_APP_MAIN_API_URL="http://localhost:8080"
```

### 3️⃣ Start Development Server

```bash
npm start
# or
pnpm start
```

The app will open at [http://localhost:3000](http://localhost:3000) 🎉

### 4️⃣ Login

Use your existing credentials from the main application to log in.

## ✨ Features

### Core Functionality
- 💬 **Real-Time Messaging** - Instant message delivery with WebSocket/STOMP protocol
- 👥 **User Management** - Browse users, see online status, and start conversations
- 🔐 **Secure Authentication** - Integrated with main app's authentication system
- 🔄 **Dual User ID System** - Automatic mapping between auth and messaging services
- 📱 **Responsive Design** - Seamless experience across desktop, tablet, and mobile

### User Experience
- 🎨 **Modern UI** - WhatsApp-inspired interface with smooth animations
- 🔔 **Message Status** - Sent, delivered, and read indicators
- 📅 **Smart Date Separators** - Organized message timeline
- 🎭 **Emoji Support** - Express yourself with emojis
- ⚡ **Fast Performance** - Optimized rendering and state management

### Advanced Features
- 📁 **File Attachments** - Share documents, images, and media
- 👥 **Group Chats** - Communicate with multiple users simultaneously
- 🔍 **Message Search** - Find past conversations quickly
- 📊 **Online Indicators** - Real-time user presence tracking
- 🌐 **Cross-Platform** - Works on all modern browsers

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Application                      │
│                    (React + TypeScript)                      │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               │ REST API                     │ WebSocket
               │ (Authentication)             │ (Real-time Messages)
               ▼                              ▼
    ┌──────────────────┐           ┌──────────────────────┐
    │   Main Backend   │           │  Collab Service      │
    │   Port: 8080     │           │  Port: 8090          │
    │                  │           │                      │
    │ • Authentication │           │ • Messaging          │
    │ • User Service   │◄─────────►│ • WebSocket Server   │
    │ • Authorization  │  Sync     │ • User Mapping       │
    └──────────────────┘           └──────────────────────┘
```

### Authentication Flow

This application implements a **dual user ID system** for seamless integration:

1. **User logs in** with credentials → Main App Backend authenticates
2. **JWT token** is issued → Frontend stores token
3. **User ID mapping** → Automatically maps Main App User ID ↔ Collab Service User ID
4. **WebSocket connection** → Established with Collab Service using mapped ID
5. **Messages sent/received** → Using Collab Service User ID transparently

> 📘 For detailed authentication documentation, see [docs/AUTHENTICATION_INTEGRATION.md](docs/AUTHENTICATION_INTEGRATION.md)

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.1 | UI Framework |
| **TypeScript** | 4.9.5 | Type Safety |
| **Tailwind CSS** | 3.4.0 | Styling |
| **Axios** | 1.11.0 | HTTP Client |
| **STOMP.js** | 7.1.1 | WebSocket Protocol |
| **Lucide React** | 0.537.0 | Icon Library |

### Development Tools
- **Create React App** - Build tooling and configuration
- **ESLint** - Code linting and quality checks
- **TypeScript Strict Mode** - Enhanced type checking
- **AWS SDK** - S3 file storage integration

### Backend Integration
- **REST API** - HTTP/HTTPS communication
- **WebSocket** - Real-time bidirectional communication
- **JWT Authentication** - Secure token-based auth

## 📁 Project Structure

```
messaging-app/
├── 📂 public/                    # Static assets
│   ├── index.html               # HTML template
│   ├── manifest.json            # PWA manifest
│   └── robots.txt               # SEO configuration
│
├── 📂 src/
│   ├── 📂 components/           # React components
│   │   ├── 📂 Layout/          # Layout wrappers (Header, Sidebar)
│   │   ├── 📂 UI/              # Reusable UI components
│   │   ├── AuthPage.tsx        # Authentication interface
│   │   ├── ChatWindow.tsx      # Main chat interface
│   │   ├── MessageItem.tsx     # Message bubble component
│   │   └── UserList.tsx        # User sidebar
│   │
│   ├── 📂 services/            # API and business logic
│   │   ├── authService.ts      # Authentication service
│   │   ├── userMappingService.ts # User ID mapping
│   │   ├── ws.ts               # WebSocket service
│   │   └── api.ts              # HTTP API client
│   │
│   ├── 📂 context/             # React Context providers
│   │   └── UserContext.tsx     # User state management
│   │
│   ├── 📂 hooks/               # Custom React hooks
│   │   ├── useMessages.ts      # Message operations
│   │   └── useUsers.ts         # User management
│   │
│   ├── 📂 types/               # TypeScript definitions
│   │   └── index.ts            # Shared types (User, Message, etc.)
│   │
│   ├── 📂 utils/               # Helper functions
│   │   ├── dateUtils.ts        # Date formatting
│   │   └── helpers.ts          # General utilities
│   │
│   ├── 📂 constants/           # App configuration
│   │   └── index.ts            # Constants and config
│   │
│   ├── App.tsx                 # Root component
│   └── index.tsx               # Entry point
│
├── 📂 docs/                    # Documentation
│   ├── AUTHENTICATION_INTEGRATION.md
│   ├── ENVIRONMENT_SETUP.md
│   ├── MOBILE_FEATURES.md
│   └── PERFORMANCE_OPTIMIZATION.md
│
├── 📂 build/                   # Production build (generated)
├── package.json                # Dependencies and scripts
├── tailwind.config.js          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Collab Service Backend (Messaging)
REACT_APP_API_URL=http://localhost:8090
REACT_APP_WS_URL=ws://localhost:8090

# Main App Backend (Authentication)
REACT_APP_MAIN_API_URL=http://localhost:8080

# Optional: AWS S3 Configuration (for file uploads)
REACT_APP_AWS_REGION=us-east-1
REACT_APP_AWS_BUCKET=your-bucket-name
```

### Environment Files

| File | Purpose | Usage |
|------|---------|-------|
| `.env` | Default values | Development defaults |
| `.env.local` | Local overrides | Local development (gitignored) |
| `.env.development` | Development | `npm start` |
| `.env.production` | Production | `npm run build` |

### Production Deployment

1. **Update production environment variables:**
   ```env
   REACT_APP_API_URL=https://api.yourdomain.com
   REACT_APP_WS_URL=wss://api.yourdomain.com
   REACT_APP_MAIN_API_URL=https://auth.yourdomain.com
   ```

2. **Build the application:**
   ```bash
   npm run build:prod
   ```

3. **Deploy the `build/` directory** to your hosting service (Vercel, Netlify, S3, etc.)

4. **Configure CORS** on your backend to allow requests from your frontend domain

> 📖 Detailed deployment guide: [docs/ENVIRONMENT_SETUP.md](docs/ENVIRONMENT_SETUP.md)

## 📜 Available Scripts

```bash
# Start development server (http://localhost:3000)
npm start

# Create optimized production build
npm run build

# Build and analyze bundle size
npm run build:analyze

# Production build with optimizations (no source maps)
npm run build:prod

# Run test suite
npm test

# Eject from Create React App (⚠️ irreversible)
npm run eject
```

## 🎨 Customization

### Theme Customization

Modify the WhatsApp-inspired color scheme in `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        whatsapp: {
          green: '#25d366',
          'green-dark': '#1da851',
          'green-light': '#dcf8c6',
          teal: '#075e54',
          'teal-light': '#128c7e',
          blue: '#34b7f1',
          gray: {
            light: '#ece5dd',
            DEFAULT: '#d9dbd5',
            dark: '#2a2f32',
          }
        }
      }
    }
  }
}
```

### Component Styling

All components use Tailwind CSS utility classes for consistent styling:
- Responsive breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Dark mode support: `dark:` prefix (ready for implementation)
- Custom animations defined in `tailwind.config.js`

## 📚 Documentation

Comprehensive guides available in the `docs/` directory:

| Document | Description |
|----------|-------------|
| [Authentication Integration](docs/AUTHENTICATION_INTEGRATION.md) | Dual user ID system explained |
| [Environment Setup](docs/ENVIRONMENT_SETUP.md) | Detailed configuration guide |
| [Mobile Features](docs/MOBILE_FEATURES.md) | Mobile-specific functionality |
| [Performance Optimization](docs/PERFORMANCE_OPTIMIZATION.md) | Performance best practices |

## 🧪 Testing

```bash
# Run test suite
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

### Testing Stack
- **Jest** - Test runner and assertion library
- **React Testing Library** - Component testing utilities
- **User Event** - User interaction simulation

## 🚧 Troubleshooting

### Common Issues

**1. Cannot connect to backend**
```bash
# Verify backends are running
curl http://localhost:8080/health
curl http://localhost:8090/health

# Check environment variables
cat .env.local
```

**2. WebSocket connection failed**
- Ensure WebSocket URL uses `ws://` for HTTP or `wss://` for HTTPS
- Check CORS configuration on backend
- Verify firewall allows WebSocket connections

**3. Authentication errors**
- Clear browser cache and local storage
- Verify JWT token is not expired
- Check user exists in both main app and collab service

**4. Build errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf build
npm run build
```

> 📖 For more troubleshooting help, see the documentation in the `docs/` folder

## 🔮 Roadmap & Future Enhancements

### In Progress ✅
- [x] Real-time messaging with WebSocket
- [x] User authentication integration
- [x] File attachments
- [x] Group chat support
- [x] Message status indicators

### Planned Features 🚀
- [ ] 🌙 **Dark Mode** - System preference support
- [ ] 🎤 **Voice Messages** - Record and send audio
- [ ] 📹 **Video Calls** - WebRTC integration
- [ ] 🔍 **Advanced Search** - Search across all conversations
- [ ] ⭐ **Message Reactions** - React with emojis
- [ ] 📌 **Pinned Messages** - Pin important messages
- [ ] 🔒 **End-to-End Encryption** - Enhanced security
- [ ] 📱 **Push Notifications** - Web Push API
- [ ] 👤 **User Profiles** - Rich user information
- [ ] 📊 **Read Receipts** - Detailed message analytics
- [ ] 🌍 **Internationalization** - Multi-language support
- [ ] 📥 **Message Export** - Download chat history

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
   ```bash
   gh repo fork MidLaneX/Messaging-app
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Write clean, documented code
   - Follow the existing code style
   - Add tests for new features

4. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
   
   Follow [Conventional Commits](https://www.conventionalcommits.org/) format:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes
   - `refactor:` - Code refactoring
   - `test:` - Test additions/updates
   - `chore:` - Build process or tooling changes

5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Provide a clear description of changes
   - Link any related issues
   - Ensure all tests pass

### Development Guidelines

- **Code Quality**: Run `npm test` and ensure all tests pass
- **TypeScript**: Maintain strict type safety
- **Styling**: Use Tailwind CSS utility classes
- **Components**: Keep components small and focused
- **Documentation**: Update docs for significant changes

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **UI/UX Design** - Inspired by WhatsApp Web
- **Icons** - [Lucide React](https://lucide.dev/) icon library
- **Framework** - Built with [Create React App](https://create-react-app.dev/)
- **Styling** - Powered by [Tailwind CSS](https://tailwindcss.com/)
- **Real-time Communication** - [STOMP.js](https://stomp-js.github.io/) WebSocket library

## 📞 Support

Need help? Here are some resources:

- 📖 **Documentation**: Check the `docs/` folder
- 🐛 **Bug Reports**: [Open an issue](https://github.com/MidLaneX/Messaging-app/issues)
- 💡 **Feature Requests**: [Start a discussion](https://github.com/MidLaneX/Messaging-app/discussions)
- 📧 **Contact**: Reach out to the maintainers

---

<div align="center">

**Built with ❤️ using React, TypeScript, and Tailwind CSS**

[![GitHub stars](https://img.shields.io/github/stars/MidLaneX/Messaging-app?style=social)](https://github.com/MidLaneX/Messaging-app/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/MidLaneX/Messaging-app?style=social)](https://github.com/MidLaneX/Messaging-app/network/members)

[⬆ Back to Top](#-real-time-messaging-application)

</div>