const fs = require("fs");

module.exports = async (req, res, next) => {
  const newCustomer = req.body;

  const data = JSON.parse(fs.readFileSync('db.json', 'utf-8'));
  const customers = data.customers;

  if (req.method === 'POST' && req.originalUrl ==='/customers') {
    
    const isDuplicate = customers.some(customer => 
      (customer.firstName === newCustomer.firstName &&
      customer.lastName === newCustomer.lastName) ||
      customer.email === newCustomer.email
    );

    if (isDuplicate) {
      return res.status(400).json({ message: 'Duplicate customer details found' });
    }
  } else if (req.method === 'PATCH' && req.originalUrl.includes('/customers/')) {
    const customerId = req.originalUrl.split('/').pop();

    const isDuplicate = customers.some(customer => 
      customer.id !== customerId && (
        (customer.firstName === newCustomer.firstName &&
        customer.lastName === newCustomer.lastName) ||
        customer.email === newCustomer.email
      )
    );

    if (isDuplicate) {
      return res.status(400).json({ message: 'Update causes duplication' });
    }
  }
  
  next();
};