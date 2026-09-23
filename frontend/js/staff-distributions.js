const API_URL =
    "http://127.0.0.1:8000";

/* ===========================
   CUSTOM MODAL
=========================== */

const modal =
    document.getElementById(
        "distributionModal"
    );

const openBtn =
    document.getElementById(
        "openModalBtn"
    );

const closeBtn =
    document.getElementById(
        "closeModalBtn"
    );

if (openBtn) {

    openBtn.addEventListener(
        "click",
        () => {

            modal.classList.add(
                "show"
            );

        }
    );

}

if (closeBtn) {

    closeBtn.addEventListener(
        "click",
        () => {

            modal.classList.remove(
                "show"
            );

        }
    );

}

if (modal) {

    modal.addEventListener(
        "click",
        (event) => {

            if (
                event.target === modal
            ) {

                modal.classList.remove(
                    "show"
                );

            }

        }
    );

}

/* ===========================
   PAGE LOAD
=========================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadDistributions();

        const distributionForm = document.getElementById("distributionForm");
        if (distributionForm) {
            distributionForm.addEventListener(
                "submit",
                createDistribution
            );
        }

        const searchInput = document.getElementById("searchInput");
        if (searchInput) {
            searchInput.addEventListener(
                "keyup",
                filterDistributions
            );
        }

    }
);

/* ===========================
   LOAD DISTRIBUTIONS
=========================== */

async function loadDistributions() {

    try {

        const response =
            await fetch(
                `${API_URL}/distributions/`
            );

        if (!response.ok) {

            throw new Error(
                "Failed to fetch distributions."
            );

        }

        const distributions =
            await response.json();

        renderDistributions(
            distributions
        );

    }
    catch (error) {

        console.error(
            error
        );

        showMessage(
            "Failed to load distributions.",
            false
        );

    }

}

/* ===========================
   RENDER TABLE
=========================== */

function renderDistributions(
    distributions
) {

    const table =
        document.getElementById(
            "distributionTableBody"
        );

    table.innerHTML = "";

    if (
        distributions.length === 0
    ) {

        table.innerHTML = `
            <tr>
                <td colspan="7">
                    No distributions found.
                </td>
            </tr>
        `;

        return;

    }

    distributions.forEach(
        distribution => {

            table.innerHTML += `
                <tr>

                    <td>
                        ${distribution.distribution_id}
                    </td>

                    <td>
                        ${distribution.request_id}
                    </td>

                    <td>
                        ${distribution.resource_id}
                    </td>

                    <td>
                        ${distribution.staff_id}
                    </td>

                    <td>
                        ${distribution.quantity_given}
                    </td>

                    <td>
                        ${new Date(
                distribution.distribution_date
            ).toLocaleDateString()}
                    </td>

                    <td>

                        <button
                            class="btn-delete"
                            onclick="deleteDistribution(${distribution.distribution_id})">

                            Delete

                        </button>

                    </td>

                </tr>
            `;

        }
    );

}

/* ===========================
   CREATE DISTRIBUTION
=========================== */

async function createDistribution(
    event
) {

    event.preventDefault();

    try {

        const payload = {

            request_id:
                parseInt(
                    document.getElementById(
                        "requestId"
                    ).value
                ),

            resource_id:
                parseInt(
                    document.getElementById(
                        "resourceId"
                    ).value
                ),

            staff_id:
                parseInt(
                    document.getElementById(
                        "staffId"
                    ).value
                ),

            quantity_given:
                parseInt(
                    document.getElementById(
                        "quantityGiven"
                    ).value
                )

        };

        const response =
            await fetch(
                `${API_URL}/distributions/create`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );

        if (!response.ok) {

            throw new Error();

        }

        document
            .getElementById(
                "distributionForm"
            )
            .reset();

        modal.classList.remove(
            "show"
        );

        showMessage(
            "Distribution created successfully.",
            true
        );

        loadDistributions();

    }
    catch (error) {

        console.error(
            error
        );

        showMessage(
            "Failed to create distribution.",
            false
        );

    }

}

/* ===========================
   DELETE DISTRIBUTION
=========================== */

async function deleteDistribution(
    distributionId
) {

    if (
        !confirm(
            "Delete this distribution?"
        )
    ) {

        return;

    }

    try {

        const response =
            await fetch(
                `${API_URL}/distributions/${distributionId}`,
                {
                    method:
                        "DELETE"
                }
            );

        if (!response.ok) {

            throw new Error();

        }

        showMessage(
            "Distribution deleted.",
            true
        );

        loadDistributions();

    }
    catch (error) {

        console.error(
            error
        );

        showMessage(
            "Failed to delete distribution.",
            false
        );

    }

}

/* ===========================
   SEARCH FILTER
=========================== */

function filterDistributions() {

    const search =
        document
            .getElementById(
                "searchInput"
            )
            .value
            .toLowerCase();

    const rows =
        document.querySelectorAll(
            "#distributionTableBody tr"
        );

    rows.forEach(
        row => {

            row.style.display =
                row.textContent
                    .toLowerCase()
                    .includes(
                        search
                    )
                    ? ""
                    : "none";

        }
    );

}

/* ===========================
   MESSAGE BOX
=========================== */

function showMessage(
    message,
    success
) {

    const box =
        document.getElementById(
            "messageBox"
        );

    box.textContent =
        message;

    box.className =
        success
            ? "success-message"
            : "error-message";

    box.style.display =
        "block";

    setTimeout(
        () => {

            box.style.display =
                "none";

        },
        3000
    );

}