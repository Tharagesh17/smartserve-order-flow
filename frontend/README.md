# SmartServe - Restaurant Management Platform

A comprehensive restaurant management platform built with modern web technologies, featuring QR code ordering, kitchen management, and advanced analytics. Now with **Cash Payment System** and **FIFO Order Queue** for hotel operations!

## ✨ **New Features (Latest Update)**

### 💰 **Cash Payment System**
- **Hotel Staff Authorization**: Only authorized staff can process cash payments
- **Payment Tracking**: Complete audit trail of cash transactions
- **Staff Management**: Role-based access control for payment processing
- **Payment Notes**: Add notes and comments for each cash transaction
- **Real-time Updates**: Instant payment status updates across the system

### 🔢 **FIFO Order Queue (First In, First Out)**
- **Automatic Queue Management**: Orders are automatically queued by arrival time
- **Priority Override**: High-priority orders can be moved up in the queue
- **Queue Position Control**: Staff can manually adjust order positions
- **Wait Time Estimation**: Real-time estimated wait times for customers
- **Queue Statistics**: Comprehensive analytics on queue performance
- **Real-time Updates**: Queue refreshes automatically every 30 seconds

### 🏨 **Hotel-Specific Features**
- **Room Billing Integration**: Seamless integration with hotel billing systems
- **Multi-Outlet Support**: Manage multiple restaurant outlets from one dashboard
- **Staff Roles**: Manager, Cashier, Kitchen, Waiter roles with specific permissions
- **Payment Authorization**: Configurable payment processing permissions

## 🚀 **Core Features**

### **QR Code Ordering System**
- **Instant Ordering**: Customers scan QR codes to place orders instantly
- **Mobile-First Design**: Optimized for all device sizes
- **Real-time Updates**: Live order status and progress tracking
- **Multiple Payment Options**: Online, cash, and counter payment methods

### **Kitchen Management**
- **Real-time Dashboard**: Live view of all pending and preparing orders
- **Batch Preparation**: Group similar orders for efficient preparation
- **Order Status Tracking**: From received to completed with timestamps
- **Kitchen Workflow**: Streamlined order preparation process

### **Menu Management**
- **Dynamic Menu Builder**: Easy-to-use interface for menu creation
- **Category Management**: Organize items by categories and types
- **Pricing Variants**: Multiple sizes and pricing options
- **Add-ons & Modifiers**: Customizable item options and extras
- **Allergen Information**: Comprehensive allergen tracking and display

### **Analytics & Reporting**
- **Sales Analytics**: Comprehensive sales data and trends
- **Order Analytics**: Order patterns and customer behavior insights
- **Performance Metrics**: Kitchen efficiency and order fulfillment times
- **Revenue Tracking**: Detailed financial reporting and analysis

### **Staff Management**
- **Role-Based Access**: Different permission levels for staff members
- **Activity Tracking**: Monitor staff actions and performance
- **Shift Management**: Track working hours and schedules
- **Payment Authorization**: Control who can process payments

## 🎨 **Design System**

### **Color Palette**
- **Primary Orange**: #FF7518 - Energy and excitement for CTAs
- **Primary Blue**: #40E0D0 - Trust and calmness for navigation
- **Secondary Teal**: #A7BEAE - Subtle accents and highlights
- **Dark Theme**: Professional dark interface with high contrast

### **Design Principles**
- **60/30/10 Rule**: 60% neutrals, 30% blue tones, 10% orange accents
- **High Contrast**: Minimum 4.5:1 ratio for accessibility
- **Mobile-First**: Responsive design optimized for all devices
- **Modern UI**: Clean, professional interface with smooth animations

## 🛠 **Technology Stack**

### **Frontend**
- **React 18**: Latest React with concurrent features
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality component library
- **Vite**: Fast build tool and dev server

### **Backend & Database**
- **Supabase**: Open-source Firebase alternative
- **PostgreSQL**: Robust relational database
- **Edge Functions**: Serverless backend functions
- **Real-time Subscriptions**: Live data updates

### **State Management**
- **React Query**: Server state management and caching
- **Context API**: Local state management
- **Optimistic Updates**: Smooth user experience

### **Payment Integration**
- **Razorpay**: Secure online payment processing
- **Cash Payment System**: Staff-managed cash transactions
- **Payment Tracking**: Complete transaction history

## 📁 **Project Structure**

```
frontend/
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── CashPaymentView.tsx    # New: Cash payment processing
│   │   │   ├── OrdersView.tsx         # Order management with FIFO queue
│   │   │   ├── KitchenView.tsx        # Kitchen dashboard
│   │   │   ├── MenuManagement.tsx     # Menu builder
│   │   │   └── ReportsView.tsx        # Analytics and reporting
│   │   ├── ordering/
│   │   │   ├── Cart.tsx               # Shopping cart with cash payment
│   │   │   ├── MenuDisplay.tsx        # Customer menu view
│   │   │   └── RestaurantHeader.tsx   # Restaurant branding
│   │   └── ui/                        # Reusable UI components
│   ├── pages/
│   │   ├── Dashboard.tsx              # Main dashboard
│   │   ├── OrderingPage.tsx           # Customer ordering interface
│   │   └── Auth.tsx                   # Authentication
│   └── integrations/
│       └── supabase/                  # Database and backend
```

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ and npm/yarn
- Supabase account and project
- Razorpay account (for online payments)

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smartserve-order-flow
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Fill in your Supabase and Razorpay credentials
   ```

4. **Database Setup**
   ```bash
   # Run the migrations in your Supabase project
   # The new cash payment and FIFO queue tables will be created
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

### **Database Migrations**

The latest update includes new database tables and functions:

- **Staff Management**: `staff` table for role-based access
- **Cash Payments**: `cash_payments` table for transaction tracking
- **Order Queue**: `order_queue` table for FIFO management
- **Payment Functions**: Database functions for processing payments

## 🔧 **Configuration**

### **Staff Roles & Permissions**
```sql
-- Create staff member with payment authorization
INSERT INTO staff (restaurant_id, name, role, can_authorize_payments)
VALUES ('restaurant-uuid', 'Manager Name', 'manager', true);
```

### **Payment Authorization**
- **Managers**: Full payment processing access
- **Cashiers**: Cash payment processing only
- **Kitchen Staff**: Order management access
- **Waiters**: Order viewing access

### **Queue Management**
- **Integrated Queue**: FIFO queue functionality is now integrated into OrdersView
- **Status-based Organization**: Orders are organized by status (Pending, Ready, Completed)
- **Priority Override**: High-priority orders can be moved up in the queue
- **Manual Adjustment**: Staff can reorder queue positions for pending orders
- **Real-time Updates**: Orders update automatically via Supabase subscriptions

## 📱 **Usage Guide**

### **For Hotel Staff**

1. **Cash Payment Processing**
   - Navigate to "Cash Payments" in the dashboard
   - Select the order to process
   - Enter payment amount and notes
   - Confirm payment with staff authorization

2. **Queue Management**
   - Navigate to "FIFO Queue" in the dashboard
   - View all orders in queue order
   - Use arrow buttons to adjust order positions
   - Monitor estimated wait times

3. **Order Management**
   - View all orders in real-time
   - Update order statuses
   - Process payments and track transactions

### **For Customers**

1. **Placing Orders**
   - Scan QR code or visit ordering page
   - Browse menu and add items to cart
   - Choose payment method (cash, online, or counter)
   - Complete order and receive confirmation

2. **Payment Options**
   - **Cash**: Pay at counter (staff will process)
   - **Online**: Secure payment via Razorpay
   - **Counter**: Pay at restaurant counter

## 🔒 **Security Features**

- **Staff Authentication**: Role-based access control
- **Payment Authorization**: Only authorized staff can process payments
- **Audit Trail**: Complete transaction history and logs
- **Data Encryption**: Secure data transmission and storage
- **Session Management**: Secure user sessions and authentication

## 📊 **Performance Features**

- **Real-time Updates**: Live data synchronization
- **Optimistic UI**: Smooth user experience with instant feedback
- **Lazy Loading**: Code splitting for faster initial load
- **Caching**: Intelligent data caching with React Query
- **Responsive Design**: Optimized for all device sizes

## 🧪 **Testing**

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e
```

## 🚀 **Deployment**

### **Production Build**
```bash
npm run build
npm run preview
```

### **Environment Variables**
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key
```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

- **Documentation**: [Project Wiki](wiki-url)
- **Issues**: [GitHub Issues](issues-url)
- **Discussions**: [GitHub Discussions](discussions-url)
- **Email**: support@smartserve.com

## 🔮 **Roadmap**

### **Upcoming Features**
- **Advanced Analytics**: Machine learning insights
- **Inventory Management**: Stock tracking and alerts
- **Customer Loyalty**: Rewards and membership system
- **Multi-language Support**: Internationalization
- **Mobile Apps**: Native iOS and Android applications

### **Recent Updates**
- ✅ **Cash Payment System**: Staff-managed cash transactions
- ✅ **FIFO Order Queue**: First In, First Out order management
- ✅ **Staff Management**: Role-based access control
- ✅ **Dark Theme**: Professional dark interface
- ✅ **Real-time Updates**: Live data synchronization

---

**SmartServe** - Transforming restaurant management with modern technology and intuitive design! 🚀🍽️
