const express = require("express");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");

const app = express();
const employeeDataFile = "employees.json";

// Middleware to parse JSON data
app.use(
  express.json(),
  cors({
    origin: "*", // Replace with your allowed origin
  }),
  fileUpload()
);
app.use(express.static(path.join(__dirname, "public")));

// Function to read employee data from JSON file
function readEmployeeData() {
  try {
    const data = fs.readFileSync(employeeDataFile, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Function to write employee data to JSON file
function writeEmployeeData(employees) {
  const data = JSON.stringify(employees, null, 2);
  fs.writeFileSync(employeeDataFile, data);
}

// Function to validate email format
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Function to validate phone number format
function validatePhone(phone) {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
}

// Function to validate date format (DD-MM-YYYY)
function validateDate(date) {
  const dateRegex = /^(0[1-9]|[1-2][0-9]|3[0-1])-(0[1-9]|1[0-2])-\d{4}$/;
  return dateRegex.test(date);
}

// Validate employee data
function validateEmployeeData(employee) {
  const errors = [];

  if (!employee.salutation) {
    errors.push("Salutation is required");
  }
  if (!employee.firstName) {
    errors.push("First Name is required");
  }
  if (!employee.lastName) {
    errors.push("Last Name is required");
  }
  if (!employee.email) {
    errors.push("Email is required");
  } else if (!validateEmail(employee.email)) {
    errors.push("Invalid email format");
  }
  if (!employee.phone) {
    errors.push("Phone is required");
  } else if (!validatePhone(employee.phone)) {
    errors.push("Invalid phone number format");
  }
  if (!employee.dob) {
    errors.push("Date of Birth is required");
  } else if (!validateDate(employee.dob)) {
    errors.push("Invalid date format. Please use DD-MM-YYYY format");
  }
  if (!employee.gender) {
    errors.push("Gender is required");
  }
  if (!employee.qualifications) {
    errors.push("Qualifications are required");
  }
  if (!employee.address) {
    errors.push("Address is required");
  }
  if (!employee.city) {
    errors.push("City is required");
  }
  if (!employee.state) {
    errors.push("State is required");
  }
  if (!employee.country) {
    errors.push("Country is required");
  }
  if (!employee.username) {
    errors.push("Username is required");
  }
  if (!employee.password) {
    errors.push("Password is required");
  }

  return errors;
}

// Get all employees
app.get("/employees", (req, res) => {
  const employees = readEmployeeData();
  res.json(employees);
});

// Get an employee by ID
app.get("/employees/:id", (req, res) => {
  const employees = readEmployeeData();
  const employee = employees.find((emp) => emp.id === req.params.id);

  if (!employee) {
    res.status(404).json({ error: "Employee not found" });
  } else {
    res.json(employee);
  }
});

// Create an employee
app.post("/employees", (req, res) => {
  const employees = readEmployeeData();
  const newEmployee = req.body;
  const validationErrors = validateEmployeeData(newEmployee);

  if (validationErrors.length > 0) {
    res.status(400).json({ errors: validationErrors });
  } else {
    newEmployee.id = uuidv4();
    employees.push(newEmployee);
    writeEmployeeData(employees);
    res
      .status(201)
      .json({ message: "Employee created successfully", id: newEmployee.id });
  }
});

// Update an employee
app.put("/employees/:id", (req, res) => {
  const employees = readEmployeeData();
  const employeeIndex = employees.findIndex((emp) => emp.id === req.params.id);

  if (employeeIndex === -1) {
    res.status(404).json({ error: "Employee not found" });
  } else {
    const updatedEmployee = req.body;
    const validationErrors = validateEmployeeData(updatedEmployee);
    if (validationErrors.length > 0) {
      res.status(400).json({ errors: validationErrors });
    } else {
      employees[employeeIndex] = {
        ...employees[employeeIndex],
        ...updatedEmployee,
      };
      writeEmployeeData(employees);
      res.json({ message: "Employee updated successfully" });
    }
  }
});

// Delete an employee
app.delete("/employees/:id", (req, res) => {
  const employees = readEmployeeData();
  const employeeIndex = employees.findIndex((emp) => emp.id === req.params.id);

  if (employeeIndex === -1) {
    res.status(404).json({ error: "Employee not found" });
  } else {
    employees.splice(employeeIndex, 1);
    writeEmployeeData(employees);
    res.json({ message: "Employee deleted successfully" });
  }
});

// Upload an employee avatar
app.post("/employees/:id/avatar", (req, res) => {
  const { id } = req.params;
  const { avatar } = req.files;

  if (!avatar) {
    return res.status(400).json({ error: "No avatar file provided" });
  }

  const uploadPath = path.join(__dirname, "public", "avatars", `${id}.jpg`);
  const publicPath = `${id}.jpg`;
  avatar.mv(uploadPath, (err) => {
    if (err) {
      console.error("Error uploading avatar:", err);
      return res.status(500).json({ error: "Failed to upload avatar" });
    }
  });
  updateEmployeeAvatar(id, publicPath);
  res.json({ success: true });
});

// Get an employee avatar
app.get("/employees/:id/avatar", (req, res) => {
  const { id } = req.params;
  const avatarPath = path.join(__dirname, "public", "avatars", `${id}.jpg`);

  if (fs.existsSync(avatarPath)) {
    res.sendFile(avatarPath);
  } else {
    res.sendFile(path.join(__dirname, "public", "default-avatar.jpg"));
  }
});

// Function to update the employee object with the avatar URL and save it to employee.json

function updateEmployeeAvatar(id, avatarUrl) {
  const filePath = path.join(__dirname, "employees.json");

  // Read the employee.json file
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading employee.json:", err);
      return;
    }

    // Parse the JSON data
    const employees = JSON.parse(data);

    // Find the employee by ID
    const employee = employees.find((emp) => emp.id === id);

    if (employee) {
      // Update the avatar URL
      employee.avatar = avatarUrl;

      // Convert the updated data back to JSON
      const updatedData = JSON.stringify(employees, null, 2);

      // Write the updated JSON data back to the file
      fs.writeFile(filePath, updatedData, "utf8", (err) => {
        if (err) {
          console.error("Error writing employee.json:", err);
          return;
        }
        console.log("Employee avatar URL updated successfully.");
      });
    } else {
      console.log("Employee not found.");
    }
  });
}

// Start the server
app.listen(3000, () => {
  console.log("API server is running on port 3000");
});
