# Real Estate Platform

## Overview

This is a comprehensive real estate platform built with the MERN stack, featuring a React frontend with Vite, Express.js backend, MongoDB database, and Firebase authentication. The platform supports three user roles (user, agent, admin) and includes property listings, offers, reviews, wishlists, and payment processing through Stripe.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React.js with Vite as the build tool
- **Styling**: Tailwind CSS with ShadCN UI components and Radix UI primitives
- **Routing**: React Router for client-side navigation
- **State Management**: React Context API for global state (auth, user roles)
- **Data Fetching**: TanStack React Query for server state management and caching
- **Forms**: React Hook Form for form handling and validation
- **Authentication**: Firebase Auth SDK for client-side authentication
- **HTTP Client**: Axios for API communication with the backend

### Backend Architecture
- **Framework**: Express.js with Node.js
- **Authentication**: Firebase Admin SDK for JWT token verification
- **Authorization**: Role-based access control middleware
- **API Structure**: RESTful API with organized route handlers
- **Payment Processing**: Stripe integration for property transactions

### Database Design
- **Primary Database**: MongoDB with native driver
- **Collections**: Users, Properties, Offers, Reviews, Wishlists
- **Schema**: Document-based storage with embedded relationships

## Key Components

### Authentication System
- **Client-Side**: Firebase Auth handles user registration, login, and token generation
- **Server-Side**: Firebase Admin SDK verifies tokens and manages user sessions
- **Role Management**: Three-tier role system (user, agent, admin) stored in MongoDB
- **Session Persistence**: JWT tokens stored in localStorage to prevent redirect on page reload

### Property Management
- **Verification System**: Admin approval required before properties appear publicly
- **Advertisement System**: Admin can promote verified properties to homepage
- **Search & Filter**: Location-based search with price range filtering
- **Image Storage**: Properties include image URLs for display

### Offer System
- **Negotiation**: Users can make offers on properties within specified price ranges
- **Status Tracking**: Offers progress through pending → accepted/rejected → bought states
- **Agent Dashboard**: Agents can view and respond to offers on their properties

### Review System
- **Property Reviews**: Users can review properties they're interested in
- **Public Display**: Reviews shown on property detail pages and homepage
- **Moderation**: Admins can manage all reviews across the platform

### Payment Integration
- **Stripe Integration**: Secure payment processing for accepted offers
- **Payment Intent**: Server-side payment intent creation with metadata
- **Transaction Tracking**: Offers updated to "bought" status after successful payment

## Data Flow

1. **User Registration/Login**: Firebase Auth → Backend verification → MongoDB user creation/update
2. **Property Listing**: Agent creates → Admin verifies → Public display
3. **Property Discovery**: Homepage advertisements → All properties page → Property details
4. **Offer Process**: User makes offer → Agent accepts/rejects → Payment processing → Transaction complete
5. **Review Process**: User adds review → Immediate display → Admin moderation if needed

## External Dependencies

### Firebase Services
- **Authentication**: Email/password and Google OAuth
- **Admin SDK**: Server-side token verification and user management
- **Configuration**: Environment variables for secure credential storage

### Stripe Payment Processing
- **Client-Side**: @stripe/stripe-js and @stripe/react-stripe-js for payment UI
- **Server-Side**: Stripe Node.js SDK for payment intent creation
- **Security**: Server-side payment processing with client-side confirmation

### MongoDB Integration
- **Connection**: Native MongoDB driver for database operations
- **Environment Configuration**: MongoDB URI stored in environment variables
- **Connection Pooling**: Single client instance shared across application

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server on port 3000 with proxy to backend
- **Backend**: Express server on port 5000 with CORS enabled
- **Database**: MongoDB connection via environment variable
- **Environment Variables**: Stored in .env files (excluded from version control)

### Production Considerations
- **Static File Serving**: Vite builds to dist/public for Express static serving
- **Environment Configuration**: All sensitive credentials stored in environment variables
- **CORS Configuration**: Configured for both local development and Replit deployment
- **Security**: Firebase private keys and database credentials secured via environment variables

### Key Architecture Decisions

1. **Separation of Concerns**: Clear separation between client authentication (Firebase) and server authorization (custom JWT)
2. **Role-Based Access**: Three-tier system allowing for flexible permission management
3. **Payment Security**: Server-side payment intent creation prevents client-side manipulation
4. **Data Consistency**: MongoDB relationships maintained through embedded document references
5. **Performance**: React Query caching reduces unnecessary API requests
6. **Responsive Design**: Tailwind CSS ensures mobile, tablet, and desktop compatibility