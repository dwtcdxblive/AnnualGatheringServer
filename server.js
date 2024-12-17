const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const { connectToDatabase } = require('./db'); // Correct import of db.js

// Call the function to connect to the database
connectToDatabase();

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Middleware
app.use(cors({ origin: 'http://46.19.74.196:3000' }));
app.use(express.json()); // Parse JSON requests

// Define a schema for the real names
const realNameSchema = new mongoose.Schema({
  fullname: String,
});

const RealNameModel = mongoose.model('Name', realNameSchema);

// Define a schema for employees
const employeeSchema = new mongoose.Schema({
  employeeName: { type: String, required: true },
  employeeDepartment: { type: String, required: true },
});

const EmployeeModel = mongoose.model('Employee', employeeSchema);

// Define an API endpoint to fetch real names
// app.get('/api/names', async (req, res) => {
//   try {
//     const realNames = await RealNameModel.find({}, 'fullname');
//     res.json(realNames);
//     realNames.forEach((name) => {
//       console.log(name.fullname);
//     });
//   } catch (error) {
//     console.error('Error fetching real names:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// GET API to fetch all employee names
app.get('/api/employeesnames', async (req, res) => {
  try {
    // Fetch only the employee names and exclude unnecessary fields
    const employees = await EmployeeModel.find({}, 'employeeName');
    
    // Log the fetched data for debugging
    console.log('Fetched Employee Names:', employees);

    // Send the employee names as JSON response
    res.status(200).json(employees);
  } catch (error) {
    console.error('Error fetching employee names:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// POST API to add a new employee
app.post('/api/employees', async (req, res) => {
  try {
    const { employeeName, employeeDepartment } = req.body;

    // Validate input
    if (!employeeName || !employeeDepartment) {
      console.log('Invalid input: Missing employeeName or employeeDepartment');
      return res.status(400).json({
        error: 'Both employeeName and employeeDepartment are required',
      });
    }

    // Create and save a new Employee
    const newEmployee = new EmployeeModel({
      employeeName,
      employeeDepartment,
    });

    const savedEmployee = await newEmployee.save();
    console.log('Employee added successfully:', savedEmployee);

    // Respond with the saved data
    res.status(201).json({
      message: 'Employee created successfully',
      data: savedEmployee,
    });
  } catch (error) {
    console.error('Error saving employee:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const port = 3002;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
