// Open a tab by showing its content and marking it as active
function openTab(e, tabId) {
    const tabContents = document.getElementsByClassName("tabcontent");
    const tabLinks = document.getElementsByClassName("tablinks");

    // Hide all tab contents
    Array.from(tabContents).forEach(content => content.style.display = "none");

    // Remove "active" class from all tab links
    Array.from(tabLinks).forEach(link => link.className = link.className.replace(" active", ""));

    // Display the selected tab and add "active" class to the clicked tab link
    document.getElementById(tabId).style.display = "block";
    e.currentTarget.className += " active";
}

// Display a single result in a table
function displayResult(username, accountId, platform, container) {
    const table = document.createElement("table");
    table.classList.add("result-table");

    // Header row
    const headerRow = document.createElement("tr");
    ["Username", "Account ID", "Platform"].forEach(headerText => {
        const th = document.createElement("th");
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Data row
    const dataRow = document.createElement("tr");
    [username, accountId, platform].forEach(dataText => {
        const td = document.createElement("td");
        td.textContent = dataText;
        dataRow.appendChild(td);
    });
    table.appendChild(dataRow);

    // Append the table to the specified container
    container.appendChild(table);
}

// Fetch account data from the API
function fetchAccounts(username, page = 0) {
    document.getElementById("result-display").innerHTML = ""; // Clear previous results

    axios.get("https://fortniteapi.io/v2/lookup/advanced", {
        params: { username: username, page: page },
        headers: {
            Authorization: "ff7a89f4-e7e42288-4e7b78f9-62ee618b",
            accept: "application/json"
        }
    })
    .then(response => {
        const data = response.data;
        if (data.matches.length === 0) {
            displayNotFound(); // Display a not found message
        } else {
            displayResults(data.matches);
            if (data.hasMore) fetchAccounts(username, page + 1); // Fetch more if available
        }
    })
    .catch(error => {
        console.error("Error fetching data:", error);
        displayError(); // Display an error message
    });
}

// Display multiple results in a table
function displayResults(matches) {
    const resultContainer = document.getElementById("result-display");
    const table = document.createElement("table");
    table.classList.add("result-table");

    // Header row
    const headerRow = document.createElement("tr");
    ["Username", "Account ID", "Platform"].forEach(headerText => {
        const th = document.createElement("th");
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Data rows
    matches.forEach(match => {
        const row = document.createElement("tr");
        const username = match.matches[0]?.value || "404 Not Found"; // Fallback for missing data
        const accountId = match.accountId || "404 Not Found"; // Fallback for missing data
        const platform = match.matches[0]?.platform || "404 Not Found"; // Fallback for missing data

        [username, accountId, platform].forEach(dataText => {
            const td = document.createElement("td");
            td.textContent = dataText;
            row.appendChild(td);
        });

        table.appendChild(row);
    });

    resultContainer.appendChild(table);

    // Adjust max height
    const footerHeight = document.querySelector("footer").offsetHeight;
    resultContainer.style.maxHeight = `calc(100vh - ${footerHeight + 50}px)`; // Ensure enough space for footer
}

// Initialize form event listeners on DOM load
document.addEventListener("DOMContentLoaded", function () {
    const lookupForm = document.getElementById("lookupForm");
    const usernameInput = document.getElementById("username");
    const platformInput = document.getElementById("platform");
    const resultDisplay = document.getElementById("result-display");

    lookupForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const username = usernameInput.value.trim();
        const platform = platformInput.value;

        if (!username) {
            alert("Please enter a username."); // Alert for missing username
            return;
        }

        const searchURL = `https://fortniteapi.io/v1/lookup?username=${username}&platform=${platform}`;
        console.log("Search URL:", searchURL);

        fetch(searchURL, {
            method: "GET",
            headers: {
                Authorization: "ff7a89f4-e7e42288-4e7b78f9-62ee618b",
                Accept: "application/json"
            }
        })
        .then(response => {
            console.log("Response status:", response.status);
            if (response.ok) return response.json();
            throw new Error("Network response was not ok");
        })
        .then(data => {
            console.log("Response data:", data);
            if (data.result) {
                const accountId = data.account_id;
                resultDisplay.innerHTML = ""; // Clear previous results
                if (accountId) {
                    displayResult(username, accountId, platform, resultDisplay);
                } else {
                    resultDisplay.textContent = "No account ID found for the given username."; // Update message
                }
            } else {
                resultDisplay.textContent = "No account found for the given username."; // Update message
            }
        })
        .catch(error => {
            console.error("Error:", error);
            resultDisplay.textContent = "An error occurred while fetching data."; // Update message
        });
    });

    // Additional fetchAccounts call
    lookupForm.addEventListener("submit", function (e) {
        e.preventDefault();
        fetchAccounts(usernameInput.value);
    });
});
