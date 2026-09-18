const API_URL =
    "http://127.0.0.1:8000";

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadResources();

        document
            .getElementById("refreshBtn")
            .addEventListener(
                "click",
                loadResources
            );

    }
);

async function loadResources() {

    try {

        const response =
            await fetch(
                `${API_URL}/resources/`
            );

        const resources =
            await response.json();

        renderResources(
            resources
        );

    }
    catch (error) {

        console.error(
            error
        );

    }

}

function renderResources(
    resources
) {

    const tbody =
        document.getElementById(
            "resourcesTableBody"
        );

    tbody.innerHTML = "";

    let available = 0;
    let low = 0;
    let depleted = 0;

    resources.forEach(resource => {

        const quantity =
            parseInt(
                resource.quantity_available
            ) || 0;

        let status =
            "AVAILABLE";

        let badge =
            "rq-badge-available";

        if (quantity === 0) {

            status =
                "DEPLETED";

            badge =
                "rq-badge-depleted";

            depleted++;

        }
        else if (quantity <= 20) {

            status =
                "LOW STOCK";

            badge =
                "rq-badge-low";

            low++;

        }
        else {

            available++;

        }

        tbody.innerHTML += `
            <tr>

                <td>
                    #R${String(resource.resource_id).padStart(3, "0")}
                </td>

                <td>
                    ${resource.resource_name}
                </td>

                <td>
                    ${(resource.category || "-").toUpperCase()}
                </td>

                <td>
                    ${quantity}
                </td>

                <td>
                    <span class="rq-badge ${badge}">
                        ${status}
                    </span>
                </td>

            </tr>
        `;
    });

    document.getElementById(
        "totalResources"
    ).textContent =
        resources.length;

    document.getElementById(
        "availableResources"
    ).textContent =
        available;

    document.getElementById(
        "lowStockResources"
    ).textContent =
        low;

    document.getElementById(
        "depletedResources"
    ).textContent =
        depleted;
}