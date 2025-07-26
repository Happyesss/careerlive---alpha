# 🎯 CareerLive - Professional Video Meeting Platform

<div align="center">

*A modern, secure, and feature-rich video conferencing platform built for professional teams*

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

[Live Demo](https://careerlive.vercel.app) 
</div>

---

## 🌟 Overview

CareerLive is a cutting-edge video conferencing platform designed specifically for professional environments. Built with modern web technologies, it offers seamless video communication with enterprise-grade security and an intuitive user experience.

### ✨ Key Highlights

- 🎥 **HD Video & Audio** - Crystal clear communication with adaptive quality
- 🔒 **Enterprise Security** - End-to-end encryption and secure authentication
- 📱 **Mobile Responsive** - Optimized for all devices and screen sizes
- 🎛️ **Advanced Controls** - Comprehensive meeting management features
- 📊 **Real-time Analytics** - Meeting insights and performance metrics
- 🌐 **Global Scale** - Reliable infrastructure worldwide

---

## 🚀 Features

### 🔐 **Authentication & Security**
- **JWT-based Authentication**: Secure login with JSON Web Tokens and bcrypt password hashing
- **Custom User Management**: Registration, login, and profile management with MongoDB
- **Session Management**: Persistent login sessions with secure token handling
- **Data Encryption**: Password encryption with bcrypt and secure communication

### 🎥 **Meeting Management**
- **Instant Meetings**: Start meetings immediately with one click
- **Scheduled Meetings**: Plan and schedule future meetings with calendar integration
- **Personal Rooms**: Dedicated meeting spaces with permanent links
- **Meeting History**: Complete record of past meetings with searchable metadata

### 🎛️ **Advanced Controls**
- **Media Controls**: Camera, microphone, and screen sharing management
- **Layout Options**: Grid, speaker, and custom layout configurations
- **Participant Management**: Mute, remove, and manage attendee permissions
- **Recording & Playback**: Local and cloud recording with download capabilities

### 📱 **Responsive Design**
- **Mobile Optimized**: Touch-friendly interface for smartphones and tablets
- **Cross-platform**: Consistent experience across all devices
- **Adaptive UI**: Dynamic layout adjustments based on screen size
- **Offline Support**: Basic functionality even with poor connectivity

### 🔧 **Developer Features**
- **RESTful APIs**: Comprehensive API for integrations
- **Webhooks**: Real-time event notifications
- **SDKs**: Client libraries for popular programming languages
- **Custom Branding**: White-label solutions for enterprise clients

---

## 🛠️ Tech Stack

<div align="center">

### Frontend
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwind-css&logoColor=white)

### Backend & Services
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Stream](https://img.shields.io/badge/Stream-005FFF?style=flat-square&logo=stream&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)

### Tools & Libraries
![Shadcn/ui](https://img.shields.io/badge/Shadcn%2Fui-000000?style=flat-square&logo=shadcn/ui&logoColor=white)
![React Hook Form](https://img.shields.io/badge/React_Hook_Form-EC5990?style=flat-square&logo=reacthookform&logoColor=white)
![Lucide React](https://img.shields.io/badge/Lucide-F56565?style=flat-square&logo=lucide&logoColor=white)

</div>

---

## 🚦 Quick Start

### Prerequisites

Ensure you have the following installed:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **npm** >= 9.0.0 or **yarn** >= 1.22.0
- **Git** ([Download](https://git-scm.com/))

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

   # Video Service (Stream)
   NEXT_PUBLIC_STREAM_API_KEY=xxxxxxxxxx
   STREAM_SECRET_KEY=xxxxxxxxxx

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

## 📋 Getting Your API Keys

### JWT Authentication Setup

1. **Generate a strong JWT secret**:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
2. Add the generated secret to your `.env.local` file as `JWT_SECRET`
3. The authentication system handles user registration, login, and session management

### MongoDB Database Setup

1. **Local MongoDB**: Install MongoDB locally or use Docker
2. **MongoDB Atlas** (recommended for production):
   - Visit [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free cluster
   - Get your connection string
   - Add it to `.env.local` as `MONGODB_URI`

### Stream Video Setup

1. Go to [Stream Console](https://getstream.io/dashboard/)
2. Create a new app with Video & Audio enabled
3. Copy your **API Key** and **Secret**
4. Configure your app settings and permissions

---

## 🏗️ Project Structure

```
careerlive/
├── 📁 app/                    # Next.js 15 App Router
│   ├── 📁 (auth)/            # Authentication routes
│   ├── 📁 (root)/            # Main application routes
│   ├── 📁 api/               # API endpoints
│   ├── globals.css           # Global styles
│   └── layout.tsx            # Root layout
├── 📁 components/            # Reusable UI components
│   ├── 📁 ui/                # Base UI components (shadcn)
│   ├── Alert.tsx             # Alert component
│   ├── MeetingRoom.tsx       # Main meeting interface
│   ├── MeetingSetup.tsx      # Pre-meeting setup
│   └── ...                   # Other components
├── 📁 constants/             # Application constants
├── 📁 hooks/                 # Custom React hooks
├── 📁 lib/                   # Utility functions
├── 📁 providers/             # Context providers
├── 📁 public/                # Static assets
├── 📁 types/                 # TypeScript type definitions
├── middleware.ts             # Next.js middleware
├── next.config.mjs           # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

---

## 🎯 Usage Guide

### Starting a Meeting

1. **Instant Meeting**: Click "New Meeting" on the dashboard
2. **Scheduled Meeting**: Use the calendar to schedule future meetings
3. **Personal Room**: Access your dedicated meeting space
4. **Join Meeting**: Enter a meeting ID or use an invitation link

### Meeting Controls

- **🎤 Microphone**: Toggle audio on/off
- **📹 Camera**: Enable/disable video  
- **🖥️ Screen Share**: Share your screen
- **👥 Participants**: View and manage attendees
- **⚙️ Settings**: Adjust audio/video preferences
- **📼 Recording**: Record meetings for later review

### Mobile Experience

The application is fully responsive with:
- Touch-optimized controls
- Adaptive video layouts
- Gesture support for common actions
- Optimized for portrait and landscape modes

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests** for new functionality
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Code Style

We use ESLint and Prettier for code formatting:

```bash
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix issues
```

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new meeting layout option
fix: resolve audio issues in Safari
docs: update API documentation
style: improve mobile responsiveness
```

---

## 🔧 Troubleshooting

### Common Issues

**Issue**: Video not working on mobile
```bash
# Solution: Check camera permissions
# Enable camera access in browser settings
```

**Issue**: Authentication fails
```bash
# Solution: Verify environment variables
echo $JWT_SECRET
echo $MONGODB_URI
```

**Issue**: Build fails
```bash
# Solution: Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Stream.io](https://getstream.io/) - Video infrastructure
- [MongoDB](https://www.mongodb.com/) - Database service
- [Next.js](https://nextjs.org/) - React framework
- [Vercel](https://vercel.com/) - Deployment platform
- [Shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework

---


<div align="center">

**[⬆ Back to Top](#-careerlive---professional-video-meeting-platform)**

Made with ❤️ by the CareerLive Team

[![GitHub stars](https://img.shields.io/github/stars/Happyesss/careerlive---alpha?style=social)](https://github.com/Happyesss/careerlive---alpha/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Happyesss/careerlive---alpha?style=social)](https://github.com/Happyesss/careerlive---alpha/network/members)
[![GitHub issues](https://img.shields.io/github/issues/Happyesss/careerlive---alpha)](https://github.com/Happyesss/careerlive---alpha/issues)

</div>