
var curSymbolResponse;
var curSymbolResult;

var fromCurrency = $("#fromCurrency");
var toCurrency = $("#toCurrency");

getCurrency();

async function getCurrency(){
    const url = 'https://currency-conversion-and-exchange-rates.p.rapidapi.com/symbols';
const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': '7519d9d81cmshbaca6aa03ea18d8p158311jsnff0e714a3ff8',
		'X-RapidAPI-Host': 'currency-conversion-and-exchange-rates.p.rapidapi.com'
	}
};

try {
	curSymbolResponse = await fetch(url, options);
	curSymbolResult = await curSymbolResponse.json();
    renderAutoComp(curSymbolResult.symbols);
} catch (error) {
	console.error(error);
}
}



getConversionRate();
async function getConversionRate(){
const url = 'https://currency-conversion-and-exchange-rates.p.rapidapi.com/latest?from=USD&to=EUR%2CGBP';
const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': '7519d9d81cmshbaca6aa03ea18d8p158311jsnff0e714a3ff8',
		'X-RapidAPI-Host': 'currency-conversion-and-exchange-rates.p.rapidapi.com'
	}
};

try {
	const response = await fetch(url, options);
	const result = await response.json();
	console.log(result);
} catch (error) {
	console.error(error);
}
}




function renderAutoComp(SymbolList){
    var currencyName = Object.values(SymbolList);
    //var currencySymbol = Object.keys(SymbolList);

    //console.log(Object.values(SymbolList));
    
    fromCurrency.on("focus",$(function(){
    fromCurrency.autocomplete({
        source: currencyName
    });
    })
    );

    toCurrency.on("focus",$(function(){
        toCurrency.autocomplete({
            source: currencyName
        });
        })
        );

}



