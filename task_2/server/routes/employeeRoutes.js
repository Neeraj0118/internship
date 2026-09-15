const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');
const { verifyToken } = require('../middleware/auth');
const { validateEmployee } = require('../middleware/validate');

// All employee routes require authentication
router.use(verifyToken);

router.get('/', getEmployees);
router.get('/:id', getEmployeeById);
router.post('/', validateEmployee, createEmployee);
router.put('/:id', validateEmployee, updateEmployee);
router.delete('/:id', deleteEmployee);

module.exports = router;
