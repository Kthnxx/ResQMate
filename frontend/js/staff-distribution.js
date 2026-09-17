/* =========================================
   RESQMATE STAFF DISTRIBUTIONS
========================================= */

const API_URL = "http://127.0.0.1:8000/distribution";


// =========================================
// DOM ELEMENTS
// =========================================

const tableBody = document.getElementById("distributionTableBody");
const searchInput = document.getElementById("searchInput");

const distributionModalElement =
    document.getElementById("distributionModal");

const distributionModal =
    new bootstrap.Modal(distributionModalElement);

const openModalBtn =
    document.getElementById("openModalBtn");

const distributionForm =
    document.getElementById("distributionForm");

const submitDistributionBtn =
    document.getElementById("submitDistributionBtn");

const messageBox =
    document.getElementById("messageBox");


// =========================================
// DATA
// =========================================

let distributions = [];


// =========================================
// LOAD DISTRIBUTIONS
// =========================================

async function loadDistributions() {

    tableBody.innerHTML = `
        <tr>
            <td colspan="7" class="text-center text-muted py-4">
                <div class="spinner-border spinner-border-sm me-2"
                     role="status"></div>
                Loading distributions...
            </td>
        </tr>
    `;


    try {

        const response = await fetch(`${API_URL}/`);


        if (!response.ok) {
            throw new Error("Failed to load distributions.");
        }


        distributions = await response.json();

        displayDistributions(distributions);


    } catch (error) {

        console.error(
            "Error loading distributions:",
            error
        );


        tableBody.innerHTML = `
            <tr>
                <td colspan="7"
                    class="text-center text-danger py-4">
                    Unable to load distributions.
                </td>
            </tr>
        `;


        showMessage(
            "Unable to connect to the distribution API.",
            "error"
        );
    }
}


// =========================================
// DISPLAY DISTRIBUTIONS
// =========================================

function displayDistributions(data) {

    if (!data || data.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="7"
                    class="text-center text-muted py-4">
                    No distributions found.
                </td>
            </tr>
        `;

        return;
    }


    tableBody.innerHTML = data.map(distribution => {

        const date =
            formatDate(distribution.distribution_date);


        return `
            <tr>

                <td class="fw-semibold">
                    ${escapeHTML(distribution.distribution_id)}
                </td>

                <td>
                    #${escapeHTML(distribution.request_id)}
                </td>

                <td>
                    #${escapeHTML(distribution.resource_id)}
                </td>

                <td>
                    #${escapeHTML(distribution.staff_id)}
                </td>

                <td>
                    ${escapeHTML(distribution.quantity_given)}
                </td>

                <td>
                    ${escapeHTML(date)}
                </td>

                <td>

                    <button
                        type="button"
                        class="delete-distribution-btn"
                        title="Delete distribution"
                        onclick="deleteDistribution(${distribution.distribution_id})"
                    >
                        <i class="bi bi-trash"></i>
                    </button>

                </td>

            </tr>
        `;

    }).join("");
}


// =========================================
// SEARCH
// =========================================

searchInput.addEventListener(
    "input",
    function () {

        const searchTerm =
            searchInput.value
                .trim()
                .toLowerCase();


        if (!searchTerm) {

            displayDistributions(distributions);

            return;
        }


        const filtered =
            distributions.filter(distribution => {

                return Object.values(distribution)
                    .some(value => {

                        if (
                            value === null ||
                            value === undefined
                        ) {
                            return false;
                        }

                        return String(value)
                            .toLowerCase()
                            .includes(searchTerm);
                    });

            });


        displayDistributions(filtered);
    }
);


// =========================================
// OPEN MODAL
// =========================================

openModalBtn.addEventListener(
    "click",
    function () {

        distributionForm.reset();

        distributionModal.show();

    }
);


// =========================================
// CREATE DISTRIBUTION
// =========================================

distributionForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const requestId =
            document.getElementById("requestId").value;

        const resourceId =
            document.getElementById("resourceId").value;

        const staffId =
            document.getElementById("staffId").value;

        const quantityGiven =
            document.getElementById("quantityGiven").value;


        if (
            !requestId ||
            !resourceId ||
            !staffId ||
            !quantityGiven
        ) {

            showMessage(
                "Please complete all fields.",
                "error"
            );

            return;
        }


        submitDistributionBtn.disabled = true;

        submitDistributionBtn.innerHTML = `
            <span
                class="spinner-border spinner-border-sm me-1"
                role="status"
            ></span>
            Creating...
        `;


        try {

            const url =
                `${API_URL}/create` +
                `?request_id=${encodeURIComponent(requestId)}` +
                `&resource_id=${encodeURIComponent(resourceId)}` +
                `&staff_id=${encodeURIComponent(staffId)}` +
                `&quantity_given=${encodeURIComponent(quantityGiven)}`;


            const response = await fetch(
                url,
                {
                    method: "POST"
                }
            );


            const result =
                await response.json();


            if (!response.ok) {

                let errorMessage =
                    "Failed to create distribution.";

                if (result.detail) {
                    errorMessage = result.detail;
                }

                throw new Error(errorMessage);
            }


            distributionModal.hide();

            showMessage(
                "Distribution created successfully.",
                "success"
            );


            await loadDistributions();


        } catch (error) {

            console.error(
                "Error creating distribution:",
                error
            );


            showMessage(
                error.message ||
                "Unable to create distribution.",
                "error"
            );


        } finally {

            submitDistributionBtn.disabled = false;

            submitDistributionBtn.innerHTML = `
                <i class="bi bi-check-lg me-1"></i>
                Create Distribution
            `;
        }

    }
);


// =========================================
// DELETE DISTRIBUTION
// =========================================

async function deleteDistribution(
    distributionId
) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this distribution?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/${distributionId}`,
                {
                    method: "DELETE"
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            let errorMessage =
                "Failed to delete distribution.";

            if (result.detail) {
                errorMessage = result.detail;
            }

            throw new Error(errorMessage);
        }


        showMessage(
            "Distribution deleted successfully.",
            "success"
        );


        await loadDistributions();


    } catch (error) {

        console.error(
            "Error deleting distribution:",
            error
        );


        showMessage(
            error.message ||
            "Unable to delete distribution.",
            "error"
        );
    }
}


// =========================================
// DATE FORMAT
// =========================================

function formatDate(dateValue) {

    if (!dateValue) {
        return "—";
    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return String(dateValue);
    }


    return date.toLocaleString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    );
}


// =========================================
// MESSAGE
// =========================================

function showMessage(
    message,
    type
) {

    messageBox.textContent = message;

    messageBox.className =
        `distribution-message ${type}`;


    setTimeout(
        () => {

            messageBox.className =
                "distribution-message";

            messageBox.textContent = "";

        },
        4000
    );
}


// =========================================
// HTML ESCAPE
// =========================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        String(value);

    return div.innerHTML;
}


// =========================================
// INITIAL LOAD
// =========================================

loadDistributions();