// Disable right-click
document.addEventListener('contextmenu', function (e) {
  e.preventDefault();
});

// Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
document.addEventListener('keydown', function (e) {
  if (
    e.key === "F12" || 
    (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J")) || 
    (e.ctrlKey && e.key === "U")
  ) {
    e.preventDefault();
  }
});

// count Show

async function loadDashboardCounts() {
  try {
    const response = await fetch("/api/dashboard-counts");
    const data = await response.json();

    console.log("Dashboard Counts:", data); // 🧪 Check in browser console

    document.getElementById("userCount").textContent = data.totalUsers;
    document.getElementById("sliderCount").textContent = data.totalSliders;
    document.getElementById("reviewCount").textContent = data.pendingReviews;
    document.getElementById("messageCount").textContent = data.totalMessages;
  } catch (error) {
    console.error("Failed to load counts", error);
  }
}

loadDashboardCounts();

//user data

document.addEventListener("DOMContentLoaded", function () {
  async function loadUsers() {
    try {
      const res = await fetch("/api/get-users");
      const users = await res.json();

      const tbody = document.getElementById("userTableBody");
      tbody.innerHTML = "";

      users.forEach((user) => {
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${user.firstName} ${user.lastName}</td>
          <td>${user.email}</td>
          <td>${user.phone}</td>
          <td>${user.yearsExp} yrs</td>
          <td>${user.currentRole}</td>
          <td>${user.location}</td>
          <td><a href="${
            user.resumePath
          }" class="resume-link" target="_blank">View</a></td>
          <td>${new Date(user.createdAt).toLocaleDateString()}</td>
          <td><button class="delete-btn" data-id="${user._id}">🗑️</button></td>
        `;

        tbody.appendChild(row);
      });

      document.getElementById("totalUsers").textContent = users.length;

      attachDeleteListeners(); // Make sure it's called here
    } catch (err) {
      console.error("Error loading users:", err);
    }
  }

  function attachDeleteListeners() {
    const deleteButtons = document.querySelectorAll(".delete-btn");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const id = button.getAttribute("data-id");
        const confirmDelete = confirm(
          "Are you sure you want to delete this user?"
        );
        if (confirmDelete) {
          try {
            const response = await fetch(`/api/delete-user/${id}`, {
              method: "DELETE",
            });
            if (response.ok) {
              alert("User deleted successfully");
              loadUsers(); // Refresh the table
            } else {
              alert("Failed to delete user");
            }
          } catch (error) {
            console.error("Error deleting user:", error);
          }
        }
      });
    });
  }

  window.filterUsers = function () {
    const input = document.getElementById("searchInput").value.toLowerCase();
    const rows = document.querySelectorAll("#userTableBody tr");

    rows.forEach((row) => {
      const name = row.cells[0].textContent.toLowerCase();
      const email = row.cells[1].textContent.toLowerCase();
      row.style.display =
        name.includes(input) || email.includes(input) ? "" : "none";
    });
  };

  loadUsers();
});

//slider

function loadSliders() {
  fetch("/api/get-sliders")
    .then((res) => {
      if (!res.ok) throw new Error(`Status ${res.status}`);
      return res.json();
    })
    .then((data) => {
      const tbody = document.getElementById("sliderTableBody");
      const total = document.getElementById("totalSliders");
      tbody.innerHTML = "";
      total.textContent = data.length;

      data.forEach((slider) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><img src="${slider.imageUrl}" alt="Slider" /></td>
          <td>${slider.title}</td>
          <td>${slider.description}</td>
          <td>
           <button class="edit-btn" onclick="editSlider('${slider._id}')">✏️ Edit</button>
           <button onclick="deleteSlider('${slider._id}')">🗑️ Delete</button></td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch((err) => {
      console.error("Error loading sliders:", err);
      alert("Failed to load sliders");
    });
}
document.addEventListener("DOMContentLoaded", () => {
  loadSliders(); // if you want to load on page load
});
function deleteSlider(id) {
  if (confirm("Are you sure you want to delete this slider?")) {
    fetch(`/api/delete-slider/${id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete");
        return res.json();
      })
      .then((data) => {
        alert(data.message);
        loadSliders(); // refresh slider list
      })
      .catch((err) => {
        console.error("Delete Error:", err);
        alert("Error deleting slider");
      });
  }
}
function editSlider(id) {
  fetch(`/api/slider/${id}`)
    .then((res) => res.json())
    .then((slider) => {
      document.getElementById("editSliderId").value = slider._id;
      document.getElementById("editTitle").value = slider.title;
      document.getElementById("editDescription").value = slider.description;
      document.getElementById("editSliderModal").style.display = "flex";
    })
    .catch((err) => {
      alert("Error loading slider for edit");
      console.error(err);
    });
}

function closeEditModal() {
  document.getElementById("editSliderModal").style.display = "none";
}
document
  .getElementById("editSliderForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const id = document.getElementById("editSliderId").value;
    const formData = new FormData();
    formData.append("title", document.getElementById("editTitle").value);
    formData.append(
      "description",
      document.getElementById("editDescription").value
    );
    const imageFile = document.getElementById("editImage").files[0];
    if (imageFile) formData.append("image", imageFile);

    fetch(`/api/slider/${id}`, {
      method: "PUT",
      body: formData,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update slider");
        return res.json();
      })
      .then((data) => {
        alert("Slider updated successfully!");
        closeEditModal();
        loadSliders();
      })
      .catch((err) => {
        alert("Error updating slider");
        console.error(err);
      });
  });

document.getElementById("sliderForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const form = document.getElementById("sliderForm");
  const formData = new FormData(form);

  fetch("/api/add-slider", {
    method: "POST",
    body: formData,
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to add slider");
      return res.json();
    })
    .then((data) => {
      alert(data.message);
      form.reset();
      loadSliders(); // refresh the table
    })
    .catch((err) => {
      console.error("Slider Add Error:", err);
      alert("Error adding slider");
    });
});

//contact messages

async function loadContacts() {
  console.log("Loading contacts..."); // Add this line

  try {
    const response = await fetch("/api/get-contacts");
    const contacts = await response.json();
    console.log("Contacts:", contacts); // And this

    const tbody = document.getElementById("contactTableBody");
    tbody.innerHTML = "";

    contacts.forEach((contact) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${contact.name}</td>
        <td>${contact.email}</td>
        <td>${contact.phone}</td>
        <td>${contact.message}</td>
        <td>${new Date(contact.createdAt).toLocaleString()}</td>
      `;
      tbody.appendChild(row);
    });

    document.getElementById("totalContacts").textContent = contacts.length;
  } catch (err) {
    console.error("Failed to load contacts:", err);
  }
}

  loadContacts();

document.addEventListener("DOMContentLoaded", () => {
  showSection("dashboard"); // or trigger based on a button
});

function showSection(sectionId) {
  document.querySelectorAll(".content-section").forEach((section) => {
    section.style.display = "none";
  });

  const section = document.getElementById(sectionId);
  if (section) {
    section.style.display = "block";

    if (sectionId === "contacts") {
      loadContacts();
    }
  }
}
document.querySelector(".action-btn").addEventListener("click", () => {
  window.location.href = "/api/export-contacts";
});

// reviews
async function loadReviews() {
  const res = await fetch("/api/get-reviews");
  const data = await res.json();
  const tbody = document.getElementById("reviewTableBody");
  document.getElementById("totalReviews").innerText = data.length;
  tbody.innerHTML = "";

  data.forEach((review) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${review.name}</td>
      <td>${review.email}</td>
      <td>${review.rating}</td>
      <td>${review.message}</td>
      <td>${review.status}</td>
      <td>
        ${
          review.status === "pending"
            ? `
          <button class="approve-btn" onclick="approveReview('${review._id}')">✅ Approve</button>
<button class="decline-btn" onclick="declineReview('${review._id}')">❌ Decline</button>

        `
            : "—"
        }
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function approveReview(id) {
  const res = await fetch(`/api/approve-review/${id}`, {
    method: "PUT",
  });
  const msg = await res.text();
  alert(msg);
  loadReviews();
}

async function declineReview(id) {
  const res = await fetch(`/api/delete-review/${id}`, {
    method: "DELETE",
  });
  const msg = await res.text();
  alert(msg);
  loadReviews();
}
function showSection(sectionId) {
  const sections = document.querySelectorAll(".content-section");
  sections.forEach((section) => (section.style.display = "none"));
  const target = document.getElementById(sectionId);
  if (target) {
    target.style.display = "block";

    if (sectionId === "adminReviews") loadReviews(); // load review list
  }
}
