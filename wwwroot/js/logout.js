document.addEventListener("DOMContentLoaded", () => { //runs once HTML is fully loaded
    console.log("client.js loaded"); //debugging log

    const logoutButton = document.getElementById("logoutButton"); //get logout button
     
    if (logoutButton) { //only add event listener if button exists
        logoutButton.addEventListener("click", (e) => { 
            e.preventDefault(); //do not follow the link

            // Clear stored client session data
            localStorage.removeItem("clientID"); //clear clientID
            localStorage.removeItem("clientEmail"); //clear email
            localStorage.removeItem("clientRole"); //clear role
            localStorage.removeItem("currentJobID"); //clear jobID

            alert("You have been logged out."); //output a message to user 
            window.location.href = "index.html";    // Redirect to homepage 
        });
    }
});
