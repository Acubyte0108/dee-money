const fs = require("fs");

module.exports = async (req, res, next) => {
  if (req.method === 'POST' && req.originalUrl === '/customers') {
    const newCustomer = req.body;
  
    const data = JSON.parse(fs.readFileSync('db.json', 'utf-8'));
    const customers = data.customers;

    const isDuplicate = customers.some(customer => 
      customer.firstName === newCustomer.firstName &&
      customer.lastName === newCustomer.lastName &&
      customer.email === newCustomer.email
    );

    if (isDuplicate) {
      return res.status(400).json({ message: 'Duplicate customer' });
    }
  }
  
  next();
}