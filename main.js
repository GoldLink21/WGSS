var messagesPage = document.getElementById("messagesPage");
var alertOverlay = document.getElementById("alertOverlay");
var settingsPage = document.getElementById("settingsPage")     

//Get all app divs and add their click events
Array.from(document.getElementsByClassName("app")).forEach(app=>{
    //Different apps  open different pages 
    app.addEventListener('click',e=>{
        if(app.classList.contains("appMessage")){ 
            openPage(messagesPage);
        } else if(app.classList.contains("appSettings")){
            //Maybe have some settings
            openPage(settingsPage);
        } else if(app.classList.contains("appPhone")){
            //This should just say no sim inserted
            openAlert("Please insert a sim card to make calls")
        }
    })
});

/**
 * @typedef {{[x:string]:{who:string,text:string}[]}} Conversation 
 * Used for what gets parsed from conversations.json
 */

/**
 * Closes the specific page element
 * @param {Element} page
 */
function closePage(page){
    page.classList.remove('activePage')
    page.classList.remove("activeAlert")
    page.classList.add('deactivate');
}

/**
 * Opens the specified page and closes all the others
 * @param {HTMLElement} page 
 */
function openPage(page){
    Array.from(document.querySelectorAll(".pages")).filter(e=>e!=page).forEach(e=>closePage(e));
    page.classList.add('activePage')
    page.classList.remove('deactivate');
}

/**
 * Opens the alert tab with the specified text
 * @param {string} msg 
 */
function openAlert(msg){
    alertOverlay.classList.remove('activeAlert')
    alertOverlay.classList.remove('deactivate');
    alertOverlay.classList.add('activeAlert')
    document.getElementById("alertMessage").innerHTML = msg;
}

/**
 * Gets contents of the conversatiosn.json file and loads it into an object 
 */
async function loadJSON(){
    return fetch("./conversations.json")
        //Get the JSON
        .then(resp=>resp.json())
        //Confirm integrity
        .then(/**@param {Conversation} val*/val=>
            new Promise((resolve,reject)=>{
                Object.values(val).forEach(value=>{
                    if(!Array.isArray(value)){
                        return reject(`Value of ${JSON.stringify(value)} is not an array`);
                    }
                    if(value.some(elem=>!('who' in elem && 'text' in elem))){
                        return reject(`Missing 'who' or 'text' on some element`);
                    }
                });
                resolve(val);
            })
        )
}

/**
 * Makes the HTML for the json from loadJSON and attaches it to the page
 */
async function loadConversations() {
    return loadJSON().then(/**@param {Conversation} val*/val=>{
        /**These are the messages from everyone */
        let msgs = document.getElementsByClassName("textMessages")[0];
        //Go through all people
        for(let key in val) {
            //First create header that holds all messages, keeping the contact open at the top
            let contact = document.createElement("div");
            contact.id = 'contactFor'+key;
            contact.classList.add("contact");
            contact.classList.add("contactHover");
            //Create contact card
            contact.innerHTML = 
            `<div class='contactCard' id='cardFor${key}'>
                <img class='cardImg' src='./img/${key.toLowerCase()}Card.png' onerror='this.onerror=null;this.src="./img/noImg.png"'>
                <div class='cardName'>${key}</div>
            </div>`
            
            var personMsgs = document.createElement("div");
            personMsgs.classList.add("messageList");
            personMsgs.id='allMsgFrom'+key;
            contact.appendChild(personMsgs);

            addContactClickHandler(contact,personMsgs);

            //Go through all messages from the contact
            for(let i = 0; i < val[key].length; i++){
                //Different format based on who it's from
                let clazz = (val[key][i].who == "Date")?"dateMsg":(val[key][i].who =='You')?"youMsg":"otherMsg"
                personMsgs.innerHTML += `<div class='${clazz}'>${val[key][i].text}</div>`
            }
            if (val[key].length == 0){
                personMsgs.innerHTML+=`<div class='dateMsg'>You haven't messaged ${key}.</div>`
            }
            msgs.appendChild(contact)
        }
        return msgs;
    })
}

/**
 * Adds the click handler to contacts to open all their messages
 * @param {HTMLDivElement} contact 
 * @param {HTMLDivElement} msgs 
 */
function addContactClickHandler(contact, msgs){
    contact.addEventListener("click",e=>{
        Array.from(document.getElementsByClassName("contact"))
        .filter(e=>e!==contact)
        .forEach(e=>{
            e.classList.add("hidden");
            e.classList.remove("contactHover");

        });
        msgs.classList.add("shown");
        document.getElementById("closePage").classList.add("hidden");
        document.getElementById("backToContactsButton").classList.remove("hidden")
        document.getElementsByClassName("messagesLabel")[0].classList.add("hidden");
        contact.classList.remove("contactHover");
    })
}

/**
 * Called when on a page for someone's text to go back to all contacts
 */
function backToContacts(){
    document.getElementById("closePage").classList.remove("hidden");
    document.getElementById("backToContactsButton").classList.add("hidden")
    document.getElementsByClassName("messagesLabel")[0].classList.remove("hidden");
    Array.from(document.getElementsByClassName("messageList")).forEach(e=>{
        e.classList.remove("shown");
    })
    Array.from(document.getElementsByClassName("contact")).forEach(e=>{
        e.classList.remove("hidden");
        e.classList.add("contactHover");
    })
}

loadConversations()

/**
 * Opens an alert with the amber alert text for Alex
 */
function callAmberAlert(){
openAlert(
`Amber Alert!
<p>Name: Alexander Greene</p>
<p>Missing From: Salt Lake City Utah</p>
<div class='amberHolder'>
<img src='./img/alex.png' class='amberImg'>
<div>
    Height:  5'8"<br>
    Missing: July 17 2015<br>
    Weight:  153lbs.<br>
    Age:     15<br>
    Last Seen Friday night after school
</div>
</div>
<p></p>
`)
}

setTimeout(callAmberAlert,60*1000*3.25);

openAlert("You have found a phone. Try to figure out the story behind it!")

/**@param {string} str @param {string} who */
function fixIt(str,who){
    return str.split("\n")
        .map(s=>s.trim())
        .map(s=>
            `{"who":"${(s[0]=='=')?who:"You"}","text":"${s.substring(1)}"}`
        )
        .join(",");
}