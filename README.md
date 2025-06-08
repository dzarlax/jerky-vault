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
- **Responsive Design**: Fully responsive interface built with Bootstrap 5.3
- **Real-time Updates**: Live data updates using SWR for optimal performance
- **Multilingual Support**: Complete i18n support for English, Russian, and Serbian
- **Interactive Charts**: Beautiful data visualization with Chart.js
- **Progressive Loading**: Smart loading states and error handling
- **Toast Notifications**: User-friendly feedback system

### **Developer Experience**
- **TypeScript**: Full type safety throughout the application
- **Modern Architecture**: Clean separation of concerns with proper component structure
- **Environment Validation**: Strict environment variable validation with Zod
- **Docker Support**: Complete containerization for easy deployment
- **CI/CD Pipeline**: Automated build and deployment with GitHub Actions

## 🏗️ Technology Stack

### **Frontend**
- **Next.js 14** - React framework with App Router and SSG/SSR capabilities
- **TypeScript** - Type-safe development environment
- **React 18** - Latest React features with concurrent rendering
- **Bootstrap 5.3** - Modern CSS framework for responsive design
- **React Bootstrap** - Bootstrap components for React
- **Chart.js** - Data visualization and analytics
- **React Icons** - Comprehensive icon library

### **State Management & Data Fetching**
- **SWR** - Smart data fetching with caching and revalidation
- **React Context** - Global state management for authentication

### **Backend & Database**
- **TypeORM** - Modern ORM with TypeScript support
- **JWT** - JSON Web Tokens for secure authentication
- **Zod** - Schema validation for API endpoints

### **Development & DevOps**
- **ESLint** - Code linting and formatting
- **Docker** - Containerization for consistent deployments
- **GitHub Actions** - Automated CI/CD pipeline
- **T3 Env** - Type-safe environment variable management

## 📁 Project Structure

```
jerky-vault/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── auth/          # Authentication pages
│   │   ├── api/           # API endpoints
│   │   └── ...            # Application pages
│   ├── styles/            # Global styles and themes
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions and helpers
│   └── env.js             # Environment validation
├── locales/               # Internationalization files
├── public/                # Static assets
├── screenshots/           # Application screenshots
└── docker-compose.yml.example
```

## 🔧 Installation & Setup

### Prerequisites
- **Node.js** 18.0 or higher
- **npm** 10.0 or higher
- **MySQL** database (local or remote)

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
# Database Configuration
DATABASE_HOST=localhost
DATABASE_USER=your_database_user
DATABASE_PASSWORD=your_database_password
DATABASE_NAME=jerky_vault

# Authentication
JWT_SECRET=your_jwt_secret_key
SECRET=your_general_secret_key

# Application URLs
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000

# Optional Features
MAPBOX_ACCESS_TOKEN=your_mapbox_token
NEXT_PUBLIC_AUTH_ENABLED=true

# Development Flags
NODE_ENV=development
SKIP_ENV_VALIDATION=false
```

### 4. Database Setup

Ensure your MySQL database is running and accessible with the credentials provided in your environment file.

### 5. Run the Application

#### Development Mode
```bash
npm run dev
```

#### Production Build
```bash
npm run build
npm start
```

The application will be available at `http://localhost:3000`

## 🐳 Docker Deployment

### Quick Start with Docker

1. **Prepare Docker Configuration**
   ```bash
   cp docker-compose.yml.example docker-compose.yml
   ```

2. **Update Environment Variables**
   Edit the `docker-compose.yml` file with your configuration:
   ```yaml
   environment:
     DATABASE_HOST: 'your_database_host'
     DATABASE_USER: 'your_database_user'
     DATABASE_PASSWORD: 'your_database_password'
     DATABASE_NAME: 'jerky_vault'
     JWT_SECRET: 'your_jwt_secret'
     SECRET: 'your_secret_key'
     NEXT_PUBLIC_API_URL: 'http://localhost:3000/api'
     NEXT_PUBLIC_FRONTEND_URL: 'http://localhost:3000'
   ```

3. **Launch the Application**
   ```bash
   docker-compose up -d
   ```

### Production Docker Build
```bash
npm run build:docker
docker build -t jerky-vault .
```

## 🌐 Internationalization

JerkyVault supports multiple languages out of the box:

- **English** (en)
- **Russian** (ru)
- **Serbian** (sr)

### Adding a New Language

1. Create a new locale directory: `locales/[language-code]/`
2. Add `common.json` with translated strings
3. Update `i18n.json` configuration
4. Restart the application

### Translation Keys
All user-facing text is managed through translation keys. Key categories include:
- Authentication and security messages
- Form labels and validation
- Navigation and UI elements
- Business domain terminology

## 📊 Application Sections

### **Dashboard**
- Real-time business metrics and KPIs
- Order status distribution charts
- Product performance analytics
- Recent activity timeline
- Quick action buttons for common tasks

### **Recipe Management**
- Complete recipe CRUD operations
- Ingredient quantity tracking
- Step-by-step instructions
- Recipe categorization and search
- Cost calculation per recipe

### **Order System**
- Full order lifecycle management
- Status tracking (pending, processing, completed)
- Client assignment and communication
- Order history and reporting
- Batch processing capabilities

### **Client Management**
- Comprehensive client database
- Contact information management
- Order history per client
- Client communication tools
- Search and filtering options

### **Product Catalog**
- Product information management
- Pricing and cost tracking
- Category organization
- Stock level monitoring
- Product performance metrics

### **User Management**
- Secure user authentication
- Profile management
- Password security features
- Session management
- Access control

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Token Validation**: Automatic token expiration handling
- **Protected Routes**: Authentication middleware for sensitive pages
- **CSRF Protection**: Built-in request validation
- **Input Validation**: Comprehensive data validation with Zod
- **Error Handling**: Secure error messages without sensitive data exposure

## ⚡ Performance Optimizations

- **SWR Caching**: Intelligent data caching and revalidation
- **Static Generation**: Optimized build process for faster loading
- **Image Optimization**: Next.js built-in image optimization
- **Code Splitting**: Automatic code splitting for reduced bundle sizes
- **Lazy Loading**: Component-level lazy loading
- **Database Optimization**: Efficient database queries with TypeORM

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Docker
npm run build:docker     # Build with Docker optimizations
npm run build:no-ssg     # Build without static generation
docker-compose up        # Start with Docker Compose

# Utilities
npm run depcheck         # Check for unused dependencies
```

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
- **Docker Hub**: [jerky-vault](https://hub.docker.com/r/dzarlax/jerky_vault)

---

**JerkyVault** - Streamlining jerky production management with modern web technologies.
