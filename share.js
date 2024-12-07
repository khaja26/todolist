document.addEventListener('DOMContentLoaded', async () => {
    let db;

    // Initialize SQLite Database
    async function initDatabase() {
        const SQL = await initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}` });

        // Load the database from localStorage
        const savedDB = localStorage.getItem('tasksDB');
        if (savedDB) {
            db = new SQL.Database(new Uint8Array(JSON.parse(savedDB)));
        } else {
            db = new SQL.Database();
        }
    }

    // Fetch records for the selected date
    window.fetchRecords = function () {
        const date = document.getElementById('shareDate').value;
        if (!date) {
            alert('Please select a date!');
            return;
        }

        const result = db.exec(`SELECT name, time FROM tasks WHERE date = ?;`, [date]);
        const recordTableBody = document.getElementById('recordTableBody');
        recordTableBody.innerHTML = ''; // Clear the table before displaying new data

        if (result.length > 0) {
            result[0].values.forEach(([name, time]) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${name}</td>
                    <td>${time}</td>
                `;
                recordTableBody.appendChild(row);
            });
            document.getElementById('shareDataButton').disabled = false; // Enable the share button
        } else {
            recordTableBody.innerHTML = '<tr><td colspan="2">No records found for this date.</td></tr>';
            document.getElementById('shareDataButton').disabled = true; // Disable the share button
        }
    };

    // Share data
    window.shareData = function () {
        const date = document.getElementById('shareDate').value;
        if (!date) {
            alert('Please select a date!');
            return;
        }

        const result = db.exec(`SELECT name, time FROM tasks WHERE date = ?;`, [date]);
        if (result.length > 0) {
            const records = result[0].values.map(([name, time]) => `Task: ${name}, Time: ${time}`).join('\n');
            const shareData = {
                title: `Tasks for ${date}`,
                text: `Here are the tasks for ${date}:\n\n${records}`,
            };

            if (navigator.share) {
                navigator.share(shareData)
                    .then(() => alert('Data shared successfully!'))
                    .catch(err => alert(`Error sharing data: ${err}`));
            } else {
                alert('Sharing is not supported in this browser.');
            }
        } else {
            alert('No records to share for this date.');
        }
    };

    await initDatabase(); // Initialize the database on page load
});
