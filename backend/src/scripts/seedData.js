const bcrypt = require('bcryptjs');
const db = require('../config/database');
require('dotenv').config();

const seedData = async () => {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   StockMaster Data Seeding                 ║');
  console.log('╚════════════════════════════════════════════╝\n');

  try {
    console.log('Seeding users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await db.query(`
      INSERT INTO users (name, email, password, role) VALUES
      ('John Manager', 'demo.manager@stockmaster.test', $1, 'Inventory Manager'),
      ('Jane Staff', 'staff@stockmaster.test', $1, 'Warehouse Staff'),
      ('Admin User', 'admin@stockmaster.test', $1, 'Admin')
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, [hashedPassword]);
    console.log(`✓ ${users.rows.length} users created`);

    console.log('\nSeeding warehouses...');
    const warehouses = await db.query(`
      INSERT INTO warehouses (name, short_code, address) VALUES
      ('Main Warehouse', 'WH', '123 Industrial Blvd, Suite 100'),
      ('Storage Facility', 'SF', '456 Storage Lane, Building B')
      ON CONFLICT (short_code) DO NOTHING
      RETURNING id
    `);
    console.log(`✓ ${warehouses.rows.length} warehouses created`);

    const whIds = await db.query('SELECT id FROM warehouses ORDER BY id');
    const wh1 = whIds.rows[0]?.id;
    const wh2 = whIds.rows[1]?.id;

    console.log('\nSeeding locations...');
    const locations = await db.query(`
      INSERT INTO locations (name, short_code, warehouse_id) VALUES
      ('Stock Area 1', 'Stock1', $1),
      ('Stock Area 2', 'Stock2', $1),
      ('Cold Storage', 'Cold1', $2)
      ON CONFLICT (warehouse_id, short_code) DO NOTHING
      RETURNING id
    `, [wh1, wh2]);
    console.log(`✓ ${locations.rows.length} locations created`);

    console.log('\nSeeding products...');
    const products = await db.query(`
      INSERT INTO products (name, sku, category, unit_of_measure, reorder_level, description) VALUES
      ('Office Chair Executive', 'OC-001', 'Furniture', 'Unit', 20, 'Ergonomic executive office chair'),
      ('Desk Lamp LED', 'DL-002', 'Lighting', 'Unit', 15, 'Energy efficient LED desk lamp'),
      ('Keyboard Mechanical', 'KB-003', 'Electronics', 'Unit', 10, 'RGB mechanical gaming keyboard'),
      ('Monitor 27inch', 'MN-004', 'Electronics', 'Unit', 15, '27 inch 4K monitor'),
      ('Standing Desk', 'SD-005', 'Furniture', 'Unit', 10, 'Electric height adjustable standing desk')
      ON CONFLICT (sku) DO NOTHING
      RETURNING id
    `);
    console.log(`✓ ${products.rows.length} products created`);

    const prodIds = await db.query('SELECT id FROM products ORDER BY id');
    const locIds = await db.query('SELECT id FROM locations ORDER BY id');

    console.log('\nSeeding stock...');
    if (prodIds.rows.length > 0 && locIds.rows.length > 0) {
      await db.query(`
        INSERT INTO stock (product_id, warehouse_id, location_id, on_hand, free_to_use, cost_per_unit) 
        VALUES ($1, $2, $3, 45, 40, 150.00)
        ON CONFLICT (product_id, warehouse_id, location_id) DO NOTHING
      `, [prodIds.rows[0].id, wh1, locIds.rows[0].id]);
      
      await db.query(`
        INSERT INTO stock (product_id, warehouse_id, location_id, on_hand, free_to_use, cost_per_unit) 
        VALUES ($1, $2, $3, 12, 10, 35.00)
        ON CONFLICT (product_id, warehouse_id, location_id) DO NOTHING
      `, [prodIds.rows[1].id, wh1, locIds.rows[0].id]);
      
      if (prodIds.rows.length > 3 && locIds.rows.length > 1) {
        await db.query(`
          INSERT INTO stock (product_id, warehouse_id, location_id, on_hand, free_to_use, cost_per_unit) 
          VALUES ($1, $2, $3, 28, 25, 320.00)
          ON CONFLICT (product_id, warehouse_id, location_id) DO NOTHING
        `, [prodIds.rows[3].id, wh1, locIds.rows[1].id]);
      }
      
      if (prodIds.rows.length > 4 && locIds.rows.length > 2) {
        await db.query(`
          INSERT INTO stock (product_id, warehouse_id, location_id, on_hand, free_to_use, cost_per_unit) 
          VALUES ($1, $2, $3, 8, 5, 450.00)
          ON CONFLICT (product_id, warehouse_id, location_id) DO NOTHING
        `, [prodIds.rows[4].id, wh2, locIds.rows[2].id]);
      }
      console.log('✓ Stock entries created');
    }

    const userIds = await db.query('SELECT id FROM users ORDER BY id');

    console.log('\nSeeding operations...');
    const operations = await db.query(`
      INSERT INTO operations (reference, type, status, from_location, to_location, contact, schedule_date, responsible_id, notes) VALUES
      ('WH/IN/0001', 'Receipt', 'Ready', 'Azure Interior', 'WH/Stock1', 'Azure Interior', CURRENT_DATE + INTERVAL '3 days', $1, 'Office furniture order'),
      ('WH/OUT/0001', 'Delivery', 'Waiting', 'WH/Stock1', 'Customer ABC', 'Customer ABC', CURRENT_DATE + INTERVAL '1 day', $2, 'Customer order #1234'),
      ('WH/INT/0001', 'Internal Transfer', 'Draft', 'WH/Stock1', 'SF/Cold1', NULL, CURRENT_DATE + INTERVAL '4 days', $1, 'Relocate to cold storage'),
      ('WH/IN/0002', 'Receipt', 'Done', 'TechSupply Co', 'WH/Stock2', 'TechSupply Co', CURRENT_DATE - INTERVAL '2 days', $1, 'Electronics shipment'),
      ('WH/OUT/0002', 'Delivery', 'Ready', 'WH/Stock2', 'Office Solutions Ltd', 'Office Solutions Ltd', CURRENT_DATE + INTERVAL '2 days', $2, 'Corporate order'),
      ('WH/ADJ/0001', 'Adjustment', 'Done', 'WH/Stock1', 'WH/Stock1', NULL, CURRENT_DATE - INTERVAL '1 day', $1, 'Damaged items adjustment')
      RETURNING id
    `, [userIds.rows[0]?.id, userIds.rows[1]?.id]);
    console.log(`✓ ${operations.rows.length} operations created`);

    console.log('\nSeeding operation items...');
    const opIds = await db.query('SELECT id FROM operations ORDER BY id');
    if (opIds.rows.length > 0 && prodIds.rows.length > 0) {
      await db.query(`INSERT INTO operation_items (operation_id, product_id, quantity) VALUES ($1, $2, 20)`, 
        [opIds.rows[0].id, prodIds.rows[0].id]);
      await db.query(`INSERT INTO operation_items (operation_id, product_id, quantity) VALUES ($1, $2, 5)`, 
        [opIds.rows[1].id, prodIds.rows[1].id]);
      await db.query(`INSERT INTO operation_items (operation_id, product_id, quantity) VALUES ($1, $2, 3)`, 
        [opIds.rows[2].id, prodIds.rows[4].id]);
      await db.query(`INSERT INTO operation_items (operation_id, product_id, quantity) VALUES ($1, $2, 15)`, 
        [opIds.rows[3].id, prodIds.rows[3].id]);
      await db.query(`INSERT INTO operation_items (operation_id, product_id, quantity) VALUES ($1, $2, 8)`, 
        [opIds.rows[4].id, prodIds.rows[3].id]);
      await db.query(`INSERT INTO operation_items (operation_id, product_id, quantity) VALUES ($1, $2, -3)`, 
        [opIds.rows[5].id, prodIds.rows[1].id]);
      console.log('✓ Operation items created');
    }

    console.log('\n✅ Data seeding completed successfully!\n');
    console.log('Demo Account Credentials:');
    console.log('  Email: demo.manager@stockmaster.test');
    console.log('  Password: password123\n');
    console.log('You can now run: npm run dev\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Data seeding failed:', error);
    process.exit(1);
  }
};

seedData();
