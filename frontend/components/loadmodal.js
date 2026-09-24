async function loadModals() {

    // Login Modal
    const loginResponse = await fetch("components/login-modal.html");
    const loginHtml = await loginResponse.text();
    document.body.insertAdjacentHTML("beforeend", loginHtml);

    // Register Modal
    const registerResponse = await fetch("components/register-modal.html");
    const registerHtml = await registerResponse.text();
    document.body.insertAdjacentHTML("beforeend", registerHtml);


    initializeModals();
}

function initializeModals() {

    const loginBtn = document.querySelector(".login-btn");
    const signupBtn = document.querySelector(".signup-btn");
    const requestBtn = document.getElementById("requestAssistanceBtn");
    const learnMoreBtn = document.getElementById("learnMoreBtn");

    const loginModal = document.getElementById("loginModal");
    const registerModal = document.getElementById("registerModal");

    const closeLogin = document.querySelector(".close-btn");
    const closeRegister = document.querySelector(".close-register");

    // Open Login
    loginBtn.addEventListener("click", () => {

        loginModal.classList.add("show");

        const loginError =
            document.getElementById("loginError");

        loginError.classList.remove("show");
    });

    if (requestBtn) {

        requestBtn.addEventListener("click", () => {

            loginModal.classList.add("show");

            const loginError =
                document.getElementById("loginError");

            if (loginError) {
                loginError.classList.remove("show");
            }

        });

    }

    if (learnMoreBtn) {

        learnMoreBtn.addEventListener("click", () => {

            document
                .getElementById("featuresSection")
                .scrollIntoView({
                    behavior: "smooth"
                });

        });

    }

    // Open Register
    signupBtn.addEventListener("click", () => {
        const dobInput = document.getElementById("registerDob");
        if (dobInput) {
            dobInput.max = new Date().toISOString().split('T')[0];
        }
        registerModal.classList.add("show");
    });

    // Close Login
    closeLogin.addEventListener("click", () => {
        loginModal.classList.remove("show");
    });

    // Close Register
    closeRegister.addEventListener("click", () => {
        registerModal.classList.remove("show");
    });

    // Click Outside Modal
    window.addEventListener("click", (e) => {

        if (e.target === loginModal) {
            loginModal.classList.remove("show");
        }

        if (e.target === registerModal) {
            registerModal.classList.remove("show");
        }

    });

    // Register -> Login
    const openLoginLink =
        document.getElementById("openLoginLink");

    if (openLoginLink) {

        openLoginLink.addEventListener(
            "click",
            (e) => {

                e.preventDefault();

                registerModal.classList.remove("show");
                loginModal.classList.add("show");

            }
        );

    }

    // Login -> Register
    const openRegisterLink =
        document.getElementById("openRegisterLink");

    if (openRegisterLink) {

        openRegisterLink.addEventListener(
            "click",
            (e) => {

                e.preventDefault();

                loginModal.classList.remove("show");
                
                const dobInput = document.getElementById("registerDob");
                if (dobInput) {
                    dobInput.max = new Date().toISOString().split('T')[0];
                }
                
                registerModal.classList.add("show");

            }
        );

    }

    // ==========================
    // REGISTER
    // ==========================
    
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

    const registerForm =
        document.getElementById("registerForm");

    if (registerForm) {
        const registerBtn = document.getElementById("registerBtn");
        const clearBtn = document.getElementById("clearBtn");
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

            let hasInput = false;
            registerInputs.forEach(input => {
                if (input.value.trim() !== '') {
                    hasInput = true;
                }
            });
            clearBtn.disabled = !hasInput;
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
            let isMaxCharWarning = false;
            
            if (input.maxLength > 0 && input.value.length >= input.maxLength) {
                errorMsg = `Maximum of ${input.maxLength} characters reached.`;
                isMaxCharWarning = true;
            } else if (!input.validity.valid) {
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
                if (!isMaxCharWarning) {
                    input.classList.add("input-error");
                    errorEl.style.color = "";
                } else {
                    input.classList.remove("input-error");
                    errorEl.style.color = "#f59e0b"; // amber for warning
                }
                errorEl.textContent = errorMsg;
                errorEl.style.display = "block";
            } else {
                input.classList.remove("input-error");
                errorEl.style.color = "";
                errorEl.style.display = "none";
            }
        }

        registerInputs.forEach(input => {
            input.addEventListener("blur", () => {
                validateSingleInput(input);
            });
            input.addEventListener("input", () => {
                let parentToAppendTo = input;
                if (input.parentElement.classList.contains('register-password-group')) {
                    parentToAppendTo = input.parentElement;
                }
                let errorEl = parentToAppendTo.nextElementSibling;
                let isErrorVisible = errorEl && errorEl.style.display === "block";

                if (isErrorVisible || (input.maxLength > 0 && input.value.length >= input.maxLength)) {
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

                const password =
                    document.getElementById("registerPassword").value;
                    
                const phone_number =
                    document.getElementById("registerPhone").value;
                    
                const dob =
                    document.getElementById("registerDob").value;

                const confirmPassword =
                    document.getElementById("confirmPassword").value;

                const registerError =
                    document.getElementById("registerError");

                if (!registerForm.checkValidity()) {
                    registerError.textContent = "Please ensure all fields are filled, emails are valid, and passwords are at least 8 characters.";
                    registerError.classList.add("show");
                    return;
                }

                if (password !== confirmPassword) {

                    registerError.textContent =
                        "Passwords do not match.";

                    registerError.classList.add("show");

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
                                password,
                                phone_number,
                                dob
                            })
                        }
                    );

                    const data =
                        await response.json();

                    const registerError =
                        document.getElementById("registerError");

                    if (!response.ok) {

                        registerError.textContent =
                            data.detail;

                        registerError.classList.add("show");

                        return;
                    }

                    registerError.classList.remove("show");

                    registerForm.reset();

                    registerModal.classList.remove("show");
                    loginModal.classList.add("show");

                    alert(
                        "Registration Successful! Please login."
                    );

                }

                catch (error) {

                    console.error(error);

                    alert(
                        "Cannot connect to server."
                    );

                }

            }
        );

    }

    const registerBackToTopBtn = document.getElementById("registerBackToTopBtn");
    if (registerBackToTopBtn) {
        registerBackToTopBtn.addEventListener("click", () => {
            const registerRight = document.querySelector(".register-right");
            if (registerRight) {
                registerRight.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    // ==========================
    // LOGIN
    // ==========================

    const loginForm =
        document.getElementById("loginForm");

    if (loginForm) {
        const loginBtn = document.getElementById("loginBtn");
        const loginInputs = loginForm.querySelectorAll("input");

        function validateLoginForm() {
            if (loginForm.checkValidity()) {
                loginBtn.disabled = false;
            } else {
                loginBtn.disabled = true;
            }
        }

        function validateSingleLoginInput(input) {
            let errorMsg = "";
            
            if (!input.validity.valid) {
                if (input.validity.valueMissing) {
                    errorMsg = "please fill up this part";
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
            if (input.parentElement.classList.contains('login-password-group')) {
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

        loginInputs.forEach(input => {
            input.addEventListener("blur", () => {
                validateSingleLoginInput(input);
            });
            input.addEventListener("input", () => {
                if (input.classList.contains("input-error")) {
                    validateSingleLoginInput(input);
                }
                validateLoginForm();
            });
        });

        loginForm.addEventListener("reset", () => {
            loginInputs.forEach(input => {
                input.classList.remove("input-error");
                let parentToAppendTo = input;
                if (input.parentElement.classList.contains('login-password-group')) {
                    parentToAppendTo = input.parentElement;
                }
                let errorEl = parentToAppendTo.nextElementSibling;
                if (errorEl && errorEl.classList.contains("field-error-msg")) {
                    errorEl.style.display = "none";
                }
            });
            setTimeout(validateLoginForm, 0);
        });

        loginForm.addEventListener(
            "submit",
            async (e) => {

                e.preventDefault();

                const loginError =
                    document.getElementById("loginError");

                if (!loginForm.checkValidity()) {
                    loginError.textContent = "Please provide a valid email and password (min 8 characters).";
                    loginError.classList.add("show");
                    return;
                }

                const email =
                    document.getElementById("email").value;

                const password =
                    document.getElementById("password").value;

                try {

                    const response = await fetch(
                        "http://127.0.0.1:8000/users/login",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            },
                            body: JSON.stringify({
                                email,
                                password
                            })
                        }
                    );

                    const data = await response.json();

                    const loginError =
                        document.getElementById("loginError");

                    if (!response.ok) {

                        loginError.textContent =
                            "Invalid Credentials";

                        loginError.classList.add("show");

                        return;
                    }

                    loginError.classList.remove("show");

                    localStorage.setItem(
                        "user",
                        JSON.stringify(data)
                    );

                    if (data.role === "admin") {

                        window.location.href =
                            "admin/dashboard.html";
                    }

                    else if (data.role === "staff") {

                        window.location.href =
                            "staff/dashboard.html";
                    }

                    else {

                        window.location.href =
                            "customer/dashboard.html";
                    }

                }

                catch (error) {

                    console.error(error);

                    alert(
                        "Cannot connect to server."
                    );

                }

            }
        );

    }

    document.querySelectorAll(".toggle-password")
        .forEach(icon => {

            icon.addEventListener("click", () => {

                const input =
                    document.getElementById(
                        icon.dataset.target
                    );

                if (input.type === "password") {

                    input.type = "text";
                    icon.classList.replace(
                        "fa-eye",
                        "fa-eye-slash"
                    );

                } else {

                    input.type = "password";
                    icon.classList.replace(
                        "fa-eye-slash",
                        "fa-eye"
                    );

                }

            });

        });

}

loadModals();