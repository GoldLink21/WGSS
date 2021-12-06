var messagesPage = document.getElementById("messagesPage");
var alertOverlay = document.getElementById("alertOverlay");
var settingsPage = document.getElementById("settingsPage")     

//Get all app divs and add their click events
Array.from(document.getElementsByClassName("app")).forEach(app=>{
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
 * @typedef {{[x:string]:[{who:string,text:string}]}} Conversation 
 * Used for what gets parsed from conversations.json
 */

/**@type {Conversation} */
var conv;

/**@param {Element} page */
function closePage(page){
    page.classList.remove('activePage')
    page.classList.remove("activeAlert")
    page.classList.add('deactivate');
}

/**@param {HTMLElement} page */
function openPage(page){
    Array.from(document.querySelectorAll(".pages")).filter(e=>e!=page).forEach(e=>closePage(e));
    page.classList.add('activePage')
    page.classList.remove('deactivate');
}

/**@param {string} msg */
function openAlert(msg){
    alertOverlay.classList.add('activeAlert')
    alertOverlay.classList.remove('deactivate');
    document.getElementById("alertMessage").innerHTML = msg;
}

/**
 * After clicking on a message, this will go back to the contacts
 */
function goBackFromMessages(){
    document.querySelectorAll(".textMessage");
}

/**Gets contents of the conversatiosn.json file and loads it into an object */
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
        //Save if good
        .then(res=>conv = res)
}

/**Makes the HTML for the json from loadJSON */
async function loadConversations() {
    document.getElementById("msgOverlay");
    return loadJSON().then(/**@param {Conversation} val*/val=>{
        /**These are the messages from everyone */
        let msgs = document.getElementsByClassName("textMessages")[0];
        //Go through all people
        for(let key in val){
            //First create header that holds all messages, keeping the contact open at the top
            let contact = document.createElement("div");
            contact.id = 'contactFor'+key;
            contact.classList.add("contact");
            //Create contact card
            contact.innerHTML = 
            `<div class='contactCard' id='cardFor${key}'>
                <img class='cardImg' src='./img/${key}Card.png' onerror='this.onerror=null;this.src="./img/noImg.png"'>
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
            msgs.appendChild(contact)
        }
        return msgs;
    })
}

/**
 * 
 * @param {HTMLDivElement} contact 
 * @param {HTMLDivElement} msgs 
 */
function addContactClickHandler(contact, msgs){
    contact.addEventListener("click",e=>{
        Array.from(document.getElementsByClassName("contact"))
        .filter(e=>e!==contact)
        .forEach(e=>{
            e.classList.add("hidden");
        });
        msgs.classList.add("shown");
        document.getElementById("closePage").classList.add("hidden");
        document.getElementById("backToContactsButton").classList.remove("hidden")
        document.getElementsByClassName("messagesLabel")[0].classList.add("hidden");

    })
}
function backToContacts(){
    document.getElementById("closePage").classList.remove("hidden");
    document.getElementById("backToContactsButton").classList.add("hidden")
    document.getElementsByClassName("messagesLabel")[0].classList.remove("hidden");
    Array.from(document.getElementsByClassName("messageList")).forEach(e=>{
        e.classList.remove("shown");
    })
    Array.from(document.getElementsByClassName("contact")).forEach(e=>{
        e.classList.remove("hidden");
    })
}

loadConversations()