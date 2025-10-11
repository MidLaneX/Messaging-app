# Messaging App

A modern, WhatsApp-inspired messaging application built with React, TypeScript, and Tailwind CSS with real-time WebSocket communication.

## ⚠️ Important: Authentication Setup Required

This messaging app now integrates with the main app's authentication system. Before running, you **MUST**:

1. **Start the main app backend** (port 8080) - Provides authentication
2. **Start the collab service backend** (port 8090) - Provides messaging
3. **Have a user account** in both systems with matching user IDs

See [docs/STARTUP_TROUBLESHOOTING.md](docs/STARTUP_TROUBLESHOOTING.md) for detailed setup instructions.

## Quick Start

```bash
# 1. Ensure both backends are running
# Main app: http://localhost:8080
# Collab service: http://localhost:8090

# 2. Install dependencies
npm install

# 3. Configure environment (already set up for local dev)
# Check .env.local for API URLs

# 4. Start the app
npm start

# 5. Open http://localhost:3000 and login with your credentials
```

## Features

- 🎨 Modern, responsive UI inspired by WhatsApp
- 💬 Real-time messaging with WebSocket support
- 👥 User list with online status indicators
- 🔐 **NEW**: Integrated authentication with main app
- 🔄 **NEW**: Automatic user mapping between services
- 📱 Mobile-first responsive design
- ⚡ Fast and smooth animations
- 🔔 Message status indicators (sent, delivered, read)
- 📅 Smart date separators
- 🎭 Emoji support
- 📁 File attachments
- 👥 Group chat support

## Authentication Architecture

This app uses a **dual user ID system**:

- **Main App User ID**: For authentication (from main app's user service)
- **Collab Service User ID**: For messaging operations (from collab service)

The mapping is automatic and transparent to users. See [docs/AUTHENTICATION_INTEGRATION.md](docs/AUTHENTICATION_INTEGRATION.md) for details.

## Tech Stack

- **Frontend**: React 19+ with TypeScript
- **Styling**: Tailwind CSS with custom WhatsApp-inspired theme
- **Real-time Communication**: WebSocket with STOMP protocol
- **HTTP Client**: Axios for API calls
- **Authentication**: Integrated with main app's auth service
- **Build Tool**: Create React App
- **Package Manager**: npm/pnpm
- **Code Quality**: ESLint, TypeScript strict mode

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Layout/          # Layout components (Header, Sidebar, etc.)
│   ├── UI/              # Basic UI components (Button, Input, Avatar)
│   ├── AuthPage.tsx     # ✨ NEW: Login/Register page
│   ├── ChatWindow.tsx   # Main chat interface
│   ├── MessageItem.tsx  # Individual message component
│   └── UserList.tsx     # User sidebar component
├── services/            # API services
│   ├── authService.ts   # ✨ NEW: Main app authentication
│   ├── userMappingService.ts  # ✨ NEW: User ID mapping
│   ├── ws.ts            # WebSocket service
│   └── api.ts           # Service interfaces
├── context/             # React Context
│   └── UserContext.tsx  # ✨ UPDATED: Dual user ID management
├── hooks/               # Custom React hooks
│   ├── useMessages.ts   # Message state management
│   └── useUsers.ts      # User state management
├── types/               # TypeScript type definitions
│   └── index.ts         # Shared types (User, Message, etc.)
├── utils/               # Utility functions
│   ├── dateUtils.ts     # Date formatting utilities
│   └── helpers.ts       # General helper functions
├── constants/           # App configuration and constants
│   └── index.ts         # App config, routes, etc.
└── docs/                # ✨ NEW: Documentation
    ├── AUTHENTICATION_INTEGRATION.md
    ├── AUTH_UPDATE_SUMMARY.md
    ├── QUICK_START.md
    └── STARTUP_TROUBLESHOOTING.md
````

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd messaging-app
```

2. Install dependencies:
```bash
pnpm install
# or
npm install
```

3. Configure environment variables:
```bash
# Copy the example environment file
cp .env .env.local

# Edit .env.local with your backend URLs
# REACT_APP_API_URL="http://localhost:8090"
# REACT_APP_WS_URL="ws://localhost:8090"
```

4. Start the development server:
```bash
pnpm start
# or
npm start
```

5. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Environment Configuration

The application uses environment variables to configure API endpoints for different environments:

### Required Environment Variables

- `REACT_APP_API_URL` - Base URL for REST API calls
- `REACT_APP_WS_URL` - WebSocket URL for real-time messaging

### Environment Files

- `.env` - Default configuration (local development)
- `.env.development` - Development environment
- `.env.production` - Production environment

### Production Setup

1. Update `.env.production` with your production URLs:
```properties
REACT_APP_API_URL="https://your-api.com"
REACT_APP_WS_URL="wss://your-api.com"
```

2. Build for production:
```bash
pnpm build
```

3. Deploy the `build/` folder to your web server.

For detailed environment setup instructions, see [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md).

### Environment Verification

Run the environment check script to verify your configuration:
```bash
./scripts/check-environment.sh
```

## Available Scripts

- `pnpm start` - Runs the app in development mode
- `pnpm build` - Builds the app for production
- `pnpm test` - Launches the test runner
- `pnpm eject` - Ejects from Create React App (⚠️ irreversible)

## Key Features Explanation

### Component Architecture

The app uses a modular component architecture with:

- **Layout Components**: Provide consistent structure across the app
- **UI Components**: Reusable components like buttons, inputs, avatars
- **Feature Components**: Chat-specific components like ChatWindow, UserList

### State Management

Custom hooks manage application state:

- `useMessages`: Handles message operations (send, read, filter)
- `useUsers`: Manages user data and selection state

### Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Custom Theme**: WhatsApp-inspired color palette and animations
- **Responsive Design**: Mobile-first approach with responsive breakpoints

### Type Safety

- **TypeScript**: Full type coverage for better development experience
- **Interface Definitions**: Clear contracts for data structures
- **Type-safe Hooks**: Custom hooks with proper TypeScript generics

## Customization

### Colors

Modify the WhatsApp-inspired theme in `tailwind.config.js`:

```javascript
colors: {
  whatsapp: {
    green: '#25d366',
    'green-dark': '#1da851',
    // ... other colors
  }
}
```

### Mock Data

Update sample data in `src/data/mockData.ts` to test different scenarios.

## Future Enhancements

- [ ] Real-time messaging with WebSocket integration
- [ ] File and image sharing
- [ ] Voice messages
- [ ] Group chats
- [ ] Message reactions
- [ ] Dark mode
- [ ] Push notifications
- [ ] Message search
- [ ] User profiles
- [ ] Message encryption

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- UI/UX inspired by WhatsApp Web
- Icons and emojis from system defaults
- Built with Create React App and Tailwind CSS


./deploy.sh