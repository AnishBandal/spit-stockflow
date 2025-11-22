const express = require('express');
const { body } = require('express-validator');
const productController = require('../controllers/productController');
const { auth, checkRole } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Validation rules
const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('sku').trim().notEmpty().withMessage('SKU is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('unit_of_measure').optional().trim(),
  body('reorder_level').optional().isInt({ min: 0 }),
  body('description').optional().trim(),
];

// Routes
router.get('/', auth, productController.getAll);
router.get('/categories', auth, productController.getCategories);
router.get('/:id', auth, productController.getOne);
router.post('/', auth, checkRole('Inventory Manager', 'Admin'), productValidation, validate, productController.create);
router.put('/:id', auth, checkRole('Inventory Manager', 'Admin'), productValidation, validate, productController.update);
router.delete('/:id', auth, checkRole('Inventory Manager', 'Admin'), productController.delete);

module.exports = router;
