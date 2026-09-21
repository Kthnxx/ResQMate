const API_URL = "http://127.0.0.1:8000";

let requestsData = [];
let usersData = [];

document.addEventListener("DOMContentLoaded", () => {
    loadRequests();
    setupFilters();
});

async function loadRequests() {
    try {

        const [requestsRes, usersRes] = await Promise.all([
            fetch(`${API_URL}/requests/`),
            fetch(`${API_URL}/users/`)
        ]);

        requestsData = await requestsRes.json();
        usersData = await usersRes.json();

        if (!requestsData) {
            requestsData = [];
        }

        renderStatistics();
        renderRequestsTable();

    } catch (error) {
        console.error("Load Requests Error:", error);
    }
}

function renderStatistics() {

    const total = requestsData.length;

    const pending = requestsData.filter(
        r => r.status?.toLowerCase() === "pending"
    ).length;

    const processing = requestsData.filter(
        r => r.status?.toLowerCase() === "processing"
    ).length;

    const completed = requestsData.filter(
        r => r.status?.toLowerCase() === "completed"
    ).length;

    document.getElementById("totalRequests").textContent = total;
    document.getElementById("pendingRequests").textContent = pending;
    document.getElementById("processingRequests").textContent = processing;
    document.getElementById("completedRequests").textContent = completed;
}

function renderRequestsTable(filteredData = requestsData) {

    const tbody =
        document.getElementById("requestsTableBody");

    tbody.innerHTML = "";

    filteredData.forEach(request => {

        const user =
            usersData.find(
                u => u.user_id === request.user_id
            );

        const requesterName =
            user?.full_name || `User ${request.user_id}`;

        const category =
            request.category_name || "Unknown";

        tbody.innerHTML += `
            <tr data-status="${request.status.toLowerCase()}">

                <td>#${request.request_id}</td>

                <td>${requesterName}</td>

                <td>${category}</td>

                <td>${request.location_name || "-"}</td>

                <td>
                    <span class="rq-badge rq-badge-${request.priority_level}">
                        ${request.priority_level}
                    </span>
                </td>

                <td>
                    <span class="rq-badge rq-badge-${request.status.toLowerCase()}">
                        ${request.status}
                    </span>
                </td>

                <td>
                     ${request.assigned_staff || "Not Assigned"}
                </td>

               <td>
                    <button
                        class="rq-btn-view"
                        onclick="viewRequest(${request.request_id})">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                </td>

            </tr>
        `;
    });
}

function getCategoryName(categoryId) {

    const categories = {
        1: "Food",
        2: "Water",
        3: "Shelter",
        4: "Medicine"
    };

    return categories[categoryId] || "Unknown";
}

function setupFilters() {

    const searchInput =
        document.getElementById("requestSearch");

    const statusFilter =
        document.getElementById("statusFilter");

    searchInput.addEventListener("input", filterRequests);
    statusFilter.addEventListener("change", filterRequests);
}

function filterRequests() {

    const search =
        document.getElementById("requestSearch")
            .value
            .toLowerCase();

    const status =
        document.getElementById("statusFilter")
            .value
            .toLowerCase();

    const filtered =
        requestsData.filter(request => {

            const user =
                usersData.find(
                    u => u.user_id === request.user_id
                );

            const requester =
                user?.full_name?.toLowerCase() || "";

            const matchesSearch =
                requester.includes(search) ||
                request.request_id.toString().includes(search);

            const matchesStatus =
                status === "all" ||
                request.status.toLowerCase() === status;

            return matchesSearch && matchesStatus;
        });

    renderRequestsTable(filtered);
}

function viewRequest(requestId) {

    const request = requestsData.find(
        r => r.request_id === requestId
    );

    if (!request) return;

    const user =
        usersData.find(
            u => u.user_id === request.user_id
        );

    document.getElementById("modalRequestId").textContent =
        request.request_id;

    document.getElementById("modalRequester").textContent =
        user?.full_name || "Unknown User";

    document.getElementById("modalCategory").textContent =
        request.category_name || getCategoryName(request.category_id);

    document.getElementById("modalLocation").textContent =
        request.location_name || "-";

    document.getElementById("modalPriority").textContent =
        request.priority_level;

    document.getElementById("modalStatus").textContent =
        request.status;

    document.getElementById("modalDescription").textContent =
        request.request_details;

    document
        .getElementById("viewRequestModal")
        .classList.add("show");
}


document.addEventListener("DOMContentLoaded", () => {

    const closeBtn =
        document.getElementById("closeViewModal");

    if (closeBtn) {

        closeBtn.addEventListener("click", () => {

            document
                .getElementById("viewRequestModal")
                .classList.remove("show");

        });

    }

});