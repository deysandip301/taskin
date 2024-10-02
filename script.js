// Variable Declarations
let addBtn = document.querySelector('.add-btn');
let modal = document.querySelector('.modal-cont');
let addTask = document.querySelector('.add-task');
let mainTicketCont = document.querySelector('.main-ticket-cont');
let prioritySelect = document.querySelector('.priority-color-cont');
let toolBoxCont = document.querySelector('.toolbox-cont');
let addModal = true;
let lastClickedPriority;
let taskColor = 'light-red';
let removeBtn = document.querySelector('.remove-btn');
let removeTasks = false;
let colorIndex = 0;
let colorMap = { 'light-red': 0, 'light-green': 1, 'sky-blue': 2, 'grey-black': 3 };
let ticketArr = [];

// Initialize the unique id generator
var uid = new ShortUniqueId();

// Load tasks from localStorage if available
if (localStorage.getItem('tasks')) {
    let stringifiedArr = localStorage.getItem('tasks');
    ticketArr = JSON.parse(stringifiedArr);
    for (let i = 0; i < ticketArr.length; i++) {
        generateTask(ticketArr[i].task, ticketArr[i].color, ticketArr[i].id);
    }
}

// Event listener for Add button
addBtn.addEventListener('click', function () {
    if (addModal) {
        modal.style.display = 'flex'; // show the modal
    }
    else {
        modal.style.display = 'none'; // hide the modal
    }
    addModal = !addModal;
});

// Event listener for adding a task on 'Enter' key press
addTask.addEventListener('keydown', function (e) {
    let key = e.key;
    if (key == 'Enter') {
        e.preventDefault();
        if (addTask.value == "") {
            alert('Please enter a task');
            return;
        }
        generateTask(e.target.value, taskColor);
        addTask.value = "";
        modal.style.display = 'none';
        addModal = true;
        // Reset priority selection
        if (lastClickedPriority) {
            lastClickedPriority.classList.remove('active');
        }
        taskColor = 'light-red'; // Resetting to default color
    }
});

// Event listener for selecting priority color
prioritySelect.addEventListener('click', function (e) {
    if (e.target.classList.contains('priority-color')) {
        if (lastClickedPriority) {
            lastClickedPriority.classList.remove('active');
        }
        e.target.classList.add('active');
        lastClickedPriority = e.target;
        taskColor = e.target.classList[1];
    }
});

// Function to generate a task
function generateTask(task, priorityColor, ticketId) {
    let id;
    if (ticketId) {
        id = ticketId; // Called from local storage, id is available
    }
    else {
        id = uid.rnd(); // Generate new id
    }

    let ticketCont = document.createElement('div');
    ticketCont.className = 'ticket-cont';
    ticketCont.setAttribute('draggable', 'true'); // Make ticket draggable

    ticketCont.innerHTML = `
        <div class="ticket-color ${priorityColor}"></div>
        <div class="ticket-id">${id}</div>
        <div class="ticket-area">${task}</div>
        <div class="lock"><i class="fa-solid fa-lock"></i></div>
    `;
    // Add data-id attribute to ticket for easy selection
    ticketCont.setAttribute('data-id', id);

    mainTicketCont.appendChild(ticketCont);

    // Add event listeners
    addTicketEventListeners(ticketCont);

    // If new task, save to ticketArr and localStorage
    if (!ticketId) {
        ticketArr.push({ task: task, color: priorityColor, id: id });
        updateLocalStorage();
    }
}

// Function to add event listeners to tickets
function addTicketEventListeners(ticketCont) {
    let id = ticketCont.getAttribute('data-id');
    let taskArea = ticketCont.querySelector('.ticket-area');
    let lockIcon = ticketCont.querySelector('.lock i');
    let ticketColor = ticketCont.querySelector('.ticket-color');

    // Lock/Unlock functionality
    lockIcon.addEventListener('click', function () {
        if (lockIcon.classList.contains('fa-lock')) {
            lockIcon.classList.remove('fa-lock');
            lockIcon.classList.add('fa-lock-open');
            taskArea.setAttribute('contenteditable', 'true');
        }
        else {
            lockIcon.classList.remove('fa-lock-open');
            lockIcon.classList.add('fa-lock');
            taskArea.setAttribute('contenteditable', 'false');
            // Update task content in ticketArr
            for (let i = 0; i < ticketArr.length; i++) {
                if (ticketArr[i].id == id) {
                    ticketArr[i].task = taskArea.innerText;
                    break;
                }
            }
            updateLocalStorage();
        }
    });

    // Change priority color on click
    ticketColor.addEventListener('click', function () {
        let currentColor = ticketColor.classList[1];
        let currentIndex = colorMap[currentColor];
        let newIndex = (currentIndex + 1) % Object.keys(colorMap).length;
        let newColor = Object.keys(colorMap)[newIndex];
        ticketColor.classList.remove(currentColor);
        ticketColor.classList.add(newColor);
        // Update color in ticketArr
        for (let i = 0; i < ticketArr.length; i++) {
            if (ticketArr[i].id == id) {
                ticketArr[i].color = newColor;
                break;
            }
        }
        updateLocalStorage();
    });

    // Remove ticket if in remove mode
    ticketCont.addEventListener('click', function () {
        if (removeTasks) {
            ticketCont.remove();
            removeTicketById(id);
        }
    });

    // Drag and Drop functionality
    ticketCont.addEventListener('dragstart', function (e) {
        e.dataTransfer.setData('text/plain', id);
        setTimeout(() => {
            ticketCont.style.display = 'none';
        }, 0);
    });

    ticketCont.addEventListener('dragend', function (e) {
        ticketCont.style.display = 'block';
    });
}

// Remove button functionality
removeBtn.addEventListener('click', function () {
    removeTasks = !removeTasks;
    if (removeTasks) {
        removeBtn.classList.add('red');
    } else {
        removeBtn.classList.remove('red');
    }
});

// Function to remove ticket by id
function removeTicketById(id) {
    for (let i = 0; i < ticketArr.length; i++) {
        if (ticketArr[i].id == id) {
            ticketArr.splice(i, 1);
            break;
        }
    }
    updateLocalStorage();
}

// Function to update localStorage
function updateLocalStorage() {
    let stringifiedArr = JSON.stringify(ticketArr);
    localStorage.setItem('tasks', stringifiedArr);
}

// Drag and Drop Target Containers
let columns = document.querySelectorAll('.main-ticket-cont');

// Add dragover and drop event listeners to columns
columns.forEach(column => {
    column.addEventListener('dragover', function (e) {
        e.preventDefault();
        column.classList.add('over');
    });

    column.addEventListener('dragleave', function (e) {
        column.classList.remove('over');
    });

    column.addEventListener('drop', function (e) {
        e.preventDefault();
        column.classList.remove('over');
        let id = e.dataTransfer.getData('text/plain');
        let ticket = document.querySelector(`.ticket-cont[data-id="${id}"]`);
        if (ticket) {
            // Append the ticket to the new column
            column.appendChild(ticket);

            // Update the ticket color to match the column's color
            let newColor = column.getAttribute('data-color');
            let ticketColorBand = ticket.querySelector('.ticket-color');
            let currentColor = ticketColorBand.classList[1];
            ticketColorBand.classList.remove(currentColor);
            ticketColorBand.classList.add(newColor);

            // Update color in ticketArr
            for (let i = 0; i < ticketArr.length; i++) {
                if (ticketArr[i].id == id) {
                    ticketArr[i].color = newColor;
                    break;
                }
            }
            updateLocalStorage();
        }
    });
});

// ToolBox functionality (if needed)
toolBoxCont.addEventListener('click', function (e) {
    let selectedTool = e.target.classList[1];
    if (e.target.classList.contains('color')) {
        if (e.target.classList.contains('active')) {
            toolBoxActive = true;
        }
        else {
            toolBoxActive = false;
        }
        for (let i = 0; i < toolBoxCont.children[0].children.length; i++) {
            toolBoxCont.children[0].children[i].classList.remove('active');
        }
        toolBoxActive = !toolBoxActive;
        if (toolBoxActive) {
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
