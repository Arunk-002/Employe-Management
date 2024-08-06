let empData;
async function gettEmployee() {// To fetch the user from the url of the page.
    const params = new URLSearchParams(window.location.search);
    const employeeId = params.get('id');
    let response = await fetch(`http://localhost:3000/employees/${employeeId}`);
    empData= await response.json();
    populateData(empData);
}
gettEmployee()
function populateData(emp){//function to populate the details of employee in th page
    let d= new Date();
    document.getElementById('employee-image').src =`http://localhost:3000/employees/${emp.id}/avatar`;
    document.getElementById('employee-name').textContent = emp.firstName+emp.lastName;
    document.getElementById('employee-email').textContent = emp.email;
    document.getElementById('employee-gender').textContent = emp.gender;
    document.getElementById('employee-age').textContent = d.getFullYear()-emp.dob.slice(-4);
    document.getElementById('employee-dob').textContent = emp.dob;
    document.getElementById('employee-mobile').textContent = emp.phone;
    document.getElementById('employee-qualification').textContent = emp.qualifications;
    document.getElementById('employee-address').textContent = emp.address;
    document.getElementById('employee-username').textContent = emp.username;
}
function deleteEmployee(empId) {//deletes the employee with the specified id. then relocates to the next page
    try {
        fetch(`http://localhost:3000/employees/${empId}`,{
            method:'DELETE'
        }).then(()=>{
            message={
                title:"Deleted",
                text:"Employee Deleted Succesfully",
                icon:"success"
            }
            popMessage(message);
            window.location.href="./index.html"
        })
    } catch (error) {
        message={
            title:"Oop's",
            text:"Employee Not Deleted",
            icon:"error"
        }
        popMessage(message);        
    }
    
}

async function PutEmployee(fd,id) {//to make changes to the employee with the specified id.
    const user= Object.fromEntries(fd);
    user.dob= user.dob.split("-").reverse().join("-");
    let response = await fetch(`http://localhost:3000/employees/${id}`,{
        method:"PUT",
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    });
    let Responsemessage = await response.json();
    if (user.avatar.size!=0) {
        await imageUpload(id,fd);
    }
    cancelForm();
    await gettEmployee();
    message={
        title:"updated",
        text:"Employee Updated Succesfully",
        icon:"success"
    }
    popMessage(message);
}
async function imageUpload(userId, formData) {// TO upload images with specified id and formdata
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
//Add event listeners----------------------
let main = document.getElementById("main");//captures all events occuring.
main.addEventListener('click',(e)=>{
    if (e.target.id==="del-btn") {
        deleteEmployee(empData.id)
    }else if (e.target.id==="edit-btn") {
        populateForm(empData);
    }else if(e.target.id=== "cancel" || e.target.id==="overlay" || e.target.id=== "x-cancel"){
        cancelForm()
    }
})
const empForm = document.getElementById("emp-form");//Form sumbmit event.
empForm.addEventListener('submit',(event)=>{
    event.preventDefault();
    const fd = new FormData(empForm);
    let valid=validateForm()
    if (valid) {
        if (isFormDataEqual(fd,empData)) {
            cancelForm();
        } else {
            PutEmployee(fd,empData.id);
        }
    }
    
    
})
document.getElementById('upload').addEventListener('input',(e)=>{//Image Preview listner.
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
// ---------------------------------------------------
function isFormDataEqual(formData, curData) {// This  functions takes formdata and curdata
    //checks if there are ny chhanges in the form.
    const formObject = Object.fromEntries(formData);
    const adjustedCurData = { ...curData }; //this is a spread operator which is used to make an exact copy of curdata.
    if (adjustedCurData.dob) {// reverses the dob format for  checking with the curdata. 
        const [year, month, day] = adjustedCurData.dob.split('-');
        adjustedCurData.dob = `${day}-${month}-${year}`;
    }
    for (const key in formObject) {
        if (key !== "avatar" && formObject[key] !== adjustedCurData[key]) { // skips the avatar key for checking.
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

// ----------------form functions-----------------
function cancelForm() {
    const formDiv = document.getElementById("emp-form-container-div");
    const overlay = document.getElementById("overlay");
    document.getElementById('emp-form').reset();
    formDiv.style.display="none";
    overlay.style.display="none";
}
function populateForm(data) {
    const formDiv = document.getElementById("emp-form-container-div");
    const overlay = document.getElementById("overlay");
    formDiv.style.display="block";
    overlay.style.display="block";
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

