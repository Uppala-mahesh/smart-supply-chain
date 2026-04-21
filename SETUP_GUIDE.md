# Supply Chain Management System - Complete Setup Guide

Welcome! This guide will walk you through setting up the Smart Supply Chain Management System step-by-step.

**Estimated time: 10-15 minutes**

---

## Step 1: Prerequisites ✅

Check that you have installed:

### 1a. Node.js

Open a terminal/command prompt and run:
```bash
node --version
```

Should show `v16.0.0` or higher.

**If not installed:** Download from [nodejs.org](https://nodejs.org/) and install (npm comes included).

### 1b. MySQL

```bash
mysql --version
```

Should show a version number like `8.0.x`.

**If not installed:** 
- **macOS:** `brew install mysql` (requires Homebrew)
- **Windows:** Download from [dev.mysql.com/downloads](https://dev.mysql.com/downloads/)
- **Linux:** `sudo apt-get install mysql-server` (Ubuntu/Debian)

### 1c. Git (Optional, but recommended)

```bash
git --version
```

---

## Step 2: Start MySQL 🔧

MySQL must be running before you start the application.

### macOS

**Option 1 - Using Homebrew:**
```bash
brew services start mysql
```

**Option 2 - Manual:**
```bash
mysql.server start
```

### Windows

1. Open **Services** app (search for "Services")
2. Find **MySQL80** (or similar version)
3. Right-click → **Start**

Or use command prompt (as Administrator):
```cmd
net start MySQL80
```

### Linux

```bash
sudo systemctl start mysql
# or
sudo service mysql start
```

**Verify MySQL is running:**
```bash
mysql -u root -p
# Press Enter or type password if you have one
# You should see: mysql>
# Type: exit
```

---

## Step 3: Setup Database 🗄️

Create the database for the application.

```bash
# Connect to MySQL
mysql -u root -p
# Press Enter if you have no password, or type your password

# Create the database
CREATE DATABASE supply_chain;

# Verify it was created
SHOW DATABASES;

# Exit
exit;
```

**Important:** The database name must be exactly `supply_chain` (lowercase).

### Do you have existing data?

If you have an existing database backup:

```bash
mysql -u root -p supply_chain < /path/to/your/backup.sql
```

If you don't have data yet, that's fine! Create the required tables:

```sql
-- Run these in mysql -u root -p supply_chain

CREATE TABLE customers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50),
  description TEXT
);

CREATE TABLE warehouses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(100)
);

CREATE TABLE inventory (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  warehouse_id INT NOT NULL,
  quantity INT DEFAULT 0
);

CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  total_price DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  action VARCHAR(50),
  product_id INT,
  quantity_change INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Step 4: Setup Environment Variables 🔐

The application needs your MySQL credentials in a `.env` file.

### Navigate to project folder

```bash
cd "path/to/smart supply chain"
```

### Create `.env` file

**On macOS/Linux:**
```bash
cp .env.example .env
```

**On Windows:**
```cmd
copy .env.example .env
```

### Edit `.env` file

Open `.env` in your text editor and fill in your MySQL details:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=supply_chain
JWT_SECRET=YourSecureRandomStringHere
PORT=5000
VITE_API_BASE=http://localhost:5000
```

**Fill in:**
- `DB_PASSWORD` - Your MySQL root password (leave empty if you didn't set one)
- `JWT_SECRET` - Keep as is (for development) or change to something random

**Don't change:**
- `DB_HOST`, `DB_USER`, `DB_NAME` (unless your setup is different)
- `PORT`, `VITE_API_BASE` (unless you have port conflicts)

---

## Step 5: Install Dependencies 📦

Download all required npm packages.

```bash
npm install
```

This may take 1-2 minutes. Wait for it to complete.

**Verify it worked:**
```bash
ls node_modules
# Should show many folders
```

---

## Step 6: Run Diagnostic Check ✅

Verify everything is set up correctly:

```bash
npm run diagnose
```

**Expected output:**
```
✅ Node.js v16+
✅ package.json exists
✅ .env file exists
✅ All directories exist
✅ All key files exist
✅ Dependencies configured correctly
...

🎉 All checks passed! You're ready to run:
   npm run backend    (Terminal 1)
   npm run dev        (Terminal 2)
```

**If checks failed:**
- Check the error messages
- See the "Troubleshooting" section below
- Review [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## Step 7: Run the Application 🚀

### Terminal 1 - Start Backend

```bash
npm run backend
```

**Expected output:**
```
[DB CONFIG] Initializing MySQL pool...
   Host: localhost
   User: root
   Database: supply_chain

✅ Connected to MySQL database
   Host: localhost
   Database: supply_chain
   User: root

🚀 Backend server running on http://localhost:5000
   API Base: http://localhost:5000
   Ready for requests!
```

✅ **Backend is running!** Leave this terminal open.

### Terminal 2 - Start Frontend

Open a new terminal/command prompt and run:

```bash
npm run dev
```

**Expected output:**
```
  VITE v5.4.1  ready in 234 ms

  ➜  Local:   http://localhost:4173/
  ➜  press h to show help
```

✅ **Frontend is running!**

### Terminal 3 - Open Application

Click the URL or open in your browser:

```
http://localhost:4173/
```

---

## Step 8: Test the Application 🧪

### Register a New Account

1. Click on **"Register here"**
2. Fill in:
   - **Name:** Your name
   - **Email:** Any email (e.g., test@example.com)
   - **Password:** 8+ characters
3. Click **Register**

**If successful:**
- You'll be logged in automatically
- You'll see the Dashboard page

**If it fails:**
- Check backend terminal (Terminal 1) for error messages
- Look for `[REGISTER ERROR]` with details
- See [Troubleshooting](#troubleshooting) below

### Explore the App

If registration worked:

- ✅ View products (Dashboard)
- ✅ Search/filter products
- ✅ Add products to cart
- ✅ Place an order
- ✅ View your orders
- ✅ View logs (if admin)

---

## Troubleshooting

### ❌ "MySQL connection failed"

**Problem:** Backend shows `❌ MySQL connection failed`

**Solutions:**

1. **Is MySQL running?**
   ```bash
   mysql -u root -p
   # If this connects, MySQL is running
   exit;
   ```

2. **Check .env credentials:**
   ```bash
   cat .env | grep DB_
   ```
   Should show your MySQL password.

3. **Test MySQL connection manually:**
   ```bash
   mysql -u root -p -e "USE supply_chain; SELECT 1;"
   # You should see: 1
   ```

4. **If using different password:**
   ```bash
   # Reset MySQL password (macOS/Linux)
   sudo mysqld_safe --skip-grant-tables
   mysql -u root
   FLUSH PRIVILEGES;
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword';
   exit;
   ```
   Then update .env: `DB_PASSWORD=newpassword`

### ❌ "Registration failed" 

**Problem:** Frontend shows "Registration failed" with no details

**Solutions:**

1. **Check backend terminal** for `[REGISTER ERROR]` message
2. **Common errors:**
   - `Unknown column 'name'` → Your table columns don't match
   - `Duplicate entry` → Email already registered
   - `Connection refused` → MySQL not running

3. **Verify table structure:**
   ```bash
   mysql -u root -p supply_chain
   DESCRIBE customers;
   ```
   Should show columns: `id, name, email, password`

4. **If columns are different:**
   - Update `controllers/authController.js` to match your column names
   - Or recreate the table to match the schema

### ❌ "PORT 5000 already in use"

**Problem:** Backend fails to start with "EADDRINUSE"

**Solutions:**

```bash
# Change .env:
PORT=5001
VITE_API_BASE=http://localhost:5001
```

Then restart:
```bash
npm run backend
```

### ❌ Frontend won't load

**Problem:** Browser shows error or blank page

**Solutions:**

1. Check frontend terminal (Terminal 2) for errors
2. Check browser console (F12 → Console tab)
3. Make sure both terminals are running:
   - Terminal 1: `npm run backend` ✅
   - Terminal 2: `npm run dev` ✅

4. Try fresh install:
   ```bash
   rm -rf node_modules
   npm install
   npm run dev
   ```

### ❌ "Cannot GET /auth/register" or 404 error

**Problem:** Frontend gets 404 when registering

**Solutions:**

1. Is backend running? Check Terminal 1
2. Check `VITE_API_BASE` in `.env`:
   ```env
   VITE_API_BASE=http://localhost:5000
   ```

3. Restart frontend: Stop Terminal 2, run `npm run dev` again

---

## Stopping the Application

To stop the application:

1. **Terminal 1 (Backend):** Press `Ctrl+C`
2. **Terminal 2 (Frontend):** Press `Ctrl+C`

---

## Next Steps

1. **Explore the application** - Register, add products, place orders
2. **Customize** - Edit styling, add new features
3. **Deploy** - When ready, see[README.md](README.md) for production build

---

## Getting Help

If you're stuck:

1. Check **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** for detailed troubleshooting
2. Run **`npm run diagnose`** to check your setup
3. Look at backend terminal logs when errors occur
4. Check browser console (F12) for frontend errors

---

## Success! 🎉

You're now running the Smart Supply Chain Management System!

**Happy coding!**
