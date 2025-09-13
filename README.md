# Store Rating Platform

A full-stack web application for rating stores with role-based access control. Built with React.js, Express.js, and PostgreSQL.

## Features

### System Administrator
- Dashboard with system statistics (total users, stores, ratings)
- Add new users, stores, and admin users
- View and manage all users with filtering and sorting
- View and manage all stores with filtering and sorting
- View detailed user information including store ratings for store owners

### Normal User
- Register and login with form validation
- View all registered stores with search and filtering
- Submit and modify ratings (1-5 stars) for stores
- Update password
- View personal rating history

### Store Owner
- Dashboard showing owned stores and their ratings
- View detailed ratings for each store
- See average ratings and total rating counts
- Update password

## Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **JWT** authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **CORS** and **Helmet** for security

### Frontend
- **React.js** with functional components and hooks
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API calls
- **React Hot Toast** for notifications
- **Lucide React** for icons

## Installation

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd store-rating-platform
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Database Setup**
   - Create a PostgreSQL database named `store_rating_platform`
   - Run the SQL schema from `server/database/schema.sql`
   - Update database credentials in `server/config/database.js`

4. **Environment Variables**
   Create a `.env` file in the `server` directory:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=store_rating_platform
   DB_USER=your_username
   DB_PASSWORD=your_password
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=24h
   PORT=5000
   NODE_ENV=development
   ```

5. **Start the application**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend development server (port 3000).

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `PUT /api/auth/password` - Update password
- `GET /api/auth/me` - Get current user

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics
- `POST /api/admin/users` - Create new user
- `GET /api/admin/users` - Get all users with filtering
- `GET /api/admin/users/:id` - Get user details
- `POST /api/admin/stores` - Create new store
- `GET /api/admin/stores` - Get all stores with filtering

### Stores
- `GET /api/stores` - Get all stores (public)
- `GET /api/stores/:id` - Get store details with user rating

### Ratings
- `POST /api/ratings` - Submit/update rating
- `GET /api/ratings/my-ratings` - Get user's ratings
- `GET /api/ratings/store/:storeId` - Get store ratings (store owners)
- `GET /api/ratings/my-stores` - Get store owner's stores

## Database Schema

### Users Table
- `id` (Primary Key)
- `name` (20-60 characters)
- `email` (Unique)
- `password_hash`
- `address` (Max 400 characters)
- `role` (admin, user, store_owner)
- `created_at`, `updated_at`

### Stores Table
- `id` (Primary Key)
- `name`
- `email` (Unique)
- `address`
- `owner_id` (Foreign Key to Users)
- `created_at`, `updated_at`

### Ratings Table
- `id` (Primary Key)
- `user_id` (Foreign Key to Users)
- `store_id` (Foreign Key to Stores)
- `rating` (1-5)
- `created_at`, `updated_at`
- Unique constraint on (user_id, store_id)

## Form Validations

### User Registration/Update
- **Name**: 20-60 characters
- **Email**: Valid email format
- **Password**: 8-16 characters, must include uppercase letter and special character
- **Address**: Maximum 400 characters

### Store Creation
- **Name**: Required
- **Email**: Valid email format, unique
- **Address**: Maximum 400 characters

## Default Admin Account

The system comes with a default admin account:
- **Email**: admin@store-rating.com
- **Password**: Admin123!

## Features Implemented

✅ **Authentication & Authorization**
- JWT-based authentication
- Role-based access control (Admin, User, Store Owner)
- Password hashing with bcryptjs
- Protected routes

✅ **User Management**
- User registration with validation
- Login/logout functionality
- Password update
- Role-based dashboards

✅ **Store Management**
- Store listing with search and filtering
- Store creation (Admin only)
- Store details with ratings
- Sorting capabilities

✅ **Rating System**
- Submit ratings (1-5 stars)
- Update existing ratings
- View rating history
- Store owner rating analytics

✅ **Admin Features**
- Dashboard with statistics
- User management with CRUD operations
- Store management
- Advanced filtering and sorting

✅ **UI/UX**
- Responsive design with Tailwind CSS
- Modern, clean interface
- Loading states and error handling
- Toast notifications
- Modal dialogs for forms

## Development

### Project Structure
```
store-rating-platform/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   └── ...
├── server/                 # Express backend
│   ├── config/            # Database configuration
│   ├── database/          # SQL schema
│   ├── middleware/        # Custom middleware
│   ├── routes/            # API routes
│   └── ...
└── package.json           # Root package.json
```

### Available Scripts
- `npm run dev` - Start both frontend and backend in development mode
- `npm run server` - Start only the backend server
- `npm run client` - Start only the frontend development server
- `npm run build` - Build the frontend for production
- `npm start` - Start the production server

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Input validation and sanitization
- CORS configuration
- Rate limiting
- Helmet.js security headers
- SQL injection prevention with parameterized queries

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
