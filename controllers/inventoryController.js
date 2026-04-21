import pool from '../utils/db.js';

export async function getInventory(req, res) {
  try {
    const productId = req.query.product_id || null;
    const warehouseId = req.query.warehouse_id || null;
    const params = [];
    let sql = `SELECT i.inventory_id, i.product_id, p.product_name, i.warehouse_id, w.warehouse_name, i.stock_quantity
               FROM inventory i
               JOIN products p ON i.product_id = p.product_id
               JOIN warehouses w ON i.warehouse_id = w.warehouse_id`;

    const filters = [];
    if (productId) {
      filters.push('i.product_id = ?');
      params.push(productId);
    }
    if (warehouseId) {
      filters.push('i.warehouse_id = ?');
      params.push(warehouseId);
    }
    if (filters.length) {
      sql += ' WHERE ' + filters.join(' AND ');
    }
    sql += ' ORDER BY p.product_name, w.warehouse_name';

    const [rows] = await pool.query(sql, params);
    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to fetch inventory.' });
  }
}

export async function addInventory(req, res) {
  try {
    const { product_id, warehouse_id, stock_quantity } = req.body;
    if (!product_id || !warehouse_id || !stock_quantity || stock_quantity <= 0) {
      return res.status(400).json({ success: false, message: 'product_id, warehouse_id and stock_quantity are required.' });
    }

    const [existing] = await pool.query('SELECT inventory_id, stock_quantity FROM inventory WHERE product_id = ? AND warehouse_id = ?', [product_id, warehouse_id]);
    if (existing.length) {
      await pool.query('UPDATE inventory SET stock_quantity = stock_quantity + ? WHERE inventory_id = ?', [stock_quantity, existing[0].inventory_id]);
      await pool.query('INSERT INTO logs (inventory_id, change_type, change_quantity, log_date) VALUES (?, ?, ?, NOW())', [existing[0].inventory_id, 'IN', stock_quantity]);
      return res.json({ success: true, message: 'Inventory updated.' });
    }

    const [result] = await pool.query('INSERT INTO inventory (product_id, warehouse_id, stock_quantity) VALUES (?, ?, ?)', [product_id, warehouse_id, stock_quantity]);
    await pool.query('INSERT INTO logs (inventory_id, change_type, change_quantity, log_date) VALUES (?, ?, ?, NOW())', [result.insertId, 'IN', stock_quantity]);
    return res.status(201).json({ success: true, message: 'Inventory record created.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to update inventory.' });
  }
}

export async function adjustInventory(req, res) {
  try {
    const inventoryId = req.params.id;
    const { stock_quantity } = req.body;
    if (stock_quantity == null || stock_quantity < 0) {
      return res.status(400).json({ success: false, message: 'stock_quantity is required and must be non-negative.' });
    }

    const [rows] = await pool.query('SELECT product_id, warehouse_id, stock_quantity FROM inventory WHERE inventory_id = ?', [inventoryId]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Inventory item not found.' });
    }

    const original = rows[0];
    const delta = stock_quantity - original.stock_quantity;
    if (delta === 0) {
      return res.json({ success: true, message: 'Inventory quantity unchanged.' });
    }

    await pool.query('UPDATE inventory SET stock_quantity = ? WHERE inventory_id = ?', [stock_quantity, inventoryId]);
    await pool.query('INSERT INTO logs (inventory_id, change_type, change_quantity, log_date) VALUES (?, ?, ?, NOW())', [
      inventoryId,
      delta > 0 ? 'IN' : 'OUT',
      Math.abs(delta)
    ]);

    return res.json({ success: true, message: 'Inventory adjusted.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to adjust inventory.' });
  }
}
