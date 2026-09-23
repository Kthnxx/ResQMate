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