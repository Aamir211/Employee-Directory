const container = document.getElementById("employee-container");
const errorDiv = document.getElementById("error");
const reloadBtn = document.getElementById("reloadBtn");

// Modal elements
const addEmployeeBtn = document.getElementById("addEmployeeBtn");
const modal = document.getElementById("employeeFormModal");
const closeBtn = document.querySelector(".closeBtn");
const employeeForm = document.getElementById("employeeForm");

// --- LocalStorage Helpers ---
function getSavedEmployees() {
  return JSON.parse(localStorage.getItem("customEmployees")) || [];
}

function saveEmployee(employee) {
  const employees = getSavedEmployees();
  employees.push(employee);
  localStorage.setItem("customEmployees", JSON.stringify(employees));
}

function deleteEmployee(email) {
  let employees = getSavedEmployees();
  employees = employees.filter(emp => emp.email !== email); // remove by email
  localStorage.setItem("customEmployees", JSON.stringify(employees));
  fetchEmployees(); // refresh UI
}

// --- Fetch and Display Employees ---
async function fetchEmployees() {
  container.innerHTML = ""; 
  errorDiv.textContent = "";

  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");
    if (!response.ok) throw new Error("Network error " + response.status);

    const users = await response.json();

    // Show API employees (no delete button)
    users.forEach((user, index) => {
      addEmployeeCard(user.name, user.email, user.phone, user.company.name, user.address.city, false, index);
    });

    // Show saved (custom) employees with delete option
    showSavedEmployees();

  } catch (error) {
    errorDiv.textContent = "⚠️ Failed to fetch data. Please check your internet.";
    console.error("Error:", error);

    // If API fails, at least show saved employees
    showSavedEmployees();
  }
}

// --- Show Employees from LocalStorage ---
function showSavedEmployees() {
  const savedEmployees = getSavedEmployees();
  savedEmployees.forEach(emp => {
    addEmployeeCard(emp.name, emp.email, emp.phone, emp.company, emp.city, true);
  });
}

// --- Create Employee Card ---
function addEmployeeCard(name, email, phone, company, city, isCustom = false, delay = 0) {
  const card = document.createElement("div");
  card.className = "employee-card";
  card.style.animationDelay = `${delay * 0.1}s`;
  card.innerHTML = `
    <h2>${name}</h2>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Company:</strong> ${company}</p>
    <p><strong>City:</strong> ${city}</p>
  `;

  // Add delete button only for custom employees
  if (isCustom) {
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌ Delete";
    deleteBtn.className = "delete-btn";
    deleteBtn.addEventListener("click", () => {
      deleteEmployee(email);
    });
    card.appendChild(deleteBtn);
  }

  container.appendChild(card);
}

// --- Reload employees button ---
reloadBtn.addEventListener("click", fetchEmployees);

// --- Modal open/close ---
addEmployeeBtn.addEventListener("click", () => {
  modal.style.display = "block";
});
closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});
window.addEventListener("click", (e) => {
  if (e.target == modal) modal.style.display = "none";
});

// --- Add new employee manually ---
employeeForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const company = document.getElementById("company").value;
  const city = document.getElementById("city").value;

  // Save to localStorage
  saveEmployee({ name, email, phone, company, city });

  // Show immediately
  addEmployeeCard(name, email, phone, company, city, true);

  employeeForm.reset();
  modal.style.display = "none";
});

// --- Load everything on page start ---
fetchEmployees();
