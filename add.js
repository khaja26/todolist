document.addEventListener('DOMContentLoaded', async () => {
    let db;

    // Initialize SQLite Database
    async function initDatabase() {
        // Load sql.js from CDN
        const SQL = await initSqlJs({ 
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}` 
        });

        // Try to load the database from localStorage, if it exists
        const savedDB = localStorage.getItem('tasksDB');
        if (savedDB) {
            // Load the existing database from localStorage
            db = new SQL.Database(new Uint8Array(JSON.parse(savedDB)));
        } else {
            // Create a new database if none exists
            db = new SQL.Database();
        }

        // Create the 'tasks' table if it doesn't exist already
        db.run(`CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY, name TEXT, date TEXT, time TEXT);`);
        
        // Load and display existing tasks from the database
        loadTasks();
    }

    // Save the database to localStorage
    function saveDatabase() {
        const data = db.export(); // Export the current database state
        // Save the database as a JSON string in localStorage
        localStorage.setItem('tasksDB', JSON.stringify([...new Uint8Array(data)]));
    }

    // Load tasks from the database and display them in the table
    function loadTasks() {
        const result = db.exec("SELECT * FROM tasks;");
        const taskTableBody = document.getElementById('taskTableBody');
        taskTableBody.innerHTML = ''; // Clear the table before reloading tasks

        if (result.length > 0) {
            // Iterate through each task and add a row to the table
            result[0].values.forEach(([id, name, date, time]) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${name}</td>
                    <td>${date}</td>
                    <td>${time}</td>
                `;
                taskTableBody.appendChild(row);
            });
        }
    }

    // Submit a new task to the SQLite Database
    async function submitTask() {
        const task = document.getElementById('taskInput').value;
        const date = document.getElementById('taskDate').value;
        const time = document.getElementById('taskTime').value;

        // Check if any field is empty
        if (!task || !date || !time) {
            alert('Please fill all fields!');
            return;
        }

        // Insert the new task into the database
        db.run(`INSERT INTO tasks (name, date, time) VALUES (?, ?, ?);`, [task, date, time]);
        alert('Task added successfully!');

        // Clear the input fields after submission
        document.getElementById('taskInput').value = '';
        document.getElementById('taskDate').value = '';
        document.getElementById('taskTime').value = '';

        // Reload tasks to update the table and save the updated database to localStorage
        loadTasks();
        saveDatabase();
    }

    // Expose the submitTask function to the global scope for use in the HTML file
    window.submitTask = submitTask;

    // Initialize the SQLite database on page load
    await initDatabase();
});
