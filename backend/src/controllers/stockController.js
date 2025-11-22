const db = require('../config/database');

class StockController {
  // Get all stock
  async getAll(req, res) {
    try {
      const { warehouse_id, product_id } = req.query;
      
      let query = `
        SELECT s.*, 
               p.name as product_name, p.sku, p.unit_of_measure,
               w.name as warehouse_name, w.short_code as warehouse_code,
               l.name as location_name, l.short_code as location_code
        FROM stock s
        JOIN products p ON s.product_id = p.id
        JOIN warehouses w ON s.warehouse_id = w.id
        JOIN locations l ON s.location_id = l.id
      `;
      
      const conditions = [];
      const params = [];
      let paramCount = 1;

      if (warehouse_id) {
        conditions.push(`s.warehouse_id = $${paramCount}`);
        params.push(warehouse_id);
        paramCount++;
      }

      if (product_id) {
        conditions.push(`s.product_id = $${paramCount}`);
        params.push(product_id);
        paramCount++;
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      query += ' ORDER BY s.updated_at DESC';

      const result = await db.query(query, params);

      res.json({
        success: true,
        stock: result.rows,
      });
    } catch (error) {
      console.error('Get stock error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Get single stock item
  async getOne(req, res) {
    try {
      const { id } = req.params;

      const result = await db.query(
        `SELECT s.*, 
                p.name as product_name, p.sku,
                w.name as warehouse_name,
                l.name as location_name
         FROM stock s
         JOIN products p ON s.product_id = p.id
         JOIN warehouses w ON s.warehouse_id = w.id
         JOIN locations l ON s.location_id = l.id
         WHERE s.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Stock item not found' });
      }

      res.json({
        success: true,
        stock: result.rows[0],
      });
    } catch (error) {
      console.error('Get stock error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Create or update stock
  async upsert(req, res) {
    try {
      const { product_id, warehouse_id, location_id, on_hand, free_to_use, cost_per_unit } = req.body;

      // Check if stock entry exists
      const existing = await db.query(
        `SELECT id FROM stock 
         WHERE product_id = $1 AND warehouse_id = $2 AND location_id = $3`,
        [product_id, warehouse_id, location_id]
      );

      let result;
      if (existing.rows.length > 0) {
        // Update existing
        result = await db.query(
          `UPDATE stock 
           SET on_hand = $1, free_to_use = $2, cost_per_unit = $3, updated_at = NOW()
           WHERE product_id = $4 AND warehouse_id = $5 AND location_id = $6
           RETURNING *`,
          [on_hand, free_to_use, cost_per_unit, product_id, warehouse_id, location_id]
        );
      } else {
        // Create new
        result = await db.query(
          `INSERT INTO stock (product_id, warehouse_id, location_id, on_hand, free_to_use, cost_per_unit) 
           VALUES ($1, $2, $3, $4, $5, $6) 
           RETURNING *`,
          [product_id, warehouse_id, location_id, on_hand, free_to_use, cost_per_unit]
        );
      }

      res.json({
        success: true,
        message: 'Stock updated successfully',
        stock: result.rows[0],
      });
    } catch (error) {
      console.error('Upsert stock error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Update stock quantity
  async updateQuantity(req, res) {
    try {
      const { id } = req.params;
      const { on_hand, free_to_use } = req.body;

      // Get current stock
      const current = await db.query('SELECT * FROM stock WHERE id = $1', [id]);
      if (current.rows.length === 0) {
        return res.status(404).json({ error: 'Stock item not found' });
      }

      const oldStock = current.rows[0];

      // Update stock
      const result = await db.query(
        `UPDATE stock 
         SET on_hand = $1, free_to_use = $2, updated_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [on_hand, free_to_use, id]
      );

      // Log to move history
      const quantityChange = on_hand - oldStock.on_hand;
      if (quantityChange !== 0) {
        await db.query(
          `INSERT INTO move_history (product_id, from_location, to_location, quantity, user_id, notes)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            oldStock.product_id,
            'Manual Adjustment',
            `Stock ID: ${id}`,
            quantityChange,
            req.user.id,
            'Stock quantity adjusted'
          ]
        );
      }

      res.json({
        success: true,
        message: 'Stock updated successfully',
        stock: result.rows[0],
      });
    } catch (error) {
      console.error('Update stock quantity error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Delete stock
  async delete(req, res) {
    try {
      const { id } = req.params;

      const result = await db.query(
        'DELETE FROM stock WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Stock item not found' });
      }

      res.json({
        success: true,
        message: 'Stock deleted successfully',
      });
    } catch (error) {
      console.error('Delete stock error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
}

module.exports = new StockController();
