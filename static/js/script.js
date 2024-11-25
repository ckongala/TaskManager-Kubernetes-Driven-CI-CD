const apiUrl = 'http://localhost:5000/tasks';

// Function to fetch and display tasks
function loadTasks() {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const taskList = document.getElementById('taskList');
            taskList.innerHTML = ''; // Clear current task list
            data.tasks.forEach(task => {
                const taskItem = document.createElement('li');
                taskItem.classList.add('task-item');
                taskItem.innerHTML = `
                    <strong>${task.title}</strong><br>
                    ${task.description}<br>
                    <input type="checkbox" ${task.done ? 'checked' : ''} onchange="toggleTask(${task.id})"> Done
                    <button class="edit" onclick="editTask(${task.id}, '${task.title}', '${task.description}')">Edit</button>
                    <button class="delete" onclick="deleteTask(${task.id})">Delete</button>
                `;
                taskList.appendChild(taskItem);
            });
        })
        .catch(error => console.error('Error loading tasks:', error));
}

// Function to create a task
document.getElementById('createTaskBtn').addEventListener('click', function () {
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;

    if (!title) {
        alert('Title is required');
        return;
    }

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title: title,
            description: description
        })
    })
    .then(response => response.json())
    .then(() => {
        loadTasks(); // Reload tasks after creation
        document.getElementById('taskTitle').value = '';
        document.getElementById('taskDescription').value = '';
    })
    .catch(error => console.error('Error creating task:', error));
});

// Function to delete a task
function deleteTask(taskId) {
    fetch(`${apiUrl}/${taskId}`, {
        method: 'DELETE'
    })
    .then(() => {
        loadTasks(); // Reload tasks after deletion
    })
    .catch(error => console.error('Error deleting task:', error));
}

// Function to edit a task
function editTask(taskId, title, description) {
    const newTitle = prompt("Edit task title", title);
    const newDescription = prompt("Edit task description", description);

    if (newTitle !== null && newTitle !== title) {
        fetch(`${apiUrl}/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: newTitle,
                description: newDescription
            })
        })
        .then(() => loadTasks()) // Reload tasks after update
        .catch(error => console.error('Error updating task:', error));
    }
}

// Function to toggle task completion
function toggleTask(taskId) {
    fetch(`${apiUrl}/${taskId}`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(task => {
        fetch(`${apiUrl}/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                done: !task.done
            })
        })
        .then(() => loadTasks()) // Reload tasks after updating status
        .catch(error => console.error('Error toggling task:', error));
    });
}

// Load tasks on page load
window.onload = loadTasks;
