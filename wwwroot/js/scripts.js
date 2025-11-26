document.addEventListener('DOMContentLoaded', () => { //runs once HTML is fully loded
    console.log("scripts.js loaded"); //debugging log

    //get elements
    const accountButton = document.getElementById('accountButton'); //get account button
    const popup = document.getElementById('accountPopup'); //get popup

    console.log("accountButton =", accountButton); //debugging log
    console.log("popup =", popup); //debugging log

    if (!accountButton || !popup){ //if account button or popup missing
        console.log("Missing account button or popup");//debugging log
        return; //stop
    } 

    popup.style.display = "none"; //hide popup when page loads

    accountButton.addEventListener('click', (e) => { //when account clicked
        e.preventDefault(); //don't follow link
        console.log("Account clicked"); //debugging log
        popup.style.display = "flex"; //show popup
    });

    popup.addEventListener('click', (e) => { //when outside popup clicked
        console.log("Overlay clicked");//debugging log
        if (e.target === popup){ 
            console.log("Closing popup");//debugging log
            popup.style.display = "none";// hide popup
        } 
    });
});

