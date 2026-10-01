function initLogoutModal() {

    document.addEventListener("click", function (e) {

        const modal = document.getElementById("logoutModal");

        // Open Modal
        if (e.target.closest(".logout button")) {
            e.preventDefault();

            if (modal) {
                modal.classList.add("show");
            }

            return;
        }

        // Close using X button
        if (e.target.closest("#closeModalBtn")) {
            modal.classList.remove("show");
            return;
        }

        // Close using Cancel button
        if (e.target.closest("#cancelLogoutBtn")) {
            modal.classList.remove("show");
            return;
        }

        // Close when clicking outside modal content
        if (e.target === modal) {
            modal.classList.remove("show");
            return;
        }

        // Confirm Logout
        if (e.target.closest("#confirmLogoutBtn")) {
            e.preventDefault();
            
            const btn = e.target.closest("#confirmLogoutBtn");
            const originalText = btn.textContent;
            btn.textContent = "Processing...";
            btn.style.pointerEvents = "none";
            
            const token = localStorage.getItem("token");
            if (token) {
                fetch("http://127.0.0.1:8000/users/logout", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }).finally(() => {
                    localStorage.removeItem("user");
                    localStorage.removeItem("token");
                    window.location.href = btn.href;
                });
            } else {
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                window.location.href = btn.href;
            }
        }
    });

}