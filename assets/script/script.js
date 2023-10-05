$(document).ready(function () {
    // Function to add a conversion to the search history
    function addToHistory(fromCurrency, toCurrency, amount, result) {
        const historyItem = { fromCurrency, toCurrency, amount, result };
        const historyItemString = JSON.stringify(historyItem);
        saveToLocalStorage(historyItemString);

        const listItem = $('<li>');
        listItem.html(`<a href="#" data-history="${historyItemString}">${fromCurrency} to ${toCurrency}: ${amount} = ${result}</a>`);
        $('#history-list').append(listItem);

        listItem.on('click', function (e) {
            e.preventDefault();
            const historyItemString = $(this).find('a').data('history');
            const { fromCurrency, toCurrency, amount, result } = JSON.parse(historyItemString);
            $('#fromCurrencySelect').val(fromCurrency);
            $('#toCurrencySelect').val(toCurrency);
            $('#amountInput').val(amount);
            $('#resultInput').val(result);
        });
    }

    // Function to save a string to local storage
    function saveToLocalStorage(data) {
        const existingHistory = JSON.parse(localStorage.getItem('conversionHistory')) || [];
        existingHistory.push(data);
        localStorage.setItem('conversionHistory', JSON.stringify(existingHistory));
    }

    // Function to load conversion history from local storage
    function loadConversionHistoryFromLocalStorage() {
        const historyData = JSON.parse(localStorage.getItem('conversionHistory')) || [];
        historyData.forEach(function (historyItemString) {
            addToHistoryFromLocalStorage(historyItemString);
        });
    }

    // Load conversion history from local storage when the page loads
    loadConversionHistoryFromLocalStorage();

    // Show the search history when the button is clicked
    $('#showHistoryButton').on('click', function () {
        $('#history-list').toggle(); // Toggle the visibility of the history list
    });
    
    // ...
});
