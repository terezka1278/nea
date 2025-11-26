document.addEventListener("DOMContentLoaded", () => {
    console.log("client-home.js loaded");

    const clientId = localStorage.getItem("clientID");

    if (!clientId) {
        // not logged in -> send to login
        window.location.href = "login.html";
        return;
    }

    const upcomingDiv = document.getElementById("upcoming-output");
    const previousDiv = document.getElementById("previous-output");

    loadNextBooking(clientId, upcomingDiv);
    loadAllBookings(clientId, previousDiv);
});

async function loadNextBooking(clientId, container) {
    if (!container) return;

    container.textContent = "Loading next booking...";

   
    const res = await fetch(`/api/client-bookings/${encodeURIComponent(clientId)}/next`);

    if (!res.ok) {
        container.textContent = "Could not load upcoming booking.";
        return;
    }

    const data = await res.json();

    if (!data.hasBooking) {
        container.textContent = "You have no upcoming bookings.";
        return;
    }

    const dateStr = new Date(data.scheduledDate).toLocaleDateString();
    const timeSlot = data.timeSlotPm ? "PM" : "AM";

    container.innerHTML = `
    <p><strong>Service:</strong> ${data.serviceName}</p>
    <p><strong>Date:</strong> ${dateStr} (${timeSlot})</p>
    <p><strong>Status:</strong> ${data.status}</p>
    <p><strong>Job ID:</strong> ${data.jobID}</p>
`;

   
}

async function loadAllBookings(clientId, container) {
    if (!container) return;

    container.textContent = "Loading bookings...";

    
    const res = await fetch(`/api/client-bookings/${encodeURIComponent(clientId)}`);

    if (!res.ok) {
        container.textContent = "Could not load bookings.";
        return;
    }

    const bookings = await res.json();

    if (!Array.isArray(bookings) || bookings.length === 0) {
        container.textContent = "You have no bookings yet.";
        return;
    }

    // Split into previous vs upcoming based on date
    const today = new Date();
    const previous = [];
    const upcoming = [];

    bookings.forEach(b => {
        const d = new Date(b.scheduledDate);
        if (d < today || (b.status && b.status.toLowerCase() === "completed")) {
            previous.push(b);
        } else {
            upcoming.push(b);
        }
    });

    // For dashboard "Previous Bookings" just show simple table rows
    const rows = previous.map(b => {
        const dateStr = new Date(b.scheduledDate).toLocaleDateString();
        const timeSlot = b.timeSlotPm ? "PM" : "AM";
        const price = b.estPrice != null ? `£${Number(b.estPrice).toFixed(2)}` : "-";

        return `
            <tr>
                <td>${b.jobID}</td>
                <td>${b.serviceName}</td>
                <td>${dateStr} (${timeSlot})</td>
                <td>${b.status}</td>
                <td>${price}</td>

            </tr>
        `;
    }).join("");

    if (!rows) {
        container.textContent = "You have no previous bookings yet.";
        return;
    }

    container.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Job ID</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Quote (£)</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
   
  

   
}



