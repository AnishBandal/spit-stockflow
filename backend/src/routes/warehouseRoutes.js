const express = require('express');
const { body } = require('express-validator');
const warehouseController = require('../controllers/warehouseController');
const { auth, checkRole } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Validation rules
const warehouseValidation = [
  body('name').trim().notEmpty().withMessage('Warehouse name is required'),
  body('short_code').trim().notEmpty().withMessage('Short code is required'),
  body('address').optional().trim(),
];

// Routes
router.get('/', auth, warehouseController.getAll);
router.get('/:id', auth, warehouseController.getOne);
router.post('/', auth, checkRole('Inventory Manager', 'Admin'), warehouseValidation, validate, warehouseController.create);
router.put('/:id', auth, checkRole('Inventory Manager', 'Admin'), warehouseValidation, validate, warehouseController.update);
router.delete('/:id', auth, checkRole('Inventory Manager', 'Admin'), warehouseController.delete);

module.exports = router;
