// Fetching data and displaying it on table.
let employeeArraay=[];
let limit=2;
async function dataGeter() {
    try {
        let response =await fetch("http://localhost:3000/employees");
        if (response.ok) {
            employeeArraay = await response.json();
            employeeArraay=employeeArraay.reverse();// so reversed the order of display so that new employees added will come to the top.
            renderButtonPagination(employeeArraay.length);          
            renderData(0,limit);
            return employeeArraay 
        } else {
            let message={
                title:"Oop's",
                text:"Server Down",
                icon:"error"
            }
            popMessage(message)
        }
    } catch (error) {
        let message={
            title:"Oop's",
            text:"Server Down",
            icon:"error"
        }
        popMessage(message)
    }
}
dataGeter() // Data fetcher fucnction

function renderButtonPagination(empLenght) {
    let btnNo=Math.ceil(empLenght/limit);   
    let pgBtns=document.getElementById('pg-btns');
    pgBtns.innerHTML=`<li onclick="pagination(${0})" class="page-item"><a class="page-link" href="#"> <i class="fa-solid fa-angles-left"></i> </a></li>`;
    for (let index = 0; index < btnNo; index++) {
        pgBtns.innerHTML+=`<li onclick="pagination(${index})" class="page-item"><a class="page-link" href="#">${index+1}</a></li>`;
    }
    pgBtns.innerHTML+=`<li onclick="pagination(${btnNo-1})" class="page-item"><a class="page-link" href="#"><i class="fa-solid fa-angles-right"></i></a></li>`;
}   
function pagination(btNo){
    let strtIndex= btNo*limit;
    let endIndex=strtIndex+limit;
    if (endIndex>employeeArraay.length-1) {
        renderData(strtIndex,employeeArraay.length);
    } else {
        renderData(strtIndex,endIndex);
    }
}
// --------------------------------addEventListener-----------------------
const parentDiv = document.getElementById("main-parent");
parentDiv.addEventListener("click",(event)=>{
    if (event.target.id==="add-employe-btn") {//adding employe code.
        popEmloyeeForm();
    }else if (event.target.id=== "cancel" || event.target.id==="overlay" || event.target.id=== "x-cancel") {
        cancelForm();
    }
})

// emp form listener
const empForm = document.getElementById("emp-form");
empForm.addEventListener('submit',(event)=>{
    event.preventDefault();
    const fd = new FormData(empForm);
    const check=document.getElementById("emp-id-check").value;
    let valid = validateForm();
    if (valid) {
        if (check) {
            if (isFormDataEqual(fd,empData)) {
                cancelForm();
            } else {
                PutEmployee(fd,document.getElementById("emp-id-check").value);
            }
        } else {
            postEmployee(fd);
        }
    }
})

// user search 
const searchBar=document.getElementById("user-search");
searchBar.addEventListener("input",(event)=>{
    event.stopPropagation();
    let value=event.target.value.toLowerCase();
    let seachedUser=[];
    employeeArraay.forEach((user)=>{
        if(user.firstName.toLowerCase().includes(value)||user.lastName.toLowerCase().includes(value)||user.email.includes(value)){
            seachedUser.unshift(user);
        }
    })
    renderButtonPagination(seachedUser.length)
    renderData(0,limit,seachedUser);
})

//impage preview
document.getElementById('upload').addEventListener('input',(e)=>{
    e.stopPropagation();
    let img =e.target.files[0];
    if (img) {
        let url = URL.createObjectURL(img);
        document.getElementById('image-Preview').style.display='block';
        document.getElementById('image-Preview').src=url;       
    } else {
        console.log('no');
        
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
        if (userobj.avatar.size!=0) {
            await imageUpload(id,fd);
        }
        message={
            title:"New Employee",
            text:"Employee Created Succesfully",
            icon:"success"
        }
        popMessage(message);
        dataGeter();
    }else{
        message={
            title:"Oop's",
            text:"Employee not Created",
            icon:"error"
        }
        popMessage(message);
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
            message={
                title:"Deleted",
                text:"Employee Deleted Succesfully",
                icon:"success"
            }
            popMessage(message);
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
    if (user.avatar.size!=0) {
        await imageUpload(id,fd);
    }
    dataGeter();
    cancelForm();
    message={
        title:"Updated",
        text:"Employee Updated Succesfully",
        icon:"success"
    }
    popMessage(message);
}

function isFormDataEqual(formData, curData) {
    const formObject = Object.fromEntries(formData);
    const adjustedCurData = { ...curData };
    if (adjustedCurData.dob) {
        const [year, month, day] = adjustedCurData.dob.split('-');
        adjustedCurData.dob = `${day}-${month}-${year}`;
    }
    for (const key in formObject) {
        if (key !== "avatar" && formObject[key] !== adjustedCurData[key]) {
            return false;
        }
    }
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
    if(data.avatar){ 
        document.getElementById('image-Preview').style.display='block';
        document.getElementById('image-Preview').src = `http://localhost:3000/employees/${data.id}/avatar`;
    }
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
function popMessage(message){
    Swal.fire({
        title: message.title,
        text: message.text,
        icon: message.icon
      });
}
function renderData(start, end, searcheduser) {    
    let tableBody = document.getElementById("employee-table");
    let row = '';
    let dataArray = searcheduser && searcheduser.length > 0 ? searcheduser : employeeArraay;
    for (let i = start; i < end && i < dataArray.length; i++) { 
        row += ` 
            <tr class="employee-details-row align-items-center">
                <th scope="row">#0${i + 1}</th>
                <td>
                    <img class="emp-img-icon" src="http://localhost:3000/employees/${dataArray[i].id}/avatar" alt="employee icon">
                    ${dataArray[i].firstName} ${dataArray[i].lastName}
                </td>
                <td>${dataArray[i].email}</td>
                <td>${dataArray[i].phone}</td>
                <td>${dataArray[i].gender}</td>
                <td>${dataArray[i].dob}</td>
                <td>${dataArray[i].country}</td>
                <td>
                    <div class="dropdown">
                        <button class="btn btn-secondary" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="fa-solid fa-ellipsis"></i>
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="./employee.html?id=${dataArray[i].id}">View</a></li>
                            <li><a class="dropdown-item" onclick="editEmployee('${dataArray[i].id}')" href="#">Edit</a></li>
                            <li><a class="dropdown-item" onclick="deleteEmployee('${dataArray[i].id}')" href="#">Delete</a></li>
                        </ul>
                    </div>
                </td>
            </tr>
        `;
    }
    tableBody.innerHTML = row;
}

function pgLimitFinder(){
    limit=parseInt(document.getElementById('pg-limit').value);
    renderButtonPagination(employeeArraay.length);
    renderData(0,limit);
    
}

// form validation--------------------------------

function validateForm() {
    let isValid = true;
    const formElements = document.getElementById('emp-form').elements;
    const requiredFields = ['salutationSelect', 'firstNameInput', 'lastNameInput', 'usernameInput', 'passwordInput', 'emailInput', 'phoneInput', 'dobInput', 'qualificationInput', 'addressInput', 'countrySelect', 'stateSelect', 'cityInput', 'zipInput'];
    
    requiredFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (!element.value) {
            isValid = false;
            element.classList.add('is-invalid');
        } else {
            element.classList.remove('is-invalid');
        }
    });

    //  email
    const emailInput = document.getElementById('emailInput');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailInput.value)) {
        isValid = false;
        emailInput.classList.add('is-invalid');
    } else {
        emailInput.classList.remove('is-invalid');
    }

    // Validate phone number
    const phoneInput = document.getElementById('phoneInput');
    const phonePattern = /^\d{10}$/;
    if (!phonePattern.test(phoneInput.value)) {
        isValid = false;
        phoneInput.classList.add('is-invalid');
    } else {
        phoneInput.classList.remove('is-invalid');
    }
    return isValid;
}
