const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const taskCount = document.getElementById("task-count");
const filterButtons = document.querySelectorAll(".filter-btn");

// Load data when page loads
document.addEventListener('DOMContentLoaded', () => {
    showData();
    updateTaskCount();
});

const addTask = () => {
    if (inputBox.value.trim() === '') {
        showNotification("Please enter a task!");
        return;
    }
    
    createTaskElement(inputBox.value.trim());
    inputBox.value = '';
    saveData();
    updateTaskCount();
    showNotification("Task added successfully!");
}

const createTaskElement = (taskText) => {
    let li = document.createElement("li");
    li.innerHTML = taskText;
    listContainer.appendChild(li);
    
    let span = document.createElement("span");
    span.innerHTML = '<i class="fas fa-times"></i>';
    li.appendChild(span);
    
    // Add creation date
    li.dataset.created = new Date().toISOString();
    li.dataset.completed = "";
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
        switch(filter) {
            case 'pending':
                task.style.display = task.classList.contains("checked") ? "none" : "";
                break;
            case 'completed':
                task.style.display = task.classList.contains("checked") ? "" : "none";
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
        
        // Reattach event listeners to saved tasks
        const tasks = listContainer.querySelectorAll("li");
        tasks.forEach(task => {
            if (!task.querySelector("span")) {
                let span = document.createElement("span");
                span.innerHTML = '<i class="fas fa-times"></i>';
                task.appendChild(span);
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