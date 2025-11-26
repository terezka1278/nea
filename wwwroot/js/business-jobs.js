document.addEventListener("DOMContentLoaded", () => {
    console.log("business-jobs.js loaded");
    loadAllJobs();
});

async function loadAllJobs() {
    const container = document.getElementById("manage-output");
    if (!container) {
        console.error("#manage-output not found");
        return;
    }

    container.innerHTML = "<p>Loading bookings...</p>";

    try {
        const res = await fetch("/api/business/jobs");
        if (!res.ok) {
            container.innerHTML = "<p>Failed to load bookings.</p>";
            return;
        }

        const jobs = await res.json();

        if (!jobs || jobs.length === 0) {
            container.innerHTML = "<p>No bookings found.</p>";
            return;
        }

        // Build a simple table
        const table = document.createElement("table");
        table.classList.add("jobs-table"); // optional – style in CSS

        const thead = document.createElement("thead");
        thead.innerHTML = `
            <tr>
                <th>Job ID</th>
                <th>Date</th>
                <th>Client</th>
                <th>Status</th>
                <th>Action</th>
            </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement("tbody");

        jobs.forEach(job => {
            const tr = document.createElement("tr");

            const dateText = new Date(job.scheduledDate).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric"
            });

            tr.innerHTML = `
                <td>${job.jobID}</td>
                <td>${dateText}</td>
                <td>${job.clientName}</td>
                <td class="status-cell">${job.status}</td>
                <td></td>
            `;

            const actionTd = tr.lastElementChild;

            const btn = document.createElement("button");
            btn.type = "button";
            btn.textContent = "Mark Completed";
            btn.classList.add("button");

            if (job.status === "Completed") {
                btn.disabled = true;
            }

            btn.addEventListener("click", () => markCompleted(job.jobID, tr));

            actionTd.appendChild(btn);
            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        container.innerHTML = "";
        container.appendChild(table);
    } catch (err) {
        console.error(err);
        container.innerHTML = "<p>Error loading bookings.</p>";
    }
}

async function markCompleted(jobId, row) {
    if (!confirm(`Mark job ${jobId} as Completed?`)) return;

    try {
        const res = await fetch(`/api/business/jobs/${encodeURIComponent(jobId)}/complete`, {
            method: "PUT"
        });

        if (!res.ok) {
            alert("Failed to update job.");
            return;
        }

        // Update UI
        const statusCell = row.querySelector(".status-cell");
        if (statusCell) statusCell.textContent = "Completed";

        const button = row.querySelector("button");
        if (button) button.disabled = true;
    } catch (err) {
        console.error(err);
        alert("Error updating job.");
    }
}
