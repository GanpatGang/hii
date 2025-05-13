# Education Platform

A comprehensive education platform with separate interfaces for administrators, teachers, and students.

## Features

- Multi-role authentication (Admin, Teacher, Student)
- Secure login system
- File and folder management for teaching materials
- Role-based access control
- Material viewing for students

## Prerequisites

1. Node.js (v14 or higher)
2. MongoDB
3. npm or yarn

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   Create a `.env` file in the root directory with:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
education-platform/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/        # Page components
│   │   ├── context/      # Context providers
│   │   └── utils/        # Utility functions
├── server/                # Backend Node.js/Express application
│   ├── controllers/      # Route controllers
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   └── middleware/      # Custom middleware
└── README.md
``` 