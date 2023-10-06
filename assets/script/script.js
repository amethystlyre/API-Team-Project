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
    var flipContainer = $("#flip-rate-container");


    const ALPHAVANTAGE_APIKEY = "XE79THS7MSCL4AER";
    const EXCHANGERATE_APIKEY = "e16414f0258ef99126086274fc299335";


    getCurrency();
    conversionForm.on("submit", handleFormSubmission);
    flipContainer.on("click", handleRateSwap);


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
            renderAlert("Currency doesn't exist, please choose from dropdown list.");
            return false;
        }
    };


    function renderAlert(message) {
        let alertMessage = $("article.message");
        let alertbody = $(".message-body");
        alertbody.text(message);
        alertMessage.toggleClass("is-hidden");
        let messageDismiss = $("button.delete");

        messageDismiss.on("click", function () {
            $("article.message").addClass("is-hidden");
        });


    }



    async function getConversionRate(url) {
        try {
            const response = await fetch(url);
            const result = await response.json();
            //console.log(result["Realtime Currency Exchange Rate"]["5. Exchange Rate"]);
            if (result.hasOwnProperty("Realtime Currency Exchange Rate")) {
                currentExRate = result["Realtime Currency Exchange Rate"]["5. Exchange Rate"];

                renderExRateResult(currentExRate);
            }
            else {
                console.log("API error:" + result["Error Message"]);
                renderAlert("Exchange rate information is currently unavailable, please try again later.");
            }
        } catch (error) {
            console.error(error);
        }
    }




    function renderAutoComp(SymbolList) {
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
        let exRateDisplay = $("#current-exchange-rate");
        exRateDisplay.text(`1${fromSymbol} = ${formattedRate} ${toSymbol}`);
        $("#success_emoji").css("visibility","visible");

    }

    function handleRateSwap() {
        flipContainer.toggleClass("is-flipped");
        let base = fromCurrency.val();
        let target = toCurrency.val();
        fromCurrency.val(target);
        toCurrency.val(base);

    }


    // Function to add a conversion to the search history
    function addToHistory(fromCurrency, toCurrency, amount, result) {
        const historyItem = { fromCurrency, toCurrency, amount, result };
        const historyItemString = JSON.stringify(historyItem);
        saveToLocalStorage(historyItemString);

        const listItem = $("<li>");
        listItem.html(`<a href="#" data-history="${historyItemString}">${fromCurrency} to ${toCurrency}: ${amount} = ${result}</a>`);
        $("#history-list").append(listItem);

        listItem.on("click", function (e) {
            e.preventDefault();
            const historyItemString = $(this).find("a").data("history");
            const { fromCurrency, toCurrency, amount, result } = JSON.parse(historyItemString);
            $("#fromCurrencySelect").val(fromCurrency);
            $("#toCurrencySelect").val(toCurrency);
            $("#amountInput").val(amount);
            $("#resultInput").val(result);
        });
    }

    // Function to save a string to local storage
    function saveToLocalStorage(data) {
        const existingHistory = JSON.parse(localStorage.getItem("conversionHistory")) || [];
        existingHistory.push(data);
        localStorage.setItem("conversionHistory", JSON.stringify(existingHistory));
    }

    // Function to load conversion history from local storage
    function loadConversionHistoryFromLocalStorage() {
        const historyData = JSON.parse(localStorage.getItem("conversionHistory")) || [];
        historyData.forEach(function (historyItemString) {
            addToHistoryFromLocalStorage(historyItemString);
        });
    }

    // Load conversion history from local storage when the page loads
    loadConversionHistoryFromLocalStorage();

    // Show the search history when the button is clicked
    $("#showHistoryButton").on("click", function () {
        $("#history-list").toggle(); // Toggle the visibility of the history list
    });

    // ...
});
