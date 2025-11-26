document.addEventListener("DOMContentLoaded", () => {
    console.log("create-account.js loaded");

    const form = document.getElementById("create-account-form");
    const output = document.getElementById("create-output");
    const popup = document.getElementById("nextPopup"); // matches HTML

    if (!form) {
        console.log("Create account form not found");
        return;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const password = document.getElementById("password").value;
        const confirm = document.getElementById("confirm").value;

        if (password !== confirm) {
            if (output) output.textContent = "Passwords do not match.";
            return;
        }

        const body = {
            firstName: document.getElementById("firstname").value.trim(),
            lastName: document.getElementById("lastname").value.trim(),
            email: document.getElementById("email").value.trim(),
            phoneNum: document.getElementById("phoneNum").value.trim(),
            address: document.getElementById("address").value.trim(),
            postcode: document.getElementById("postcode").value.trim(),
            password: password
        };

        console.log("Sending create-account request", body);
        if (output) output.textContent = "Creating account...";

        
        const response = await fetch("/api/client/create-account", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        let data;
        try {
            data = await response.json();
        } catch (jsonErr) {
            console.error("JSON parse error:", jsonErr);
            if (output) output.textContent = "Unexpected server response.";
            return;
        }

        console.log("Create-account response", response.status, data);

        if (!response.ok) {
            // Backend validation error (email / phone already in use, etc.)
            if (output) output.textContent = data.message || "Error creating account.";
            return;
        }

        // ✅ SUCCESS
        if (output) {
            output.textContent = "Account created! Your ID is: " + data.clientId;
        }

        // store login state so booking etc can use it if you want
        localStorage.setItem("clientID", data.clientId);
        localStorage.setItem("clientEmail", body.email);

        // show success popup
        if (popup) {
            popup.style.display = "flex";
        } else {
            // fallback: go to login
            window.location.href = "login.html";
        }
    });
});
