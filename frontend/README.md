# PickNGo Frontend

A professional React + Tailwind CSS e-commerce frontend application.

## Features

- **Authentication**: Login/Signup for customers and admins
- **Product Browsing**: View and search products
- **Shopping Cart**: Add items, manage quantities, checkout
- **Admin Dashboard**: View statistics and manage products
- **Responsive Design**: Works on all devices
- **Protected Routes**: Role-based access control

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and update your API URL:

```bash
cp .env.example .env
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build

```bash
npm run build
```

### Preview Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/      # Reusable components (Navbar, ProductCard, etc.)
├── pages/          # Page components (Home, Cart, Login, etc.)
├── context/        # React Context (Auth, Cart)
├── api/            # API client setup
├── App.jsx         # Main app component
└── main.jsx        # Entry point
```

## Key Features

### Authentication
- Customer and Admin login
- Signup for new customers
- JWT token-based auth
- Protected routes

### Shopping
- Product catalog
- Search and filter
- Add to cart
- Cart management
- Order placement

### Admin Panel
- Dashboard with statistics
- Product management
- Order management
- Customer management

## Technologies

- **React 18** - UI framework
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Vite** - Build tool
- **Lucide React** - Icons

## API Integration

The frontend connects to the backend API at `http://localhost:5000/api`. Make sure your backend is running before starting the frontend.

## Best Practices

- Use Context API for state management
- Component-based architecture
- Responsive design with Tailwind
- Error handling in API calls
- Loading states for async operations
- Protected routes for authentication

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT
