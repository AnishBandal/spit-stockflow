const db = require('../config/database');

class OperationController {
  // Get all operations
  async getAll(req, res) {
    try {
      const { type, status } = req.query;
      
      let query = `
        SELECT o.*, u.name as responsible_name
        FROM operations o
        LEFT JOIN users u ON o.responsible_id = u.id
      `;
      
      const conditions = [];
      const params = [];
      let paramCount = 1;

      if (type) {
        conditions.push(`o.type = $${paramCount}`);
        params.push(type);
        paramCount++;
      }

      if (status) {
        conditions.push(`o.status = $${paramCount}`);
        params.push(status);
        paramCount++;
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      query += ' ORDER BY o.created_at DESC';

      const result = await db.query(query, params);

      // Get operation items for each operation
      const operations = await Promise.all(
        result.rows.map(async (op) => {
          const items = await db.query(
            `SELECT oi.*, p.name as product_name, p.sku
             FROM operation_items oi
             JOIN products p ON oi.product_id = p.id
             WHERE oi.operation_id = $1`,
            [op.id]
          );
          return { ...op, items: items.rows };
        })
      );

      res.json({
        success: true,
        operations,
      });
    } catch (error) {
      console.error('Get operations error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Get single operation
  async getOne(req, res) {
    try {
      const { id } = req.params;

      const result = await db.query(
        `SELECT o.*, u.name as responsible_name
         FROM operations o
         LEFT JOIN users u ON o.responsible_id = u.id
         WHERE o.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Operation not found' });
      }

      const operation = result.rows[0];

      // Get operation items
      const items = await db.query(
        `SELECT oi.*, p.name as product_name, p.sku
         FROM operation_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.operation_id = $1`,
        [id]
      );

      operation.items = items.rows;

      res.json({
        success: true,
        operation,
      });
    } catch (error) {
      console.error('Get operation error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Create operation
  async create(req, res) {
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');

      const { reference, type, status, from_location, to_location, contact, schedule_date, responsible_id, notes, items } = req.body;

      // Generate reference if not provided
      let operationRef = reference;
      if (!operationRef) {
        const typePrefix = {
          'Receipt': 'WH/IN',
          'Delivery': 'WH/OUT',
          'Internal Transfer': 'WH/INT',
          'Adjustment': 'WH/ADJ'
        }[type];
        
        const count = await client.query(
          'SELECT COUNT(*) FROM operations WHERE type = $1',
          [type]
        );
        operationRef = `${typePrefix}/${String(parseInt(count.rows[0].count) + 1).padStart(4, '0')}`;
      }

      // Create operation
      const result = await client.query(
        `INSERT INTO operations (reference, type, status, from_location, to_location, contact, schedule_date, responsible_id, notes) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         RETURNING *`,
        [operationRef, type, status || 'Draft', from_location, to_location, contact, schedule_date, responsible_id, notes]
      );

      const operation = result.rows[0];

      // Add operation items
      if (items && items.length > 0) {
        for (const item of items) {
          await client.query(
            `INSERT INTO operation_items (operation_id, product_id, quantity) 
             VALUES ($1, $2, $3)`,
            [operation.id, item.product_id, item.quantity]
          );
        }
      }

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Operation created successfully',
        operation,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Create operation error:', error);
      res.status(500).json({ error: 'Server error' });
    } finally {
      client.release();
    }
  }

  // Update operation
  async update(req, res) {
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');

      const { id } = req.params;
      const { type, status, from_location, to_location, contact, schedule_date, responsible_id, notes, items } = req.body;

      const result = await client.query(
        `UPDATE operations 
         SET type = $1, status = $2, from_location = $3, to_location = $4, 
             contact = $5, schedule_date = $6, responsible_id = $7, notes = $8, updated_at = NOW()
         WHERE id = $9
         RETURNING *`,
        [type, status, from_location, to_location, contact, schedule_date, responsible_id, notes, id]
      );

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Operation not found' });
      }

      // Update items if provided
      if (items) {
        // Delete old items
        await client.query('DELETE FROM operation_items WHERE operation_id = $1', [id]);
        
        // Add new items
        for (const item of items) {
          await client.query(
            `INSERT INTO operation_items (operation_id, product_id, quantity) 
             VALUES ($1, $2, $3)`,
            [id, item.product_id, item.quantity]
          );
        }
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Operation updated successfully',
        operation: result.rows[0],
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Update operation error:', error);
      res.status(500).json({ error: 'Server error' });
    } finally {
      client.release();
    }
  }

  // Delete operation
  async delete(req, res) {
    try {
      const { id } = req.params;

      const result = await db.query(
        'DELETE FROM operations WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Operation not found' });
      }

      res.json({
        success: true,
        message: 'Operation deleted successfully',
      });
    } catch (error) {
      console.error('Delete operation error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Complete operation (change status to Done and update stock)
  async complete(req, res) {
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');

      const { id } = req.params;

      // Get operation details
      const opResult = await client.query(
        'SELECT * FROM operations WHERE id = $1',
        [id]
      );

      if (opResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Operation not found' });
      }

      const operation = opResult.rows[0];

      // Update status to Done
      await client.query(
        'UPDATE operations SET status = $1, updated_at = NOW() WHERE id = $2',
        ['Done', id]
      );

      // Get operation items
      const items = await client.query(
        'SELECT * FROM operation_items WHERE operation_id = $1',
        [id]
      );

      // Update stock based on operation type
      for (const item of items.rows) {
        // Log to move history
        await client.query(
          `INSERT INTO move_history (product_id, operation_id, from_location, to_location, quantity, user_id, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            item.product_id,
            id,
            operation.from_location,
            operation.to_location,
            item.quantity,
            req.user.id,
            `${operation.type} - ${operation.reference}`
          ]
        );
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Operation completed successfully',
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Complete operation error:', error);
      res.status(500).json({ error: 'Server error' });
    } finally {
      client.release();
    }
  }
}

module.exports = new OperationController();
