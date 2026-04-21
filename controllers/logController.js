import pool from '../utils/db.js';

export async function getLogs(req, res) {
  try {
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 15);
    const offset = (page - 1) * pageSize;

    const [rows] = await pool.query(
      `SELECT l.log_id, p.product_name, w.warehouse_name,
              l.change_type, l.change_quantity, l.log_date
       FROM logs l
       JOIN inventory i ON l.inventory_id = i.inventory_id
       JOIN products p ON i.product_id = p.product_id
       JOIN warehouses w ON i.warehouse_id = w.warehouse_id
       ORDER BY l.log_date DESC
       LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );

    const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM logs');
    const total = countRows[0].total || 0;
    return res.json({ logs: rows, total });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to fetch logs.' });
  }
}
