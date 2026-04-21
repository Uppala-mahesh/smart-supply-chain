import pool from '../utils/db.js';

export async function getProducts(req, res) {
  try {
    const search = req.query.search || '';
    const category = req.query.category || '';
    const params = [];
    let sql = `SELECT p.product_id, p.product_name, p.product_category, p.product_price, COALESCE(SUM(i.stock_quantity), 0) AS stock
               FROM products p
               LEFT JOIN inventory i ON p.product_id = i.product_id`;

    const filters = [];
    if (search) {
      filters.push('p.product_name LIKE ?');
      params.push(`%${search}%`);
    }
    if (category) {
      filters.push('p.product_category = ?');
      params.push(category);
    }
    if (filters.length) {
      sql += ' WHERE ' + filters.join(' AND ');
    }
    sql += ' GROUP BY p.product_id ORDER BY p.product_name ASC';

    const [rows] = await pool.query(sql, params);
    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to fetch products.' });
  }
}

export async function getProductById(req, res) {
  try {
    const productId = req.params.id;
    const [rows] = await pool.query(
      `SELECT p.product_id, p.product_name, p.product_category, p.product_price, COALESCE(i.stock_quantity, 0) AS stock, w.warehouse_id, w.warehouse_name
       FROM products p
       LEFT JOIN inventory i ON p.product_id = i.product_id
       LEFT JOIN warehouses w ON i.warehouse_id = w.warehouse_id
       WHERE p.product_id = ?`,
      [productId]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to fetch product.' });
  }
}
