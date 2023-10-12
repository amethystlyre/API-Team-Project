$(document).ready(function () {
  //intialize global variables and DOM elements
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
  var flipRateContainer = $("#flip-rate-container");
  var flipAmountContainer = $("#flip-amount-container");
  var convertContainer = $('#convert-amount-form');
  var amountFrom = $('#fromAmount');
  var amountTo = $('#toAmount');


  //API keys for exchange rates
  const ALPHAVANTAGE_APIKEY = "XE79THS7MSCL4AER";
  //const EXCHANGERATE_APIKEY = "e16414f0258ef99126086274fc299335";//backup Symbols API
  const XRAPID_APIKEY="38181d70c5msh81a24e2f7d16b84p190a40jsn29bf7d794117";
  //Back up API Key in case we hit quota limit for the month: 38181d70c5msh81a24e2f7d16b84p190a40jsn29bf7d794117

  //Populate fields with acceptable currency names and lsten for user actions
  getCurrency();
  conversionForm.on("submit", handleFormSubmission);
  flipRateContainer.on("click", handleRateSwap);
  flipAmountContainer.on("click", handleAmountSwap);
  convertContainer.on("submit", calculateCurrency);

  //function for retrieving all available currencies
  async function getCurrency() {
    //const url = `http://api.exchangeratesapi.io/v1/symbols?access_key=${EXCHANGERATE_APIKEY}`;//backup Symbols API
    const url = 'https://currency-conversion-and-exchange-rates.p.rapidapi.com/symbols';
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': `${XRAPID_APIKEY}`,
        'X-RapidAPI-Host': 'currency-conversion-and-exchange-rates.p.rapidapi.com'
      }
    };

    try {
      curSymbolResponse = await fetch(url, options);
      curSymbolResult = await curSymbolResponse.json();
      //console.log(curSymbolResult);
      if (curSymbolResult.hasOwnProperty("symbols") && curSymbolResult.symbols.length != 0) {
        currencyList = curSymbolResult.symbols;
        //console.log(currencyList);
        renderAutoComp(currencyList);
      }
    } catch (error) {
      console.error(error);
    }
  }


  //Handle currency conversion form submission with user input
  function handleFormSubmission(event) {
    event.preventDefault();

    if (checkUserInput()) {
      let url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${fromSymbol}&to_currency=${toSymbol}&apikey=${ALPHAVANTAGE_APIKEY}`;
      //console.log(url);
      getConversionRate(url);
      addToSearchHistory(fromCurrency.val(), toCurrency.val());
    };

  }

  //check if user input exist and is valid
  function checkUserInput() {
    //console.log(fromCurrency.val());
    //console.log(toCurrency.val());
    fromSymbol = getSymbolByName(currencyList, fromCurrency.val());
    toSymbol = getSymbolByName(currencyList, toCurrency.val());


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

  //Render warning message for unexpected user error or API error
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

  //Fetch currency conversion rate from API
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

  //Render auto-populate list for From and To currency lists
  function renderAutoComp(SymbolList) {
    currencyName = Object.values(SymbolList);
    //console.log(currencyName);

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

  //Helper function for finding and returning the currency symbol
  function getSymbolByName(listOfCurSymbols, curName) {
    return Object.keys(listOfCurSymbols).find(key =>
      listOfCurSymbols[key] === curName);
  }

  // Render exchange rate results
  function renderExRateResult(rate) {
    let formattedRate = parseFloat(rate, 10).toString();
    let exRateDisplay = $("#current-exchange-rate");
    exRateDisplay.text(`1${fromSymbol} = ${formattedRate} ${toSymbol}`);
    $("#success_emoji").css("visibility", "visible");
    $("#current-rate-container").css("visibility", "visible");
  }

  // Swap user rates and animate icon upon click of two-way arrow
  function handleRateSwap() {
    flipRateContainer.toggleClass("is-flipped");
    let baseRate = fromCurrency.val();
    let targetRate = toCurrency.val();
    fromCurrency.val(targetRate);
    toCurrency.val(baseRate);
  }


  //Swap user entered amounts and animate icon upon click of two-way arrow
  function handleAmountSwap() {
    flipAmountContainer.toggleClass("is-flipped");
    let baseAmount = amountFrom.val();
    let targetAmount = amountTo.val();
    amountFrom.val(targetAmount);
    amountTo.val(baseAmount);
  }

  //Convert a user given amount based on the exchanged rate result
  function calculateCurrency(rate) {
    rate.preventDefault();
    var amount = amountFrom.val();
    var convertedAmount = Math.round(amount * parseFloat(currentExRate, 10));
    amountTo.val(convertedAmount);
    $(".custom-hide").css("display", "flex");
  }


  // Function to load the conversion history from local storage
  function loadSearchHistoryFromLocalStorage() {
    const historyData = JSON.parse(localStorage.getItem("conversionHistory")) || [];
    // Reverse the historyData array to maintain the order
    const reversedHistoryData = historyData.reverse();
    const limitedHistoryData = reversedHistoryData.slice(0, 5); // Get the last 5 items

    $("#history-list").empty(); // Clear the history list

    limitedHistoryData.forEach(function (historyItemString) {
      const historyItem = JSON.parse(historyItemString); // Parse the stored string into an object
      addToSearchHistory(historyItem.fromCurrency, historyItem.toCurrency);
    });

    // Show the search history by default
    $("#history-list").show();
  }

  // Load search history from local storage when the page loads
  loadSearchHistoryFromLocalStorage();

  function addToSearchHistory(fromCurrency, toCurrency) {
    const historyItem = { fromCurrency, toCurrency };
    const historyItemString = JSON.stringify(historyItem);

    // Check if the item already exists in the history
    const existingItems = $("#history-list button").toArray();
    const itemExists = existingItems.some(function (item) {
      return item.textContent === `${fromCurrency} to ${toCurrency}`;
    });

    if (!itemExists) {
      // Item does not exist, add it to the history
      saveToLocalStorage(historyItemString);

      const button = $("<button class='button search-history-button is-link'></button>");
      button.text(`${fromCurrency} to ${toCurrency}`); // Display the searched currencies

      // Append the history item to the history list
      $("#history-list").prepend(button);

      button.on("click", function () {
        const { fromCurrency, toCurrency } = historyItem;
        $("#fromCurrency").val(fromCurrency);
        $("#toCurrency").val(toCurrency);

        // Trigger the form submission to perform the conversion
        conversionForm.trigger("submit");

        // Move the clicked item to the top of the list
        button.prependTo("#history-list");

        console.log("Saved to localStorage:", historyItemString);
      });
    }
  }

  function saveToLocalStorage(data) {
    const existingHistory = JSON.parse(localStorage.getItem("conversionHistory")) || [];
    existingHistory.push(data);
    localStorage.setItem("conversionHistory", JSON.stringify(existingHistory));
  }
});

var myMap = function () {

  // Google Map to show nearby Banks
  var mapCenter = { lat: 0, lng: 0 };

  var map = new google.maps.Map(document.getElementById('map'), {
    center: mapCenter,
    zoom: 12
  });

  // Getting the user's location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      var userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      map.setCenter(userLocation);

      var placesService = new google.maps.places.PlacesService(map);
      var request = {
        location: userLocation,
        radius: 10000,
        keyword: 'money exchange'
      };

      // Searching nearby
      placesService.nearbySearch(request, function (results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          for (let i = 0; i < results.length; i++) {
            var place = results[i];
            createMarker(place);
            console.log(place)
          }
        }
      });
    });
  } else {
    renderAlert("Geolocation is not supported by this browser.");
  }

  // Marker for each money exchange
  function createMarker(place) {
    var marker = new google.maps.Marker({
      map: map,
      position: place.geometry.location,
      title: place.name
    });
    var infowindow = new google.maps.InfoWindow({
      content: `
          <div>
              <h2>${place.name}</h2>
              <p>${place.vicinity}</p>
              <a href="https://www.google.com/maps/search/?q=${encodeURIComponent(place.name)}" target="_blank">View on Google Maps</a>
          </div>
      `
    });
    marker.addListener('click', function () {
      infowindow.open(map, marker);

       
    });
  }
}