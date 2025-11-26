document.addEventListener("DOMContentLoaded", () => {
    console.log("business-documents.js loaded");

    loadAllQuotes();
    loadAllInvoices();
});

// --------- QUOTES (all quotes for business) ---------

async function loadAllQuotes() {
    const container = document.getElementById("quote-output");
    if (!container) {
        console.error("#quote-output not found");
        return;
    }

    container.textContent = "Loading quotes...";

    try {
        const res = await fetch("/api/business/documents/quotes");

        if (!res.ok) {
            container.textContent = "Could not load quotes.";
            return;
        }

        const quotes = await res.json();

        if (!Array.isArray(quotes) || quotes.length === 0) {
            container.textContent = "There are currently no quotes.";
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
    } catch (err) {
        console.error(err);
        container.textContent = "Error loading quotes.";
    }
}

// --------- INVOICES (all invoices for business) ---------

async function loadAllInvoices() {
    const container = document.getElementById("invoice-output");
    if (!container) {
        console.error("#invoice-output not found");
        return;
    }

    container.textContent = "Loading invoices...";

    try {
        const res = await fetch("/api/business/documents/invoices");

        if (!res.ok) {
            container.textContent = "Could not load invoices.";
            return;
        }

        const invoices = await res.json();

        if (!Array.isArray(invoices) || invoices.length === 0) {
            container.textContent = "There are currently no invoices.";
            return;
        }

        const rows = invoices.map(inv => `
            <tr>
                <td>${inv.invoiceID}</td>
                <td>${inv.jobID}</td>
                <td>${inv.serviceName}</td>
                <td>£${Number(inv.finalPrice).toFixed(2)}</td>
                <td>${inv.paymentStatus}</td>
                <td>£${Number(inv.depositPaid).toFixed(2)}</td>
            </tr>
        `).join("");

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
    } catch (err) {
        console.error(err);
        container.textContent = "Error loading invoices.";
    }
}
