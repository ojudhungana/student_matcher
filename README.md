<<<<<<< HEAD
<<<<<<< HEAD
# student_matcher

# install Node.js LTS

# put the .env in the backend_evan folder (same place as package.json)

# command line
# cd into backend_evan folder
# npm install
# npm run build; npm start

# Open http://localhost:4000/health -> you should see {"ok":true}
=======
# ChargerCircle - Frontend
=======
# ChargerCircle - Frontend
>>>>>>> ff58fc09 (Update README.md)

A modern Tinder-style college student matching app built with React + TypeScript. Find study buddies, make friends, and connect with fellow students based on shared classes, interests, and compatibility.

## 🚀 Features

- **University Authentication**: Secure login via Supabase OAuth + Campus SSO
- **Smart Matching**: Find students based on shared classes, interests, and compatibility
- **Tinder-Style Interface**: Swipe to connect or skip potential matches
- **Real-time Connections**: Manage your connections and chat with matches
- **Profile Management**: Complete profile setup with interests and classes
- **Mobile-First Design**: Responsive UI optimized for mobile devices

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: TailwindCSS
- **Animations**: Framer Motion
- **Routing**: React Router v6
- **Authentication**: Supabase Auth
- **HTTP Client**: Axios
- **Testing**: Vitest + React Testing Library
- **Build Tool**: Vite
- **Linting**: ESLint + Prettier

## 📦 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Input, etc.)
│   ├── layout/         # Layout components (Header, Navigation)
│   ├── auth/           # Authentication components
│   └── match/          # Match-specific components
├── pages/              # Main application screens
├── hooks/              # Custom React hooks
├── contexts/           # React contexts (Auth, etc.)
├── services/           # API service layer
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── config/             # Configuration files
└── test/               # Testing utilities and setup
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ...
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_API_BASE_URL=http://localhost:3001/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🧪 Testing

Run the test suite:
```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm test -- --coverage
```

## 🏗️ Building for Production

```bash
# Build the project
npm run build

# Preview the production build
npm run preview
```

## 📱 Development Features

### Mock Data Mode
In development, the app uses mock data to simulate API responses. This allows for:
- Offline development
- Consistent test data
- No backend dependency during frontend development

### Hot Reload
The development server includes hot module replacement for instant updates during development.

### TypeScript Integration
Full TypeScript support with strict type checking and IntelliSense.

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🎨 Design System

The app uses a consistent design system built with TailwindCSS:

### Colors
- **Primary**: Red/Pink theme (`primary-*`)
- **Secondary**: Gray theme (`secondary-*`)
- **Success**: Green (`green-*`)
- **Warning**: Yellow (`yellow-*`)
- **Error**: Red (`red-*`)

### Components
All components follow a consistent API pattern with:
- TypeScript interfaces for props
- Consistent styling with Tailwind classes
- Accessibility features built-in
- Mobile-first responsive design

## 🔐 Authentication

The app supports multiple authentication methods:

1. **University OAuth**: Google OAuth with university email verification
2. **Email/Password**: Traditional email authentication
3. **Development Mode**: Mock authentication for testing

## 📄 API Integration

The app is designed to work with a REST API backend. In development mode, it uses mock data. Key endpoints include:

- `GET /api/match/suggestions` - Get match suggestions
- `POST /api/match/connect` - Send connection request
- `GET /api/connections` - Get user connections
- `GET/PUT /api/profile` - Profile management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow the existing component patterns
- Write tests for new features
- Use meaningful commit messages
- Ensure all linting passes

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For questions or issues:
1. Check the existing issues
2. Create a new issue with detailed description
3. Include steps to reproduce any bugs

## 🎯 Roadmap

- [ ] Real-time messaging
- [ ] Video call integration
- [ ] Event planning features
- [ ] Study group formation
- [ ] Campus map integration
- [ ] Push notifications
- [ ] Dark mode support
>>>>>>> 3510a55f (First working version)
