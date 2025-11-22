const db = require('../config/database');

class WarehouseController {
  // Get all warehouses
  async getAll(req, res) {
    try {
      const result = await db.query(
        'SELECT * FROM warehouses ORDER BY created_at DESC'
      );

      res.json({
        success: true,
        warehouses: result.rows,
      });
    } catch (error) {
      console.error('Get warehouses error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Get single warehouse
  async getOne(req, res) {
    try {
      const { id } = req.params;

      const result = await db.query(
        'SELECT * FROM warehouses WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Warehouse not found' });
      }

      res.json({
        success: true,
        warehouse: result.rows[0],
      });
    } catch (error) {
      console.error('Get warehouse error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Create warehouse
  async create(req, res) {
    try {
      const { name, short_code, address } = req.body;

      // Check if short_code exists
      const existing = await db.query(
        'SELECT id FROM warehouses WHERE short_code = $1',
        [short_code]
      );
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Short code already exists' });
      }

      const result = await db.query(
        `INSERT INTO warehouses (name, short_code, address) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [name, short_code, address]
      );

      res.status(201).json({
        success: true,
        message: 'Warehouse created successfully',
        warehouse: result.rows[0],
      });
    } catch (error) {
      console.error('Create warehouse error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Update warehouse
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, short_code, address } = req.body;

      // Check if short_code exists for another warehouse
      const existing = await db.query(
        'SELECT id FROM warehouses WHERE short_code = $1 AND id != $2',
        [short_code, id]
      );
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Short code already exists' });
      }

      const result = await db.query(
        `UPDATE warehouses 
         SET name = $1, short_code = $2, address = $3, updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [name, short_code, address, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Warehouse not found' });
      }

      res.json({
        success: true,
        message: 'Warehouse updated successfully',
        warehouse: result.rows[0],
      });
    } catch (error) {
      console.error('Update warehouse error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Delete warehouse
  async delete(req, res) {
    try {
      const { id } = req.params;

      const result = await db.query(
        'DELETE FROM warehouses WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Warehouse not found' });
      }

      res.json({
        success: true,
        message: 'Warehouse deleted successfully',
      });
    } catch (error) {
      console.error('Delete warehouse error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
}

module.exports = new WarehouseController();
