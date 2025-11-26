document.addEventListener("DOMContentLoaded", () => {
    console.log("client-documents.js loaded");

    const clientId = localStorage.getItem("clientID");

    if (!clientId) {
        window.location.href = "login.html";
        return;
    }

    const manageOutput = document.getElementById("manage-output");
    const quotesOutput = document.getElementById("quote-output");
    const invoicesOutput = document.getElementById("invoice-output");

    loadClientBookings(clientId, manageOutput);
    loadClientQuotes(clientId, quotesOutput);
    loadClientInvoices(clientId, invoicesOutput);
});
async function loadClientQuotes(clientId, container) {
    if (!container) return;

    container.textContent = "Loading quotes...";

    const res = await fetch(`/api/client-bookings/${encodeURIComponent(clientId)}/quotes`);

    if (!res.ok) {
        container.textContent = "Could not load quotes.";
        return;
    }

    const quotes = await res.json();

    if (!Array.isArray(quotes) || quotes.length === 0) {
        container.textContent = "You currently have no quotes.";
        return;
    }

    const rows = quotes.map(q => {
        const acceptedText = q.accepted ? "Accepted" : "Pending";

        return `
            <tr>
                <td>${q.quoteID}</td>
                <td>${q.jobID}</td>
                <td>${q.serviceName}</td>
                <td>£${Number(q.estPrice).toFixed(2)}</td>
                <td>${q.estDuration} hrs</td>
                <td>${acceptedText}</td>
            </tr>
        `;
    }).join("");

    container.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Quote ID</th>
                    <th>Job ID</th>
                    <th>Service</th>
                    <th>Estimated Price</th>
                    <th>Estimated Duration</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
}
async function loadClientInvoices(clientId, container) {
    if (!container) return;

    container.textContent = "Loading invoices...";

    const res = await fetch(`/api/client-bookings/${encodeURIComponent(clientId)}/invoices`);

    if (!res.ok) {
        container.textContent = "Could not load invoices.";
        return;
    }

    const invoices = await res.json();

    if (!Array.isArray(invoices) || invoices.length === 0) {
        container.textContent = "You currently have no invoices.";
        return;
    }

    const rows = invoices.map(inv => {
        return `
            <tr>
                <td>${inv.invoiceID}</td>
                <td>${inv.jobID}</td>
                <td>${inv.serviceName}</td>
                <td>£${Number(inv.finalPrice).toFixed(2)}</td>
                <td>${inv.paymentStatus}</td>
                <td>£${Number(inv.depositPaid).toFixed(2)}</td>
            </tr>
        `;
    }).join("");

    container.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Invoice ID</th>
                    <th>Job ID</th>
                    <th>Service</th>
                    <th>Final Price</th>
                    <th>Payment Status</th>
                    <th>Deposit Paid</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
}
