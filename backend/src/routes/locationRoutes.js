const express = require('express');
const { body } = require('express-validator');
const locationController = require('../controllers/locationController');
const { auth, checkRole } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Validation rules
const locationValidation = [
  body('name').trim().notEmpty().withMessage('Location name is required'),
  body('short_code').trim().notEmpty().withMessage('Short code is required'),
  body('warehouse_id').isInt().withMessage('Valid warehouse ID is required'),
];

// Routes
router.get('/', auth, locationController.getAll);
router.get('/:id', auth, locationController.getOne);
router.post('/', auth, checkRole('Inventory Manager', 'Admin'), locationValidation, validate, locationController.create);
router.put('/:id', auth, checkRole('Inventory Manager', 'Admin'), locationValidation, validate, locationController.update);
router.delete('/:id', auth, checkRole('Inventory Manager', 'Admin'), locationController.delete);

module.exports = router;
