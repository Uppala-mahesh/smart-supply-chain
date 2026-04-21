import bcrypt from 'bcryptjs';
import pool from '../utils/db.js';
import { signToken } from '../middleware/authMiddleware.js';

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    
    console.log('[REGISTER REQUEST]', { name, email, passwordLength: password?.length });
    
    // Validate input
    if (!name || !email || !password) {
      const missing = [];
      if (!name) missing.push('name');
      if (!email) missing.push('email');
      if (!password) missing.push('password');
      
      console.log('[REGISTER VALIDATION FAILED]', `Missing fields: ${missing.join(', ')}`);
      return res.status(400).json({ 
        success: false, 
        message: `Missing required fields: ${missing.join(', ')}` 
      });
    }

    // Validate email format
    if (!email.includes('@')) {
      console.log('[REGISTER VALIDATION FAILED] Invalid email format:', email);
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address.' 
      });
    }

    // Check if email already exists
    console.log('[REGISTER] Checking if email exists:', email);
    const [existing] = await pool.query('SELECT customer_id FROM customers WHERE email = ?', [email]);
    
    if (existing && existing.length > 0) {
      console.log(`[REGISTER] Email already registered: ${email}`);
      return res.status(409).json({ 
        success: false, 
        message: `Email "${email}" already registered.` 
      });
    }

    // Hash password
    console.log('[REGISTER] Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new customer
    console.log('[REGISTER] Inserting customer into database...');
    // Find the max customer_id and increment
    const [maxId] = await pool.query('SELECT MAX(customer_id) as max_id FROM customers');
    const newCustomerId = (maxId[0]?.max_id || 1020) + 1;
    
    await pool.query(
      'INSERT INTO customers (customer_id, customer_name, email, password) VALUES (?, ?, ?, ?)',
      [newCustomerId, name, email, hashedPassword]
    );

    const customer = { customer_id: newCustomerId, customer_name: name, email };
    const token = signToken({ customer_id: customer.customer_id, email: customer.email });
    
    console.log(`[REGISTER SUCCESS] ✅ New customer registered: ${email} (ID: ${customer.customer_id})`);
    return res.status(201).json({ 
      success: true, 
      message: 'Registration successful!',
      customer, 
      token 
    });
    
  } catch (error) {
    // Detailed error logging
    console.error('\n[REGISTER ERROR] ❌', error.message);
    console.error('[REGISTER ERROR CODE]', error.code);
    console.error('[REGISTER ERROR SQL]', error.sqlMessage || 'N/A');
    console.error('[REGISTER ERROR DETAILS]', error);
    
    // Provide helpful error messages based on error type
    let userMessage = 'Registration failed. Please try again.';
    
    if (error.code === 'ER_NO_REFERENCED_TABLE') {
      userMessage = 'Database error: customers table not found. Please contact administrator.';
      console.error('[CRITICAL] customers table does not exist!');
    } else if (error.code === 'ER_BAD_FIELD_ERROR' || error.sqlMessage?.includes('Unknown column')) {
      userMessage = 'Database configuration error. Column names may not match.';
      console.error('[CRITICAL] Column mismatch - customers table may use different column names!');
      console.error('[HINT] Check that customers table has columns: id, name, email, password');
    } else if (error.code === 'ER_DUP_ENTRY') {
      userMessage = 'Email already registered.';
    }
    
    return res.status(500).json({ 
      success: false, 
      message: userMessage,
      error: error.message,
      code: error.code
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    
    console.log('[LOGIN REQUEST]', { email, passwordLength: password?.length });
    
    // Validate input
    if (!email || !password) {
      const missing = [];
      if (!email) missing.push('email');
      if (!password) missing.push('password');
      
      console.log('[LOGIN VALIDATION FAILED]', `Missing fields: ${missing.join(', ')}`);
      return res.status(400).json({ 
        success: false, 
        message: `Missing required fields: ${missing.join(', ')}` 
      });
    }

    // Find customer by email
    console.log('[LOGIN] Looking up customer:', email);
    const [rows] = await pool.query(
      'SELECT customer_id, customer_name, email, password FROM customers WHERE email = ?',
      [email]
    );
    
    const customer = rows[0];
    if (!customer) {
      console.log(`[LOGIN FAILED] Email not found in database: ${email}`);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password.' 
      });
    }

    // Verify password
    console.log('[LOGIN] Verifying password...');
    const valid = await bcrypt.compare(password, customer.password);
    
    if (!valid) {
      console.log(`[LOGIN FAILED] Password verification failed for: ${email}`);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password.' 
      });
    }

    // Generate token and return
    const token = signToken({ customer_id: customer.customer_id, email: customer.email });
    
    console.log(`[LOGIN SUCCESS] ✅ User logged in: ${email} (ID: ${customer.customer_id})`);
    return res.json({ 
      success: true,
      message: 'Login successful!',
      customer: { customer_id: customer.customer_id, customer_name: customer.customer_name, email: customer.email }, 
      token 
    });
    
  } catch (error) {
    // Detailed error logging
    console.error('\n[LOGIN ERROR] ❌', error.message);
    console.error('[LOGIN ERROR CODE]', error.code);
    console.error('[LOGIN ERROR SQL]', error.sqlMessage || 'N/A');
    console.error('[LOGIN ERROR DETAILS]', error);
    
    // Provide helpful error messages based on error type
    let userMessage = 'Login failed. Please try again.';
    
    if (error.code === 'ER_NO_REFERENCED_TABLE') {
      userMessage = 'Database error: customers table not found.';
      console.error('[CRITICAL] customers table does not exist!');
    } else if (error.code === 'ER_BAD_FIELD_ERROR' || error.sqlMessage?.includes('Unknown column')) {
      userMessage = 'Database configuration error.';
      console.error('[CRITICAL] Column mismatch - check customers table structure!');
    }
    
    return res.status(500).json({ 
      success: false, 
      message: userMessage,
      error: error.message,
      code: error.code
    });
  }
}

