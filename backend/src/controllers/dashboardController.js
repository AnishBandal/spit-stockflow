const db = require('../config/database');

class DashboardController {
  // Get dashboard statistics
  async getStats(req, res) {
    try {
      // Total products
      const productsResult = await db.query('SELECT COUNT(*) FROM products');
      const totalProducts = parseInt(productsResult.rows[0].count);

      // Low stock items
      const lowStockResult = await db.query(`
        SELECT COUNT(DISTINCT p.id) 
        FROM products p
        LEFT JOIN stock s ON p.id = s.product_id
        GROUP BY p.id, p.reorder_level
        HAVING COALESCE(SUM(s.on_hand), 0) > 0 AND COALESCE(SUM(s.on_hand), 0) <= p.reorder_level
      `);
      const lowStock = parseInt(lowStockResult.rows.length);

      // Out of stock items
      const outOfStockResult = await db.query(`
        SELECT COUNT(DISTINCT p.id) 
        FROM products p
        LEFT JOIN stock s ON p.id = s.product_id
        GROUP BY p.id
        HAVING COALESCE(SUM(s.on_hand), 0) = 0
      `);
      const outOfStock = parseInt(outOfStockResult.rows.length);

      // Pending receipts
      const receiptsResult = await db.query(
        `SELECT COUNT(*) FROM operations 
         WHERE type = 'Receipt' AND status != 'Done' AND status != 'Canceled'`
      );
      const pendingReceipts = parseInt(receiptsResult.rows[0].count);

      // Pending deliveries
      const deliveriesResult = await db.query(
        `SELECT COUNT(*) FROM operations 
         WHERE type = 'Delivery' AND status != 'Done' AND status != 'Canceled'`
      );
      const pendingDeliveries = parseInt(deliveriesResult.rows[0].count);

      // Total operations
      const operationsResult = await db.query('SELECT COUNT(*) FROM operations');
      const totalOperations = parseInt(operationsResult.rows[0].count);

      // Operations by type
      const operationsByType = await db.query(`
        SELECT type, status, COUNT(*) as count
        FROM operations
        GROUP BY type, status
      `);

      // Recent operations
      const recentOperations = await db.query(`
        SELECT o.*, u.name as responsible_name
        FROM operations o
        LEFT JOIN users u ON o.responsible_id = u.id
        ORDER BY o.created_at DESC
        LIMIT 10
      `);

      // Stock value
      const stockValueResult = await db.query(`
        SELECT SUM(on_hand * cost_per_unit) as total_value
        FROM stock
      `);
      const totalStockValue = parseFloat(stockValueResult.rows[0].total_value || 0);

      res.json({
        success: true,
        stats: {
          totalProducts,
          lowStock,
          outOfStock,
          pendingReceipts,
          pendingDeliveries,
          totalOperations,
          totalStockValue: totalStockValue.toFixed(2),
          operationsByType: operationsByType.rows,
          recentOperations: recentOperations.rows,
        },
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Get move history
  async getMoveHistory(req, res) {
    try {
      const { product_id, limit = 50 } = req.query;
      
      let query = `
        SELECT mh.*, 
               p.name as product_name, p.sku,
               u.name as user_name,
               o.reference as operation_reference
        FROM move_history mh
        JOIN products p ON mh.product_id = p.id
        LEFT JOIN users u ON mh.user_id = u.id
        LEFT JOIN operations o ON mh.operation_id = o.id
      `;
      
      const params = [];
      if (product_id) {
        query += ' WHERE mh.product_id = $1';
        params.push(product_id);
      }
      
      query += ` ORDER BY mh.created_at DESC LIMIT $${params.length + 1}`;
      params.push(limit);

      const result = await db.query(query, params);

      res.json({
        success: true,
        history: result.rows,
      });
    } catch (error) {
      console.error('Get move history error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
}

module.exports = new DashboardController();
