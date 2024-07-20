// Fetching data and displaying it on table.
async function dataGeter() {
    try {
        let response =await fetch("http://localhost:3000/employees");
        if (response.ok) {
            let employees = await response.json();
            let tableBody = document.getElementById("employee-table");
            let row = '';
            for (let i = 0; i < employees.length; i++) {
                row+=` 
                    <tr class ="employee-details-row align-items-center" >
                        <th scope="row">${i}</th>
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
                                    <li><a class="dropdown-item" href="#">Edit</a></li>
                                    <li><a class="dropdown-item" href="#">Delete</a></li>
                                </ul>
                            </div>
                        </td>
                    </tr>
                `
                tableBody.innerHTML=row;
            }
        } else {
            alert("API malfunction");
        }
    } catch (error) {
        alert("server down");
    }

}
dataGeter() // Data fetcher fucnction.

// --------------------------------addEventListener-----------------------
const parentDiv = document.getElementById("main-parent");
parentDiv.addEventListener("click",(event)=>{
    if (event.target.id==="add-employe-btn") {//adding employe code.
        addEmployee();
    }else if (event.target.id=== "cancel" || event.target.id==="overlay" || event.target.id=== "x-cancel") {
        cancelForm();
    }else{
        // console.log('.')
    }
})
const form = document.getElementById("emp-form");
form.addEventListener('submit',(event)=>{
    event.preventDefault();
    event.stopPropagation();
    const fd = new FormData(form);
    // console.log(fd);
    // for (const item of fd) {
    //     console.log(item);
    // }
    const fdobj= Object.fromEntries(fd);
    fdobj.dob= fdobj.dob.split("-").reverse().join("-");
    postEmployee(fdobj);
    console.log(fdobj);
})
// --------------------------------------------------------------------------
function addEmployee() {
    const formDiv = document.getElementById("emp-form-container-div");
    const overlay = document.getElementById("overlay");
    console.log(form);
    formDiv.style.display="block";
    overlay.style.display="block";
}
function cancelForm() {
    const formDiv = document.getElementById("emp-form-container-div");
    const overlay = document.getElementById("overlay");
    console.log(form);
    formDiv.style.display="none";
    overlay.style.display="none";
}
async function postEmployee(userobj){
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
        dataGeter();
    }
    
}