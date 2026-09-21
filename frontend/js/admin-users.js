const API_URL = "http://127.0.0.1:8000/users";

const usersTableBody =
    document.getElementById("usersTableBody");

const modal =
    document.getElementById("userModal");

let editingUserId = null;

let allUsers = [];

/* ===========================
   LOAD USERS
=========================== */

async function loadUsers() {

    try {

        const response =
            await fetch(API_URL);

        const users =
            await response.json();

        allUsers = users;

        renderUsers(users);

    } catch (error) {

        console.error(
            "Failed to load users",
            error
        );
    }
}

/* ===========================
   RENDER USERS
=========================== */
function renderUsers(users) {

    usersTableBody.innerHTML = "";

    users.forEach(user => {

        const roleClass =
            user.role === "admin"
                ? "rq-badge-admin"
                : user.role === "staff"
                    ? "rq-badge-staff"
                    : "rq-badge-community";

        const roleText =
            user.role === "admin"
                ? "ADMIN"
                : user.role === "staff"
                    ? "STAFF"
                    : "USER";

        usersTableBody.innerHTML += `
            <tr data-role="${user.role}">

                <td>${user.user_id}</td>

                <td>${user.full_name}</td>

                <td>${user.email}</td>

                <td>
                    <span class="rq-badge ${roleClass}">
                        ${roleText}
                    </span>
                </td>

                <td>

                    <button
                        class="rq-btn-edit"
                        onclick="editUser(
                            ${user.user_id},
                            '${user.full_name}',
                            '${user.email}',
                            '${user.role}'
                        )"
                    >
                        Edit
                    </button>

                    <button
                        class="rq-btn-delete"
                        onclick="deleteUser(${user.user_id})"
                    >
                        Delete
                    </button>

                </td>

            </tr>
        `;
    });
}
/* ===========================
   ADD USER
=========================== */

document
    .getElementById("addUserBtn")
    .addEventListener("click", () => {

        editingUserId = null;

        document.getElementById(
            "userModalTitle"
        ).textContent =
            "Add New User";

        document.getElementById(
            "userName"
        ).value = "";

        document.getElementById(
            "userEmail"
        ).value = "";

        document.getElementById(
            "userPassword"
        ).value = "";

        document.getElementById(
            "userRole"
        ).value = "community";

        modal.classList.add("active");

    });

/* ===========================
   SAVE USER
=========================== */

document
    .getElementById("saveUserBtn")
    .addEventListener("click", async () => {

        const fullName =
            document.getElementById(
                "userName"
            ).value;

        const email =
            document.getElementById(
                "userEmail"
            ).value;

        const password =
            document.getElementById(
                "userPassword"
            ).value;

        const role =
            document.getElementById(
                "userRole"
            ).value;

        if (
            !fullName ||
            !email
        ) {
            alert("Please fill all fields.");
            return;
        }

        try {

            if (!editingUserId) {

                await fetch(
                    `${API_URL}/create`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body: JSON.stringify({
                            full_name: fullName,
                            email: email,
                            password: password,
                            role: role
                        })
                    }
                );

            } else {

                await fetch(
                    `${API_URL}/${editingUserId}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body: JSON.stringify({
                            full_name: fullName,
                            email: email,
                            role: role
                        })
                    }
                );

            }

            modal.classList.remove(
                "active"
            );

            loadUsers();

        } catch (error) {

            console.error(error);

        }

    });

/* ===========================
   EDIT USER
=========================== */

window.editUser = function (
    id,
    fullName,
    email,
    role
) {

    editingUserId = id;

    document.getElementById(
        "userModalTitle"
    ).textContent =
        "Edit User";

    document.getElementById(
        "userName"
    ).value = fullName;

    document.getElementById(
        "userEmail"
    ).value = email;

    document.getElementById(
        "userRole"
    ).value = role;

    modal.classList.add(
        "active"
    );
};

/* ===========================
   DELETE USER
=========================== */

window.deleteUser =
    async function (userId) {

        const confirmed =
            confirm(
                "Delete this user?"
            );

        if (!confirmed) return;

        try {

            await fetch(
                `${API_URL}/${userId}`,
                {
                    method: "DELETE"
                }
            );

            loadUsers();

        } catch (error) {

            console.error(error);

        }
    };

/* ===========================
   SEARCH
=========================== */

document
    .getElementById("userSearch")
    .addEventListener("input", () => {

        const value =
            document
                .getElementById(
                    "userSearch"
                )
                .value
                .toLowerCase();

        const filtered =
            allUsers.filter(
                user =>
                    user.full_name
                        .toLowerCase()
                        .includes(value)
                    ||
                    user.email
                        .toLowerCase()
                        .includes(value)
            );

        renderUsers(filtered);

    });

/* ===========================
   CLOSE MODAL
=========================== */

document
    .getElementById("closeUserModal")
    .addEventListener("click", () => {
        modal.classList.remove("active");
    });

document
    .getElementById("cancelUserModal")
    .addEventListener("click", () => {
        modal.classList.remove("active");
    });

/* ===========================
   INITIAL LOAD
=========================== */

loadUsers();