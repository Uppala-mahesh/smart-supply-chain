# Smart Supply Chain Management System

A full-stack React + Express + MySQL application for managing supply chain operations with user authentication, product catalog, shopping cart, order management, and inventory tracking.

## Features

✅ **User Authentication** - Secure registration and login with JWT tokens  
✅ **Product Catalog** - Search and filter products by category  
✅ **Shopping Cart** - Add/remove items with real-time stock tracking  
✅ **Order Management** - Place orders, track status, view history  
✅ **Inventory Tracking** - Monitor stock levels across warehouses  
✅ **Admin Logs** - View all inventory transactions (admin only)  
✅ **Responsive Design** - Mobile-friendly with Tailwind CSS  

---

## Quick Start (5 minutes)

### Prerequisites

- **Node.js** 16+ ([download](https://nodejs.org))
- **MySQL** 8.0+ ([download](https://dev.mysql.com/downloads/mysql/))
- **npm** (comes with Node.js)

### 1. Setup Database

**Start MySQL:**
```bash
# macOS/Linux:
sudo systemctl start mysql

# Windows: Open Services app and start "MySQL80" or similar

# macOS (Homebrew):
brew services start mysql
```

**Create database:**
```bash
mysql -u root -p
# Enter your MySQL root password when prompted

CREATE DATABASE supply_chain;
exit;
```

**Import existing data** (if you have a database backup):
```bash
mysql -u root -p supply_chain < your_backup.sql
```

### 2. Setup Environment

**Create `.env` file:**
```bash
cp .env.example .env
```

**Edit `.env`** with your MySQL credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=supply_chain
JWT_SECRET=YourSecureRandomStringHere
PORT=5000
VITE_API_BASE=http://localhost:5000
```

### 3. Install & Run

**Install dependencies:**
```bash
npm install
```

**Terminal 1 - Start Backend:**
```bash
npm run backend
```

Should show:
```
✅ Connected to MySQL database
   Host: localhost
   Database: supply_chain
   User: root

🚀 Backend server running on http://localhost:5000
   Ready for requests!
```

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```

Should show:
```
➜  Local:   http://localhost:4173/
```

**Open in browser:**
```
http://localhost:4173/
```

---

## Project Structure

```
smart-supply-chain/
├── src/                      # Frontend React
│   ├── main.jsx             # Entry point
│   ├── App.jsx              # Main app (730+ lines)
│   ├── api.js               # API client with error handling
│   ├── types.js             # Type definitions
│   ├── index.css            # Tailwind CSS
│   ├── contexts/
│   │   └── AuthContext.jsx  # Auth state (localStorage)
│   └── components/
│       ├── Navbar.jsx       # Navigation
│       ├── Spinner.jsx      # Loading indicator
│       └── Notifications.jsx # Toast alerts
├── server.js                # Express main server
├── utils/
│   └── db.js               # MySQL connection pool
├── middleware/
│   └── authMiddleware.js   # JWT verification
├── controllers/
│   ├── authController.js    # Register/Login
│   ├── productController.js # Products & search
│   ├── orderController.js   # Orders with transactions
│   ├── inventoryController.js
│   └── logController.js     # Inventory logs
├── routes/                  # Express routing
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── orderRoutes.js
│   ├── inventoryRoutes.js
│   └── logRoutes.js
├── .env.example             # Environment template
├── .env                     # Your config (gitignored)
├── package.json             # Dependencies
├── tailwind.config.js       # Tailwind CSS config
├── vite.config.js           # Vite build config
├── README.md                # This file
└── TROUBLESHOOTING.md       # Detailed troubleshooting
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Create new account |
| POST | `/auth/login` | ❌ | Login and get JWT |

### Products & Inventory
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/products?search=text&category=cat` | ❌ | List products (searchable) |
| GET | `/products/:id` | ❌ | Product details + stock |
| GET | `/inventory` | ❌ | List all inventory |
| POST | `/inventory` | ✅ | Add stock |
| PUT | `/inventory/:id` | ✅ | Adjust stock |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/orders` | ✅ | Create new order |
| GET | `/orders` | ✅ | Get user's orders |
| GET | `/orders/:id` | ✅ | Get order details |

### Logs
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/logs?page=1&pageSize=15` | ✅ | Inventory change logs (admin) |

✅ = Requires JWT token (login first)

---

## Database Schema

Your `supply_chain` database should have these tables:

**Check existing tables:**
```bash
mysql -u root -p supply_chain
SHOW TABLES;
DESCRIBE customers;
DESCRIBE products;
```

**Expected columns:**

```sql
customers:
  - id (INT, PRIMARY KEY, AUTO_INCREMENT)
  - name (VARCHAR, NOT NULL)
  - email (VARCHAR, UNIQUE, NOT NULL)
  - password (VARCHAR, NOT NULL)
  - created_at (TIMESTAMP)

products:
  - id (INT, PRIMARY KEY)
  - name (VARCHAR)
  - price (DECIMAL)
  - category (VARCHAR)
  - description (TEXT)

orders:
  - id (INT, PRIMARY KEY)
  - customer_id (INT, FOREIGN KEY)
  - status (VARCHAR)
  - total_price (DECIMAL)
  - created_at (TIMESTAMP)

order_items:
  - id (INT, PRIMARY KEY)
  - order_id (INT, FOREIGN KEY)
  - product_id (INT, FOREIGN KEY)
  - quantity (INT)
  - price (DECIMAL)

inventory:
  - id (INT, PRIMARY KEY)
  - product_id (INT)
  - warehouse_id (INT)
  - quantity (INT)

logs:
  - id (INT, PRIMARY KEY)
  - action (VARCHAR)
  - product_id (INT)
  - quantity_change (INT)
  - created_at (TIMESTAMP)
```

---

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DB_HOST` | ✅ | MySQL server host | localhost |
| `DB_USER` | ✅ | MySQL username | root |
| `DB_PASSWORD` | ✅ | MySQL password | SecureP@ss123 |
| `DB_NAME` | ✅ | Database name | supply_chain |
| `JWT_SECRET` | ✅ | Token signing key | RandomSecretString |
| `PORT` | ❌ | Backend port | 5000 |
| `VITE_API_BASE` | ❌ | Frontend API URL | http://localhost:5000 |

---

## Scripts

```bash
# Development
npm run dev              # Start frontend (port 4173)
npm run backend         # Start backend (port 5000)

# Production
npm run build           # Build React app
npm run preview         # Preview production build

# Utilities
npm start               # Run backend only
```

---

## Common Issues

### ❌ "MySQL connection failed"
**Check:**
1. Is MySQL running? Run: `mysql -u root -p`
2. Are credentials in `.env` correct?
3. Does database exist? Run: `mysql -u root -p -e "SHOW DATABASES;"`

**See:** [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

### ❌ "Registration failed"
**Check backend logs:**
1. Terminal with `npm run backend` should show `[REGISTER REQUEST]` and `[REGISTER ERROR]`
2. Common errors: "Unknown column", "Duplicate entry", "Connection refused"

**See:** [TROUBLESHOOTING.md#registrationlogin-issues](TROUBLESHOOTING.md#registrationlogin-issues)

### ❌ "PORT 5000 already in use"
**Change port in `.env`:**
```env
PORT=5001
VITE_API_BASE=http://localhost:5001
```

**Or kill process:**
```bash
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :5000
kill -9 <PID>
```

### ❌ "Tailwind CSS not working"
Check `tailwind.config.js` has:
```javascript
content: ['./src/**/*.{js,jsx}'],  // NOT .ts or .tsx
```

Rebuild:
```bash
npm run build
```

---

## Development Tips

### Debug Backend Errors
1. Check terminal where `npm run backend` is running
2. Look for `[REGISTER REQUEST]`, `[ERROR]`, `[LOGIN SUCCESS]` messages
3. Add temporary logs in controllers: `console.log('[DEBUG]', value);`

### Debug Frontend Errors
1. Open browser DevTools (F12)
2. Check Console tab for error messages
3. Check Network tab to see API responses
4. Look for red error text in console

### Test API Manually
```bash
# Check backend is running
curl http://localhost:5000/health

# Test registration
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"Password123"}'

# Get products
curl http://localhost:5000/products
```

### Test Database Directly
```bash
mysql -u root -p supply_chain

# Check users
SELECT * FROM customers;

# Check products
SELECT * FROM products;

# Exit
exit;
```

---

## Testing Checklist

- [ ] ✅ MySQL is running: `mysql --version`
- [ ] ✅ `.env` file has correct credentials
- [ ] ✅ Backend starts: `npm run backend`
- [ ] ✅ Frontend starts: `npm run dev`
- [ ] ✅ Can register account
- [ ] ✅ Can login with credentials
- [ ] ✅ Products display with stock info
- [ ] ✅ Can add items to cart
- [ ] ✅ Can place order
- [ ] ✅ Orders appear in Orders page
- [ ] ✅ Inventory logs appear (admin)
- [ ] ✅ Can logout

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 18.3+ |
| Styling | Tailwind CSS | 3.4+ |
| Build | Vite | 5.4+ |
| Routing | React Router | 6.15+ |
| Backend | Node.js/Express | 4.22+ |
| Database | MySQL | 8.0+ |
| Auth | JWT (jsonwebtoken) | 9.0+ |
| Password | bcryptjs | 2.4+ |

---

## Full Troubleshooting

For detailed troubleshooting including:
- Database connection issues
- Registration/Login failures
- Frontend styling problems
- Port conflicts
- MySQL setup

**See:** [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## Getting Help

If issues persist, collect:
1. Backend terminal output (full startup)
2. Browser console errors (F12)
3. Network tab responses
4. Your `.env` file (password can be `***`)
5. MySQL version: `mysql --version`
6. Node version: `node --version`

---

## License

MIT

---

## Next Steps

1. ✅ Install Node.js and MySQL
2. ✅ Setup `.env` file
3. ✅ Run `npm install`
4. ✅ Start Backend: `npm run backend`
5. ✅ Start Frontend: `npm run dev`
6. ✅ Register a test account
7. ✅ Explore the application!

**Questions?** Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

