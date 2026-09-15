const validateEmployee = (req, res, next) => {
  const { first_name, last_name, email, phone, department, designation, joining_date, salary } = req.body;
  const errors = [];

  if (!first_name || typeof first_name !== 'string' || first_name.trim().length < 2) {
    errors.push('First name is required and must be at least 2 characters long.');
  }

  if (!last_name || typeof last_name !== 'string' || last_name.trim().length < 1) {
    errors.push('Last name is required.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    errors.push('A valid email address is required.');
  }

  if (!phone || typeof phone !== 'string' || phone.trim().length < 7) {
    errors.push('A valid phone number is required (at least 7 digits/characters).');
  }

  if (!department || typeof department !== 'string' || department.trim().length === 0) {
    errors.push('Department is required.');
  }

  if (!designation || typeof designation !== 'string' || designation.trim().length === 0) {
    errors.push('Designation is required.');
  }

  if (!joining_date || isNaN(Date.parse(joining_date))) {
    errors.push('A valid joining date is required.');
  }

  if (salary === undefined || salary === null || isNaN(Number(salary)) || Number(salary) < 0) {
    errors.push('Salary must be a valid positive number.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  next();
};

const validateAuth = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    errors.push('Valid email address is required.');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  next();
};

module.exports = {
  validateEmployee,
  validateAuth
};
