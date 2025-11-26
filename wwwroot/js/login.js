document.addEventListener("DOMContentLoaded", () => { //runs code after HTML is fully loaded
    console.log("login.js loaded"); //debugging log

    //get elements
    const form = document.getElementById("login-form"); //get form
    const output = document.getElementById("login-output");//get output
    const popup = document.getElementById("confirmationPopup");//get popup

    if (!form) {
        console.log("Login form not found");
        return;
    } //stop if form not found

    form.addEventListener("submit", async (e) => { //function runs when form is submitted
        e.preventDefault(); //prevents ?email= from being in url (solution to error found before)

        const email = document.getElementById("email").value.trim(); //get value from email input and remove whitespace
        const password = document.getElementById("password").value; //get value from password input
        const body = { email, password }; //create JSON object that will be sent to backend

        if (output) output.textContent = "Logging in..."; //loading message
        
        const response = await fetch("/api/client/login", { //send POST request to server
            method: "POST", //tells server it is a POST request
            headers: { "Content-Type": "application/json" },//tells server it is JSON data
            body: JSON.stringify(body) //converts into string
        }); 

        const data = await response.json(); //converts reply from JSON inro a JS object
        console.log("Login response:", response.status, data); //debugging log

        if (!response.ok) { //checks if response is error code (400-500)
            if (output) output.textContent = data.message || "Invalid login details."; //error message output
            return;
        }

        //save data in local storage
        localStorage.setItem("clientID", data.clientId); //save client ID
        localStorage.setItem("clientEmail", email); //save client email
        localStorage.setItem("role", data.role); //save user role

        const returnToBooking = localStorage.getItem("returnToBooking");// check if user was trying to book before logging in

        if (returnToBooking === "true") { //if user was trying to book before logging in  
            localStorage.removeItem("returnToBooking");//empty redirect flag
            window.location.href = "booking.html";//send user back to booking page
            return;
        }

        if (data.role === "B") { //if user role is business
            window.location.href = "business-home.html"; //redirect to business home
            return;
        }
        else { //if user role is not business
            if (popup) { //if user role is client
                popup.style.display = "flex"; //show popup
            } else {
                window.location.href = "client-home.html"; //redirect to client home
            }
        }
    });
});

