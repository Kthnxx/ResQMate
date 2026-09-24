const registerForm =
    document.getElementById("registerForm");

document.addEventListener("DOMContentLoaded", () => {
    const dobInput = document.getElementById("registerDob");
    if (dobInput) {
        const today = new Date().toISOString().split('T')[0];
        dobInput.max = today;
    }
    
    const phoneInput = document.getElementById("registerPhone");
    if (phoneInput) {
        phoneInput.addEventListener('input', function (e) {
            this.value = this.value.replace(/\D/g, '');
            if (this.value.length < 11) {
                this.setCustomValidity('Phone number must be exactly 11 digits.');
            } else {
                this.setCustomValidity('');
            }
        });
    }

    const registerBtn = document.getElementById("registerBtn");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const passwordInput = document.getElementById("registerPassword");
    const registerInputs = registerForm.querySelectorAll("input");
    
    function validateForm() {
        const isFormValid = registerForm.checkValidity();
        const doPasswordsMatch = passwordInput.value === confirmPasswordInput.value && passwordInput.value.length > 0;
        
        if (isFormValid && doPasswordsMatch) {
            registerBtn.disabled = false;
        } else {
            registerBtn.disabled = true;
        }
    }

    const validateConfirmPassword = () => {
        if (confirmPasswordInput.value !== passwordInput.value && confirmPasswordInput.value.length > 0) {
            confirmPasswordInput.setCustomValidity("Passwords do not match.");
        } else {
            confirmPasswordInput.setCustomValidity("");
        }
    };

    passwordInput.addEventListener("input", validateConfirmPassword);
    confirmPasswordInput.addEventListener("input", validateConfirmPassword);

    function validateSingleInput(input) {
        let errorMsg = "";
        
        if (!input.validity.valid) {
            if (input.validity.valueMissing) {
                errorMsg = "please fill up this part";
            } else if (input.validity.customError) {
                errorMsg = input.validationMessage;
            } else if (input.validity.typeMismatch || input.validity.patternMismatch) {
                if (input.type === "email") errorMsg = "Please enter a valid email address.";
                else errorMsg = "Invalid format.";
            } else if (input.validity.tooShort) {
                errorMsg = `Must be at least ${input.minLength} characters.`;
            } else {
                errorMsg = input.validationMessage || "Invalid input.";
            }
        }

        let parentToAppendTo = input;
        if (input.parentElement.classList.contains('register-password-group')) {
            parentToAppendTo = input.parentElement;
        }

        let errorEl = parentToAppendTo.nextElementSibling;
        
        if (!errorEl || !errorEl.classList.contains("field-error-msg")) {
            errorEl = document.createElement("span");
            errorEl.className = "field-error-msg";
            parentToAppendTo.insertAdjacentElement("afterend", errorEl);
        }

        if (errorMsg) {
            input.classList.add("input-error");
            errorEl.textContent = errorMsg;
            errorEl.style.display = "block";
        } else {
            input.classList.remove("input-error");
            errorEl.style.display = "none";
        }
    }

    registerInputs.forEach(input => {
        input.addEventListener("blur", () => {
            validateSingleInput(input);
        });
        input.addEventListener("input", () => {
            if (input.classList.contains("input-error")) {
                validateSingleInput(input);
            }
            validateForm();
        });
    });

    registerForm.addEventListener("reset", () => {
        registerInputs.forEach(input => {
            input.classList.remove("input-error");
            let parentToAppendTo = input;
            if (input.parentElement.classList.contains('register-password-group')) {
                parentToAppendTo = input.parentElement;
            }
            let errorEl = parentToAppendTo.nextElementSibling;
            if (errorEl && errorEl.classList.contains("field-error-msg")) {
                errorEl.style.display = "none";
            }
        });
        setTimeout(validateForm, 0);
    });
});

registerForm.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        const first_name =
            document.getElementById("firstName").value;
            
        const last_name =
            document.getElementById("lastName").value;

        const email =
            document.getElementById("registerEmail").value;

        const phone_number = 
            document.getElementById("registerPhone").value;
            
        const dob = 
            document.getElementById("registerDob").value;

        const password =
            document.getElementById("registerPassword").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        if (password !== confirmPassword) {

            alert("Passwords do not match");
            return;
        }

        try {

            const response = await fetch(
                "http://127.0.0.1:8000/users/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        first_name,
                        last_name,
                        email,
                        phone_number,
                        dob,
                        password
                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                alert(data.detail);
                return;
            }

            alert("Registration Successful! Please login.");

            document.getElementById("registerForm").reset();

            // Close Register Modal
            document
                .getElementById("registerModal")
                .classList.remove("show");

            // Open Login Modal
            document
                .getElementById("loginModal")
                .classList.add("show");

        }

        catch (error) {

            console.error(error);

            alert(
                "Cannot connect to server."
            );
        }

    }
);