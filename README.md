# Vidyank - Learning Platform Mobile App

A comprehensive React Native learning platform built with Expo that provides users with an intuitive course discovery and learning experience. Vidyank offers seamless authentication, personalized course management, and interactive learning features.

## 🚀 Features

### Authentication & User Management
- **Secure Login/Registration**: JWT-based authentication with refresh token support
- **Profile Management**: Customizable user profiles with avatar upload

### Course Discovery & Management
- **Course Catalog**: Browse extensive course library with search and filtering
- **Featured Courses**: Auto-scrolling carousel showcasing highlighted courses
- **Course Categories**: Organized content by subject areas
- **Bookmarking**: Save favorite courses for quick access
- **Enrollment System**: Seamless course enrollment with progress tracking

### Interactive Learning Experience
- **Course Details**: Comprehensive course information with instructor profiles
- **WebView Integration**: In-app course content viewing
- **Image Galleries**: Multiple course images with navigation
- **Instructor Profiles**: Detailed instructor information and contact details

### User Interface & Experience
- **Modern Design**: Clean, intuitive interface with custom branding
- **Responsive Layout**: Optimized for various screen sizes
- **Background Images**: Immersive visual experience
- **Side Navigation**: Easy access to app features
- **Search Overlay**: Quick course and instructor search

### Notifications & Engagement
- **Push Notifications**: Real-time updates and reminders
- **Activity Tracking**: User engagement monitoring
- **Success Modals**: Celebration of learning milestones

## 📱 Screenshots

### Main Screens

#### Splash Screen
- App branding and loading experience
- Smooth transition to main application

#### Login/Registration Screen
- Secure authentication with form validation
- Toggle between login and signup modes
- Error handling and success feedback

#### Course List Screen (Home)
- Featured courses carousel with auto-scroll
- Search functionality with overlay on banner
- Course grid layout for browsing
- Filter options (All Courses, Bookmarks, Enrolled)
- Side navigation menu access

#### Course Details Screen
- High-resolution course images with gallery navigation
- Comprehensive course information
- Instructor profile integration
- Enrollment and bookmark functionality
- WebView access for course content

#### Profile Screen
- User information display
- Avatar upload and management
- Account verification status
- Membership details and settings

#### Course WebView Screen
- In-app course content viewing
- Seamless learning experience
- Navigation controls

## 🛠 Tech Stack

### Frontend
- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and build tools
- **TypeScript**: Type-safe JavaScript development
- **Zustand**: Lightweight state management

### UI/UX
- **Expo Vector Icons**: Comprehensive icon library
- **React Native Safe Area Context**: Safe area handling
- **Expo Linear Gradient**: Beautiful gradient effects
- **React Native WebView**: In-app web content

### Backend Integration
- **Axios**: HTTP client for API communication
- **JWT Authentication**: Secure token-based auth
- **RESTful APIs**: Standard API communication

### Storage & Security
- **Expo Secure Store**: Secure token storage
- **AsyncStorage**: Local data persistence
- **Image Picker**: Camera and gallery access

### Notifications
- **Expo Notifications**: Push notification system
- **Background processing**: Activity tracking

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (for testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rohitrahane1000/vidyank.git
   cd vidyank
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_API_BASE_URL=https://api.freeapi.app/api/v1
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on device/simulator**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

## 📁 Project Structure

```
src/
├── assets/           # Images, fonts, and static assets
├── auth/            # Authentication screens
├── components/      # Reusable UI components
├── screens/         # Main application screens
├── services/        # API services and external integrations
├── store/          # State management (Zustand stores)
├── types/          # TypeScript type definitions
└── utils/          # Utility functions and helpers
```

## 🔧 Configuration

### Environment Variables
- `EXPO_PUBLIC_API_BASE_URL`: Backend API base URL

### Build Configuration
- **EAS Build**: Configured for both development and production builds
- **App Store/Play Store**: Ready for deployment with proper app icons and splash screens

### Permissions
- Camera access for profile pictures
- Photo library access for image uploads
- Network access for API communication
- Notification permissions for push notifications

## 🏗 Key Architecture Decisions

### State Management
- **Zustand**: Chosen for its simplicity and TypeScript support
- Separate stores for authentication and course data
- Persistent storage integration for offline capability

### Navigation
- **Modal-based navigation**: Smooth transitions between screens
- **Stack navigation**: Hierarchical screen management

### API Integration
- **Axios interceptors**: Automatic token refresh and error handling
- **Retry logic**: Network resilience for poor connections
- **Response caching**: Improved performance and offline support

### Image Handling
- **Robust image loading**: Fallback images for failed loads
- **Consistent placeholders**: Branded fallback experience
- **Optimized uploads**: Compressed image uploads for better performance

## 🐛 Known Issues/Limitations

### Current Limitations
- **Offline Mode**: Limited offline functionality (planned for future release)
- **Video Content**: Currently supports web-based content only
- **Social Features**: No social sharing or discussion features yet

### Performance Considerations
- Large image galleries may impact performance on older devices
- Network-dependent features require stable internet connection

## 🚀 Deployment

### Development Builds
```bash
# Android development build
npm run build:dev:android

# iOS development build  
npm run build:dev:ios
```

### Production Builds
```bash
# Android production build
npm run build:prod:android

# iOS production build
npm run build:prod:ios
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request



## 👥 Team

- **Developer**: Rohit Rahane
- **Designer**: Rohit Rahane




**Vidyank** - Empowering learning through technology 🎓
