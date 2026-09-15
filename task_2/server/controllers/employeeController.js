const { dbRun, dbAll, dbGet } = require('../config/db');

// Get all employees with search, department filter, status filter, sorting, and stats
const getEmployees = async (req, res) => {
  try {
    const { search, department, status, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;

    let sql = `SELECT * FROM employees WHERE 1=1`;
    const params = [];

    if (search && search.trim() !== '') {
      const searchPattern = `%${search.trim()}%`;
      sql += ` AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR designation LIKE ?)`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (department && department.trim() !== '' && department !== 'All') {
      sql += ` AND department = ?`;
      params.push(department.trim());
    }

    if (status && status.trim() !== '' && status !== 'All') {
      sql += ` AND status = ?`;
      params.push(status.trim());
    }

    // Whitelist valid columns for sorting to prevent SQL injection
    const validSortColumns = ['id', 'first_name', 'last_name', 'email', 'department', 'designation', 'salary', 'joining_date', 'status', 'created_at'];
    const safeSortBy = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    sql += ` ORDER BY ${safeSortBy} ${safeSortOrder}`;

    const employees = await dbAll(sql, params);

    // Compute Summary Stats
    const totalCount = await dbGet(`SELECT COUNT(*) as count FROM employees`);
    const activeCount = await dbGet(`SELECT COUNT(*) as count FROM employees WHERE status = 'Active'`);
    const totalPayroll = await dbGet(`SELECT SUM(salary) as total FROM employees WHERE status = 'Active'`);
    const deptRows = await dbAll(`SELECT DISTINCT department FROM employees`);

    res.json({
      success: true,
      data: employees,
      stats: {
        total: totalCount.count || 0,
        active: activeCount.count || 0,
        totalPayroll: totalPayroll.total || 0,
        departmentsCount: deptRows.length
      }
    });
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve employee records.' });
  }
};

// Get single employee by ID
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await dbGet(`SELECT * FROM employees WHERE id = ?`, [id]);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }
    res.json({ success: true, data: employee });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve employee details.' });
  }
};

// Create new employee
const createEmployee = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, department, designation, joining_date, salary, status = 'Active', address = '' } = req.body;

    // Check duplicate email
    const existing = await dbGet(`SELECT id FROM employees WHERE LOWER(email) = LOWER(?)`, [email.trim()]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An employee with this email already exists.' });
    }

    const result = await dbRun(
      `INSERT INTO employees (first_name, last_name, email, phone, department, designation, joining_date, salary, status, address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [first_name.trim(), last_name.trim(), email.trim().toLowerCase(), phone.trim(), department.trim(), designation.trim(), joining_date, Number(salary), status, address.trim()]
    );

    const newEmployee = await dbGet(`SELECT * FROM employees WHERE id = ?`, [result.lastID]);

    res.status(201).json({
      success: true,
      message: 'Employee record created successfully.',
      data: newEmployee
    });
  } catch (err) {
    console.error('Error creating employee:', err);
    res.status(500).json({ success: false, message: 'Failed to create employee record.' });
  }
};

// Update existing employee
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, department, designation, joining_date, salary, status, address } = req.body;

    const existing = await dbGet(`SELECT * FROM employees WHERE id = ?`, [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    // Check duplicate email if email is being updated
    if (email.trim().toLowerCase() !== existing.email.toLowerCase()) {
      const emailOccupied = await dbGet(`SELECT id FROM employees WHERE LOWER(email) = LOWER(?) AND id != ?`, [email.trim(), id]);
      if (emailOccupied) {
        return res.status(400).json({ success: false, message: 'Another employee with this email already exists.' });
      }
    }

    await dbRun(
      `UPDATE employees SET
        first_name = ?,
        last_name = ?,
        email = ?,
        phone = ?,
        department = ?,
        designation = ?,
        joining_date = ?,
        salary = ?,
        status = ?,
        address = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [first_name.trim(), last_name.trim(), email.trim().toLowerCase(), phone.trim(), department.trim(), designation.trim(), joining_date, Number(salary), status, address ? address.trim() : '', id]
    );

    const updatedEmployee = await dbGet(`SELECT * FROM employees WHERE id = ?`, [id]);

    res.json({
      success: true,
      message: 'Employee record updated successfully.',
      data: updatedEmployee
    });
  } catch (err) {
    console.error('Error updating employee:', err);
    res.status(500).json({ success: false, message: 'Failed to update employee record.' });
  }
};

// Delete employee
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await dbGet(`SELECT * FROM employees WHERE id = ?`, [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    await dbRun(`DELETE FROM employees WHERE id = ?`, [id]);

    res.json({
      success: true,
      message: `Employee "${existing.first_name} ${existing.last_name}" deleted successfully.`
    });
  } catch (err) {
    console.error('Error deleting employee:', err);
    res.status(500).json({ success: false, message: 'Failed to delete employee record.' });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
};
