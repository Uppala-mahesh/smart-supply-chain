import pool from '../utils/db.js';

export async function placeOrder(req, res) {
  const connection = await pool.getConnection();
  try {
    const customerId = req.user.customer_id;
    let { warehouse_id, items } = req.body;
    
    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ success: false, message: 'items are required.' });
    }

    const productIds = items.map((item) => item.product_id);
    const [products] = await connection.query(
      `SELECT p.product_id, p.product_name, p.product_price, COALESCE(SUM(i.stock_quantity),0) AS stock
       FROM products p
       LEFT JOIN inventory i ON p.product_id = i.product_id
       WHERE p.product_id IN (?)
       GROUP BY p.product_id`,
      [productIds]
    );

    const productMap = new Map(products.map((product) => [product.product_id, product]));
    for (const item of items) {
      const product = productMap.get(item.product_id);
      if (!product) {
        return res.status(400).json({ success: false, message: `Product not found: ${item.product_id}` });
      }
      if (item.quantity <= 0) {
        return res.status(400).json({ success: false, message: 'Quantity must be greater than zero.' });
      }
      if (item.quantity > product.stock) {
        return res.status(400).json({ success: false, message: `Not enough stock for ${product.product_name}.` });
      }
    }

    // If warehouse_id is 0 or not provided, find first warehouse with stock
    if (!warehouse_id || warehouse_id === 0) {
      const [availableWarehouses] = await connection.query(
        `SELECT DISTINCT i.warehouse_id FROM inventory i WHERE i.product_id IN (?) LIMIT 1`,
        [productIds]
      );
      
      if (!availableWarehouses || availableWarehouses.length === 0) {
        return res.status(400).json({ success: false, message: 'No warehouse has stock for these products.' });
      }
      warehouse_id = availableWarehouses[0].warehouse_id;
    }

    await connection.beginTransaction();
    const [orderResult] = await connection.query(
      'INSERT INTO orders (customer_id, warehouse_id, order_date) VALUES (?, ?, NOW())',
      [customerId, warehouse_id]
    );

    const orderId = orderResult.insertId;
    const orderItems = items.map((item) => {
      const product = productMap.get(item.product_id);
      return [orderId, item.product_id, item.quantity];
    });

    for (const orderItem of orderItems) {
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)',
        orderItem
      );
    }

    await connection.commit();
    
    // Get warehouse name
    const [warehouseData] = await connection.query('SELECT warehouse_name FROM warehouses WHERE warehouse_id = ?', [warehouse_id]);
    const warehouseName = warehouseData && warehouseData[0] ? warehouseData[0].warehouse_name : 'Warehouse';
    const orderTime = new Date().toISOString();
    
    return res.status(201).json({ 
      success: true, 
      message: 'Order placed successfully.', 
      order_id: orderId, 
      order_time: orderTime,
      warehouse_id: warehouse_id,
      warehouse_name: warehouseName
    });
  } catch (error) {
    await connection.rollback();
    console.error('[ORDER ERROR]', error.message);
    console.error('[ORDER ERROR DETAILS]', error);
    return res.status(500).json({ success: false, message: `Unable to place order: ${error.message}` });
  } finally {
    connection.release();
  }
}

export async function getOrders(req, res) {
  try {
    const customerId = req.user.customer_id;
    const [rows] = await pool.query(
      `SELECT o.order_id, o.order_date, w.warehouse_name,
              oi.product_id, oi.quantity, p.product_name, p.product_price,
              (SELECT MIN(l.log_date)
               FROM logs l
               JOIN inventory i ON i.inventory_id = l.inventory_id
               WHERE i.product_id = oi.product_id
                 AND i.warehouse_id = o.warehouse_id
                 AND l.change_type = 'OUT'
                 AND l.log_date >= o.order_date
                 AND l.log_date < o.order_date + INTERVAL 1 DAY) AS order_time
       FROM orders o
       JOIN warehouses w ON o.warehouse_id = w.warehouse_id
       JOIN order_items oi ON oi.order_id = o.order_id
       JOIN products p ON oi.product_id = p.product_id
       WHERE o.customer_id = ?
       ORDER BY o.order_date DESC`,
      [customerId]
    );

    const orders = [];
    const orderMap = new Map();
    for (const row of rows) {
      if (!orderMap.has(row.order_id)) {
        orderMap.set(row.order_id, {
          order_id: row.order_id,
          order_date: row.order_date,
          order_time: row.order_time || row.order_date,
          warehouse_name: row.warehouse_name,
          items: []
        });
      }
      orderMap.get(row.order_id).items.push({
        product_id: row.product_id,
        product_name: row.product_name,
        quantity: row.quantity,
        product_price: row.product_price
      });
    }

    return res.json(Array.from(orderMap.values()));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to fetch orders.' });
  }
}

export async function getOrderById(req, res) {
  try {
    const customerId = req.user.customer_id;
    const orderId = req.params.id;
    const [rows] = await pool.query(
      `SELECT o.order_id, o.order_date, w.warehouse_name,
              oi.product_id, oi.quantity, p.product_name, p.product_price,
              (SELECT MIN(l.log_date)
               FROM logs l
               JOIN inventory i ON i.inventory_id = l.inventory_id
               WHERE i.product_id = oi.product_id
                 AND i.warehouse_id = o.warehouse_id
                 AND l.change_type = 'OUT'
                 AND l.log_date >= o.order_date
                 AND l.log_date < o.order_date + INTERVAL 1 DAY) AS order_time
       FROM orders o
       JOIN warehouses w ON o.warehouse_id = w.warehouse_id
       JOIN order_items oi ON oi.order_id = o.order_id
       JOIN products p ON oi.product_id = p.product_id
       WHERE o.customer_id = ? AND o.order_id = ?`,
      [customerId, orderId]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = {
      order_id: rows[0].order_id,
      order_date: rows[0].order_date,
      order_time: rows[0].order_time || rows[0].order_date,
      warehouse_name: rows[0].warehouse_name,
      items: rows.map((row) => ({
        product_id: row.product_id,
        product_name: row.product_name,
        quantity: row.quantity,
        price: row.product_price
      }))
    };
    return res.json(order);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to fetch order.' });
  }
}
