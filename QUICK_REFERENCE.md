# Supply Chain Management System - Quick Reference

## Start Application

```bash
# Terminal 1: Backend (port 5000)
npm run backend

# Terminal 2: Frontend (port 4173)  
npm run dev

# Open browser:
http://localhost:4173/
```

---

## Common Commands

```bash
# Setup
npm install                    # Install dependencies
npm run diagnose              # Check if setup is correct
cp .env.example .env          # Create .env file

# Development
npm run dev                   # Start frontend dev server
npm run backend              # Start backend server
npm run build                # Build frontend for production

# Database
mysql -u root -p            # Connect to MySQL
mysql -u root -p -e "SHOW DATABASES;"  # List databases
mysql -u root -p supply_chain < file.sql  # Import SQL

# Troubleshooting
npm run diagnose             # Verify all setup is correct
mysql -u root -p -e "SELECT 1;"  # Test MySQL connection
curl http://localhost:5000/health  # Test backend health
```

---

## File Structure Cheat Sheet

```
Project Root/
├── src/                    → Frontend (React)
├── controllers/            → Backend business logic
├── routes/                 → API endpoints
├── middleware/             → JWT auth, etc.
├── utils/                  → Database connection
├── server.js              → Backend main file
├── .env                   → Your config (secret!)
├── README.md              → Setup instructions
├── SETUP_GUIDE.md         → Detailed setup
├── TROUBLESHOOTING.md     → Common issues
└── diagnose.js            → Health check script
```

---

## Environment Variables (.env)

```env
# Database
DB_HOST=localhost         # MySQL server
DB_USER=root             # MySQL user
DB_PASSWORD=pass         # MySQL password
DB_NAME=supply_chain     # Database name

# Security
JWT_SECRET=secret        # Token signing key

# Server
PORT=5000               # Backend port
VITE_API_BASE=http://localhost:5000  # Frontend API URL
```

---

## API Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/auth/register` | ❌ | Create account |
| POST | `/auth/login` | ❌ | Login |
| GET | `/products` | ❌ | List products |
| GET | `/products/:id` | ❌ | Product details |
| POST | `/orders` | ✅ | Create order |
| GET | `/orders` | ✅ | List orders |
| GET | `/logs` | ✅ | View logs |

✅ = Requires login (JWT token)

---

## Database Tables

**customers**
- id, name, email, password, created_at

**products**
- id, name, price, category, description

**orders**
- id, customer_id, status, total_price, created_at

**order_items**
- id, order_id, product_id, quantity, price

**inventory**
- id, product_id, warehouse_id, quantity

**logs**
- id, action, product_id, quantity_change, created_at

---

## Keyboard Shortcuts

| Shortcut | Purpose |
|----------|---------|
| `Ctrl+C` | Stop backend/frontend |
| `F12` | Browser DevTools |
| `Ctrl+Shift+C` | Inspect element |
| `Ctrl+J` | Console tab |
| `Ctrl+Shift+K` | Clear console |

---

## Ports & URLs

| Service | Port | URL |
|---------|------|-----|
| Frontend | 4173 | http://localhost:4173 |
| Backend | 5000 | http://localhost:5000 |
| MySQL | 3306 | localhost:3306 |

---

## Error Messages & Solutions

| Error | Likely Cause | Fix |
|-------|--------------|-----|
| `ECONNREFUSED` | MySQL not running | Run: `brew services start mysql` |
| `Unknown database` | `supply_chain` doesn't exist | Run: `CREATE DATABASE supply_chain;` |
| `Access denied` | Wrong MySQL password | Check DB_PASSWORD in .env |
| `EADDRINUSE` | Port 5000 in use | Change PORT in .env to 5001 |
| `Cannot GET` | Backend not running | Run: `npm run backend` |
| `404 Not Found` | Endpoint doesn't exist | Check backend is running |
| `Registration failed` | Check backend logs | Look for `[REGISTER ERROR]` |

---

## Debugging Checklist

- [ ] MySQL running: `mysql -u root -p`
- [ ] Backend running: `npm run backend`
- [ ] Frontend running: `npm run dev`
- [ ] Browser console clear (F12)
- [ ] Backend logs readable (look for errors)
- [ ] .env file has all variables
- [ ] Database `supply_chain` exists
- [ ] Table `customers` has: id, name, email, password

---

## Performance Tips

- Keep backend and frontend terminals visible
- Check backend logs when errors occur
- Use browser DevTools (F12) to debug
- Run `npm run diagnose` to verify setup
- Clear browser cache (Ctrl+Shift+Delete) if issues persist

---

## Useful Links

- Backend logs → Terminal 1 (npm run backend)
- Frontend logs → Terminal 2 (npm run dev)
- Browser console → F12 → Console tab
- Network tab → F12 → Network tab
- Database → Terminal: `mysql -u root -p supply_chain`

---

## Key Files to Edit

- Frontend styling → `src/index.css` (Tailwind)
- Frontend pages → `src/App.jsx`
- Backend API → `server.js` and `routes/`
- Database config → `.env`
- Auth logic → `controllers/authController.js`
- API client → `src/api.js`

---

## Quick Test

```bash
# Is backend running?
curl http://localhost:5000/health

# Can you reach database?
mysql -u root -p -e "SELECT 1;"

# What's the exact error?
# Check backend terminal for [ERROR] messages
```

---

## More Help

- **Setup:** See [SETUP_GUIDE.md](SETUP_GUIDE.md)
- **Troubleshooting:** See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **README:** See [README.md](README.md)
- **Diagnose:** Run `npm run diagnose`
