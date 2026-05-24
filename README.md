# JerkyVault

**JerkyVault** is a modern, full-stack web application designed for comprehensive management of jerky production operations. Built with cutting-edge technologies including **Next.js 14**, **TypeScript**, and **Bootstrap**, the application provides a scalable, secure, and user-friendly platform for managing recipes, orders, clients, products, and production workflows.

## 🚀 Key Features

### **Production Management**
- **Recipe Management**: Create, edit, and organize jerky recipes with detailed ingredient lists and instructions
- **Order Tracking**: Complete order lifecycle management from creation to fulfillment
- **Client Database**: Comprehensive client management with contact information and order history
- **Product Catalog**: Manage your jerky product lineup with pricing and descriptions
- **Inventory Control**: Track ingredients and manage stock levels
- **Price Management**: Dynamic pricing system for products and services

### **Advanced Authentication & Security**
- **JWT-based Authentication**: Secure token-based authentication system
- **Automatic Session Management**: Smart token validation with automatic logout on expiration
- **Cross-tab Synchronization**: Consistent auth state across multiple browser tabs
- **Protected Routes**: Role-based access control for sensitive operations
- **CSRF Protection**: Built-in protection against cross-site request forgery attacks

### **Modern User Experience**
- **Custom Design System**: Smoked Ember theme with burgundy/wine color palette
- **Dark/Light Theme**: Seamless theme switching with localStorage persistence
- **Responsive Design**: Fully responsive interface with mobile-optimized navigation
- **Real-time Updates**: Live data updates using SWR for optimal performance
- **Multilingual Support**: Complete i18n support for English, Russian, and Serbian
- **Interactive Charts**: Beautiful data visualization with D3.js and interactive tooltips
- **Smart Navigation**: Grouped sidebar sections with iconography and language switcher
- **Progressive Loading**: Smart loading states and error handling
- **Toast Notifications**: User-friendly feedback system

### **Developer Experience**
- **TypeScript**: Full type safety throughout the application
- **Modern Architecture**: Clean separation of concerns with proper component structure
- **Unified Components**: Consistent SelectDropdown component across all forms
- **Environment Validation**: Strict environment variable validation with Zod
- **Docker Support**: Complete containerization for easy deployment
- **Hot Module Replacement**: Instant development feedback

## 🏗️ Technology Stack

### **Frontend**
- **Next.js 14** - React framework with Pages Router (not App Router)
- **TypeScript** - Type-safe development environment
- **React 18** - Latest React features with concurrent rendering
- **Bootstrap 5.3** - Modern CSS framework for responsive design
- **React Bootstrap** - Bootstrap components for React
- **D3.js** - Data visualization and analytics
- **React Icons (react-icons/fa)** - FontAwesome icon library

### **State Management & Data Fetching**
- **SWR** - Smart data fetching with caching and revalidation
- **React Context** - Global state management for authentication

### **Styling & Theming**
- **Smoked Ember Design System** - Custom burgundy/wine color palette
- **CSS Variables** - Design tokens for consistent theming
- **Dark/Light Themes** - Seamless theme switching
- **Responsive Design** - Mobile-first approach with breakpoint support

### **Development & DevOps**
- **ESLint** - Code linting and formatting
- **Docker Compose** - Multi-container orchestration
- **GitHub Actions** - Automated CI/CD pipeline
- **T3 Env** - Type-safe environment variable management

## 📁 Project Structure

```
jerky-vault/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── charts/        # Chart components (DonutChart)
│   │   ├── modal/         # Modal components for CRUD operations
│   │   ├── SelectDropdown.tsx  # Unified dropdown component
│   │   └── ...            # Other UI components
│   ├── pages/             # Next.js pages (Pages Router)
│   ├── styles/            # Global styles and design system
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions and helpers
│   └── env.js             # Environment validation
├── locales/               # Internationalization files (en, ru, rs)
├── public/                # Static assets (images, flags, etc.)
├── docker-compose.yml     # Docker Compose configuration
└── server.js              # Custom Next.js server
```

## 🎨 Design System

### Smoked Ember Theme
- **Primary Color**: Burgundy/Wine (#8B2635)
- **Light Theme**: White/light gray surfaces with dark text
- **Dark Theme**: Dark gray surfaces with light text
- **Accent Colors**: Status-based colors (success, warning, error)

### Component Features
- **Unified SelectDropdown**: Consistent dropdown behavior across the entire application
- **Interactive Charts**: D3-based donut charts with hover tooltips
- **Grouped Navigation**: Sidebar organized into logical sections
- **Language Switcher**: Quick-access language buttons with flags
- **Theme Toggle**: One-click dark/light mode switching

## 🔧 Installation & Setup

### Prerequisites
- **Node.js** 20.0 or higher
- **npm** 10.0 or higher
- **Docker** (optional, for containerized deployment)

### 1. Clone the Repository
```bash
git clone https://github.com/dzarlax/jerky-vault.git
cd jerky-vault
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the project root:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000

# Authentication
NEXT_PUBLIC_AUTH_ENABLED=true
JWT_SECRET=your_jwt_secret_key
SECRET=your_general_secret_key

# Optional Features
MAPBOX_ACCESS_TOKEN=your_mapbox_token

# Development Flags
NODE_ENV=development
SKIP_ENV_VALIDATION=false
```

### 4. Run the Application

#### Development Mode
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🐳 Docker Deployment

### Quick Start with Docker Compose

1. **Start all services**
   ```bash
   docker-compose up -d
   ```

2. **Rebuild frontend after changes**
   ```bash
   docker-compose up -d --build jerky_vault_frontend
   ```

### Services
- **jerky_vault_frontend** - Next.js frontend (port 3000)
- **jerky_vault_backend** - Go API backend (port 8080)

### Environment Variables in Docker
Configure environment variables in `docker-compose.yml`:
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_FRONTEND_URL` - Frontend URL
- `NEXT_PUBLIC_AUTH_ENABLED` - Enable/disable authentication

## 🌐 Internationalization

JerkyVault supports multiple languages out of the box:

- **English** (en) 🇬🇧
- **Russian** (ru) 🇷🇺
- **Serbian** (sr) 🇷🇸

### Language Switching
- Language selector in sidebar footer
- Three flag buttons for instant language switching
- All UI text translated automatically

### Translation Keys
All user-facing text is managed through translation keys in:
- `locales/en/common.json`
- `locales/ru/common.json`
- `locales/rs/common.json`

## 📊 Application Sections

### **Dashboard**
- Real-time business metrics and KPIs
- Interactive donut charts with hover tooltips
- Order status distribution
- Ingredient type distribution
- Profit analytics (revenue vs cost vs profit)
- Recent orders table with quick actions

### **Recipe Management**
- Complete recipe CRUD operations
- Ingredient quantity tracking
- Step-by-step instructions
- Recipe categorization and search
- Cost calculation per recipe

### **Order System**
- Full order lifecycle management
- Card-based order items in modal
- Status tracking (pending, in progress, ready, finished, canceled)
- Client assignment and communication
- Order history and reporting
- Quick status change from dashboard

### **Client Management**
- Comprehensive client database
- Contact information management
- Order history per client
- Client communication tools (phone, telegram, instagram)
- Search and filtering options

### **Product Catalog**
- Product information management
- Pricing and cost tracking
- Recipe assignment
- Package selection
- Product performance metrics
- Image URL support

### **User Management**
- Secure user authentication
- Profile management
- Password change functionality
- Session management
- Access control

## 🎯 UI/UX Highlights

### Sidebar Navigation
- **260px fixed width** on desktop
- **Grouped sections**:
  - Main: Dashboard, Recipes, Ingredients
  - Management: Products, Orders, Clients, Prices
  - Account: Profile
- **Language switcher**: Three flag buttons (EN, RU, RS)
- **Theme toggle**: Moon/Sun icon button
- **Mobile responsive**: Hamburger menu with slide-in sidebar

### Forms & Modals
- **SelectDropdown**: Unified dropdown component with:
  - Portal rendering (prevents z-index issues)
  - Dark theme support
  - Error states and helper text
  - Searchable and clearable options
- **Card-based layouts**: Modern card designs for order items
- **Dark theme**: All modals fully support dark/light themes

### Interactive Charts
- **Donut charts** built with D3.js
- **Hover tooltips** showing:
  - Segment name with colored indicator
  - Absolute values
  - Percentages (color-coded: green ≥20%, orange <20%)
- **Smart positioning**: Tooltips avoid screen edges

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Token Validation**: Automatic token expiration handling
- **Protected Routes**: Authentication middleware for sensitive pages
- **CSRF Protection**: Built-in request validation
- **Input Validation**: Comprehensive data validation
- **Error Handling**: Secure error messages without sensitive data exposure

## ⚡ Performance Optimizations

- **SWR Caching**: Intelligent data caching and revalidation
- **Portal Rendering**: Dropdowns render to document.body for z-index management
- **Code Splitting**: Automatic code splitting for reduced bundle sizes
- **Image Optimization**: Next.js built-in image optimization
- **Smart Refresh Rates**: Different SWR configs for different data types

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Docker
docker-compose up        # Start all services
docker-compose up -d --build jerky_vault_frontend  # Rebuild frontend
docker-compose down      # Stop all services

# Build variants
npm run build:docker     # Build with Docker optimizations
npm run build:no-ssg     # Build without static generation
```

## 📖 Documentation

For detailed development documentation, see [CLAUDE.md](./CLAUDE.md).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Repository**: [GitHub](https://github.com/dzarlax/jerky-vault)
- **Issues**: [Bug Reports & Feature Requests](https://github.com/dzarlax/jerky-vault/issues)

---

**JerkyVault** - Streamlining jerky production management with modern web technologies and the Smoked Ember design system.
