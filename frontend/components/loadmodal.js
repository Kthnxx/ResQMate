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
                registerModal.classList.add("show");

            }
        );

    }

    // ==========================
    // REGISTER
    // ==========================

    const registerForm =
        document.getElementById("registerForm");

    if (registerForm) {

        registerForm.addEventListener(
            "submit",
            async (e) => {

                e.preventDefault();

                const full_name =
                    document.getElementById("fullname").value;

                const email =
                    document.getElementById("registerEmail").value;

                const password =
                    document.getElementById("registerPassword").value;

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
                                full_name,
                                email,
                                password
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

    // ==========================
    // LOGIN
    // ==========================

    const loginForm =
        document.getElementById("loginForm");

    if (loginForm) {

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