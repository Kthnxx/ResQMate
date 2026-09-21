const API_URL =
    "http://127.0.0.1:8000";

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadStaffProfile();
        loadDashboardStats();
        loadRecentRequests();

    }
);

function loadStaffProfile() {

    const user =
        JSON.parse(
            localStorage.getItem("user")
        );

    if (!user) return;

    console.log(
        "Logged in:",
        user.full_name
    );

}

async function loadDashboardStats() {

    try {

        const requestsResponse =
            await fetch(
                `${API_URL}/requests/`
            );

        const requests =
            await requestsResponse.json();

        const resourcesResponse =
            await fetch(
                `${API_URL}/resources/`
            );

        const resources =
            await resourcesResponse.json();

        const distributionsResponse =
            await fetch(
                `${API_URL}/distributions/`
            );

        const distributions =
            await distributionsResponse.json();

        document.getElementById(
            "totalRequests"
        ).textContent =
            requests.length;

        document.getElementById(
            "pendingRequests"
        ).textContent =
            requests.filter(
                request =>
                    request.status
                        .toLowerCase() ===
                    "pending"
            ).length;

        document.getElementById(
            "completedDistributions"
        ).textContent =
            distributions.length;

        document.getElementById(
            "totalResources"
        ).textContent =
            resources.length;

    }
    catch (error) {

        console.error(
            "Failed loading dashboard:",
            error
        );

    }

}

async function loadRecentRequests() {

    try {

        const response =
            await fetch(
                `${API_URL}/requests/`
            );

        const requests =
            await response.json();

        const table =
            document.getElementById(
                "recentRequestsTable"
            );

        table.innerHTML = "";

        requests
            .slice(0, 5)
            .forEach(request => {

                const status =
                    (request.status || "pending")
                        .toLowerCase();

                const priority =
                    (request.priority_level || "low")
                        .toLowerCase();

                table.innerHTML += `
                    <tr>

                        <td>
                            ${request.request_id}
                        </td>

                        <td>
                            ${request.user_id}
                        </td>

                        <td>
                            <span class="rq-badge rq-badge-${priority}">
                                ${(request.priority_level || "-").toUpperCase()}
                            </span>

                        </td>

                        <td>
                            <span class="rq-badge rq-badge-${status}">
                                ${(request.status || "PENDING").toUpperCase()}
                            </span>
                        </td>

                    </tr>
                `;

            });

    }
    catch (error) {

        console.error(
            "Failed loading requests:",
            error
        );

    }

}