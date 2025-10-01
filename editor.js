let tabs = [];
let currentTab = -1;

// Add a new tab/file
function addTab(name = "untitled.py", code = "") {
    const tabIndex = tabs.length;
    tabs.push({name, code});

    // Create tab button
    const tabButton = document.createElement("button");
    tabButton.textContent = name;
    tabButton.onclick = () => switchTab(tabIndex);
    document.getElementById("tabs").appendChild(tabButton);

    // Create editor textarea
    const editor = document.createElement("textarea");
    editor.id = "editor-" + tabIndex;
    editor.value = code;
    editor.style.display = "none";
    editor.rows = 20;
    editor.cols = 80;
    document.getElementById("editors").appendChild(editor);

    switchTab(tabIndex);
}

// Switch between tabs
function switchTab(index) {
    if (currentTab >= 0) {
        const editor = document.getElementById("editor-" + currentTab);
        tabs[currentTab].code = editor.value;
        editor.style.display = "none";
    }
    currentTab = index;
    document.getElementById("editor-" + index).style.display = "block";
}

// Run current tab code
function runCurrent() {
    if (currentTab < 0) return;
    const code = document.getElementById("editor-" + currentTab).value;
    const formData = new FormData();
    formData.append("code", code);

    fetch("/run", { method: "POST", body: formData })
        .then(response => response.json())
        .then(data => {
            document.getElementById("output").textContent = data.output + data.errors;
        });
}

// Save current tab
function saveCurrent() {
    if (currentTab < 0) return;
    const filename = prompt("Enter filename:", tabs[currentTab].name);
    if (!filename) return;

    const code = document.getElementById("editor-" + currentTab).value;
    const formData = new FormData();
    formData.append("filename", filename);
    formData.append("code", code);

    fetch("/save", { method: "POST", body: formData })
        .then(response => response.json())
        .then(data => {
            alert(data.status);
            tabs[currentTab].name = filename;
            document.querySelectorAll("#tabs button")[currentTab].textContent = filename;
        });
}

// Open file into new tab
function openFile() {
    const filename = prompt("Enter filename to open:");
    if (!filename) return;

    fetch(`/open?filename=${encodeURIComponent(filename)}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                addTab(filename, data.code);
            }
        });
}

// Format current tab code with AutoPEP8
function formatAutopep8() {
    if (currentTab < 0) return;
    const code = document.getElementById("editor-" + currentTab).value;
    const formData = new FormData();
    formData.append("code", code);

    fetch("/format/autopep8", { method: "POST", body: formData })
        .then(response => response.json())
        .then(data => {
            document.getElementById("editor-" + currentTab).value = data.code;
        });
}

// Format current tab code with Black
function formatBlack() {
    if (currentTab < 0) return;
    const code = document.getElementById("editor-" + currentTab).value;
    const formData = new FormData();
    formData.append("code", code);

    fetch("/format/black", { method: "POST", body: formData })
        .then(response => response.json())
        .then(data => {
            document.getElementById("editor-" + currentTab).value = data.code;
        });
}

// Lint current tab code
function lintCurrent() {
    if (currentTab < 0) return;
    const code = document.getElementById("editor-" + currentTab).value;
    const formData = new FormData();
    formData.append("code", code);

    fetch("/lint", { method: "POST", body: formData })
        .then(response => response.json())
        .then(data => {
            alert(data.lint || "No linting errors");
        });
}

// Autocomplete (example: needs cursor position)
function autocomplete(line, column) {
    if (currentTab < 0) return;
    const code = document.getElementById("editor-" + currentTab).value;
    const formData = new FormData();
    formData.append("code", code);
    formData.append("line", line);
    formData.append("column", column);

    fetch("/autocomplete", { method: "POST", body: formData })
        .then(response => response.json())
        .then(data => {
            console.log("Completions:", data.completions);
        });
}

// Initialize with one default tab
addTab();
