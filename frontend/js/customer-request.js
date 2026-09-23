const API_URL = "http://127.0.0.1:8000";

const requestForm = document.getElementById("requestForm");
const assistanceTypeInput = document.getElementById("assistanceType");
const barangayInput = document.getElementById("barangay");
const cityInput = document.getElementById("city");
const provinceInput = document.getElementById("province");
const detailsInput = document.getElementById("details");
const priorityInput = document.getElementById("priority");
const characterCount = document.getElementById("characterCount");
const cancelButton = document.getElementById("cancelButton");
const assistanceOptions = document.querySelectorAll(".assistance-option");
const submitButton = document.querySelector(".submit-button");

if (submitButton) {
    submitButton.disabled = true;
}

if (provinceInput) {
    provinceInput.addEventListener("change", function () {
        if (this.value) {
            cityInput.disabled = false;
        } else {
            cityInput.disabled = true;
            cityInput.value = "";
            barangayInput.disabled = true;
            barangayInput.value = "";
        }
        checkFormValidity();
    });
}

if (cityInput) {
    cityInput.addEventListener("change", function () {
        if (this.value) {
            barangayInput.disabled = false;
        } else {
            barangayInput.disabled = true;
            barangayInput.value = "";
        }
        checkFormValidity();
    });
}

if (barangayInput) {
    barangayInput.addEventListener("change", checkFormValidity);
}

if (detailsInput) {
    detailsInput.addEventListener("input", checkFormValidity);
}

if (priorityInput) {
    priorityInput.addEventListener("change", checkFormValidity);
}

function checkFormValidity() {
    if (requestForm && submitButton) {
        if (requestForm.checkValidity()) {
            submitButton.disabled = false;
        } else {
            submitButton.disabled = true;
        }
    }
}

assistanceOptions.forEach(option => {
    option.addEventListener("click", function () {
        assistanceOptions.forEach(item => {
            item.classList.remove("active");
        });

        this.classList.add("active");
        assistanceTypeInput.value = this.getAttribute("data-type");
    });
});

if (detailsInput && characterCount) {
    detailsInput.addEventListener("input", function () {
        characterCount.textContent = this.value.length;
    });
}

if (cancelButton) {
    cancelButton.addEventListener("click", function () {
        requestForm.reset();

        assistanceTypeInput.value = "Food";

        assistanceOptions.forEach(option => {
            option.classList.remove("active");

            if (option.getAttribute("data-type") === "Food") {
                option.classList.add("active");
            }
        });

        if (characterCount) {
            characterCount.textContent = "0";
        }
    });
}

if (requestForm) {
    requestForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        console.log("Form submission triggered!");

        const requestError = document.getElementById("requestError");

        if (!requestForm.checkValidity()) {
            if (requestError) {
                requestError.textContent = "Please complete all required fields.";
                requestError.style.display = "block";
            }
            return;
        } else if (requestError) {
            requestError.style.display = "none";
        }

        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            alert("You are not logged in. Please log in first.");
            return;
        }

        let user;

        try {
            user = JSON.parse(storedUser);
        } catch (error) {
            alert("Invalid user information. Please log in again.");
            return;
        }

        if (!user.user_id) {
            alert("User ID was not found. Please log in again.");
            return;
        }

        const assistanceType = assistanceTypeInput.value.trim();
        
        const barangay = barangayInput ? barangayInput.value.trim() : "";
        const city = cityInput ? cityInput.value.trim() : "";
        const province = provinceInput ? provinceInput.value.trim() : "";
        const location = `${barangay}, ${city}, ${province}`;
        
        const details = detailsInput.value.trim();
        const priority = priorityInput.value;

        if (!assistanceType || !barangay || !city || !province || !details || !priority) {
            if (requestError) {
                requestError.textContent = "Please complete all required fields.";
                requestError.style.display = "block";
            } else {
                alert("Please complete all required fields.");
            }
            return;
        }

        const submitButton = requestForm.querySelector(".submit-button");

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Submitting...";
        }

        try {
            const response = await fetch(`${API_URL}/requests/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id: user.user_id,
                    assistance_type: assistanceType,
                    barangay: barangay,
                    city: city,
                    province: province,
                    request_details: details,
                    priority: priority
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    data.message ||
                    "Failed to submit request."
                );
            }

            alert("Your assistance request has been submitted successfully.");
            
            // Redirect to dashboard to view the new request
            window.location.href = "dashboard.html";

            requestForm.reset();

            assistanceTypeInput.value = "Food";

            assistanceOptions.forEach(option => {
                option.classList.remove("active");

                if (option.getAttribute("data-type") === "Food") {
                    option.classList.add("active");
                }
            });

            if (characterCount) {
                characterCount.textContent = "0";
            }

        } catch (error) {
            console.error(error);
            alert(`Failed to submit request.\n\n${error.message}`);
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "Submit Request";
            }
        }
    });
}