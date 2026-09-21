const API_URL = "http://127.0.0.1:8000";

/* =========================
   DASHBOARD STATS
========================= */
async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_URL}/dashboard/`);
        const data = await response.json();

        document.getElementById("totalRequests").textContent =
            data.total_requests || 0;

        document.getElementById("pendingRequests").textContent =
            data.pending_requests || 0;

        document.getElementById("availableResources").textContent =
            data.total_resources || 0;

        document.getElementById("activeDistributions").textContent =
            data.accepted_requests || 0;

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
    }
}

/* =========================
   RECENT REQUESTS
========================= */
async function loadRecentRequests() {
    try {
        const response = await fetch(
            "http://127.0.0.1:8000/requests/"
        );

        const requests = await response.json();

        const tbody =
            document.getElementById(
                "recentRequestsBody"
            );

        if (!tbody) return;

        tbody.innerHTML = "";

        requests.slice(0, 5).forEach(request => {

            tbody.innerHTML += `
                <tr>
                    <td>#${request.request_id}</td>
                    <td>${request.full_name}</td>
                    <td>${request.category_name}</td>
                    <td>
                        <span class="badge ${request.priority_level
                }">
                            ${request.priority_level}
                        </span>
                    </td>
                    <td>
                        <span class="badge pending">
                            ${request.status}
                        </span>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error(
            "Recent Requests Error:",
            error
        );
    }
}

/* =========================
   RESOURCE ALERTS
========================= */
async function loadResourceAlerts() {

    try {

        const response =
            await fetch(`${API_URL}/resources/`);

        const resources =
            await response.json();

        const container =
            document.getElementById("resourceAlerts");

        if (!container) return;

        container.innerHTML = "";

        const lowStock =
            resources.filter(resource =>
                resource.quantity_available < 20
            );

        if (lowStock.length === 0) {

            container.innerHTML = `
                <div class="alert-item">
                    ✅ All resources sufficiently stocked
                </div>
            `;

            return;
        }

        lowStock.forEach(resource => {

            container.innerHTML += `
                <div class="alert-item">
                    ⚠ ${resource.resource_name}
                    running low
                    (${resource.quantity_available} ${resource.unit})
                </div>
            `;
        });

    } catch (error) {
        console.error("Resource Alert Error:", error);
    }
}

/* =========================
   ACTIVE DISTRIBUTIONS
========================= */
async function loadDistributions() {

    try {

        const [distributionRes, usersRes] = await Promise.all([
            fetch(`${API_URL}/distributions`),
            fetch(`${API_URL}/users`)
        ]);

        const distributions = await distributionRes.json();
        const users = await usersRes.json();

        // Create lookup table
        const userMap = {};

        users.forEach(user => {
            userMap[user.user_id] = user.full_name;
        });

        const tbody = document.querySelector(
            "#distributionTable tbody"
        );

        if (!tbody) return;

        tbody.innerHTML = "";

        distributions.forEach(item => {

            tbody.innerHTML += `
                <tr>
                    <td>${item.distribution_id}</td>
                    <td>${item.request_id}</td>
                    <td>${item.resource_id}</td>
                    <td>
                        ${userMap[item.staff_id] || "Unknown Staff"}
                    </td>
                    <td>${item.quantity_given}</td>
                    <td>${item.distribution_date}</td>
                </tr>
            `;
        });

    }
    catch (error) {

        console.error(
            "Failed to load distributions:",
            error
        );
    }
}

async function loadRecentActivity() {

    const activityList =
        document.getElementById("activityList");

    if (!activityList) return;

    try {

        const response =
            await fetch(
                "http://127.0.0.1:8000/requests/"
            );

        const requests =
            await response.json();

        activityList.innerHTML = "";

        requests.slice(0, 5).forEach(request => {

            activityList.innerHTML += `
                <div class="activity-item">
                    Request #${request.request_id}
                    was marked as
                    ${request.status}
                </div>
            `;
        });

    } catch (error) {

        activityList.innerHTML = `
            <div class="activity-item">
                No activity found
            </div>
        `;
    }
}

async function loadPriorityRequests() {

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/requests/"
        );

        const requests = await response.json();

        const high =
            requests.filter(
                r => r.priority_level === "high"
            ).length;

        const medium =
            requests.filter(
                r => r.priority_level === "medium"
            ).length;

        const low =
            requests.filter(
                r => r.priority_level === "low"
            ).length;

        document.getElementById(
            "highPriorityCount"
        ).textContent = high;

        document.getElementById(
            "mediumPriorityCount"
        ).textContent = medium;

        document.getElementById(
            "lowPriorityCount"
        ).textContent = low;

    } catch (error) {

        console.error(
            "Priority Error:",
            error
        );
    }
}

document.addEventListener(
    "DOMContentLoaded",
    () => {
        loadDashboardStats();
        loadPriorityRequests();
        loadResourceAlerts();
        loadDistributions();
        loadRecentRequests();
        loadRecentActivity();
    }
);