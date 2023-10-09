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
  var flipContainer = $("#flip-rate-container");

//API keys for exchange rates
 const ALPHAVANTAGE_APIKEY = "XE79THS7MSCL4AER";
 //const EXCHANGERATE_APIKEY = "e16414f0258ef99126086274fc299335";

//Populate fields with acceptable currency names and lsten for user actions
  getCurrency();
  conversionForm.on("submit", handleFormSubmission);
  flipContainer.on("click", handleRateSwap);

//function for retrieving all available currencies
  async function getCurrency() {
    //const url = `http://api.exchangeratesapi.io/v1/symbols?access_key=${EXCHANGERATE_APIKEY}`;
    const url = 'https://currency-conversion-and-exchange-rates.p.rapidapi.com/symbols';
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': '7519d9d81cmshbaca6aa03ea18d8p158311jsnff0e714a3ff8',
            'X-RapidAPI-Host': 'currency-conversion-and-exchange-rates.p.rapidapi.com'
        }
    };

    try {
      curSymbolResponse = await fetch(url,options);
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

//Helper function for checking the currency chosen is available in list
  function getSymbolByName(listOfCurSymbols, curName) {
    return Object.keys(listOfCurSymbols).find(key =>
      listOfCurSymbols[key] === curName);
  }

// Render exchange rate results
  function renderExRateResult(rate) {
    formattedRate = parseFloat(rate, 10).toString();
    let exRateDisplay = $("#current-exchange-rate");
    exRateDisplay.text(`1${fromSymbol} = ${formattedRate} ${toSymbol}`);
    $("#success_emoji").css("visibility", "visible");
  }

// Swap user rates and animate icon upon click of two-way arrow
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

});

var myMap = function(){
  
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
        type: 'bank'
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
    console.log("Geolocation is not supported by this browser.");
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