// js/app.js

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. Theme Challenge (Light / Dark Mode)
    // ==========================================
    const themeToggle = document.getElementById('theme-toggle');
    let currentTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', currentTheme);

    themeToggle.addEventListener('click', () => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', currentTheme);
        localStorage.setItem('theme', currentTheme);
    });

    // ==========================================
    // 2. Greeting & Custom Name Challenge
    // ==========================================
    const clockEl = document.getElementById('clock');
    const dateEl = document.getElementById('date-display');
    const greetingMsgEl = document.getElementById('greeting-message');
    const nameInput = document.getElementById('user-name-input');
    
    // Sets a default value specifically customized to your context
    let userName = localStorage.getItem('userName') || 'Ammar';
    nameInput.value = userName;

    function updateClock() {
        const now = new Date();
        clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        dateEl.textContent = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
        
        const hour = now.getHours();
        let timeGreeting = 'Good evening';
        if (hour < 12) timeGreeting = 'Good morning';
        else if (hour < 18) timeGreeting = 'Good afternoon';
        
        greetingMsgEl.textContent = `${timeGreeting}, ${userName}.`;
    }

    nameInput.addEventListener('input', (e) => {
        userName = e.target.value.trim() || 'Ammar';
        localStorage.setItem('userName', userName);
        updateClock();
    });

    setInterval(updateClock, 1000);
    updateClock();

    // ==========================================
    // 3. Focus Timer & Change Pomodoro Time
    // ==========================================
    let timerInterval;
    let timeLeft = localStorage.getItem('pomodoroTime') ? parseInt(localStorage.getItem('pomodoroTime')) * 60 : 25 * 60;
    let isRunning = false;

    const timerDisplay = document.getElementById('timer-display');
    const timeInput = document.getElementById('pomodoro-time');
    
    timeInput.value = localStorage.getItem('pomodoroTime') || 25;

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        timerDisplay.textContent = `${m}:${s}`;
    }

    timeInput.addEventListener('change', (e) => {
        if (!isRunning) {
            let newMins = parseInt(e.target.value);
            if (newMins < 1) newMins = 1;
            localStorage.setItem('pomodoroTime', newMins);
            timeLeft = newMins * 60;
            formatTime(timeLeft);
        }
    });

    document.getElementById('timer-start').addEventListener('click', () => {
        if (isRunning) return;
        isRunning = true;
        timerInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                formatTime(timeLeft);
            } else {
                clearInterval(timerInterval);
                isRunning = false;
                alert("Time's up! Take a break.");
            }
        }, 1000);
    });

    document.getElementById('timer-stop').addEventListener('click', () => {
        clearInterval(timerInterval);
        isRunning = false;
    });

    document.getElementById('timer-reset').addEventListener('click', () => {
        clearInterval(timerInterval);
        isRunning = false;
        timeLeft = parseInt(timeInput.value) * 60;
        formatTime(timeLeft);
    });

    formatTime(timeLeft);

    // ==========================================
    // 4. To-Do List (Duplicate Prevention & Sorting)
    // ==========================================
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const errorMsg = document.getElementById('task-error');

    function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            if (task.done) li.classList.add('done');
            
            li.innerHTML = `
                <span style="cursor:pointer; flex:1" onclick="toggleTask(${index})">${task.text}</span>
                <div class="button-group">
                    <button class="btn btn-small" onclick="editTask(${index})">Edit</button>
                    <button class="btn btn-small" onclick="deleteTask(${index})">X</button>
                </div>
            `;
            taskList.appendChild(li);
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    document.getElementById('add-task-btn').addEventListener('click', () => {
        const text = taskInput.value.trim();
        errorMsg.textContent = '';
        
        if (!text) return;

        // Challenge: Prevent duplicate tasks
        const isDuplicate = tasks.some(t => t.text.toLowerCase() === text.toLowerCase());
        if (isDuplicate) {
            errorMsg.textContent = "Task already exists.";
            return;
        }

        tasks.push({ text, done: false });
        taskInput.value = '';
        renderTasks();
    });

    window.toggleTask = (index) => {
        tasks[index].done = !tasks[index].done;
        renderTasks();
    };

    window.deleteTask = (index) => {
        tasks.splice(index, 1);
        renderTasks();
    };

    window.editTask = (index) => {
        const newText = prompt("Edit task:", tasks[index].text);
        if (newText !== null && newText.trim() !== '') {
            tasks[index].text = newText.trim();
            renderTasks();
        }
    };

    // Challenge: Sort tasks A-Z
    document.getElementById('sort-task-btn').addEventListener('click', () => {
        tasks.sort((a, b) => a.text.localeCompare(b.text));
        renderTasks();
    });

    renderTasks();

    // ==========================================
    // 5. Quick Links
    // ==========================================
    let links = JSON.parse(localStorage.getItem('links')) || [];
    const linkName = document.getElementById('link-name');
    const linkUrl = document.getElementById('link-url');
    const linksList = document.getElementById('quick-links-list');

    function renderLinks() {
        linksList.innerHTML = '';
        links.forEach((link, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <a href="${link.url}" target="_blank">${link.name}</a>
                <button class="btn-icon" onclick="deleteLink(${index})" style="color:var(--accent-color)">[X]</button>
            `;
            linksList.appendChild(li);
        });
        localStorage.setItem('links', JSON.stringify(links));
    }

    document.getElementById('add-link-btn').addEventListener('click', () => {
        let url = linkUrl.value.trim();
        const name = linkName.value.trim();
        
        if (!name || !url) return;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        links.push({ name, url });
        linkName.value = '';
        linkUrl.value = '';
        renderLinks();
    });

    window.deleteLink = (index) => {
        links.splice(index, 1);
        renderLinks();
    };

    renderLinks();
});