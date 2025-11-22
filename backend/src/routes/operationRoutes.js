const express = require('express');
const { body } = require('express-validator');
const operationController = require('../controllers/operationController');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Validation rules
const operationValidation = [
  body('type').isIn(['Receipt', 'Delivery', 'Internal Transfer', 'Adjustment']).withMessage('Invalid operation type'),
  body('status').optional().isIn(['Draft', 'Waiting', 'Ready', 'Done', 'Canceled']),
  body('from_location').optional().trim(),
  body('to_location').optional().trim(),
  body('contact').optional().trim(),
  body('schedule_date').isISO8601().withMessage('Valid schedule date is required'),
  body('responsible_id').optional().isInt(),
  body('notes').optional().trim(),
  body('items').optional().isArray(),
];

// Routes
router.get('/', auth, operationController.getAll);
router.get('/:id', auth, operationController.getOne);
router.post('/', auth, operationValidation, validate, operationController.create);
router.put('/:id', auth, operationValidation, validate, operationController.update);
router.delete('/:id', auth, operationController.delete);
router.post('/:id/complete', auth, operationController.complete);

module.exports = router;
