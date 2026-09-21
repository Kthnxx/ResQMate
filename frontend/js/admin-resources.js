const API_URL = "http://127.0.0.1:8000/resources";

const resourceTableBody =
    document.querySelector("#resourcesTable tbody");

const resourceForm =
    document.getElementById("resourceForm");

const resourceModal =
    document.getElementById("resourceModal");

const modalTitle =
    document.getElementById("modalTitle");

const locationSelect =
    document.getElementById("resourceLocation");

const customLocation =
    document.getElementById("customLocation");

let editingResourceId = null;

/* ==================================
   LOAD RESOURCES
================================== */

async function loadResources() {

    try {

        const response = await fetch(API_URL);

        const resources = await response.json();

        updateStats(resources);

        resourceTableBody.innerHTML = "";

        resources.forEach(resource => {

            let badgeClass = "rq-badge-active";

            if (
                resource.quantity_available > 0 &&
                resource.quantity_available <= 50
            ) {
                badgeClass = "rq-badge-medium";
            }

            if (resource.quantity_available <= 0) {
                badgeClass = "rq-badge-inactive";
            }

            let statusText = "Available";

            if (
                resource.quantity_available > 0 &&
                resource.quantity_available <= 50
            ) {
                statusText = "Low Stock";
            }

            if (resource.quantity_available <= 0) {
                statusText = "Depleted";
            }

            resourceTableBody.innerHTML += `
                <tr data-id="${resource.resource_id}">

                    <td>${resource.resource_id}</td>

                    <td>${resource.resource_name}</td>

                    <td>${resource.unit}</td>

                    <td>
                        ${resource.quantity_available}
                    </td>

                    <td>
                        ${resource.location || "N/A"}
                    </td>

                    <td>
                        <span class="rq-badge ${badgeClass}">
                            ${statusText}
                        </span>
                    </td>

                    <td>

                        <button
                            class="action-btn edit-btn"
                            onclick="editResource(
                                ${resource.resource_id},
                                '${resource.resource_name}',
                                '${resource.unit}',
                                ${resource.quantity_available},
                                '${resource.location || ""}'
                            )">

                            <i class="fa-solid fa-pen"></i>

                        </button>

                        <button
                            class="action-btn delete-btn"
                            onclick="deleteResource(${resource.resource_id})">

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </td>

                </tr>
            `;
        });

    } catch (error) {

        console.error(
            "Failed to load resources",
            error
        );
    }
}

/* ==================================
   UPDATE STATS
================================== */

function updateStats(resources) {

    const total =
        resources.length;

    const available =
        resources.filter(
            r => r.quantity_available > 50
        ).length;

    const lowStock =
        resources.filter(
            r =>
                r.quantity_available > 0 &&
                r.quantity_available <= 50
        ).length;

    const depleted =
        resources.filter(
            r => r.quantity_available <= 0
        ).length;

    document.getElementById(
        "totalResources"
    ).textContent = total;

    document.getElementById(
        "availableResources"
    ).textContent = available;

    document.getElementById(
        "lowStockResources"
    ).textContent = lowStock;

    document.getElementById(
        "depletedResources"
    ).textContent = depleted;
}

/* ==================================
   OPEN ADD MODAL
================================== */

document
    .getElementById("addResourceBtn")
    .addEventListener("click", () => {

        editingResourceId = null;

        modalTitle.textContent =
            "Add Resource";

        resourceForm.reset();

        customLocation.style.display =
            "none";

        resourceModal.classList.add(
            "show"
        );
    });

/* ==================================
   LOCATION DROPDOWN
================================== */

if (locationSelect) {

    locationSelect.addEventListener(
        "change",
        () => {

            if (
                locationSelect.value === "other"
            ) {

                customLocation.style.display =
                    "block";

                customLocation.required =
                    true;

            } else {

                customLocation.style.display =
                    "none";

                customLocation.required =
                    false;

                customLocation.value = "";
            }
        }
    );
}

/* ==================================
   SAVE RESOURCE
================================== */

resourceForm.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        const resource_name =
            document.getElementById(
                "resourceName"
            ).value;

        const quantity_available =
            document.getElementById(
                "resourceQty"
            ).value;

        const unit =
            document.getElementById(
                "resourceCategory"
            ).value;

        let location =
            locationSelect.value;

        if (
            locationSelect.value === "other"
        ) {
            location =
                customLocation.value;
        }

        try {

            if (
                editingResourceId === null
            ) {

                await fetch(
                    `${API_URL}/create?resource_name=${encodeURIComponent(resource_name)}&quantity_available=${quantity_available}&unit=${encodeURIComponent(unit)}`,
                    {
                        method: "POST"
                    }
                );

            } else {

                await fetch(
                    `${API_URL}/${editingResourceId}?quantity_available=${quantity_available}`,
                    {
                        method: "PUT"
                    }
                );
            }

            resourceModal.classList.remove(
                "show"
            );

            loadResources();

        } catch (error) {

            console.error(error);
        }
    }
);

/* ==================================
   EDIT RESOURCE
================================== */

window.editResource = function (
    id,
    name,
    unit,
    quantity,
    location = ""
) {

    editingResourceId = id;

    modalTitle.textContent =
        "Edit Resource";

    document.getElementById(
        "resourceName"
    ).value = name;

    document.getElementById(
        "resourceCategory"
    ).value = unit;

    document.getElementById(
        "resourceQty"
    ).value = quantity;

    if (
        location &&
        [
            "QC Warehouse",
            "Pasig Hub",
            "Marikina Depot"
        ].includes(location)
    ) {

        locationSelect.value =
            location;

        customLocation.style.display =
            "none";

    } else {

        locationSelect.value =
            "other";

        customLocation.style.display =
            "block";

        customLocation.value =
            location;
    }

    resourceModal.classList.add(
        "show"
    );
};

/* ==================================
   DELETE RESOURCE
================================== */

window.deleteResource =
    async function (id) {

        const confirmed =
            confirm(
                "Delete this resource?"
            );

        if (!confirmed) return;

        try {

            await fetch(
                `${API_URL}/${id}`,
                {
                    method: "DELETE"
                }
            );

            loadResources();

        } catch (error) {

            console.error(error);
        }
    };

/* ==================================
   CLOSE MODAL
================================== */

document
    .getElementById("closeModal")
    .addEventListener("click", () => {

        resourceModal.classList.remove(
            "show"
        );
    });

document
    .getElementById("cancelModal")
    .addEventListener("click", () => {

        resourceModal.classList.remove(
            "show"
        );
    });

/* ==================================
   SEARCH
================================== */

document
    .getElementById("resourceSearch")
    .addEventListener("input", () => {

        const value =
            document
                .getElementById(
                    "resourceSearch"
                )
                .value
                .toLowerCase();

        document
            .querySelectorAll(
                "#resourcesTable tbody tr"
            )
            .forEach(row => {

                row.style.display =
                    row.textContent
                        .toLowerCase()
                        .includes(value)
                        ? ""
                        : "none";
            });
    });

/* ==================================
   INITIAL LOAD
================================== */

loadResources();