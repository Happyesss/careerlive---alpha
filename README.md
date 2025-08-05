# 🎯 CareerLive - Professional Video Mentoring Platform

<div align="center">

*A modern, secure mentoring platform with integrated video conferencing for career development*

[![Next.js](https://img.shields.io/badge/Next.js-15.4.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1.0-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

</div>

---

## 🌟 Overview

CareerLive is a comprehensive mentoring platform that connects mentees with mentors through seamless video conferencing and intelligent booking management. Built with cutting-edge web technologies, it provides a professional environment for career guidance, skill development, and knowledge sharing.

### ✨ Key Features

- **🎥 HD Video Meetings** - Crystal clear communication powered by Stream.io
- **👥 Mentor-Mentee Matching** - Smart booking system connecting the right people
- **📅 Smart Scheduling** - Intelligent calendar management with email notifications
- **🔒 Secure Authentication** - JWT-based auth with role-based access control
- **📱 Mobile Responsive** - Optimized experience across all devices
- **📧 Email Integration** - Automated notifications and confirmations
- **🎛️ Meeting Controls** - Screen sharing, recording, and participant management

---

## 🚀 Core Features

### 🔐 **Authentication & User Management**
- **Secure Registration/Login**: JWT-based authentication with bcrypt password hashing
- **Role-Based Access**: Separate interfaces for mentors and mentees
- **Profile Management**: Complete user profiles with personal information
- **Session Persistence**: Secure token-based session management

### 👥 **Mentoring System**
- **Mentor Discovery**: Browse and connect with available mentors
- **Booking Requests**: Send meeting requests with preferred time slots
- **Mentor Scheduling**: Mentors can confirm, decline, or reschedule bookings
- **Meeting Management**: Complete lifecycle from request to completion

### 🎥 **Video Conferencing**
- **Instant Meetings**: Start impromptu video calls immediately
- **Scheduled Sessions**: Pre-planned meetings with calendar integration
- **Meeting Rooms**: Dedicated spaces for ongoing mentoring relationships
- **Advanced Controls**: Screen sharing, recording, participant management
- **Mobile Support**: Full-featured mobile video calling experience

### 📅 **Smart Scheduling**
- **Calendar Integration**: Visual booking with date/time selection
- **Automated Notifications**: Email confirmations and reminders
- **Time Zone Handling**: Intelligent scheduling across different time zones
- **Conflict Detection**: Prevents double-booking and scheduling conflicts

### � **Email Communication**
- **Booking Notifications**: Automated emails for new requests
- **Confirmation System**: Email confirmations for accepted meetings
- **Meeting Links**: Secure meeting URLs delivered via email
- **Reminder System**: Automated reminders before scheduled sessions

### � **Dashboard & Analytics**
- **Upcoming Meetings**: Clear view of today's and future sessions
- **Meeting History**: Complete record of past mentoring sessions
- **Statistics**: Meeting counts, duration tracking, and engagement metrics
- **Booking Management**: Pending requests and scheduling tools

---

## 🛠️ Tech Stack

<div align="center">

### Frontend Architecture
![Next.js](https://img.shields.io/badge/Next.js-15.4.4-000000?style=flat-square&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat-square&logo=tailwind-css&logoColor=white)

### Backend & Database
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8.16-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-ODM-880000?style=flat-square&logo=mongoose&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)

### Video & Communication
![Stream.io](https://img.shields.io/badge/Stream.io-Video-005FFF?style=flat-square&logo=stream&logoColor=white)
![Nodemailer](https://img.shields.io/badge/Nodemailer-Email-339933?style=flat-square&logo=nodemailer&logoColor=white)

### UI Components & Icons
![Shadcn/ui](https://img.shields.io/badge/Shadcn%2Fui-Components-000000?style=flat-square&logo=shadcn/ui&logoColor=white)
![Lucide React](https://img.shields.io/badge/Lucide-Icons-F56565?style=flat-square&logo=lucide&logoColor=white)
![Radix UI](https://img.shields.io/badge/Radix%20UI-Primitives-8B5CF6?style=flat-square&logo=radix-ui&logoColor=white)

</div>

---

## 🏗️ Project Architecture

```
careerlive/
├── 📁 app/                     # Next.js 15 App Router
│   ├── 📁 (auth)/             # Authentication pages
│   │   ├── sign-in/           # Login interface
│   │   └── sign-up/           # Registration interface
│   ├── 📁 (root)/             # Main application
│   │   ├── 📁 (home)/         # Dashboard and home pages
│   │   │   ├── page.tsx       # Main dashboard
│   │   │   ├── bookings/      # Booking management
│   │   │   ├── upcoming/      # Upcoming meetings
│   │   │   ├── previous/      # Meeting history
│   │   │   └── recordings/    # Meeting recordings
│   │   ├── meeting/[id]/      # Video meeting rooms
│   │   └── test/              # Development testing
│   ├── 📁 api/                # Backend API endpoints
│   │   ├── auth/              # Authentication APIs
│   │   ├── bookings/          # Booking management APIs
│   │   ├── mentor/            # Mentor-specific APIs
│   │   ├── mentors/           # Mentor discovery APIs
│   │   └── users/             # User management APIs
│   ├── globals.css            # Global styles
│   └── layout.tsx             # Root layout
├── 📁 components/             # React components
│   ├── 📁 ui/                 # Base UI components (Shadcn)
│   ├── Alert.tsx              # Alert notifications
│   ├── BookingModal.tsx       # Booking request interface
│   ├── BookingsList.tsx       # Booking management
│   ├── CallList.tsx           # Meeting list components
│   ├── CombinedUpcomingList.tsx # Unified upcoming meetings
│   ├── MeetingRoom.tsx        # Main video interface
│   ├── MeetingSetup.tsx       # Pre-meeting configuration
│   ├── MentorScheduler.tsx    # Mentor scheduling tools
│   ├── Navbar.tsx             # Navigation bar
│   ├── PendingBookingCards.tsx # Booking request cards
│   ├── ProtectedRoute.tsx     # Route protection
│   ├── ScheduleCalendar.tsx   # Calendar component
│   ├── Sidebar.tsx            # Navigation sidebar
│   ├── UpcomingBookings.tsx   # Upcoming meetings display
│   └── UserButton.tsx         # User profile button
├── 📁 hooks/                  # Custom React hooks
│   ├── useGetCallById.ts      # Individual call data
│   ├── useGetCalls.ts         # Meeting list management
│   └── useLocalRecording.ts   # Recording functionality
├── 📁 lib/                    # Utility libraries
│   ├── auth.ts                # Authentication utilities
│   ├── database.ts            # MongoDB connection
│   ├── emailService.ts        # Email notification service
│   └── utils.ts               # General utilities
├── 📁 models/                 # MongoDB schemas
│   ├── Booking.ts             # Booking data model
│   └── User.ts                # User data model
├── 📁 providers/              # React context providers
│   ├── AuthProvider.tsx       # Authentication context
│   └── StreamClientProvider.tsx # Video service context
├── 📁 constants/              # Application constants
├── 📁 actions/                # Server actions
├── 📁 public/                 # Static assets
│   ├── icons/                 # SVG icons
│   └── images/                # Images and graphics
├── middleware.ts              # Next.js middleware
├── next.config.mjs            # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS config
└── tsconfig.json              # TypeScript configuration
```

---

## 🚦 Quick Start

### Prerequisites

Ensure you have the following installed:
- **Node.js** >= 20.0.0 ([Download](https://nodejs.org/))
- **npm** >= 9.0.0 or **yarn** >= 1.22.0
- **Git** ([Download](https://git-scm.com/))
- **MongoDB** (local or Atlas account)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Happyesss/careerlive---alpha.git
   cd careerlive---alpha
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Authentication (JWT)
   JWT_SECRET=your-super-secret-jwt-key-here
   
   # Database (MongoDB)
   MONGODB_URI=mongodb://localhost:27017/careerlive
   # or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/careerlive

   # Video Service (Stream.io)
   NEXT_PUBLIC_STREAM_API_KEY=your_stream_api_key
   STREAM_SECRET_KEY=your_stream_secret_key

   # Email Service (Gmail SMTP)
   GMAIL_USER=your-email@gmail.com
   GMAIL_PASS=your-app-password

   # Application
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   NODE_ENV=development
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🔑 API Keys & Configuration

### JWT Authentication Setup

1. **Generate a strong JWT secret**:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
2. Add the generated secret to your `.env.local` file as `JWT_SECRET`

### MongoDB Database Setup

**Option 1: MongoDB Atlas (Recommended)**
1. Visit [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user
4. Get your connection string
5. Add it to `.env.local` as `MONGODB_URI`

**Option 2: Local MongoDB**
```bash
# Install MongoDB locally
brew install mongodb/brew/mongodb-community  # macOS
# or follow instructions for your OS
mongod --dbpath /path/to/data/directory
```

### Stream.io Video Setup

1. Go to [Stream Console](https://getstream.io/dashboard/)
2. Create a new app with **Video & Audio** enabled
3. Copy your **API Key** and **Secret Key**
4. Add them to your `.env.local` file

### Email Service Setup (Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Create a new app password
3. Add your email and app password to `.env.local`

---

## 🎯 Usage Guide

### User Roles & Workflows

#### **Mentee Workflow**
1. **Register/Login** as a mentee
2. **Browse mentors** and send booking requests
3. **Receive email confirmation** when mentor accepts
4. **Join meetings** using provided links
5. **View meeting history** and recordings

#### **Mentor Workflow**
1. **Register/Login** as a mentor
2. **Receive booking requests** via email and dashboard
3. **Confirm or decline** requests
4. **Schedule meetings** and generate meeting links
5. **Manage upcoming sessions** and mentees

### Meeting Controls

- **Camera/Microphone**: Toggle video and audio
- **Screen Sharing**: Share your screen with participants
- **Recording**: Record sessions for later review
- **Participant Management**: Manage attendees and permissions
- **Chat**: In-meeting text communication
- **Settings**: Adjust video/audio quality and preferences

### Mobile Experience

The platform is fully responsive with:
- **Touch-optimized controls** for mobile devices
- **Adaptive video layouts** for different screen sizes
- **Gesture support** for common meeting actions
- **Optimized performance** on mobile networks

---

## 🔧 Development

### Project Structure Details

#### **Authentication System**
- JWT-based authentication with secure token handling
- Role-based access control (mentor/mentee)
- Protected routes and API endpoints
- Persistent login sessions

#### **Database Models**
- **User Model**: Stores user profiles, roles, and authentication data
- **Booking Model**: Manages meeting requests, confirmations, and scheduling
- Mongoose ODM for MongoDB interactions

#### **API Architecture**
- RESTful API design with Next.js API routes
- Authentication middleware for protected endpoints
- CRUD operations for users and bookings
- Email notification system integration

#### **Video Integration**
- Stream.io SDK for video calling functionality
- Real-time communication and meeting management
- Recording and playback capabilities
- Mobile-optimized video experience

### Code Style & Standards

```bash
# Linting
npm run lint

# Type checking
npx tsc --noEmit

# Development server
npm run dev

# Production build
npm run build
npm start
```

### Component Architecture

- **Modular Components**: Reusable UI components with TypeScript
- **Custom Hooks**: Shared logic for calls, authentication, and data fetching
- **Context Providers**: Global state management for auth and video
- **Responsive Design**: Mobile-first approach with Tailwind CSS

---

## 🔧 Troubleshooting

### Common Issues

#### Video/Audio Not Working
```bash
# Check browser permissions
# Enable camera/microphone access in browser settings
# Verify Stream.io API keys are correctly configured
```

#### Authentication Issues
```bash
# Verify JWT_SECRET is properly set
# Check MongoDB connection string
# Ensure user exists in database
```

#### Email Notifications Not Sending
```bash
# Verify Gmail credentials in .env.local
# Check if 2FA and app password are properly configured
# Review email service logs in console
```

#### Build/Deployment Issues
```bash
# Clear cache and reinstall dependencies
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Performance Optimization

- **Image Optimization**: Use Next.js Image component
- **Code Splitting**: Automatic with Next.js App Router
- **Caching**: Browser caching for static assets
- **Database Indexing**: Optimized MongoDB queries

---

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your GitHub repository** to Vercel
2. **Configure environment variables** in Vercel dashboard
3. **Deploy automatically** on every push to main branch

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Variables for Production

```env
# Production settings
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# Database (MongoDB Atlas recommended)
MONGODB_URI=mongodb+srv://...

# Stream.io production keys
NEXT_PUBLIC_STREAM_API_KEY=...
STREAM_SECRET_KEY=...

# Email service
GMAIL_USER=...
GMAIL_PASS=...

# Secure JWT secret
JWT_SECRET=...
```

---

## 🤝 Contributing

We welcome contributions! Please follow our development workflow:

### Development Workflow

1. **Fork the repository** on GitHub
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes** with proper TypeScript types
4. **Add tests** for new functionality
5. **Run linting and type checks**
   ```bash
   npm run lint
   npx tsc --noEmit
   ```
6. **Commit your changes**
   ```bash
   git commit -m 'feat: add amazing feature'
   ```
7. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Open a Pull Request** with detailed description

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new mentor scheduling feature
fix: resolve video call connection issues
docs: update API documentation
style: improve mobile responsiveness
refactor: optimize database queries
test: add unit tests for booking system
```

### Code Style Guidelines

- **TypeScript**: Strict typing with proper interfaces
- **ESLint**: Follow the project's linting rules
- **Prettier**: Code formatting (automatic with editor setup)
- **Component Structure**: Functional components with hooks
- **File Naming**: kebab-case for files, PascalCase for components

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[Stream.io](https://getstream.io/)** - Reliable video infrastructure and SDK
- **[MongoDB](https://www.mongodb.com/)** - Flexible database solution
- **[Next.js](https://nextjs.org/)** - Powerful React framework
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Shadcn/ui](https://ui.shadcn.com/)** - Beautiful and accessible UI components
- **[Lucide React](https://lucide.dev/)** - Consistent and customizable icons
- **[Vercel](https://vercel.com/)** - Seamless deployment platform

---

## 📊 Project Status

- ✅ **Authentication System** - Complete with JWT and role-based access
- ✅ **Video Calling** - Integrated with Stream.io SDK
- ✅ **Booking System** - Full mentoring workflow implementation
- ✅ **Email Notifications** - Automated communication system
- ✅ **Responsive Design** - Mobile and desktop optimized
- ✅ **Database Integration** - MongoDB with Mongoose ODM
- 🔄 **Advanced Analytics** - In development
- 🔄 **Calendar Integration** - Planned for next release
- 🔄 **Payment Integration** - Future enhancement

---

<div align="center">

**[⬆ Back to Top](#-careerlive---professional-video-mentoring-platform)**

Made with ❤️ by the CareerLive Team

[![GitHub stars](https://img.shields.io/github/stars/Happyesss/careerlive---alpha?style=social)](https://github.com/Happyesss/careerlive---alpha/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Happyesss/careerlive---alpha?style=social)](https://github.com/Happyesss/careerlive---alpha/network/members)
[![GitHub issues](https://img.shields.io/github/issues/Happyesss/careerlive---alpha)](https://github.com/Happyesss/careerlive---alpha/issues)

*Connect. Learn. Grow. Together.*

</div>