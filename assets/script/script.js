// Function to add a conversion to the search history
function addToHistory(fromCurrency, toCurrency, amount, result) {
    const historyItem = { fromCurrency, toCurrency, amount, result };
    // Convert the historyItem object to a JSON string
    const historyItemString = JSON.stringify(historyItem);
    // Save the conversion to local storage as a string
    saveToLocalStorage(historyItemString);
    // Add the conversion to the history list
    const historyList = document.getElementById('history-list');
    const listItem = document.createElement('li');
    listItem.innerHTML = `<a href="#" data-history="${historyItemString}">${fromCurrency} to ${toCurrency}: ${amount} = ${result}</a>`;
    historyList.appendChild(listItem);

    // Add a click event listener to the new history item
    listItem.addEventListener('click', (e) => {
        e.preventDefault();
        // Parse the JSON string to retrieve the history data
        const historyItemString = e.target.getAttribute('data-history');
        const { from, to, amount, result } = JSON.parse(historyItemString);
        fromCurrencySelect.value = from;
        toCurrencySelect.value = to;
        amountInput.value = amount;
        resultInput.value = result;
    });
}


// Function to save a string to local storage
function saveToLocalStorage(data) {
    // Retrieve existing history data from local storage
    const existingHistory = JSON.parse(localStorage.getItem('conversionHistory')) || [];
    // Add the new data to the existing history array
    existingHistory.push(data);
    // Save the updated history array to local storage
    localStorage.setItem('conversionHistory', JSON.stringify(existingHistory));
}

// ...

// Function to load conversion history from local storage
function loadConversionHistoryFromLocalStorage() {
    const historyData = JSON.parse(localStorage.getItem('conversionHistory')) || [];
    historyData.forEach(function (historyItemString) {
        addToHistoryFromLocalStorage(historyItemString);
    });
}

// Load conversion history from local storage when the page loads
loadConversionHistoryFromLocalStorage();

// ...

