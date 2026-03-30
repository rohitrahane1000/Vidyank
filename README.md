# Vidyank - Learning Platform Mobile App

A comprehensive React Native learning platform built with Expo that provides users with an intuitive course discovery and learning experience. Vidyank offers seamless authentication, personalized course management, and interactive learning features.

---

## 🚀 Features

### Authentication & User Management

* Secure Login/Registration with JWT authentication
* Profile management with avatar upload

### Course Discovery & Management

* Course catalog with search and filters
* Featured courses carousel
* Bookmarking & enrollment system

### Interactive Learning

* Course details with instructor info
* WebView-based content access
* Image galleries

### UI/UX

* Clean and modern design
* Responsive layouts
* Side navigation & search overlay

### Notifications

* Push notifications
* Activity tracking
* Success modals

---

## 📱 Screenshots

### 🔹 Splash Screen

<p align="center">
  <img src="https://github.com/user-attachments/assets/aa7c993d-a87c-4bfd-9015-83701dd49285" width="220"/>
</p>

---

### 🔹 Authentication Screens

<p align="center">
  <img src="https://github.com/user-attachments/assets/fb7a844a-5ad1-4a06-9010-7cabebb358b6" width="220"/>
  <img src="https://github.com/user-attachments/assets/b7f87435-faca-4f33-8291-906c2ec0f801" width="220"/>
</p>

---

### 🔹 Home / Course List

<p align="center">
  <img src="https://github.com/user-attachments/assets/45b417c7-11b0-4559-b1ca-cbfb42f2b076" width="250"/>
</p>

---

### 🔹 Course Details

<p align="center">
  <img src="https://github.com/user-attachments/assets/303e60d1-1482-4be9-bfe8-98bb60a15512" width="250"/>
</p>

---

### 🔹 Profile Screen

<p align="center">
  <img src="https://github.com/user-attachments/assets/9a74030b-c96e-4e45-aaea-2ffe919b36e4" width="220"/>
</p>

---

### 🔹 WebView Learning Screen

<p align="center">
  <img src="https://github.com/user-attachments/assets/dba84830-2de9-4101-9c87-ecd0ab56460f" width="250"/>
</p>

---

## 🛠 Tech Stack

### Frontend

* React Native
* Expo
* TypeScript
* Zustand

### UI/UX

* Expo Vector Icons
* Safe Area Context
* Linear Gradient
* WebView

### Backend

* Axios
* JWT Authentication
* REST APIs

### Storage

* Secure Store
* AsyncStorage

### Notifications

* Expo Notifications

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v16+)
* npm / yarn
* Expo CLI

---

### Installation

```bash
git clone https://github.com/rohitrahane1000/vidyank.git
cd vidyank
npm install
```

---

### Environment Variables

Create `.env` file:

```env
EXPO_PUBLIC_API_BASE_URL=https://api.freeapi.app/api/v1
```

---

### Run Project

```bash
npm start
npm run android
npm run ios
npm run web
```

---

## 📁 Project Structure

```
src/
├── assets/
├── auth/
├── components/
├── screens/
├── services/
├── store/
├── types/
└── utils/
```

---

## 🔧 Configuration

* EAS Build configured
* App ready for Play Store / App Store
* Required permissions:

  * Camera
  * Storage
  * Internet
  * Notifications

---

## 🏗 Architecture

* Zustand for state management
* Axios interceptors for API handling
* Modal + Stack navigation
* Optimized image handling

---

## 🐛 Limitations

* Limited offline support
* No native video player yet
* No social features

---

## 🚀 Deployment

```bash
npm run build:prod:android
npm run build:prod:ios
```

---

## 🤝 Contributing

1. Fork repo
2. Create branch
3. Commit changes
4. Push & PR

---

## 👥 Team

* Developer: Rohit Rahane
* Designer: Rohit Rahane

---

**Vidyank — Empowering learning through technology 🎓**
