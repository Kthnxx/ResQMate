const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/users/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
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

        alert("Login Successful");

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

});