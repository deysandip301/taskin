let addBtn = document.querySelector('.add-btn');
let modal = document.querySelector('.modal-cont');
let addTask = document.querySelector('.add-task');
let mainTicketCont = document.querySelector('.main-ticket-cont');
let prioritySelect = document.querySelector('.priority-color-cont');
let toolBoxCont = document.querySelector('.toolbox-cont');
let toolBoxActive = false;
let addModal = true;
let lastClickedPriority;
let taskColor = 'light-red';
let removeBtn = document.querySelector('.remove-btn');
let removeTasks = false;
let colorIndex = 0;
let colorMap = { 'light-red': 0, 'light-green': 1, 'sky-blue': 2, 'grey-black': 3};
let ticketArr = [];


if(localStorage.getItem('tasks')){
    let stringifiedArr = localStorage.getItem('tasks');
    ticketArr = JSON.parse(stringifiedArr);
    for(let i=0; i<ticketArr.length; i++){
        generateTask(ticketArr[i].task,ticketArr[i].color,ticketArr[i].id);
    }
}


addBtn.addEventListener('click', function () {
    if(addModal){
        modal.style.display = 'flex'; // show the modal
    }
    else{
        modal.style.display = 'none'; // hide the modal
    }
    addModal = !addModal;
});

addTask.addEventListener('keydown', function (e) {
    let key = e.key;
    if(key == 'Enter'){
        if(addTask.value == ""){
            alert('Please enter a task');
            return;
        }

        generateTask(e.target.value,taskColor);
        console.log(e.target.value);
        addTask.value = "";
        modal.style.display = 'none';
        addModal = true;
    }
});

prioritySelect.addEventListener('click', function (e) {
    e.target.classList.add('active');
    if(lastClickedPriority){
        lastClickedPriority.classList.remove('active');
    }
    lastClickedPriority = e.target;

    taskColor = e.target.classList[1];
});

// Initialise the unique id generator
var uid = new ShortUniqueId();


function generateTask(task,priorityColor,ticketId) {

    let id;
    if(ticketId){
        id = ticketId; // it means it is called from local storage ans id is available
    }
    else{
        id = uid.rnd(); // it means it is called from add task button and id is not available
    }
    let ticketCont = document.createElement('div');
    ticketCont.className = 'ticket-cont';
    ticketCont.innerHTML = `<div class="ticket-color ${priorityColor}">
                            </div><div class="ticket-id">${id}</div>
                            <div class="ticket-area">${task}</div>
                            <div class="lock"><i class="fa-solid fa-lock"></i></div>`;
    mainTicketCont.appendChild(ticketCont);
    
    if(!ticketId) {
        ticketArr.push({task: task, color: priorityColor, id: id});
        let stringifiedArr = JSON.stringify(ticketArr);
        localStorage.setItem('tasks', stringifiedArr);
    }
}

removeBtn.addEventListener('click', function () {
    removeTasks = !removeTasks;
    if (removeTasks) {
        removeBtn.classList.add('red');
        mainTicketCont.addEventListener('click', removeTicket);
    } else {
        removeBtn.classList.remove('red');
        mainTicketCont.removeEventListener('click', removeTicket);
    }
});

function removeTicket(e) {
    if (e.target.parentNode.classList.contains('ticket-cont')) {
        e.target.parentNode.remove();
    }
    let id = e.target.parentNode.children[1].innerText;
    for(let i=0; i<ticketArr.length; i++){
        if(ticketArr[i].id == id){
            ticketArr.splice(i,1);
            break;
        }
    }
    updateLocalStorage();
}

toolBoxCont.addEventListener('click', function (e) {
    let selectedTool = e.target.classList[1];
        if(e.target.classList.contains('color')) {
        if(e.target.classList.contains('active')) {
            toolBoxActive = true;
        }
        else {
            toolBoxActive = false;
        }
        for (let i=0; i<toolBoxCont.children[0].children.length; i++) {
            toolBoxCont.children[0].children[i].classList.remove('active');
        }
        toolBoxActive = !toolBoxActive;
        if(toolBoxActive) {
            e.target.classList.add('active');
            for (let i = 0; i < mainTicketCont.children.length; i++) {
                let ticket = mainTicketCont.children[i];
                let ticketColor = ticket.children[0].classList[1];
                if (selectedTool == ticketColor) {
                    ticket.style.display = 'block';
                }
                else {
                    ticket.style.display = 'none';
                }
            }
        }
        else {
            e.target.classList.remove('active');
            for (let i = 0; i < mainTicketCont.children.length; i++) {
                let ticket = mainTicketCont.children[i];
                ticket.style.display = 'block';
            }
        } 
    }
});

mainTicketCont.addEventListener('click', function (e) {
    
    // priority changing functionality
    if(e.target.classList.contains('ticket-color')) {
        colorIndex = colorMap[e.target.classList[1]];
        e.target.classList.remove(e.target.classList[1]);
        colorIndex = (colorIndex + 1) % 4;
        e.target.classList.add(Object.keys(colorMap)[colorIndex]);
    }

    //lock functionality
    if(e.target.parentNode.classList.contains('lock')) {
        let taskArea = e.target.parentNode.parentNode.children[2];
        if(e.target.classList.contains('fa-lock')){
            e.target.classList.remove('fa-lock');
            e.target.classList.add('fa-lock-open');
            taskArea.setAttribute('contenteditable', 'true');
        }
        else{
            e.target.classList.remove('fa-lock-open');
            e.target.classList.add('fa-lock');
            taskArea.setAttribute('contenteditable', 'false');
        }
    }
});

function updateLocalStorage(){
    let stringifiedArr = JSON.stringify(ticketArr);
    localStorage.setItem('tasks',stringifiedArr);
}