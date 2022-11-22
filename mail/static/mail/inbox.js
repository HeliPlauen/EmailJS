document.addEventListener('DOMContentLoaded', function () {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);

    // By default, load the inbox
    load_mailbox('inbox');

    document.querySelector('#test').addEventListener('click', () => load_mailbox('test'));
});

// Sending letters +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function compose_email() {

    // Stop sending form
    document.getElementById("compose-form").addEventListener("submit", function (event) {
        event.preventDefault();
    });

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#email-body').style.display = 'none';

    // Hide the email buttons
    document.querySelector('#ansver').style.display = 'none';
    document.querySelector('#to_archive').style.display = 'none';
    document.querySelector('#out_off_archive').style.display = 'none';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';

    // If form is submitted
    document.querySelector('#compose-form').onsubmit = function () {

        // Getting data from user
        var recipients = document.querySelector('#compose-recipients').value;
        if (!recipients) {
            alert('You have to put at least one recipient!!!');
            return false;
        }

        var subject = document.querySelector('#compose-subject').value;
        var body = document.querySelector('#compose-body').value;

        // Sending data and getting response
        fetch('/emails', {
            method: 'POST',
            body: JSON.stringify({
                recipients: recipients,
                subject: subject,
                body: body
            })
        })
        .then(response => response.json())
        .then(result => {
            console.log(result);
            alert(result.message);
            if (result.message == undefined) {
                alert(result.error);
                return false;
            }            

            // By default, load the inbox
            load_mailbox('sent');

            // If suxcess - submitting form
            document.getElementById("compose-form").requestSubmit("submit");
        });        
    }
}

// Getting the letters list ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function load_mailbox(mailbox) {

    // Making email-holder empty
    document.querySelector('#email-body').innerHTML = '';

    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-body').style.display = 'none';

    // Hide the email buttons
    document.querySelector('#ansver').style.display = 'none';
    document.querySelector('#to_archive').style.display = 'none';
    document.querySelector('#out_off_archive').style.display = 'none';

    // Show the mailbox name
    document.querySelector('#header').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    // Making emails list empty befor letters were downloaded
    document.querySelector('#emails-view').innerHTML = [];

    // getting all the letters for our mailbox
    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {

        const emailsList = document.querySelector('#emails-view');

        // Filling the mailbox by emails
        for (email of emails) {

            // Creating the new element for each email and filling it by email
            const div = document.createElement('div');

            // If mailbox is 'inbox', else if 'sent', else 'archive'
            if (mailbox == 'inbox') {
                if (email.read === true) {
                    div.style.backgroundColor = 'grey';
                } else {
                    div.style.backgroundColor = 'white';
                }
                div.innerHTML = `<b>${email.sender}</b>: ${email.subject} (${email.timestamp})`;
            } else if (mailbox == 'sent') {
                div.style.backgroundColor = 'grey';
                div.innerHTML = `<b>${email.recipients[0]}</b>: ${email.subject} (${email.timestamp})`;
            } else {
                div.style.backgroundColor = 'grey';
                div.innerHTML = `<b>${email.sender} - ${email.recipients[0]}</b>: ${email.subject} (${email.timestamp})`;
            }
            div.name = email.id;

            console.log(div);

            // Appending each div to the list            
            emailsList.append(div);
        }        

        // Calling for the getting letter from our mailbox function 
        email_onload();
    })
    .catch(error => {
        console.log('Error: ', 'Invalid indox');
    });
}

// Getting the letter from our mailbox function ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function email_onload() {

    console.log("DOWNLOADED!!!");

    // Show the email and hide other views    
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-body').style.display = 'block';

    // Show the chosen email
    const container = document.querySelector('#emails-view');
    const divs = container.querySelectorAll('div');

    console.log(container);
    console.log(divs);

    divs.forEach(function (div) {
        div.onclick = function () {
            fetch(`/emails/${div.name}`)
            .then(response => response.json())
            .then(email => {
                console.log(email);

                // Show the answer button if user is recipient
                document.querySelector('#ansver').style.display = 'block';           

                // Add to the archive/Delete from the archive buttons
                const recipients = email.recipients;
                const currentUser = document.querySelector('h2').innerHTML;

                console.log(recipients);

                for (recipient of recipients) {

                    console.log(email.user);
                    console.log(currentUser);

                    if (currentUser == recipient) {
                        if (email.archived == true) {
                            document.querySelector('#out_off_archive').style.display = 'block';
                        } else {
                            document.querySelector('#to_archive').style.display = 'block';
                        }  
                    }
                }                               

                // Making the letter marked as readen
                fetch(`/emails/${email.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        read: true
                    })
                })

                console.log(email);

                document.querySelector('#email-body').innerHTML =
                    `<h4>${email.subject}</h4><br> Sender: ${email.sender},<br> Recipients: ${email.recipients},<br> ${email.timestamp}.<br> ${email.body}`;

                // Hide emails-view
                document.querySelector('#emails-view').style.display = 'none';

                // Calling for the Appending to archive/Removing from the archive function
                archive(email);

                // Calling for the answer function
                answer(email);
            });
        }
    });    
}

// Appending to the archive/Removing from the archive function +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function archive(email) {
    if (email.archived == true) {
        document.querySelector('#out_off_archive').onclick = function () {

            // Appending the letter to the archive
            fetch(`/emails/${email.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    archived: false                    
                })
            })

            // Load the inbox
            load_mailbox('inbox');
        }
    } else {
        document.querySelector('#to_archive').onclick = function () {

            // Appending the letter to the archive
            fetch(`/emails/${email.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    archived: true
                })
            })

            // Load the inbox
            load_mailbox('inbox');
        }
    }
}

// Getting the answer function +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function answer(email) {
    document.querySelector('#ansver').onclick = function () {

        // Create the new letters placeholders
        const newRecipient = email.sender;
        const newSubject = email.subject;
        const newBody = email.body;
        const newTimestampt = email.timestamp;

        // Redirecting to the new email creating form
        compose_email();
        document.querySelector('#compose-recipients').value = newRecipient;
        document.querySelector('#compose-subject').value = 'Re: ' + newSubject;
        document.querySelector('#compose-body').value = `On ${newTimestampt} ${newRecipient} wrote ${newBody}`;
    }
}

