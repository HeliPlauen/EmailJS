document.addEventListener('DOMContentLoaded', function () {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);

    // By default, load the inbox
    load_mailbox('inbox');
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
    //document.querySelector('#to_archive').style.display = 'none';
    //document.querySelector('#out_off_archive').style.display = 'none';
    document.querySelector('#archivation_group').style.display = 'none';

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

// Getting the letters list !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
function load_mailbox(mailbox) {

    // getting all the letters for our mailbox
    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {

        // If mailbox does not exist
        if (emails.error) {
            alert(emails.error);
            console.log(mailbox);
            console.log(emails.error);
            return false;
        }

        // Making email-holder empty
        document.querySelector('#email-body').innerHTML = '';

        // Show the mailbox and hide other views
        document.querySelector('#emails-view').style.display = 'block';
        document.querySelector('#compose-view').style.display = 'none';
        document.querySelector('#email-body').style.display = 'none';

        // Hide the email buttons
        document.querySelector('#ansver').style.display = 'none';
        //document.querySelector('#to_archive').style.display = 'none';
        //document.querySelector('#out_off_archive').style.display = 'none';
        if (mailbox == 'inbox') {            
            document.querySelector('#archivation_group').style.display = 'block';
            document.querySelector('#archivation_group').innerHTML = 'Add emails to the archive';
        } else if (mailbox == 'archive') {
            document.querySelector('#archivation_group').style.display = 'block';
            document.querySelector('#archivation_group').innerHTML = 'Get emails out of the archive';
        } else {
            document.querySelector('#archivation_group').style.display = 'none';
        }

        // Show the mailbox name
        document.querySelector('#header').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

        // Making emails list empty befor letters were downloaded
        document.querySelector('#emails-view').innerHTML = [];

        // Creting the div-list
        const emailsList = document.querySelector('#emails-view');

        // Filling the mailbox by emails
        for (email of emails) {

            // Creating the new element for each email and filling it by email
            const div = document.createElement('div');
            const input = document.createElement('input');
            const button = document.createElement('button');

            // Creqting the checkbox
            input.type = 'checkbox';
            input.id = email.id;

            console.log(input);

            // If mailbox is 'inbox', else if 'sent', else if 'archive', else ERROR
            if (mailbox == 'inbox') {
                if (email.read === true) {
                    button.style.backgroundColor = 'lightgrey';
                } else {
                    button.style.backgroundColor = 'white';
                }
                button.innerHTML = `<b>${email.sender}</b>: ${email.subject} (${email.timestamp})`;
            } else if (mailbox == 'sent') {
                button.style.backgroundColor = 'lightgrey';
                button.innerHTML = `<b>${email.recipients[0]}</b>: ${email.subject} (${email.timestamp})`;
            } else {
                button.style.backgroundColor = 'lightgrey';
                button.innerHTML = `<b>${email.sender} - ${email.recipients[0]}</b>: ${email.subject} (${email.timestamp})`;
            } 
            button.name = email.id;
            //button.classList.add("btn btn-sm btn-outline-primary");

            console.log(button);

            // Appending each button to the div
            div.append(input);
            div.append(button);

            // Appending each div to the list            
            emailsList.append(div);
        }        

        // Calling for the getting letter from our mailbox function 
        email_onload();

        // Calling for the group-archive function
        group_archive();
    })
}

// Getting the letter from our mailbox function ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function email_onload() {

    // Show the chosen email
    const container = document.querySelector('#emails-view');
    const buttons = container.querySelectorAll('button');

    console.log(container);
    console.log(buttons);

    buttons.forEach(function (button) {
        button.onclick = function () {
            fetch(`/emails/${button.name}`)
            .then(response => response.json())
            .then(email => {

                // If such email does not exist
                if (email.error) {
                    alert(email.error);
                    console.log(email);
                    console.log(email.error);
                    return false;
                }

                console.log("DOWNLOADED!!!");
                console.log(email);
                console.log(email.error);

                // Show the email and hide other views    
                document.querySelector('#compose-view').style.display = 'none';
                document.querySelector('#email-body').style.display = 'block';              

                // Show the answer button and archivation-button if user is recipient
                document.querySelector('#ansver').style.display = 'block';
                document.querySelector('#archivation_group').style.display = 'block';

                // Add to the archive/Delete from the archive buttons
                const recipients = email.recipients;
                const currentUser = document.querySelector('h2').innerHTML;

                console.log(recipients);

                for (recipient of recipients) {

                    console.log(email.user);
                    console.log(currentUser);

                    if (currentUser == recipient) {
                        if (email.archived == true) {
                            document.querySelector('#archivation_group').innerHTML = 'Get email out of the archive';
                        } else {
                            document.querySelector('#archivation_group').innerHTML = 'Add email to the archive';
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
                document.querySelector('#archivation_group').onclick = function () {

                    console.log(email.archived);

                    archive(email);

                    console.log(email);
                    console.log(email.archived);

                    // Load the inboxes
                    if (email.archived == true) {
                        load_mailbox('archive');
                    } else {
                        load_mailbox('inbox');
                    }
                }                

                // Calling for the answer function
                answer(email);
            });
        }
    });    
}

// Appending to the archive/Removing from the archive function +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function archive(email) {
    if (email.archived == true) {

        // Appending the letter to the archive
        fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: false                    
            })
        })
    } else {

        // Appending the letter to the archive
        fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: true
            })
        })
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

// The group-archive function !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
function group_archive() {

    // Getting ready the chosen emails list to archivation
    const readyToArchive = [];

    console.log(readyToArchive);

    // Filling the chosen emails list to archivation with emails
    const container = document.querySelector('#emails-view');
    container.querySelectorAll('input').forEach(function (input) {
        input.onclick = function () {
            fetch(`/emails/${input.id}`)
                .then(response => response.json())
                .then(email => {
                    console.log(input.id);
                    console.log(email);
                    readyToArchive.push(email);
                    console.log(readyToArchive);
                });
        }
    });

    // Making the selected elements archived
    document.querySelector('#archivation_group').onclick = function () {

        if (readyToArchive.length === 0) {
            alert('You have to choose at least one email for achivation!!!');
            return false;
        }

        console.log('ARCHIVING');

        var emailsArchived;

        for (email of readyToArchive) {
            console.log(email);
            console.log(emailsArchived);

            archive(email);
            emailsArchived = email.archived;

            console.log(email);
            console.log(emailsArchived);
        }

        // Load the inboxes
        if (emailsArchived == true) {
            load_mailbox('archive');
        } else {
            load_mailbox('inbox');
        }
        
    };
}

