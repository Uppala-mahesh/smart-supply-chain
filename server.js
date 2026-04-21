import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import logRoutes from './routes/logRoutes.js';
import pool from './utils/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser requests and any localhost dev port.
      if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    }
  })
);
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Supply chain backend is running.' });
});

app.use('/', authRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/logs', logRoutes);

async function startServer() {
  try {
    // Test database connection
    const connection = await pool.getConnection();
    await connection.query('SELECT 1');
    connection.release();
    
    console.log('\n✅ Connected to MySQL database');
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   Database: ${process.env.DB_NAME || 'supply_chain'}`);
    console.log(`   User: ${process.env.DB_USER || 'root'}`);
  } catch (err) {
    console.error('\n❌ MySQL connection failed:', err.message);
    console.error('\n📋 Troubleshooting:');
    console.error('   1. Is MySQL running? (sudo systemctl start mysql or mysql.server start)');
    console.error('   2. Check .env file has correct credentials:');
    console.error(`      - DB_HOST: ${process.env.DB_HOST || 'localhost'}`);
    console.error(`      - DB_USER: ${process.env.DB_USER || 'root'}`);
    console.error(`      - DB_PASSWORD: ${process.env.DB_PASSWORD ? '***' : '(empty)'}`);
    console.error(`      - DB_NAME: ${process.env.DB_NAME || 'supply_chain'}`);
    console.error('   3. Verify database exists: mysql -u root -p -e "SHOW DATABASES;"');
    console.error('   4. Check MySQL is accessible: mysql -u root -p');
    process.exit(1);
  }
  
  const server = app.listen(PORT, () => {
    console.log(`\n🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`   API Base: ${process.env.VITE_API_BASE || 'http://localhost:5000'}`);
    console.log(`   Ready for requests!\n`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`\n⚠️ Port ${PORT} is already in use.`);
      console.error('   Another backend instance is already running.');
      console.error(`   Use existing server at: http://localhost:${PORT}`);
      return process.exit(1);
    }

    console.error('\n❌ Server startup failed:', error.message);
    process.exit(1);
  });
}

startServer();
