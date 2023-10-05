$(document).ready(function () {
    var curSymbolResponse;
    var curSymbolResult;
    var currencyList;
    var currencyName;
    var currentExRate;

    var fromCurrency = $("#fromCurrency");
    var toCurrency = $("#toCurrency");
    var fromSymbol;
    var toSymbol;
    var conversionForm = $("#conversion-form");


    const ALPHAVANTAGE_APIKEY = "XE79THS7MSCL4AER";
    const EXCHANGERATE_APIKEY = "e16414f0258ef99126086274fc299335";


    getCurrency();
    conversionForm.on("submit", handleFormSubmission);



    async function getCurrency() {
        const url = `http://api.exchangeratesapi.io/v1/symbols?access_key=${EXCHANGERATE_APIKEY}`;


        try {
            curSymbolResponse = await fetch(url);
            curSymbolResult = await curSymbolResponse.json();
            if (curSymbolResult.hasOwnProperty("symbols") && curSymbolResult.symbols.length != 0) {
                currencyList = curSymbolResult.symbols;
                console.log(currencyList);
                renderAutoComp(currencyList);
            }
        } catch (error) {
            console.error(error);
        }
    }



    function handleFormSubmission(event) {
        event.preventDefault();

        if (checkUserInput()) {
            let url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${fromSymbol}&to_currency=${toSymbol}&apikey=${ALPHAVANTAGE_APIKEY}`;
            //console.log(url);
            getConversionRate(url);
        };

    }


    function checkUserInput() {
        //console.log(fromCurrency.val());
        //console.log(toCurrency.val());
        fromSymbol = getSymbolByName(currencyList, fromCurrency.val());
        toSymbol = getSymbolByName(currencyList, toCurrency.val());
        //console.log("from:"+fromSymbol);
        //console.log("to:"+toSymbol);


        if (currencyName.includes(fromCurrency.val()) && currencyName.includes(toCurrency.val())) {
            fromSymbol = getSymbolByName(currencyList, fromCurrency.val());
            toSymbol = getSymbolByName(currencyList, toCurrency.val());
            return true;
        }
        else {
            //TODO: convert to modal
            alert("Currency doesn't exist, choose from dropdown list.");
            return false;
        }
    };

    //getConversionRate();
    async function getConversionRate(url) {
        //const url = 'https://currency-conversion-and-exchange-rates.p.rapidapi.com/latest?from=USD&to=JPY';

        try {
            const response = await fetch(url);
            const result = await response.json();
            //console.log(result["Realtime Currency Exchange Rate"]["5. Exchange Rate"]);
            currentExRate = result["Realtime Currency Exchange Rate"]["5. Exchange Rate"];
            renderExRateResult(currentExRate);
        } catch (error) {
            console.error(error);
        }
    }




    function renderAutoComp(SymbolList) {
        //let autoPopList = SymbolList.map((element) => `${element.name}: ${element.code}`) ;


        currencyName = Object.values(SymbolList);
        console.log(currencyName);

        fromCurrency.on("focus", $(function () {
            fromCurrency.autocomplete({
                source: currencyName
            });
        }));

        toCurrency.on("focus", $(function () {
            toCurrency.autocomplete({
                source: currencyName
            });
        }));

    }


    function getSymbolByName(listOfCurSymbols, curName) {
        return Object.keys(listOfCurSymbols).find(key =>
            listOfCurSymbols[key] === curName);
    }

    function renderExRateResult(rate) {
        formattedRate = parseFloat(rate, 10).toString();
        let exRateDisplay = $("#currentExRate");
        exRateDisplay.text(`1${fromSymbol} = ${formattedRate} ${toSymbol}`);

    }

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
