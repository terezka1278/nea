document.addEventListener("DOMContentLoaded", () => {
    console.log("client-account.js loaded");

    const clientId = localStorage.getItem("clientID");
    if (!clientId) {
        window.location.href = "login.html";
        return;
    }

    loadCurrentClientInfo(clientId);

    const form = document.getElementById("account-changes");
    form.addEventListener("submit", updateClientAccount);
});

async function loadCurrentClientInfo(clientId) {
    const res = await fetch(`/api/client-account/${clientId}`);
    if (!res.ok) {
        console.error("Failed to load client info");
        return;
    }

    const client = await res.json();

    // fill "Current" fields
    document.getElementById("current-address").innerHTML = `<p>${client.address}</p>`;
    document.getElementById("current-postcode").innerHTML = `<p>${client.postcode}</p>`;
    document.getElementById("current-email").innerHTML = `<p>${client.email}</p>`;
    document.getElementById("current-phoneNum").innerHTML = `<p>${client.phoneNum}</p>`;
    document.getElementById("current-password").innerHTML = `<p>********</p>`;
}
async function updateClientAccount(e) {
    e.preventDefault();

    const clientId = localStorage.getItem("clientID");

    const formData = new FormData(e.target);

    const body = {
        address: formData.get("address") || null,
        postcode: formData.get("postcode") || null,
        email: formData.get("email") || null,
        phoneNum: formData.get("phoneNum") || null,
        password: formData.get("password") || null
    };

    // Remove empty strings → send null instead
    Object.keys(body).forEach(key => {
        if (!body[key] || body[key].trim() === "") body[key] = null;
    });

    const res = await fetch(`/api/client-account/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    if (res.ok) {
        alert("Your account has been updated!");
        loadCurrentClientInfo(clientId);
    } else {
        alert("Update failed.");
    }
}
