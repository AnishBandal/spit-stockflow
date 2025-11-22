const express = require('express');
const { body } = require('express-validator');
const locationController = require('../controllers/locationController');
const { auth } = require('../middleware/auth');
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
router.post('/', auth, locationValidation, validate, locationController.create);
router.put('/:id', auth, locationValidation, validate, locationController.update);
router.delete('/:id', auth, locationController.delete);

module.exports = router;
