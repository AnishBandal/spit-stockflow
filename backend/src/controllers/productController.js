const db = require('../config/database');

class ProductController {
  // Get all products
  async getAll(req, res) {
    try {
      const { category, search } = req.query;
      let query = `
        SELECT p.*, 
               COALESCE(SUM(s.on_hand), 0)::INTEGER as total_stock,
               CASE 
                 WHEN COALESCE(SUM(s.on_hand), 0) = 0 THEN 'Out of Stock'
                 WHEN COALESCE(SUM(s.on_hand), 0) <= p.reorder_level THEN 'Low'
                 ELSE 'Normal'
               END as status
        FROM products p
        LEFT JOIN stock s ON p.id = s.product_id
      `;
      
      const conditions = [];
      const params = [];
      let paramCount = 1;

      if (category) {
        conditions.push(`p.category = $${paramCount}`);
        params.push(category);
        paramCount++;
      }

      if (search) {
        conditions.push(`(p.name ILIKE $${paramCount} OR p.sku ILIKE $${paramCount})`);
        params.push(`%${search}%`);
        paramCount++;
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      query += ` GROUP BY p.id ORDER BY p.created_at DESC`;

      const result = await db.query(query, params);

      res.json({
        success: true,
        products: result.rows,
      });
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Get single product
  async getOne(req, res) {
    try {
      const { id } = req.params;

      const result = await db.query(
        `SELECT p.*, 
                COALESCE(SUM(s.on_hand), 0)::INTEGER as total_stock,
                CASE 
                  WHEN COALESCE(SUM(s.on_hand), 0) = 0 THEN 'Out of Stock'
                  WHEN COALESCE(SUM(s.on_hand), 0) <= p.reorder_level THEN 'Low'
                  ELSE 'Normal'
                END as status
         FROM products p
         LEFT JOIN stock s ON p.id = s.product_id
         WHERE p.id = $1
         GROUP BY p.id`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json({
        success: true,
        product: result.rows[0],
      });
    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Create product
  async create(req, res) {
    try {
      const { name, sku, category, unit_of_measure, reorder_level, description } = req.body;

      // Check if SKU exists
      const existing = await db.query('SELECT id FROM products WHERE sku = $1', [sku]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'SKU already exists' });
      }

      const result = await db.query(
        `INSERT INTO products (name, sku, category, unit_of_measure, reorder_level, description) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [name, sku, category, unit_of_measure || 'Unit', reorder_level || 0, description]
      );

      const product = { ...result.rows[0], total_stock: 0, status: 'Out of Stock' };

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        product,
      });
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Update product
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, sku, category, unit_of_measure, reorder_level, description } = req.body;

      // Check if SKU exists for another product
      const existing = await db.query(
        'SELECT id FROM products WHERE sku = $1 AND id != $2',
        [sku, id]
      );
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'SKU already exists for another product' });
      }

      const result = await db.query(
        `UPDATE products 
         SET name = $1, sku = $2, category = $3, unit_of_measure = $4, 
             reorder_level = $5, description = $6, updated_at = NOW()
         WHERE id = $7
         RETURNING *`,
        [name, sku, category, unit_of_measure, reorder_level, description, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json({
        success: true,
        message: 'Product updated successfully',
        product: result.rows[0],
      });
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Delete product
  async delete(req, res) {
    try {
      const { id } = req.params;

      const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Get product categories
  async getCategories(req, res) {
    try {
      const result = await db.query(
        'SELECT DISTINCT category FROM products ORDER BY category'
      );

      res.json({
        success: true,
        categories: result.rows.map(row => row.category),
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
}

module.exports = new ProductController();
