const API_URL = "http://127.0.0.1:8000";

document.addEventListener("DOMContentLoaded", () => {

    loadRequests();

    // Display logged in staff name
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
        const firstName = user.full_name
            .trim()
            .split(" ")[0];

        const staffName =
            document.getElementById("staffName");

        if (staffName) {
            staffName.textContent = firstName;
        }
    }

    // Refresh button
    const refreshBtn =
        document.getElementById("refreshBtn");

    if (refreshBtn) {
        refreshBtn.addEventListener(
            "click",
            loadRequests
        );
    }

    // Search
    const searchBar =
        document.getElementById("searchBar");

    if (searchBar) {
        searchBar.addEventListener(
            "input",
            filterRequests
        );
    }

    // Status Filter
    const statusFilter =
        document.getElementById("statusFilter");

    if (statusFilter) {
        statusFilter.addEventListener(
            "change",
            filterRequests
        );
    }
});

async function loadRequests() {

    try {

        const response =
            await fetch(
                `${API_URL}/requests`
            );

        if (!response.ok) {
            throw new Error(
                "Failed to load requests"
            );
        }

        const requests =
            await response.json();

        renderTable(requests);

        updateCounts(requests);

    }

    catch (error) {

        console.error(
            "Error loading requests:",
            error
        );

        document.getElementById(
            "requestsTableBody"
        ).innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-danger py-4">
                    Failed to load requests from server.
                </td>
            </tr>
        `;
    }
}

function renderTable(requests) {

    const tbody =
        document.getElementById(
            "requestsTableBody"
        );

    if (!tbody) return;

    tbody.innerHTML = "";

    if (requests.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4">
                    No requests found.
                </td>
            </tr>
        `;

        return;
    }

    requests.forEach(request => {

        const status =
            request.status || "Pending";

        const statusClass =
            status.toLowerCase();

        const createdDate =
            request.created_at
                ? new Date(
                    request.created_at
                ).toLocaleDateString()
                : "-";

        tbody.innerHTML += `
            <tr data-status="${statusClass}">

                <td class="fw-semibold">
                    #${String(
            request.request_id
        ).padStart(4, "0")}
                </td>

                <td>
                    ${request.full_name || "-"}
                </td>

                <td>
                    ${request.category_name || "-"}
                </td>

                <td>
                    ${request.location_name || "-"}
                </td>

                <td>
                    <span class="rq-badge rq-badge-high">
                        High
                    </span>
                </td>

                <td>
                    <span class="rq-badge rq-badge-${statusClass}">
                        ${status}
                    </span>
                </td>

                <td>
                    ${createdDate}
                </td>

                <td>

                    <button
                        class="rq-btn-view me-1"
                        onclick="viewRequest(${request.request_id})">
                        View
                    </button>

                    ${statusClass === "pending"
                ? `
                        <button
                            class="rq-btn-approve me-1"
                            onclick="updateStatus(${request.request_id}, 'Approved')">
                            Approve
                        </button>

                        <button
                            class="rq-btn-reject"
                            onclick="updateStatus(${request.request_id}, 'Rejected')">
                            Reject
                        </button>
                        `
                : ""
            }

                    ${statusClass === "approved"
                ? `
                        <button
                            class="rq-btn-approve"
                            onclick="updateStatus(${request.request_id}, 'Processing')">
                            Process
                        </button>
                        `
                : ""
            }

                    ${statusClass === "processing"
                ? `
                        <button
                            class="rq-btn-approve"
                            onclick="updateStatus(${request.request_id}, 'Completed')">
                            Complete
                        </button>
                        `
                : ""
            }

                </td>

            </tr>
        `;
    });

    filterRequests();
}

function updateCounts(requests) {

    const pending =
        requests.filter(
            r =>
                r.status &&
                r.status.toLowerCase() ===
                "pending"
        ).length;

    const approved =
        requests.filter(
            r =>
                r.status &&
                r.status.toLowerCase() ===
                "approved"
        ).length;

    const processing =
        requests.filter(
            r =>
                r.status &&
                r.status.toLowerCase() ===
                "processing"
        ).length;

    const completed =
        requests.filter(
            r =>
                r.status &&
                r.status.toLowerCase() ===
                "completed"
        ).length;

    document.getElementById(
        "countPending"
    ).textContent = pending;

    document.getElementById(
        "countApproved"
    ).textContent = approved;

    document.getElementById(
        "countProcessing"
    ).textContent = processing;

    document.getElementById(
        "countCompleted"
    ).textContent = completed;
}

function filterRequests() {

    const search =
        document.getElementById(
            "searchBar"
        ).value.toLowerCase();

    const status =
        document.getElementById(
            "statusFilter"
        ).value.toLowerCase();

    const rows =
        document.querySelectorAll(
            "#requestsTableBody tr"
        );

    let visibleRows = 0;

    rows.forEach(row => {

        const text =
            row.textContent.toLowerCase();

        const rowStatus =
            row.dataset.status || "";

        const matchesSearch =
            text.includes(search);

        const matchesStatus =
            status === "all" ||
            rowStatus === status;

        if (
            matchesSearch &&
            matchesStatus
        ) {

            row.style.display = "";
            visibleRows++;

        } else {

            row.style.display = "none";

        }
    });

    const emptyState =
        document.getElementById(
            "emptyState"
        );

    if (emptyState) {

        if (visibleRows === 0) {

            emptyState.classList.remove(
                "d-none"
            );

        } else {

            emptyState.classList.add(
                "d-none"
            );

        }
    }
}

async function updateStatus(
    requestId,
    newStatus
) {

    try {

        const response =
            await fetch(
                `${API_URL}/requests/${requestId}/status`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );

        if (!response.ok) {
            throw new Error(
                "Status update failed"
            );
        }

        alert(
            `Request #${requestId} updated to ${newStatus}`
        );

        loadRequests();

    }

    catch (error) {

        console.error(error);

        alert(
            "Failed to update request status."
        );
    }
}

async function viewRequest(id) {

    try {

        const response =
            await fetch(`${API_URL}/requests/${id}`);

        const request =
            await response.json();

        document.getElementById(
            "customRequestDetailBody"
        ).innerHTML = `

            <table class="request-details-table">

                <tr>
                    <th>ID</th>
                    <td>${request.request_id}</td>
                </tr>

                <tr>
                    <th>Requester</th>
                    <td>${request.full_name || "-"}</td>
                </tr>

                <tr>
                    <th>Type</th>
                    <td>${request.category_name || "-"}</td>
                </tr>

                <tr>
                    <th>Location</th>
                    <td>${request.location_name || "-"}</td>
                </tr>

                <tr>
                    <th>Details</th>
                    <td>${request.request_details}</td>
                </tr>

                <tr>
                    <th>Status</th>
                    <td>${request.status}</td>
                </tr>

            </table>

        `;

        document
            .getElementById("requestModal")
            .classList.add("show");

    } catch (error) {

        console.error(error);

    }

}

// ======================
// REQUEST MODAL
// ======================

document.addEventListener("DOMContentLoaded", () => {

    const requestModal =
        document.getElementById("requestModal");

    const closeBtn =
        document.getElementById("closeRequestModal");

    if (closeBtn && requestModal) {

        closeBtn.addEventListener("click", () => {

            requestModal.classList.remove("show");

        });

        requestModal.addEventListener("click", (e) => {

            if (e.target === requestModal) {

                requestModal.classList.remove("show");

            }

        });

    }

});