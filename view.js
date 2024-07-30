let empData;
async function gettEmployee() {
    const params = new URLSearchParams(window.location.search);
    const employeeId = params.get('id');
    let response = await fetch(`http://localhost:3000/employees/${employeeId}`);
    empData= await response.json();
    populateData(empData);
}
gettEmployee()
function populateData(emp){
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
function deleteEmployee(empId) {
    try {
        fetch(`http://localhost:3000/employees/${empId}`,{
            method:'DELETE'
        }).then((response)=>{
            alert(response);
            window.location.href="./index.html"
        })
    } catch (error) {
        
    }
    
}
let main = document.getElementById("main");
main.addEventListener('click',(e)=>{
    if (e.target.id==="del-btn") {
        deleteEmployee(empData.id)
    } if (e.target.id==="edit-btn") {
        console.log("edit")
    }
})