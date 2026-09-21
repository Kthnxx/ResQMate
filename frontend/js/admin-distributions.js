const API_URL = "http://127.0.0.1:8000/distributions";

const distributionModal =
    document.getElementById("distributionModal");

const deleteDistributionModal =
    document.getElementById("deleteDistributionModal");

const addDistributionBtn =
    document.getElementById("addDistributionBtn");

const cancelDistribution =
    document.getElementById("cancelDistribution");

const saveDistribution =
    document.getElementById("saveDistribution");

const cancelDeleteDistribution =
    document.getElementById("cancelDeleteDistribution");

const confirmDeleteDistribution =
    document.getElementById("confirmDeleteDistribution");

const distributionTableBody =
    document.querySelector("#distributionTable tbody");

let editingDistributionId = null;
let deletingDistributionId = null;

let allDistributions = [];

/* ===========================
   LOAD DISTRIBUTIONS
=========================== */

async function loadDistributions() {

    try {

        const response =
            await fetch(API_URL);

        const distributions =
            await response.json();

        allDistributions = distributions;

        renderTable(distributions);

        updateStats(distributions);

    } catch (error) {

        console.error(
            "Failed to load distributions",
            error
        );

    }
}

/* ===========================
   RENDER TABLE
=========================== */

function renderTable(data) {

    distributionTableBody.innerHTML = "";

    data.forEach(distribution => {

        distributionTableBody.innerHTML += `
            <tr data-status="${distribution.status}">
                <td>${distribution.distribution_id}</td>
                <td>${distribution.request_id}</td>
                <td>${distribution.recipient_name}</td>
                <td>${distribution.resource_name}</td>
                <td>${distribution.quantity_given}</td>
                <td>${distribution.staff_id}</td>

                <td>
                    <span class="rq-badge rq-badge-approved">
                        ${distribution.status}
                    </span>
                </td>

                <td>

                    <button
                        class="rq-btn-edit"
                        onclick="editDistribution(
                            ${distribution.distribution_id},
                            ${distribution.request_id},
                            '${distribution.recipient_name}',
                            ${distribution.resource_id},
                            ${distribution.staff_id},
                            ${distribution.quantity_given},
                            '${distribution.status}'
                        )"
                    >
                        <i class="fa-solid fa-pen"></i>
                    </button>

                    <button
                        class="rq-btn-delete"
                        onclick="deleteDistribution(${distribution.distribution_id})"
                    >
                        <i class="fa-solid fa-trash"></i>
                    </button>

                </td>
            </tr>
        `;
    });
}

/* ===========================
   UPDATE STATS
=========================== */

function updateStats(data) {

    document.getElementById(
        "totalDistributions"
    ).textContent = data.length;

    const totalQty =
        data.reduce(
            (sum, d) =>
                sum + Number(d.quantity_given),
            0
        );

    document.getElementById(
        "totalQuantity"
    ).textContent = totalQty;

    const resources =
        [...new Set(
            data.map(d => d.resource_id)
        )];

    document.getElementById(
        "resourceCount"
    ).textContent =
        resources.length;

    const staffs =
        [...new Set(
            data.map(d => d.staff_id)
        )];

    document.getElementById(
        "staffCount"
    ).textContent =
        staffs.length;
}

/* ===========================
   OPEN CREATE MODAL
=========================== */

addDistributionBtn.addEventListener(
    "click",
    () => {

        editingDistributionId = null;

        document.getElementById(
            "distributionModalTitle"
        ).textContent =
            "Create Distribution";

        document.getElementById(
            "requestId"
        ).value = "";

        document.getElementById(
            "recipient"
        ).value = "";

        document.getElementById(
            "resource"
        ).value = "";

        document.getElementById(
            "quantity"
        ).value = "";

        document.getElementById(
            "staff"
        ).value = "";

        document.getElementById(
            "distributionStatus"
        ).value = "Preparing";

        distributionModal.classList.add(
            "show"
        );

    }
);

/* ===========================
   SAVE
=========================== */

saveDistribution.addEventListener(
    "click",
    async () => {

        const requestId =
            document.getElementById(
                "requestId"
            ).value;

        const recipient =
            document.getElementById(
                "recipient"
            ).value;

        const resourceId =
            document.getElementById(
                "resource"
            ).value;

        const quantity =
            document.getElementById(
                "quantity"
            ).value;

        const staffId =
            document.getElementById(
                "staff"
            ).value;

        const status =
            document.getElementById(
                "distributionStatus"
            ).value;

        if (
            !requestId ||
            !recipient ||
            !resourceId ||
            !quantity ||
            !staffId
        ) {

            alert(
                "Please complete all fields."
            );

            return;
        }

        try {

            if (!editingDistributionId) {

                await fetch(
                    `${API_URL}/create?request_id=${requestId}&resource_id=${resourceId}&staff_id=${staffId}&quantity_given=${quantity}&recipient_name=${encodeURIComponent(recipient)}&status=${encodeURIComponent(status)}`,
                    {
                        method: "POST"
                    }
                );

            } else {

                await fetch(
                    `${API_URL}/${editingDistributionId}?request_id=${requestId}&resource_id=${resourceId}&staff_id=${staffId}&quantity_given=${quantity}&recipient_name=${encodeURIComponent(recipient)}&status=${encodeURIComponent(status)}`,
                    {
                        method: "PUT"
                    }
                );

            }

            distributionModal.classList.remove(
                "show"
            );

            loadDistributions();

        } catch (error) {

            console.error(error);

        }
    }
);

/* ===========================
   EDIT
=========================== */

window.editDistribution = function (
    id,
    requestId,
    recipient,
    resourceId,
    staffId,
    quantity,
    status
) {

    editingDistributionId = id;

    document.getElementById(
        "distributionModalTitle"
    ).textContent =
        "Edit Distribution";

    document.getElementById(
        "requestId"
    ).value = requestId;

    document.getElementById(
        "recipient"
    ).value = recipient;

    document.getElementById(
        "resource"
    ).value = resourceId;

    document.getElementById(
        "quantity"
    ).value = quantity;

    document.getElementById(
        "staff"
    ).value = staffId;

    document.getElementById(
        "distributionStatus"
    ).value = status;

    distributionModal.classList.add(
        "show"
    );
};

/* ===========================
   DELETE
=========================== */

window.deleteDistribution =
    function (id) {

        deletingDistributionId = id;

        deleteDistributionModal.classList.add(
            "show"
        );
    };

confirmDeleteDistribution.addEventListener(
    "click",
    async () => {

        try {

            await fetch(
                `${API_URL}/${deletingDistributionId}`,
                {
                    method: "DELETE"
                }
            );

            deleteDistributionModal.classList.remove(
                "show"
            );

            loadDistributions();

        } catch (error) {

            console.error(error);

        }

    }
);

/* ===========================
   CLOSE MODALS
=========================== */

cancelDistribution.addEventListener(
    "click",
    () => {

        distributionModal.classList.remove(
            "show"
        );

    }
);

cancelDeleteDistribution.addEventListener(
    "click",
    () => {

        deleteDistributionModal.classList.remove(
            "show"
        );

    }
);

/* ===========================
   SEARCH
=========================== */

document
    .getElementById(
        "distributionSearch"
    )
    .addEventListener(
        "keyup",
        () => {

            const value =
                document
                    .getElementById(
                        "distributionSearch"
                    )
                    .value
                    .toLowerCase();

            const filtered =
                allDistributions.filter(
                    d =>
                        JSON.stringify(d)
                            .toLowerCase()
                            .includes(value)
                );

            renderTable(filtered);

        }
    );

async function loadResources() {

    try {

        const response =
            await fetch("http://127.0.0.1:8000/resources");

        const resources =
            await response.json();

        const resourceSelect =
            document.getElementById("resource");

        resourceSelect.innerHTML =
            '<option value="">Select Resource</option>';

        resources.forEach(resource => {

            resourceSelect.innerHTML += `
                <option value="${resource.resource_id}">
                    ${resource.resource_name}
                </option>
            `;

        });

    } catch (error) {

        console.error(
            "Failed to load resources",
            error
        );

    }

}

async function loadStaff() {

    try {

        const response =
            await fetch("http://127.0.0.1:8000/users");

        const users =
            await response.json();

        const staffSelect =
            document.getElementById("staff");

        staffSelect.innerHTML =
            '<option value="">Select Staff</option>';

        users
            .filter(user => user.role === "staff")
            .forEach(user => {

                staffSelect.innerHTML += `
                    <option value="${user.user_id}">
                        ${user.full_name}
                    </option>
                `;

            });

    } catch (error) {

        console.error(
            "Failed to load staff",
            error
        );

    }

}

/* ===========================
   STATUS FILTER
=========================== */

document
    .getElementById(
        "statusFilter"
    )
    .addEventListener(
        "change",
        () => {

            const status =
                document.getElementById(
                    "statusFilter"
                ).value;

            if (status === "all") {

                renderTable(
                    allDistributions
                );

                return;
            }

            const filtered =
                allDistributions.filter(
                    d =>
                        d.status
                            .toLowerCase()
                            .replace(/\s/g, "")
                            .includes(status)
                );

            renderTable(filtered);

        }
    );

/* ===========================
   INITIAL LOAD
=========================== */

loadResources();
loadStaff();
loadDistributions();