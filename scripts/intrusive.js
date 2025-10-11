/**
=========================================
        💭 AFFIRMATIONS & SELF-TALK 💙
=========================================
**/

// Global affirmation array
const affirmations = [
    "You are doing your best, and that is enough.",
    "Every breath is a chance to begin again.",
    "You are worthy of peace and love.",
    "It's okay to rest. Rest is productive too.",
    "You are not alone. You are supported.",
    "Your feelings are valid. Always.",
    "You are enough, just as you are.",
    "It's okay to take it one step at a time.",
    "Progress, not perfection.",
    "You are deserving of self-compassion.",
    "Your past does not define your future.",
    "Small wins add up to big victories.",
    "You have the strength to overcome this.",
    "It's okay to ask for help.",
    "You are a work in progress, and that's okay.",
    "You are not your intrusive thoughts.",
    "Each moment is an opportunity to start fresh.",
    "You are allowed to have bad days.",
    "You are resilient, and you can handle this.",
    "Taking care of yourself is not selfish.",
    "You are more than your challenges."
];

// Display random affirmation on button click
function showAffirmation() {
    const randomIndex = Math.floor(Math.random() * affirmations.length);
    document.getElementById("affirmationBox").textContent = affirmations[randomIndex];
}


/**
=========================================
       🧾 LOG FORM BEHAVIOR & INPUTS ✍️
=========================================
**/

document.getElementById("logForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const category = document.getElementById("category").value;
    const description = document.getElementById("description").value;
    const trigger = document.getElementById("trigger").value;
    const intensity = document.getElementById("intensity").value;
    const coping = document.getElementById("coping").value;
    const outcome = document.getElementById("outcome").value;

    const newLogEntry = {
        category,
        description,
        trigger,
        intensity,
        coping,
        outcome,
        timestamp: new Date().toISOString()
    };

    saveLogEntry(newLogEntry);
    refreshDataAndCharts();
    document.getElementById("logForm").reset();
});


/**
=========================================
             💾 LOCAL STORAGE 🗂
=========================================
**/

function saveLogEntry(logEntry) {
    let logs = JSON.parse(localStorage.getItem('logEntries')) || [];
    logs.push(logEntry);
    localStorage.setItem('logEntries', JSON.stringify(logs));
}

function loadLogEntries() {
    const logs = JSON.parse(localStorage.getItem('logEntries')) || [];
    const logEntriesContainer = document.getElementById('logEntries');
    logEntriesContainer.innerHTML = '';
    logs.forEach((log, index) => {
        const logEntryDiv = document.createElement('div');
        logEntryDiv.classList.add('log-entry');
        const formattedDate = new Date(log.timestamp).toLocaleString();
        logEntryDiv.innerHTML = `
            <h3>${log.category} <small style="font-weight: normal; font-size: 0.8em; color: #666;">(${formattedDate})</small></h3>
            <p><strong>Description:</strong> ${log.description}</p>
            <p><strong>Trigger:</strong> ${log.trigger}</p>
            <p><strong>Intensity Level:</strong> ${log.intensity}/10</p>
            <p><strong>Coping Method:</strong> ${log.coping}</p>
            <p><strong>Outcome:</strong> ${log.outcome}</p>
            <button onclick="editEntry(${index})">Edit</button>
            <button onclick="deleteEntry(${index})">Delete</button>
        `;
        logEntriesContainer.appendChild(logEntryDiv);
    });
}


/**
=========================================
           ✏️ EDIT & DELETE ENTRIES ❌
=========================================
**/

function editEntry(index) {
    const logs = JSON.parse(localStorage.getItem('logEntries')) || [];
    const log = logs[index];
    document.getElementById('category').value = log.category;
    document.getElementById('description').value = log.description;
    document.getElementById('trigger').value = log.trigger;
    document.getElementById('intensity').value = log.intensity;
    document.getElementById('coping').value = log.coping;
    document.getElementById('outcome').value = log.outcome;

    logs.splice(index, 1);
    localStorage.setItem('logEntries', JSON.stringify(logs));
    refreshDataAndCharts();
}

function deleteEntry(index) {
    let logs = JSON.parse(localStorage.getItem('logEntries')) || [];
    logs.splice(index, 1);
    localStorage.setItem('logEntries', JSON.stringify(logs));
    refreshDataAndCharts();
}


/**
=========================================
              🥧 PIE CHART 📊
=========================================
**/

let pieChartInstance = null;

function renderPieChart() {
    const logs = JSON.parse(localStorage.getItem('logEntries')) || [];
    const counts = {};
    logs.forEach(log => {
        counts[log.category] = (counts[log.category] || 0) + 1;
    });

    const labels = Object.keys(counts);
    const data = Object.values(counts);

    const backgroundColors = [
        '#ffc1cc', '#ff8aa1', '#ff5c77', '#e64a6e', '#cc395e',
        '#b82e55', '#a3244a', '#8c1c41', '#741539', '#5c0f30'
    ];

    const ctx = document.getElementById('pieChart').getContext('2d');
    if (pieChartInstance) pieChartInstance.destroy();

    pieChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Behavior Distribution',
                data: data,
                backgroundColor: backgroundColors.slice(0, labels.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: { enabled: true }
            }
        }
    });
}


/**
=========================================
              📈 LINE GRAPH 📉
=========================================
**/

let lineChartInstance = null;

function renderLineGraph() {
    const logs = JSON.parse(localStorage.getItem('logEntries')) || [];

    const labels = logs.map((log, index) => {
        if (log.timestamp) {
            const date = new Date(log.timestamp);
            if (!isNaN(date)) {
                return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            }
        }
        return `Entry ${index + 1}`;
    });

    const intensityData = logs.map(log => Number(log.intensity) || 0);
    const ctx = document.getElementById('lineGraph').getContext('2d');
    if (lineChartInstance) lineChartInstance.destroy();

    lineChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Intensity Over Time',
                data: intensityData,
                fill: false,
                borderColor: '#ff5c77',
                backgroundColor: '#ff8aa1',
                tension: 0.3,
                pointRadius: 5,
                pointHoverRadius: 7,
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    title: { display: true, text: 'Intensity Level' }
                },
                x: {
                    title: { display: true, text: 'Date' }
                }
            },
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function(context) {
                            const log = logs[context.dataIndex];
                            if (log && log.timestamp) {
                                const date = new Date(log.timestamp);
                                return `Intensity: ${context.parsed.y} on ${date.toLocaleDateString()}`;
                            }
                            return `Intensity: ${context.parsed.y}`;
                        }
                    }
                }
            }
        }
    });
}


/**
=========================================
        🧰 COPING TOOLS & STRATEGIES 🌿
=========================================
**/

function showTool(tool) {
    const toolDisplay = document.getElementById("toolDisplay");
    let message = "";

    switch (tool) {
        case "fidget":
            message = "Try using a fidget toy, putty, or stress ball to release tension through movement. Focus on how it feels in your hands.";
            break;
        case "breathing":
            message = "Slow down and take deep breaths — in for 4, hold for 4, out for 6. Repeat until your body feels calmer.";
            break;
        case "distraction":
            message = "Try doing something that shifts your focus — go for a walk, doodle, play a short game, or listen to music you love.";
            break;
	case "journaling":
            message = "Write freely — no filter, no judgment. Let your thoughts spill out until they feel lighter. You don’t have to keep it tidy.";
            break;
	case "music":
            message = "Put on music that matches how you *want* to feel, not how you currently feel. Let rhythm guide your mood shift.";
            break;
        default:
            message = "Pick a tool to see suggestions for coping.";
    }

    toolDisplay.textContent = message;
}


/**
=========================================
           🔁 PAGE INITIALIZATION 🚀
=========================================
**/

function refreshDataAndCharts() {
    loadLogEntries();
    renderPieChart();
    renderLineGraph();
}

window.addEventListener('DOMContentLoaded', refreshDataAndCharts);
