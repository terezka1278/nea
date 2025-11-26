document.addEventListener("DOMContentLoaded", () => {
    console.log("client.js loaded");

    const logoutButton = document.getElementById("logoutButton");

    if (logoutButton) {
        logoutButton.addEventListener("click", (e) => {
            e.preventDefault();

            // Clear stored client session data
            localStorage.removeItem("clientID");
            localStorage.removeItem("clientEmail");
            localStorage.removeItem("clientRole");
            localStorage.removeItem("currentJobID");

            alert("You have been logged out.");

            // Redirect to homepage or login page
            window.location.href = "index.html";
        });
    }
});
