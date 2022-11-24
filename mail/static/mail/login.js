document.addEventListener('DOMContentLoaded', function () {    
    document.querySelector('#login_submit').addEventListener("submit", function () {

        // Stop sending the form
        document.getElementById("login_submit").addEventListener("submit", function (event) {
            event.preventDefault();
        });

        // Login and creating localStorage
        var email = document.querySelector('#login_email').value;
        var password = document.querySelector('#login_password').value;

        if (!email) {
            alert('Input email please!');
            return false;
        }

        if (!password) {
            alert('Input password please!');
            return false;
        }

        localStorage.setItem('currentUser', email);

        var currentUser = localStorage.getItem('currentUser');
        console.log(currentUser);

        // If suxcess - submitting form
        //var submitter = document.querySelector('#login_input').onclick;
        document.querySelector('#login_submit').requestSubmit('submit');
    });
})


