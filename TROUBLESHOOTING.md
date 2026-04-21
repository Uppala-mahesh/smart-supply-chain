# Supply Chain Management System - Troubleshooting Guide

## Database Connection Issues

### Issue: "❌ MySQL connection failed"

**Symptom:** Backend won't start, shows `MySQL connection failed: connect ECONNREFUSED`

**Root Causes & Solutions:**

1. **MySQL is not running**
   ```bash
   # On Windows (check Services or run):
   mysql.server start
   
   # On Mac:
   brew services start mysql
   
   # On Linux:
   sudo systemctl start mysql
   # or
   sudo service mysql start
   ```
   Then run `npm run backend` again.

2. **Wrong host in .env file**
   - Default should be: `DB_HOST=localhost`
   - If using TCP: `DB_HOST=127.0.0.1`
   - If using socket: `DB_HOST=/var/run/mysqld/mysqld.sock`
   
   Check which one works:
   ```bash
   mysql -h localhost -u root -p
   # or
   mysql -h 127.0.0.1 -u root -p
   ```

3. **Wrong password in .env file**
   ```bash
   # Test connection with your password:
   mysql -u root -p
   # When prompted, enter your DB_PASSWORD value
   ```

4. **MySQL port is not 3306**
   - Update .env: `DB_HOST=localhost:3307` (if using different port)
   - Or update your MySQL server to use port 3306

### Issue: "Unknown database 'supply_chain'"

**Symptom:** Backend starts but logs `Unknown database`

**Solution:**
1. Create the database:
   ```bash
   mysql -u root -p
   CREATE DATABASE supply_chain;
   exit;
   ```

2. Verify database exists:
   ```bash
   mysql -u root -p -e "SHOW DATABASES;"
   ```

3. Check .env has correct name: `DB_NAME=supply_chain`

### Issue: "Access denied for user 'root'@'localhost'"

**Symptom:** Connection fails with `Access denied` message

**Solutions:**

1. Check your password is correct in .env
2. Reset MySQL root password:
   ```bash
   # macOS:
   sudo mysqld_safe --skip-grant-tables
   mysql -u root
   FLUSH PRIVILEGES;
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
   exit;
   ```

3. Update .env: `DB_PASSWORD=new_password`

---

## Registration/Login Issues

### Issue: "Registration failed" on frontend

**Symptom:** Frontend shows error but no details

**Debugging Steps:**

1. **Check backend is running:**
   ```bash
   # In terminal where you ran npm run backend
   # Should see: ✅ Connected to MySQL database
   # and: 🚀 Backend server running
   ```

2. **Check backend logs when registering:**
   ```
   [REGISTER REQUEST] { name: '...', email: '...' }
   [REGISTER ERROR] Unknown column 'name' in 'field list'
   ```

3. **If error says "Unknown column":**
   - Your MySQL `customers` table has different column names
   - Check current columns:
     ```bash
     mysql -u root -p supply_chain
     DESCRIBE customers;
     exit;
     ```
   - Update `controllers/authController.js` to match your column names
   - Example if columns are `customer_name, customer_email`:
     ```javascript
     const result = await pool.query(
       'INSERT INTO customers (customer_name, customer_email, password) VALUES (?, ?, ?)',
       [name, email, hashedPassword]
     );
     ```

4. **If error says "Duplicate entry for key":**
   - Email already registered
   - Use different email or check users table:
     ```bash
     mysql -u root -p supply_chain
     SELECT * FROM customers WHERE email='dullamanojreddy@gmail.com';
     exit;
     ```

5. **If error says "Table 'supply_chain.customers' doesn't exist":**
   - Table wasn't created
   - Create it:
     ```bash
     mysql -u root -p supply_chain
     CREATE TABLE customers (
       id INT PRIMARY KEY AUTO_INCREMENT,
       name VARCHAR(100) NOT NULL,
       email VARCHAR(100) UNIQUE NOT NULL,
       password VARCHAR(255) NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
     );
     exit;
     ```
   - Update column names if different

6. **If backend doesn't log anything:**
   - Backend crashed or isn't running
   - Restart: Stop current terminal, run `npm run backend` again in new terminal
   - Watch for any error messages on startup

### Issue: "Cannot GET /auth/register" or similar 404 error

**Symptom:** Frontend gets 404 when trying to register

**Solution:** 
1. Check backend is running on port 5000
2. Check VITE_API_BASE in .env: `VITE_API_BASE=http://localhost:5000`
3. Restart frontend: `npm run dev`
4. Test manually:
   ```bash
   curl -X POST http://localhost:5000/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@test.com","password":"password123"}'
   ```

---

## Frontend Issues

### Issue: Tailwind CSS styling not working

**Symptom:** Page loads but no styling (no colors, spacing, etc.)

**Solution:**
1. Check `tailwind.config.js` has correct content:
   ```javascript
   content: ['./src/**/*.{js,jsx}'],  // NOT .ts/.tsx
   ```
2. Rebuild Tailwind:
   ```bash
   npm run build
   ```
3. Check CSS file `src/index.css`:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

### Issue: API errors not showing on frontend

**Symptom:** Network request fails but no error message

**Solution:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Attempt registration/login
4. Click on the failed request
5. Check Response tab for backend error message
6. Report exact error to fix backend

---

## Build & Run Issues

### Issue: "npm run dev" fails

**Symptoms:** Various npm errors

**Solutions:**
1. Delete node_modules & package-lock.json:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run dev
   ```

2. Check Node version (needs 16+):
   ```bash
   node --version  # should be v16.0.0 or higher
   ```

3. On Windows, if "npm: command not found":
   - Reinstall Node.js from nodejs.org
   - Restart terminal/IDE

### Issue: "npm run backend" fails

**Symptom:** `Cannot find module 'express'` or similar

**Solution:**
```bash
npm install
npm run backend
```

### Issue: PORT 5000 already in use

**Symptom:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find process on port 5000:
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :5000
kill -9 <PID>

# Or change port in .env:
PORT=5001
# Update frontend: VITE_API_BASE=http://localhost:5001
```

---

## Quick Diagnostics

Run this script to check everything:

```bash
# 1. Check Node/npm
node --version && npm --version

# 2. Check MySQL is running
mysql --version

# 3. Check database connection
mysql -u root -p -e "USE supply_chain; SELECT COUNT(*) FROM customers;"

# 4. Check .env file
cat .env | grep DB_

# 5. Install dependencies
npm install

# 6. Start backend (in terminal 1)
npm run backend

# 7. Start frontend (in terminal 2)
npm run dev

# 8. Test API (in terminal 3)
curl -X GET http://localhost:5000/health
```

---

## Getting Help

If issues persist:

1. **Collect logs:**
   - Screenshot of backend terminal (full startup message)
   - Screenshot of browser console (F12 → Console tab)
   - Full error message from backend logs
   - Your .env file (password can be hidden)

2. **Common files to check:**
   - `server.js` - Backend startup logic
   - `utils/db.js` - Database connection config
   - `controllers/authController.js` - Registration/login logic
   - `.env` - Configuration
   - `src/api.js` - Frontend API client

3. **Enable verbose logging:**
   - Add temporary logs in controllers:
     ```javascript
     console.log('[DEBUG]', varName, value);
     ```
   - Restart backend and retry
   - Check terminal for debug output
