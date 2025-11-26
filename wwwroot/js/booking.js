document.addEventListener("DOMContentLoaded", () => {
    console.log("booking.js loaded");

    const form = document.getElementById("booking-form");
    const nextButton = document.getElementById("nextButton");
    const stage1 = document.getElementById("stage1");
    const stage2 = document.getElementById("stage2");
    const output = document.getElementById("stage1-output");
    const confirmPopup = document.getElementById("confirm-popup");
    const confirmPopupMessage = document.getElementById("confirm-popup-message");
    const confirmPopupClose = document.getElementById("confirm-popup-close");

    if (!form || !nextButton || !stage1 || !stage2) {
        console.log("Booking form or stages not found");
        return;
    }

    // The fieldset immediately after the Stage 2 heading
    const stage2Fieldset = stage2.nextElementSibling;
    if (stage2Fieldset) {
        stage2Fieldset.hidden = true; // hide Step 2 initially
    }

    // ---------- STEP 1: create job ----------
    nextButton.addEventListener("click", async () => {
        // 1. Read values
        const firstName = document.getElementById("firstname").value.trim();
        const lastName = document.getElementById("lastname").value.trim();
        const email = document.getElementById("email").value.trim();
        const phoneNum = document.getElementById("phoneNum").value.trim();
        const address = document.getElementById("address").value.trim();
        const postcode = document.getElementById("postcode").value.trim();
        const service = document.getElementById("service").value;
        const pointsVal = document.getElementById("points").value.trim();
        const summary = document.getElementById("summary").value.trim();

        const points = Number(pointsVal);

        // 2. Basic validation (same idea as backend)
        if (!firstName || !lastName || !email || !phoneNum ||
            !address || !postcode || !service || !summary || !points) {
            if (output) output.textContent = "Please fill in all required fields.";
            return;
        }

        const body = {
            firstName,
            lastName,
            email,
            phoneNum,
            address,
            postcode,
            service,
            points,
            summary,
            clientId: localStorage.getItem("clientID") || null
        };

        console.log("Sending booking step 1 request", body);
        if (output) output.textContent = "Saving your details...";

            const response = await fetch("/api/booking/step1", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            const data = await response.json();
            console.log("Booking step 1 response", response.status, data);

            if (!response.ok) {
                // ----- CASE A: MUST LOG IN -----
                if (data.requiresLogin) {
                    if (output) {
                        output.textContent = data.message ||
                            "You already have an account. Please log in to continue.";
                    }

                    localStorage.setItem("returnToBooking", "true");

                    setTimeout(() => {
                        window.location.href = "login.html";
                    }, 1500);

                    return;
                }

                // ----- CASE B: MUST CREATE ACCOUNT -----
                if (data.requiresAccount) {
                    if (output) {
                        output.textContent = data.message ||
                            "No account found. Please create an account first.";
                    }

                    localStorage.setItem("returnToBooking", "true");

                    setTimeout(() => {
                        window.location.href = "create-account.html";
                    }, 1500);

                    return;
                }

                // Generic error
                if (output) {
                    output.textContent = data.message ||
                        "There was a problem saving your details.";
                }
                return;
            }

            // ----- CASE C: STEP 1 SUCCEEDED -----
            const clientId = data.clientId;
            const jobId = data.jobId;

            // store login / booking state
            localStorage.setItem("clientID", clientId);
            localStorage.setItem("clientEmail", email);
            localStorage.setItem("currentJobID", jobId);
            localStorage.setItem("clientName", firstName + " " + lastName);

            if (output) {
                output.textContent = "Details saved! Continue to Step 2.";
            }

            // show Stage 2 fieldset
            if (stage2Fieldset) {
                stage2Fieldset.hidden = false;
                stage2Fieldset.scrollIntoView({ behavior: "smooth" });
            }

        } catch (err) {
            console.error(err);
            if (output) output.textContent = "Network error. Please try again.";
        }
    });

    // ---------- STEP 2: send selected days and show suggested dates ----------
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const dateOutputDiv = document.getElementById("date-output");
        if (!dateOutputDiv) {
            console.warn("date-output div not found");
            return;
        }

        // 1. Collect selected weekdays from checkboxes
        const dayCheckboxes = document.querySelectorAll(".days");
        const selectedDays = [];

        dayCheckboxes.forEach(cb => {
            if (cb.checked) {
                selectedDays.push(cb.name); // "monday", "tuesday", etc.
            }
        });

        if (selectedDays.length === 0) {
            dateOutputDiv.textContent = "Please select at least one day.";
            return;
        }

        // 2. Retrieve Job ID stored by Step 1
        const jobId = localStorage.getItem("currentJobID");
        if (!jobId) {
            dateOutputDiv.textContent = "Missing job information. Please complete Stage 1 again.";
            return;
        }

        const body = {
            jobId: jobId,
            days: selectedDays
        };

        console.log("Sending booking step 2 request", body);
        dateOutputDiv.textContent = "Finding available dates...";

        try {
            const response = await fetch("/api/booking/step2", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            const data = await response.json();
            console.log("Booking step 2 response", response.status, data);

            if (!response.ok) {
                dateOutputDiv.textContent =
                    data.message || "There was a problem finding available dates.";
                return;
            }

            const suggested = data.suggestedDates || [];

            if (suggested.length === 0) {
                dateOutputDiv.textContent =
                    data.message || "No available dates found in the next few weeks.";
                return;
            }

            // Display radio buttons for date selection
            renderSuggestedDates(dateOutputDiv, suggested, jobId);

        } catch (err) {
            console.error("Error in step 2:", err);
            dateOutputDiv.textContent = "Network error. Please try again.";
        }
    });

    // ---------- Helper: render suggested dates + confirm ----------
    function renderSuggestedDates(container, suggestedDates, jobId) {
        container.innerHTML = "";

        const info = document.createElement("p");
        info.textContent = "Please choose one of these dates:";
        container.appendChild(info);

        const list = document.createElement("div");

        suggestedDates.forEach(dateStr => {
            const label = document.createElement("label");
            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = "chosenDate";
            radio.value = dateStr;

            const pretty = new Date(dateStr).toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "short",
                day: "numeric"
            });

            label.appendChild(radio);
            label.append(` ${pretty}`);
            list.appendChild(label);
            list.appendChild(document.createElement("br"));
        });

        container.appendChild(list);

        // ---- Confirm button ----
        let btn = document.getElementById("confirm-date");
        if (!btn) {
            btn = document.createElement("button");
            btn.type = "button";       // important: don't submit the form again
            btn.id = "confirm-date";
            btn.textContent = "Confirm date";
            container.appendChild(btn);
        }

        let statusP = document.getElementById("date-status");
        if (!statusP) {
            statusP = document.createElement("p");
            statusP.id = "date-status";
            container.appendChild(statusP);
        }

        btn.onclick = async () => {
            const selectedRadio = container.querySelector("input[name='chosenDate']:checked");
            if (!selectedRadio) {
                statusP.textContent = "Please select a date first.";
                return;
            }

            const selectedDate = selectedRadio.value; // yyyy-MM-dd
            statusP.textContent = "Confirming your booking...";

            try {
                console.log("Sending confirm:", { jobId, selectedDate });
                const response = await fetch("/api/booking/step2/confirm", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ jobId, selectedDate })
                });

                const data = await response.json();
                console.log("Booking confirm response", response.status, data);

                if (!response.ok) {
                    statusP.textContent =
                        data.message || "There was a problem confirming your booking.";
                    return;
                }

                // Optionally still store in localStorage if you want to use it elsewhere
                localStorage.setItem("lastBookingDate", data.selectedDate);
                localStorage.setItem("lastBookingJobId", data.jobId);
                localStorage.setItem("lastBookingSlot", data.timeSlot);

                const clientName = localStorage.getItem("clientName") || "Client";

                // Build a simple confirmation message
                const niceDate = new Date(data.selectedDate).toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                });

                if (confirmPopup && confirmPopupMessage) {
                    confirmPopupMessage.textContent =
                        `Thank you, ${clientName}. Your booking has been confirmed for ${niceDate}.`;
                    confirmPopup.hidden = false; // show popup
                } else {
                    // fallback if popup not found
                    statusP.textContent = data.message || "Booking confirmed!";
                }
                if (confirmPopupClose && confirmPopup) {
                    confirmPopupClose.addEventListener("click", () => {
                        confirmPopup.hidden = true;
                        // optional: redirect to account/home page here
                        // window.location.href = "client-account-home.html";
                    });
                }

            } catch (err) {
                console.error("Error confirming date:", err);
                statusP.textContent = "Network error while confirming booking.";
            }
        };
    }

});

