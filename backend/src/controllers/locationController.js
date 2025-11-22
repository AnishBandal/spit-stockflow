const db = require('../config/database');

class LocationController {
  // Get all locations
  async getAll(req, res) {
    try {
      const { warehouse_id } = req.query;
      
      let query = `
        SELECT l.*, w.name as warehouse_name 
        FROM locations l
        JOIN warehouses w ON l.warehouse_id = w.id
      `;
      
      const params = [];
      if (warehouse_id) {
        query += ' WHERE l.warehouse_id = $1';
        params.push(warehouse_id);
      }
      
      query += ' ORDER BY l.created_at DESC';

      const result = await db.query(query, params);

      res.json({
        success: true,
        locations: result.rows,
      });
    } catch (error) {
      console.error('Get locations error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Get single location
  async getOne(req, res) {
    try {
      const { id } = req.params;

      const result = await db.query(
        `SELECT l.*, w.name as warehouse_name 
         FROM locations l
         JOIN warehouses w ON l.warehouse_id = w.id
         WHERE l.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Location not found' });
      }

      res.json({
        success: true,
        location: result.rows[0],
      });
    } catch (error) {
      console.error('Get location error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Create location
  async create(req, res) {
    try {
      const { name, short_code, warehouse_id } = req.body;

      // Check if warehouse exists
      const warehouse = await db.query(
        'SELECT id FROM warehouses WHERE id = $1',
        [warehouse_id]
      );
      if (warehouse.rows.length === 0) {
        return res.status(404).json({ error: 'Warehouse not found' });
      }

      // Check if short_code exists in this warehouse
      const existing = await db.query(
        'SELECT id FROM locations WHERE short_code = $1 AND warehouse_id = $2',
        [short_code, warehouse_id]
      );
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Short code already exists in this warehouse' });
      }

      const result = await db.query(
        `INSERT INTO locations (name, short_code, warehouse_id) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [name, short_code, warehouse_id]
      );

      res.status(201).json({
        success: true,
        message: 'Location created successfully',
        location: result.rows[0],
      });
    } catch (error) {
      console.error('Create location error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Update location
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, short_code, warehouse_id } = req.body;

      // Check if short_code exists for another location in the same warehouse
      const existing = await db.query(
        'SELECT id FROM locations WHERE short_code = $1 AND warehouse_id = $2 AND id != $3',
        [short_code, warehouse_id, id]
      );
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Short code already exists in this warehouse' });
      }

      const result = await db.query(
        `UPDATE locations 
         SET name = $1, short_code = $2, warehouse_id = $3, updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [name, short_code, warehouse_id, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Location not found' });
      }

      res.json({
        success: true,
        message: 'Location updated successfully',
        location: result.rows[0],
      });
    } catch (error) {
      console.error('Update location error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Delete location
  async delete(req, res) {
    try {
      const { id } = req.params;

      const result = await db.query(
        'DELETE FROM locations WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Location not found' });
      }

      res.json({
        success: true,
        message: 'Location deleted successfully',
      });
    } catch (error) {
      console.error('Delete location error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
}

module.exports = new LocationController();
