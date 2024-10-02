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
let ticketArr = [];

// Select the due date input
let dueDateInput = document.querySelector('.due-date-input');

// Initialize the unique id generator
var uid = new ShortUniqueId();

// Load tasks from localStorage if available
if (localStorage.getItem('tasks')) {
    let stringifiedArr = localStorage.getItem('tasks');
    ticketArr = JSON.parse(stringifiedArr);
    for (let i = 0; i < ticketArr.length; i++) {
        generateTask(ticketArr[i].task, ticketArr[i].color, ticketArr[i].dueDate, ticketArr[i].id);
    }
}

// Event listener for Add button
addBtn.addEventListener('click', function () {
    if (addModal) {
        modal.style.display = 'flex'; // show the modal
    } else {
        modal.style.display = 'none'; // hide the modal
    }
    addModal = !addModal;
});

// Event listener for adding a task on 'Enter' key press
addTask.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        if (addTask.value.trim() === "") {
            alert('Please enter a task');
            return;
        }
        let taskText = addTask.value.trim();
        let dueDate = dueDateInput.value;

        generateTask(taskText, taskColor, dueDate);
        addTask.value = "";
        dueDateInput.value = "";
        modal.style.display = 'none';
        addModal = true;
        // Reset priority selection
        if (lastClickedPriority) {
            lastClickedPriority.classList.remove('active');
        }
        taskColor = 'light-red'; // Resetting to default color
    }
});

// Event listener for selecting priority color in the modal
prioritySelect.addEventListener('click', function (e) {
    if (e.target.classList.contains('priority-color')) {
        if (lastClickedPriority) {
            lastClickedPriority.classList.remove('active');
        }
        e.target.classList.add('active');
        lastClickedPriority = e.target;
        taskColor = e.target.classList[1]; // Set the task color based on selection
    }
});

// Function to generate a task
function generateTask(taskText, priorityColor, dueDate, ticketId) {
    let id = ticketId || uid.rnd(); // Use provided id or generate a new one

    let ticketCont = document.createElement('div');
    ticketCont.className = 'ticket-cont';
    ticketCont.setAttribute('draggable', 'true');
    ticketCont.setAttribute('data-id', id);

    // Updated HTML structure
    ticketCont.innerHTML = `
        <div class="due-date-status ${priorityColor}">
            <div class="due-date">${formatDueDate(dueDate)}</div>
            <div class="status-indicator">${getStatusIndicator(dueDate)}</div> 
        </div>
        <div class="ticket-area" contenteditable="false">${taskText}</div>
        <div class="lock"><i class="fa-solid fa-lock"></i></div>
    `;

    // Append the ticket to the correct column based on its color
    let targetColumn = document.querySelector(`.main-ticket-cont[data-color="${priorityColor}"]`);
    if (targetColumn) {
        targetColumn.appendChild(ticketCont);
    } else {
        console.error(`No column found for color: ${priorityColor}`);
    }

    // Add event listeners to the ticket
    addTicketEventListeners(ticketCont);

    // If this is a new task (not loaded from localStorage), save it
    if (!ticketId) {
        ticketArr.push({ task: taskText, color: priorityColor, dueDate: dueDate, id: id });
        updateLocalStorage();
    }
}

// Function to format due date for display
function formatDueDate(dueDate) {
    if (dueDate) {
        let date = new Date(dueDate);
        return date.toLocaleDateString();
    } else {
        return 'No Due Date';
    }
}

// Function to get status indicator based on due date
function getStatusIndicator(dueDate) {
    if (!dueDate) return '';

    let today = new Date();
    let due = new Date(dueDate);
    let diffTime = due - today;
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return 'Overdue';
    } else if (diffDays === 0) {
        return 'Due Today';
    } else if (diffDays <= 7) {
        return 'Due Soon';
    } else {
        return '';
    }
}

// Function to add event listeners to tickets
function addTicketEventListeners(ticketCont) {
    let id = ticketCont.getAttribute('data-id');
    let taskArea = ticketCont.querySelector('.ticket-area');
    let lockIcon = ticketCont.querySelector('.lock i');

    // Lock/Unlock functionality
    lockIcon.addEventListener('click', function () {
        if (lockIcon.classList.contains('fa-lock')) {
            lockIcon.classList.remove('fa-lock');
            lockIcon.classList.add('fa-lock-open');
            taskArea.setAttribute('contenteditable', 'true');
            taskArea.focus();
        } else {
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

            // Update the ticket's color class to match the column's color
            let newColor = column.getAttribute('data-color');
            let currentColor = ticket.getAttribute('data-color');
            ticket.classList.remove(currentColor);
            ticket.classList.add(newColor);
            ticket.setAttribute('data-color', newColor);

            // Update background color of ticket-area
            let ticketArea = ticket.querySelector('.ticket-area');
            ticketArea.classList.remove(currentColor);
            ticketArea.classList.add(newColor);

            // Update the color in due-date-status
            let dueDateStatus = ticket.querySelector('.due-date-status');
            dueDateStatus.classList.remove(currentColor);
            dueDateStatus.classList.add(newColor);

            // Update the color in ticketArr
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
    // Your existing toolbox functionality (if any)
});
