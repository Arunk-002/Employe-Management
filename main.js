// Fetching data and displaying it on table.
async function dataGeter() {
    try {
        let response =await fetch("http://localhost:3000/employees");
        if (response.ok) {
            let employees = await response.json();
            let tableBody = document.getElementById("employee-table");
            let row = '';
            for (let i = employees.length - 1 ; i >0 ; i--) { // so reversed the order of display so that new employees added will come to the top.
                row+=` 
                    <tr class ="employee-details-row align-items-center" >
                        <th scope="row">${employees.length-i}</th>
                        <td>
                            <img class="emp-img-icon" src="http://localhost:3000/employees/${employees[i].id}/avatar" alt="employee icon">
                            ${employees[i].firstName} ${employees[i].lastName}
                        </td>
                        <td>${employees[i].email}</td>
                        <td>${employees[i].phone}</td>
                        <td>${employees[i].gender}</td>
                        <td>${employees[i].dob}</td>
                        <td>${employees[i].country}</td>
                        <td>
                            <div class="dropdown">
                                <button class="btn btn-secondary " type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="fa-solid fa-ellipsis"></i>
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="#">view</a></li>
                                    <li><a class="dropdown-item" onclick="editEmployee('${employees[i].id}')" href="#">Edit</a></li>
                                    <li><a class="dropdown-item" onclick="deleteEmployee('${employees[i].id}')" href="#">Delete</a></li>
                                </ul>
                            </div>
                        </td>
                    </tr>
                `
                tableBody.innerHTML=row;
            }
            return employees 
        } else {
            alert("API malfunction");
        }
    } catch (error) {
        alert("server down");
    }

}
dataGeter() // Data fetcher fucnction

// --------------------------------addEventListener-----------------------
const parentDiv = document.getElementById("main-parent");
parentDiv.addEventListener("click",(event)=>{
    if (event.target.id==="add-employe-btn") {//adding employe code.
        popEmloyeeForm();
    }else if (event.target.id=== "cancel" || event.target.id==="overlay" || event.target.id=== "x-cancel") {
        cancelForm();
    }else{
        // console.log('.')
    }
})

const empForm = document.getElementById("emp-form");
empForm.addEventListener('submit',(event)=>{
    event.preventDefault();
    const fd = new FormData(empForm);
    const check=document.getElementById("emp-id-check").value;
    if (check) {
        if (isFormDataEqual(fd,empData)) {
            cancelForm();
            console.log("Nothing changed")
        } else {
            PutEmployee(fd,document.getElementById("emp-id-check").value);
        }
    } else {
        console.log("save form")
        postEmployee(fd);
    }

})
// --------------------------------------------------------------------------
// -------------------user-related functions----------------
async function postEmployee(fd){
    const userobj= Object.fromEntries(fd);
    userobj.dob= userobj.dob.split("-").reverse().join("-");
    let response= await fetch("http://localhost:3000/employees",{
        method:'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userobj)
    })
    let result = await response.json();
    if(result.message=='Employee created successfully'){
        cancelForm();
        await imageUpload(result.id, fd);
        dataGeter();
    }
    
}
async function imageUpload(userId, formData) {
    let imgResponse = await fetch(`http://localhost:3000/employees/${userId}/avatar`, {
        method: 'POST',
        body: formData
    });
    const imgResult = await imgResponse.json();
    if (imgResult.success) {
        console.log('Avatar uploaded successfully');
    } else {
        console.error('Error uploading avatar:', imgResult.error);
    }
}

function deleteEmployee(empId) {
    try {
        fetch(`http://localhost:3000/employees/${empId}`,{
            method:'DELETE'
        }).then((response)=>{
            alert(response);
            dataGeter();
        })
    } catch (error) {
        
    }
    
}
let empData;
async function editEmployee(empId) {
    let response = await fetch(`http://localhost:3000/employees/${empId}`);
    empData= await response.json()
    document.getElementById("emp-id-check").value=empId;
    popEmloyeeForm();
    populateForm(empData);
}
async function PutEmployee(fd,id) {
    const user= Object.fromEntries(fd);
    user.dob= user.dob.split("-").reverse().join("-");
    let response = await fetch(`http://localhost:3000/employees/${id}`,{
        method:"PUT",
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    });
    let message = await response.json();
    console.log(message);
    if (user.avatar.size!=0) {
        await imageUpload(id,fd);
    }
    dataGeter();
    cancelForm();
}

function isFormDataEqual(formData, curData) {
    // Convert FormData to a plain object
    const formObject = Object.fromEntries(formData);

    // Adjust the dob format in curData to match the form data format
    const adjustedCurData = { ...curData };
    if (adjustedCurData.dob) {
        const [year, month, day] = adjustedCurData.dob.split('-');
        adjustedCurData.dob = `${day}-${month}-${year}`;
    }

    // Compare formObject and adjustedCurData (excluding avatar and id)
    for (const key in formObject) {
        if (key !== "avatar" && formObject[key] !== adjustedCurData[key]) {
            return false;
        }
    }

    // Ensure the keys in adjustedCurData also match (excluding avatar and id)
    for (const key in adjustedCurData) {
        if (key !== "avatar" && key !== "id" && formObject[key] !== adjustedCurData[key]) {
            return false;
        }
    }
    if (formObject.avatar.size!=0) {
        return false
    }
    return true;
}

// ------------------------html-and front end related functions----------------
function popEmloyeeForm() {
    const formDiv = document.getElementById("emp-form-container-div");
    const overlay = document.getElementById("overlay");
    formDiv.style.display="block";
    overlay.style.display="block";
}
function cancelForm() {
    const formDiv = document.getElementById("emp-form-container-div");
    const overlay = document.getElementById("overlay");
    document.getElementById('emp-form').reset();
    formDiv.style.display="none";
    overlay.style.display="none";
}
function populateForm(data) {
    document.getElementById('salutationSelect').value = data.salutation;
    document.getElementById('firstNameInput').value = data.firstName;
    document.getElementById('lastNameInput').value = data.lastName;
    document.getElementById('usernameInput').value = data.username;
    document.getElementById('passwordInput').value = data.password;
    document.getElementById('emailInput').value = data.email;
    document.getElementById('phoneInput').value = data.phone;
    document.getElementById('dobInput').value = data.dob.split("-").reverse().join("-");
    document.querySelector(`input[name="gender"][value="${data.gender}"]`).checked = true;
    document.getElementById('qualificationInput').value = data.qualifications;
    document.getElementById('addressInput').value = data.address;
    document.getElementById('countrySelect').value = data.country;
    document.getElementById('stateSelect').value = data.state;
    document.getElementById('cityInput').value = data.city;
    document.getElementById('zipInput').value = data.zip;
    
}