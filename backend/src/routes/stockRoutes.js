const express = require('express');
const { body } = require('express-validator');
const stockController = require('../controllers/stockController');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Validation rules
const stockValidation = [
  body('product_id').isInt().withMessage('Valid product ID is required'),
  body('warehouse_id').isInt().withMessage('Valid warehouse ID is required'),
  body('location_id').isInt().withMessage('Valid location ID is required'),
  body('on_hand').isInt({ min: 0 }).withMessage('On hand must be a non-negative integer'),
  body('free_to_use').isInt({ min: 0 }).withMessage('Free to use must be a non-negative integer'),
  body('cost_per_unit').isFloat({ min: 0 }).withMessage('Cost per unit must be a non-negative number'),
];

const stockUpdateValidation = [
  body('on_hand').isInt({ min: 0 }).withMessage('On hand must be a non-negative integer'),
  body('free_to_use').isInt({ min: 0 }).withMessage('Free to use must be a non-negative integer'),
];

// Routes
router.get('/', auth, stockController.getAll);
router.get('/:id', auth, stockController.getOne);
router.post('/', auth, stockValidation, validate, stockController.upsert);
router.put('/:id', auth, stockUpdateValidation, validate, stockController.updateQuantity);
router.delete('/:id', auth, stockController.delete);

module.exports = router;
