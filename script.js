const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const taskCount = document.getElementById("task-count");
const filterButtons = document.querySelectorAll(".filter-btn");
let currentPriority = "high"; // Default priority
const priorityButtons = document.querySelectorAll(".priority-btn");

// Load data when page loads
document.addEventListener('DOMContentLoaded', () => {
    showData();
    updateTaskCount();
});

priorityButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all priority buttons
        priorityButtons.forEach(btn => btn.classList.remove("active"));
        // Add active class to clicked button
        button.classList.add("active");
        // Update current priority
        currentPriority = button.dataset.priority;
    });
});

const addTask = () => {
    if (inputBox.value.trim() === '') {
        showNotification("Please enter a task!");
        return;
    }
    
    createTaskElement(inputBox.value.trim(), currentPriority);
    inputBox.value = '';
    saveData();
    updateTaskCount();
    showNotification(`Task added with ${currentPriority} priority!`);
}

const createTaskElement = (taskText, priority = currentPriority) => {
    let li = document.createElement("li");
    li.className = `priority-${priority}`;
    
    // Add priority indicator
    const priorityDiv = document.createElement("div");
    priorityDiv.className = "task-priority";
    
    // Create task content container
    const contentDiv = document.createElement("div");
    contentDiv.className = "task-content";
    
    // Add priority label
    const priorityLabel = document.createElement("span");
    priorityLabel.className = "priority-label";
    priorityLabel.textContent = priority;
    
    // Add task text
    const taskSpan = document.createElement("span");
    taskSpan.textContent = taskText;
    
    // Assemble content
    contentDiv.appendChild(priorityLabel);
    contentDiv.appendChild(taskSpan);
    
    // Assemble task item
    li.appendChild(priorityDiv);
    li.appendChild(contentDiv);
    
    listContainer.appendChild(li);
    
    // Add delete button
    let span = document.createElement("span");
    span.innerHTML = '<i class="fas fa-times"></i>';
    li.appendChild(span);
    
    // Add creation date and priority
    li.dataset.created = new Date().toISOString();
    li.dataset.completed = "";
    li.dataset.priority = priority;
    
    return li;
}

listContainer.addEventListener('click', (e) => {
    if (e.target.tagName === "LI") {
        toggleTaskCompletion(e.target);
    }  
    else if (e.target.tagName === "SPAN" || e.target.parentElement.tagName === "SPAN") {
        const span = e.target.tagName === "SPAN" ? e.target : e.target.parentElement;
        deleteTask(span.parentElement);
    }
}, false);

const toggleTaskCompletion = (taskElement) => {
    taskElement.classList.toggle("checked");
    taskElement.dataset.completed = taskElement.classList.contains("checked") 
        ? new Date().toISOString() 
        : "";
    saveData();
    updateTaskCount();
}

const deleteTask = (taskElement) => {
    if (confirm("Are you sure you want to delete this task?")) {
        taskElement.remove();
        saveData();
        updateTaskCount();
        showNotification("Task deleted!");
    }
}

// Filter tasks
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove("active"));
        // Add active class to clicked button
        button.classList.add("active");
        
        const filter = button.dataset.filter;
        filterTasks(filter);
    });
});

const filterTasks = (filter) => {
    const tasks = listContainer.querySelectorAll("li");
    
    tasks.forEach(task => {
        const isCompleted = task.classList.contains("checked");
        const priority = task.dataset.priority;
        
        switch(filter) {
            case 'pending':
                task.style.display = isCompleted ? "none" : "";
                break;
            case 'completed':
                task.style.display = isCompleted ? "" : "none";
                break;
            case 'high-priority':
                task.style.display = priority === 'high' ? "" : "none";
                break;
            case 'medium-priority':
                task.style.display = priority === 'medium' ? "" : "none";
                break;
            case 'low-priority':
                task.style.display = priority === 'low' ? "" : "none";
                break;
            default:
                task.style.display = "";
        }
    });
}

const clearCompleted = () => {
    const completedTasks = listContainer.querySelectorAll("li.checked");
    
    if (completedTasks.length === 0) {
        showNotification("No completed tasks to clear!");
        return;
    }
    
    if (confirm(`Are you sure you want to delete ${completedTasks.length} completed task(s)?`)) {
        completedTasks.forEach(task => task.remove());
        saveData();
        updateTaskCount();
        showNotification("Completed tasks cleared!");
    }
}

const updateTaskCount = () => {
    const totalTasks = listContainer.querySelectorAll("li").length;
    const completedTasks = listContainer.querySelectorAll("li.checked").length;
    const pendingTasks = totalTasks - completedTasks;
    
    taskCount.textContent = `${pendingTasks} pending, ${completedTasks} completed - ${totalTasks} total`;
}

const showNotification = (message) => {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff5945;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = "slideOut 0.3s ease";
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

const saveData = () => {
    localStorage.setItem("todoData", listContainer.innerHTML);
}

const showData = () => {
    const savedData = localStorage.getItem("todoData");
    if (savedData) {
        listContainer.innerHTML = savedData;
        
        // Reattach event listeners and restore priority classes
        const tasks = listContainer.querySelectorAll("li");
        tasks.forEach(task => {
            // Restore priority class
            const priority = task.dataset.priority || 'medium';
            task.className = `priority-${priority} ${task.classList.contains('checked') ? 'checked' : ''}`;
            
            // Add delete button if missing
            if (!task.querySelector("span")) {
                let span = document.createElement("span");
                span.innerHTML = '<i class="fas fa-times"></i>';
                task.appendChild(span);
            }
            
            // Ensure priority indicator exists
            if (!task.querySelector(".task-priority")) {
                const priorityDiv = document.createElement("div");
                priorityDiv.className = "task-priority";
                task.prepend(priorityDiv);
            }
            
            // Ensure priority label exists in content
            if (!task.querySelector(".priority-label")) {
                const content = task.querySelector(".task-content") || task;
                const text = content.textContent || content.innerHTML;
                const priority = task.dataset.priority || 'medium';
                
                // Clear and rebuild content
                content.innerHTML = '';
                
                const priorityLabel = document.createElement("span");
                priorityLabel.className = "priority-label";
                priorityLabel.textContent = priority;
                
                const taskSpan = document.createElement("span");
                taskSpan.textContent = text.replace('×', '').trim();
                
                content.appendChild(priorityLabel);
                content.appendChild(taskSpan);
            }
        });
    }
}

// Add keyboard support
inputBox.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        addTask();
    }
});

// This function to allow changing priority of existing tasks
const updateTaskPriority = (taskElement, newPriority) => {
    // Remove old priority class
    taskElement.classList.remove(`priority-${taskElement.dataset.priority}`);
    
    // Update priority
    taskElement.dataset.priority = newPriority;
    taskElement.className = `priority-${newPriority} ${taskElement.classList.contains('checked') ? 'checked' : ''}`;
    
    // Update priority label
    const priorityLabel = taskElement.querySelector(".priority-label");
    if (priorityLabel) {
        priorityLabel.textContent = newPriority;
        priorityLabel.className = "priority-label";
    }
    
    // Update priority indicator
    const priorityIndicator = taskElement.querySelector(".task-priority");
    if (priorityIndicator) {
        priorityIndicator.className = "task-priority";
    }
    
    saveData();
    showNotification(`Task priority changed to ${newPriority}!`);
}

// This to your existing event listeners
listContainer.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === "LI" || e.target.closest("li")) {
        e.preventDefault();
        const taskElement = e.target.tagName === "LI" ? e.target : e.target.closest("li");
        showPriorityMenu(e, taskElement);
    }
});

// Add priority context menu function
const showPriorityMenu = (event, taskElement) => {
    // Remove existing menu if any
    const existingMenu = document.querySelector(".priority-menu");
    if (existingMenu) existingMenu.remove();
    
    // Create menu
    const menu = document.createElement("div");
    menu.className = "priority-menu";
    menu.innerHTML = `
        <div class="menu-item" data-priority="high">
            <div class="priority-dot high"></div>
            High Priority
        </div>
        <div class="menu-item" data-priority="medium">
            <div class="priority-dot medium"></div>
            Medium Priority
        </div>
        <div class="menu-item" data-priority="low">
            <div class="priority-dot low"></div>
            Low Priority
        </div>
    `;
    
    // Style the menu
    menu.style.cssText = `
        position: fixed;
        top: ${event.clientY}px;
        left: ${event.clientX}px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        padding: 8px 0;
        z-index: 1001;
        min-width: 180px;
    `;
    
    document.body.appendChild(menu);
    
    // Add click handlers
    menu.querySelectorAll(".menu-item").forEach(item => {
        item.addEventListener('click', () => {
            const newPriority = item.dataset.priority;
            updateTaskPriority(taskElement, newPriority);
            menu.remove();
        });
        
        // Style menu items
        item.style.cssText = `
            padding: 10px 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
            transition: background 0.2s;
        `;
        
        item.addEventListener('mouseenter', () => {
            item.style.background = '#f5f5f5';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.background = 'white';
        });
    });
    
    // Style priority dots
    const style = document.createElement('style');
    style.textContent = `
        .priority-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
        }
        .priority-dot.high { background: #dc3545; }
        .priority-dot.medium { background: #ffc107; }
        .priority-dot.low { background: #28a745; }
    `;
    document.head.appendChild(style);
    
    // Close menu when clicking outside
    setTimeout(() => {
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
                document.removeEventListener('contextmenu', closeMenu);
            }
        };
        document.addEventListener('click', closeMenu);
        document.addEventListener('contextmenu', closeMenu);
    }, 0);
}