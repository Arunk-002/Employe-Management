# Employee Management Program

The Employee Management Program is a JavaScript-based application that allows you to manage employee details. It provides basic CRUD (Create, Read, Update, Delete) operations for employee records, and the data is stored in a JSON file.

## Features

- Get a list of all employees
- Get an employee by ID
- Create a new employee record
- Update an existing employee record
- Delete an employee record

## Requirements

- Node.js
- npm or yarn (package managers)

## Installation

1. Clone the repository:

   ```shell
   git clone https://github.com/azimsai/dummy-employee-api.git
   cd employee-management-program
   npm install
   or
   yarn install
   ```

   Usage

   Start the API server:

   ```
     node index.js

   ```

   The server will start running on http://localhost:3000.

You can use tools like cURL or Postman to interact with the API endpoints:

Get all employees: GET /employees

Get an employee by ID: GET /employees/:id

Create a new employee: POST /employees

Update an existing employee: PUT /employees/:id

Delete an employee: DELETE /employees/:id

Upload employee avatar : POST /employees/:id/avatar

Get employee avatar : GET /employees/:id/avatar

Note: Replace :id with the actual employee ID.

Data Persistence
The employee data is stored in a JSON file named employees.json. The server reads the data from this file at startup and writes the data to the file whenever there are changes (e.g., adding, updating, or deleting an employee).

Validation
The program performs validation on the employee data to ensure that the required fields are provided and have valid formats. Invalid data will result in appropriate error messages and status codes.

License
This project is licensed under the MIT License.
