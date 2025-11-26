document.addEventListener("DOMContentLoaded", () => {
    console.log("business-home.js loaded");
    loadDashboard();
});

async function loadDashboard() {
    const todayList = document.getElementById("JobsToday");
    const weekTable = document.getElementById("week-calendar");
    const monthTable = document.getElementById("month-calendar");

    if (!todayList || !weekTable || !monthTable) {
        console.error("One or more dashboard elements not found");
        return;
    }

    const todayTbody = weekTable.querySelector("tbody");
    const monthTbody = monthTable.querySelector("tbody");

    if (todayList) todayList.innerHTML = "<li>Loading...</li>";
    if (todayTbody) todayTbody.innerHTML = "";
    if (monthTbody) monthTbody.innerHTML = "";

    try {
        const res = await fetch("/api/business/jobs");
        if (!res.ok) {
            if (todayList) todayList.innerHTML = "<li>Failed to load jobs.</li>";
            return;
        }

        const rawJobs = await res.json();
        const jobs = rawJobs.map(normaliseJob);

        renderToday(jobs, todayList);
        renderWeek(jobs, weekTable);
        renderMonth(jobs, monthTable);

    } catch (err) {
        console.error(err);
        if (todayList) todayList.innerHTML = "<li>Error loading jobs.</li>";
    }
}

// --- helpers ---

function normaliseJob(raw) {
    const jobId = raw.jobId || raw.JobID || raw.jobID;
    const clientName = raw.clientName || raw.ClientName;
    const scheduledDateStr = raw.scheduledDate || raw.ScheduledDate;
    const status = raw.status || raw.Status;

    const serviceName = raw.serviceName || raw.ServiceName;   // NEW
    const address = raw.address || raw.Address;               // NEW
    const postcode = raw.postcode || raw.Postcode;            // NEW

    const dateObj = scheduledDateStr ? new Date(scheduledDateStr) : null;

    return {
        jobId,
        clientName,
        status,
        dateObj,
        serviceName,
        address,
        postcode
    };
}


function isSameDate(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}

function formatShortDate(date) {
    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

// ------------ TODAY VIEW (list) ------------

function renderToday(jobs, listEl) {
    if (!listEl) return;

    const today = new Date();
    listEl.innerHTML = "";

    const todaysJobs = jobs.filter(j => j.dateObj && isSameDate(j.dateObj, today));

    if (todaysJobs.length === 0) {
        listEl.innerHTML = "<li>No jobs scheduled for today.</li>";
        return;
    }

    todaysJobs.forEach(job => {
        const li = document.createElement("li");
        li.textContent =
            `${job.clientName} – ${job.serviceName} – ${job.address} (${job.status})`;
        listEl.appendChild(li);
    });
}


// ------------ WEEK VIEW (Mon–Fri) ------------

function renderWeek(jobs, weekTable) {
    const tbody = weekTable.querySelector("tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    const row = document.createElement("tr");

    const today = new Date();

    // find Monday of current week (Mon=1,…,Sun=0/7)
    const day = today.getDay(); // 0=Sun,1=Mon,...
    const diffToMonday = (day === 0 ? -6 : 1 - day); // if Sunday, go back 6 days
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);

    // We only show Monday–Friday (5 columns)
    for (let i = 0; i < 5; i++) {
        const current = new Date(monday);
        current.setDate(monday.getDate() + i);

        const td = document.createElement("td");

        const header = document.createElement("div");
        header.classList.add("day-header");
        header.textContent = current.toLocaleDateString(undefined, {
            weekday: "short",
            day: "numeric",
            month: "short"
        });
        td.appendChild(header);

        const dayJobs = jobs.filter(j => j.dateObj && isSameDate(j.dateObj, current));

        if (dayJobs.length === 0) {
            const p = document.createElement("p");
            p.classList.add("no-jobs");
            p.textContent = "No jobs";
            td.appendChild(p);
        } else {
            dayJobs.forEach(job => {
                const p = document.createElement("p");
                p.classList.add("job-item");
                p.textContent =
                    `${job.clientName} – ${job.serviceName} – ${job.address} (${job.status})`;

                td.appendChild(p);
            });
        }

        row.appendChild(td);
    }

    tbody.appendChild(row);
}

// ------------ MONTH VIEW (Mon–Sun grid) ------------

function renderMonth(jobs, monthTable) {
    const tbody = monthTable.querySelector("tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // 0–11

    // First day of this month
    const firstOfMonth = new Date(year, month, 1);
    const firstDayOfWeek = firstOfMonth.getDay(); // 0=Sun,1=Mon,...

    // convert to Monday-based index (0=Mon,...,6=Sun)
    const mondayIndex = (firstDayOfWeek + 6) % 7;

    // number of days in this month
    const nextMonth = new Date(year, month + 1, 0);
    const daysInMonth = nextMonth.getDate();

    let currentDay = 1 - mondayIndex; // can start negative = days from prev month

    // up to 6 rows for a month grid
    for (let week = 0; week < 6; week++) {
        const tr = document.createElement("tr");

        for (let dow = 0; dow < 7; dow++) {
            const td = document.createElement("td");

            if (currentDay < 1 || currentDay > daysInMonth) {
                // outside this month: leave blank
                td.classList.add("empty-day");
            } else {
                const dateObj = new Date(year, month, currentDay);

                const dateLabel = document.createElement("div");
                dateLabel.classList.add("date-label");
                dateLabel.textContent = currentDay.toString();
                td.appendChild(dateLabel);

                const dayJobs = jobs.filter(j => j.dateObj && isSameDate(j.dateObj, dateObj));

                if (dayJobs.length > 0) {
                    dayJobs.forEach(job => {
                        const p = document.createElement("p");
                        p.classList.add("job-item");
                        p.textContent =
                            `${job.clientName} – ${job.serviceName} – ${job.address} (${job.status})`;
                        td.appendChild(p);
                    });
                }
            }

            tr.appendChild(td);
            currentDay++;
        }

        tbody.appendChild(tr);

        // stop early if we’re past the end of month and on a clean row
        if (currentDay > daysInMonth) break;
    }
}
