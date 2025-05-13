const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const taskCount = document.getElementById("task-count");
const filterButtons = document.querySelectorAll(".filter-btn");

// Priority variables
let currentPriority = "high";
const priorityButtons = document.querySelectorAll(".priority-btn");

// Load data when page loads
document.addEventListener('DOMContentLoaded', () => {
    showData();
    updateTaskCount();
    
    // Initialize priority buttons
    priorityButtons.forEach(button => {
        button.addEventListener('click', () => {
            priorityButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            currentPriority = button.dataset.priority;
        });
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
    li.dataset.priority = priority;
    li.dataset.created = new Date().toISOString();
    li.dataset.completed = "";
    
    // Create priority indicator (colored bar on left)
    const priorityIndicator = document.createElement("div");
    priorityIndicator.className = "task-priority";
    
    // Create checkbox area (the ::before will handle the visual)
    
    // Create task content container
    const contentDiv = document.createElement("div");
    contentDiv.className = "task-content";
    
    // Create priority label
    const priorityLabel = document.createElement("span");
    priorityLabel.className = "priority-label";
    priorityLabel.textContent = priority.toUpperCase();
    
    // Create task text span
    const taskTextSpan = document.createElement("span");
    taskTextSpan.className = "task-text";
    taskTextSpan.textContent = taskText;
    
    // Assemble content
    contentDiv.appendChild(priorityLabel);
    contentDiv.appendChild(taskTextSpan);
    
    // Assemble task item
    li.appendChild(priorityIndicator);
    li.appendChild(contentDiv);
    
    // Create delete button
    const deleteSpan = document.createElement("span");
    deleteSpan.innerHTML = '<i class="fas fa-times"></i>';
    deleteSpan.className = "delete-btn";
    
    // Add to list
    li.appendChild(deleteSpan);
    listContainer.appendChild(li);
    
    return li;
}

listContainer.addEventListener('click', (e) => {
    // Check if clicked on delete button or its icon
    if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
        const li = e.target.closest('li');
        if (li) {
            deleteTask(li);
        }
    }
    // Check if clicked on LI (task item) but not on delete button
    else if (e.target.tagName === "LI" || e.target.closest("li")) {
        const li = e.target.tagName === "LI" ? e.target : e.target.closest("li");
        toggleTaskCompletion(li);
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
        filterButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        
        const filter = button.dataset.filter;
        filterTasks(filter);
    });
});

const filterTasks = (filter) => {
    const tasks = listContainer.querySelectorAll("li");
    
    tasks.forEach(task => {
        const isCompleted = task.classList.contains("checked");
        const priority = task.dataset.priority || 'medium';
        
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
    
    setTimeout(() => {
        notification.style.animation = "slideOut 0.3s ease";
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS for notifications
if (!document.querySelector('style[data-notifications]')) {
    const style = document.createElement('style');
    style.setAttribute('data-notifications', 'true');
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
}

const saveData = () => {
    // Save only the essential data, not the entire HTML
    const tasks = listContainer.querySelectorAll("li");
    const taskData = Array.from(tasks).map(task => ({
        text: task.querySelector('.task-text')?.textContent || '',
        priority: task.dataset.priority || 'medium',
        completed: task.classList.contains('checked'),
        created: task.dataset.created || new Date().toISOString(),
        completedDate: task.dataset.completed || ''
    }));
    
    localStorage.setItem("todoData", JSON.stringify(taskData));
}

const showData = () => {
    const savedData = localStorage.getItem("todoData");
    if (savedData) {
        try {
            const taskData = JSON.parse(savedData);
            listContainer.innerHTML = ''; // Clear existing tasks
            
            taskData.forEach(task => {
                const li = createTaskElement(task.text, task.priority);
                
                if (task.completed) {
                    li.classList.add("checked");
                    li.dataset.completed = task.completedDate || new Date().toISOString();
                }
                
                li.dataset.created = task.created || new Date().toISOString();
            });
        } catch (e) {
            console.error("Error loading saved data:", e);
            // Fallback to old method if JSON parsing fails
            const oldData = localStorage.getItem("data");
            if (oldData) {
                listContainer.innerHTML = oldData;
                // Try to fix any old tasks
                const oldTasks = listContainer.querySelectorAll("li");
                oldTasks.forEach(task => {
                    if (!task.querySelector('.task-content')) {
                        // This is an old format task, recreate it
                        const text = task.textContent.replace('×', '').trim();
                        const priorityMatch = text.match(/\b(HIGH|MEDIUM|LOW)\b/i);
                        let priority = 'medium';
                        let actualText = text;
                        
                        if (priorityMatch) {
                            priority = priorityMatch[0].toLowerCase();
                            actualText = text.replace(priorityMatch[0], '').trim();
                        }
                        
                        // Create new structure
                        task.innerHTML = '';
                        task.className = `priority-${priority}`;
                        task.dataset.priority = priority;
                        
                        const priorityIndicator = document.createElement("div");
                        priorityIndicator.className = "task-priority";
                        
                        const contentDiv = document.createElement("div");
                        contentDiv.className = "task-content";
                        
                        const priorityLabel = document.createElement("span");
                        priorityLabel.className = "priority-label";
                        priorityLabel.textContent = priority.toUpperCase();
                        
                        const taskTextSpan = document.createElement("span");
                        taskTextSpan.className = "task-text";
                        taskTextSpan.textContent = actualText;
                        
                        contentDiv.appendChild(priorityLabel);
                        contentDiv.appendChild(taskTextSpan);
                        
                        task.appendChild(priorityIndicator);
                        task.appendChild(contentDiv);
                        
                        const deleteSpan = document.createElement("span");
                        deleteSpan.innerHTML = '<i class="fas fa-times"></i>';
                        deleteSpan.className = "delete-btn";
                        task.appendChild(deleteSpan);
                    }
                });
            }
        }
    }
    updateTaskCount();
}

// Add keyboard support
inputBox.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        addTask();
    }
});

// Add priority context menu
listContainer.addEventListener('contextmenu', (e) => {
    if (e.target.closest("li")) {
        e.preventDefault();
        const taskElement = e.target.closest("li");
        showPriorityMenu(e, taskElement);
    }
});

const showPriorityMenu = (event, taskElement) => {
    const existingMenu = document.querySelector(".priority-menu");
    if (existingMenu) existingMenu.remove();
    
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
    
    // Add menu item styles
    const menuItems = menu.querySelectorAll(".menu-item");
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            updateTaskPriority(taskElement, item.dataset.priority);
            menu.remove();
        });
        
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
    
    // Add priority dot styles
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

const updateTaskPriority = (taskElement, newPriority) => {
    taskElement.classList.remove(`priority-${taskElement.dataset.priority}`);
    taskElement.dataset.priority = newPriority;
    taskElement.className = `priority-${newPriority} ${taskElement.classList.contains('checked') ? 'checked' : ''}`;
    
    // Update priority label
    const priorityLabel = taskElement.querySelector(".priority-label");
    if (priorityLabel) {
        priorityLabel.textContent = newPriority.toUpperCase();
    }
    
    saveData();
    showNotification(`Task priority changed to ${newPriority}!`);
}

// Clear existing tasks and reload with proper structure
function fixExistingTasks() {
    const tasks = listContainer.querySelectorAll("li");
    if (tasks.length > 0) {
        const confirmFix = confirm("Found tasks with old structure. Would you like to fix them to show priority labels properly?");
        if (confirmFix) {
            tasks.forEach(task => {
                if (!task.querySelector('.task-content')) {
                    // This is an old format task
                    const text = task.textContent.replace('×', '').trim();
                    const priorityMatch = text.match(/\b(HIGH|MEDIUM|LOW)\b/i);
                    let priority = 'medium';
                    let actualText = text;
                    
                    if (priorityMatch) {
                        priority = priorityMatch[0].toLowerCase();
                        actualText = text.replace(priorityMatch[0], '').trim();
                    }
                    
                    // Check if task was completed
                    const wasChecked = task.classList.contains('checked');
                    
                    // Create new task element
                    const newTask = createTaskElement(actualText, priority);
                    if (wasChecked) {
                        newTask.classList.add("checked");
                    }
                    
                    // Replace old task with new one
                    task.parentNode.replaceChild(newTask, task);
                }
            });
            saveData();
            showNotification("Tasks fixed successfully!");
        }
    }
}

// Run fix on load if needed
setTimeout(fixExistingTasks, 1000);