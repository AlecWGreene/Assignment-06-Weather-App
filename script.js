/**
 * ==================================================
 * VARIABLES
 * ==================================================
 */
/** API key */
var apiKey = "14dcce84f7b94920cbe9d542aace61ee";

/** Object storing the location identifying data */
var query = {name: "Ann Arbor", lat: 0, lon: 0};
/** Weather object to store Ajax calls */
var queryResult;
/** UV index returned from Ajax calls */
var queryUV;

/** City weather to display */
var cityWeather = {temp: 0, humidity: 0, wind: 0, uv: 0};
/** 5-day forecast data */
var forecastArray = [];
/** The user's search history */
var searchHistory = [];
//["Atlanta","Boston","Chicago","Detroit","Houston","Los Angeles","New York","Sacremento","San Fransisco","St. Louis"];

/** openWeather API link */
var weather_URL = `https://api.openweathermap.org/data/2.5/weather?q=${query.name}&appid=` + apiKey;
/** openWeather UV API link */
var weatherUV_URL = `https://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${query.lat}&lon=${query.lon}`
/** openWeather Forecast API link */
var forecast_URL = `https://api.openweathermap.org/data/2.5/forecast?q=${query.name}&appid=${apiKey}`;
/** The url for a weather icon */
var icon_URL = "https://openweathermap.org/img/w/";
/** openWeather param to return units in Imperial */
var imperial_suffix = "&units=imperial";
/** .png */
var png_suffix = ".png";



/**
 * ==================================================
 * RUNTIME
 * ==================================================
 */

$(document).ready(function(){
    // Setup event listeners
    InitListeners();

    // If the search history is empty
    if(searchHistory.length === 0){
        GetCityWeather("Ann Arbor");
    }
    else{
        GetCityWeather(searchHistory[0]);
    }

    // Get the forecast
    GetForecast();

    // Get searchHistory
    searchHistory = JSON.parse(localStorage.getItem("searchHistory"));

    // Show the search history
    LoadSearchHistory();
});


/**
 * ==================================================
 * FUNCTIONS
 * ==================================================
 */


/**
  * --------------------------------------------------
  * Display methods
  * --------------------------------------------------
  */

function LoadSearchHistory(){
    // For each object in search history
    for(let i = searchHistory.length - 1; i >= 0; i--){
        // An item to add to the search list
        var t_item = $("<li>").addClass("search-list-item collapse multi-collapse").append($("<button>").addClass("btn btn-outline-info search-list-btn").text(searchHistory[i]));
        
        // If the history is full, remove the last element
        if($("#search-list").children().toArray().length === 10){
            $("#search-list li").last().remove();
        }

        // Have the new item match the current list status
        if(!$("#search-collapse-btn").hasClass("collapsed")){
            t_item.addClass("show");
        }

        // Display new item
        $("#search-list").prepend(t_item);

        // Add search listeners to city buttons
        $(t_item).on("click", SearchListButtonHandler);
    }
}

function UpdateSearchHistory(){   
    // Return void if searchHistory is empty
    if(searchHistory.length === 0){
        return;
    }

    // An item to add to the search list
    var t_item = $("<li>").addClass("search-list-item collapse multi-collapse").append($("<button>").addClass("btn btn-outline-info search-list-btn").text(searchHistory[0]));
    
    // If the history is full, remove the last element
    if($("#search-list").children().toArray().length === 10){
        $("#search-list li").last().remove();
    }

    // Have the new item match the current list status
    if(!$("#search-collapse-btn").hasClass("collapsed")){
        t_item.addClass("show");
    }

    // Display new item
    $("#search-list").prepend(t_item);

    // Add search listeners to city buttons
    $(t_item).on("click", SearchListButtonHandler);
}

  /**
   * Displays the data contained in @see cityWeather
   */
function DisplayCityWeather(){
    // Display city name
    $("#city-title").text(query.name);

    // Update city-info divs
    $("#city-temp").text(cityWeather.temp);
    $("#city-humidity").text(cityWeather.humidity);
    $("#city-wind").text(cityWeather.wind);
    $("#city-uv").text(cityWeather.uv);

    // Color UV index
    var t_threat = Math.floor(cityWeather.uv / 3);
    // UV 3-5
    if(t_threat === 1){
        $("#city-uv").parent().css("background-color","yellow").css("color","white");
    }
    // UV 6-8
    else if(t_threat === 2){
        $("#city-uv").parent().css("background-color","orange").css("color","white");
    }
    // UV > 9
    else if(t_threat >= 3){
        $("#city-uv").parent().css("background-color","red").css("color","white");
    }
}

/**
 * Display the 5-day forecast
 */
function DisplayForecast(){

    // For each day
    for(let i = 0; i < 5; i++){

        // Display forecastArray[i] members
        $("#forecast-header-" + (i + 1)).text(forecastArray[i].day);
        $("#conditions-" + (i + 1)).attr("src", forecastArray[i].conditions);
        $("#temphi-" + (i + 1)).html("Hi " + forecastArray[i].tempHigh + "\&\#176\;");
        $("#templo-" + (i + 1)).html("Lo " + forecastArray[i].tempLow + "\&\#176\;");
        $("#humidity-" + (i + 1)).html(forecastArray[i].humidity + " \&\#37\;");

    }

}

function ClearHistory(){
    searchHistory = [];
}


 /**
  * --------------------------------------------------
  * Wrapped Ajax calls
  * --------------------------------------------------
  */

/**
 * Makes an Ajax call to openWeather and displays the info to the DOM
 * 
 * @param {String} a_city The name of the city
 */
function GetCityWeather(a_city){
    // Grab city name
    query.name = a_city;

    // Update URL vars
    weather_URL = `https://api.openweathermap.org/data/2.5/weather?q=${query.name}&appid=` + apiKey;

    // Ajax weather call
    $.ajax({
        url: weather_URL + imperial_suffix,
        method: "GET"
    }).then(function(response){
        // Get response
        queryResult = response;

        // Store coordinates
        query.lat = queryResult.coord.lat;
        query.lon = queryResult.coord.lon;

        // Get the city UV index
        GetCityUV();

        // Update city weather humidity, temp, wind
        cityWeather.humidity = queryResult.main.humidity;
        cityWeather.temp = queryResult.main.temp;
        cityWeather.wind = queryResult.wind.speed;

        DisplayCityWeather();
    });
}

/**
 * While GetCityWeather is being executed, grabs the UV index from openWeather UV
 */
function GetCityUV(){
    // Update weather UV url
    weatherUV_URL = `http://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${query.lat}&lon=${query.lon}`;

    // Ajax UV call
    $.ajax({
        url: weatherUV_URL + imperial_suffix,
        method: "GET"
    }).then(function(response){
        // Update city weather UV
        cityWeather.uv = response.value;
    });
}

/**
 * Makes the Ajax call to get the 5 day forecast, then displays the info to the DOM
 */
function GetForecast(){

    // Update the forecast url
    forecast_URL = `http://api.openweathermap.org/data/2.5/forecast?q=${query.name}&appid=${apiKey}`;

    // Ajax call
    $.ajax({
        url: forecast_URL + imperial_suffix, 
        method: "GET"
    }).then(function(response){ 
        UpdateForecast(response);
        DisplayForecast();
    });

}

/**
 * Update the 5-day forecast using a response from the API
 * 
 * @param {Response} a_query The response from the 5-day forecast API
 */
function UpdateForecast(a_query){
    // For each day
    for(let i = 0; i < 5; i++){
            
        // Init helper vars
        var t_temp_min;
        var t_temp_max;
        var t_humidity_avg = 0;

        // For each 3hour forecast
        for(let j = 0; j < 8; j++){

            // If temperature is highest
            if((a_query.list[8 * i + j ].main.temp > t_temp_max) || (i + j) == 0){
                t_temp_max = a_query.list[8 * i + j ].main.temp;
            }

            // If temperature is lowest
            if((a_query.list[8 * i + j ].main.temp < t_temp_min) || (i + j) == 0){
                t_temp_min = a_query.list[8 * i + j ].main.temp;
            }

            // Add to humidity
            t_humidity_avg += a_query.list[8 * i + j ].main.humidity;
        }

        // Store data in the array
        forecastArray[i] = {
            day: moment(a_query.list[8 * i].dt_txt).format("dddd"),
            conditions: icon_URL + a_query.list[8 * i + 5].weather[0].icon + png_suffix, 
            tempHigh: t_temp_max, 
            tempLow: t_temp_min, 
            humidity: t_humidity_avg / 8
        };
    }
}

function Test(a_city){
    GetCityWeather(a_city);
    GetForecast();
}

/**
 * --------------------------------------------------
 * DOM Manipulation Methods
 * --------------------------------------------------
 */

 /**
  * Initialize the listeners
  */
function InitListeners(){

    // Add search listeners to city buttons
    $(".search-list-btn").on("click", SearchListButtonHandler);

    // Add search listener to the search button
    $(".search-button").on("click", SearchButtonHandler);

    // Add search listener to text box
    $("#search-form").on("submit", function(a_event){ a_event.preventDefault()});
    $("#search-input").on("submit", HandleInputSubmit);
}


/**
 * Handle the event of a user clicking a city button
 * 
 * @param {Event} a_event The event of a user clicking a city button
 */
function SearchListButtonHandler(a_event){
    a_event.preventDefault();
    
    // Get the city name
    var t_name = $(a_event.target).text();

    // If a button exists
    if($(a_event.target).hasClass("city-button") || searchHistory.includes(t_name)){
        // For each search item
        $("#search-list").children().toArray().forEach(function(a_element){ 
            // If the element was the button that was clicked
            if($(a_element).text().includes(t_name)){  
                // Remove the element
                $(a_element).remove();
            } 
        });
    }

    // Update search history
    StoreSearch(t_name);
    UpdateSearchHistory();

    // Make Ajax API calls
    GetCityWeather(t_name);
    GetForecast();
}

/**
 * Handle the event of a user clicking the search button
 * 
 * @param {Event} a_event The event of a user clicking the search button
 */
function SearchButtonHandler(a_event){
    a_event.preventDefault();
    a_event.stopPropagation();

    // Get the search string
    var t_string = $("#search-input").val().trim();

    // Store the first button that matches the search
    var t_button;
    $("#search-list").children().toArray().forEach(a_element => {
        // If the button's text matches the string
        if($(a_element).children("button").text() === t_string){
            t_button = $(a_element).children("button");
        }
    });
    
    // If a button exists
    if($(t_button).hasClass("city-button") || searchHistory.includes(t_string)){
        // For each search item
        $("#search-list").children().toArray().forEach(function(a_element){ 
            // If the element was the button that was clicked
            if($(a_element).text().includes(t_string)){  
                // Remove the element
                $(a_element).remove();
            } 
        });
    }

    // Update search history
    if(!searchHistory.includes(t_string)){
        StoreSearch(t_string);
        UpdateSearchHistory();
    }

    // Make Ajax API calls
    GetCityWeather(t_string);
    GetForecast();

    return false;
}

/**
 * Search a city when the user hits enter from the text field
 * 
 * @param {Event} a_event The event of the user hitting enter in the search box
 */
function HandleInputSubmit(a_event){
    a_event.preventDefault();
    a_event.stopPropagation();

    // Get the search string
    var t_string = $("#search-input").val().trim();

    // Store the first button that matches the search
    var t_button;
    $("#search-list").children().toArray().forEach(a_element => {
        // If the button's text matches the string
        if($(a_element).children("button").text() === t_string){
            t_button = $(a_element).children("button");
        }
    });
    
    // If a button exists
    if($(t_button).hasClass("city-button") || searchHistory.includes(t_string)){
        // For each search item
        $("#search-list").children().toArray().forEach(function(a_element){ 
            // If the element was the button that was clicked
            if($(a_element).text().includes(t_string)){  
                // Remove the element
                $(a_element).remove();
            } 
        });
    }

    // Update search history
    if(!searchHistory.includes(t_string)){
        StoreSearch(t_string);
        UpdateSearchHistory();
    }

    // Make Ajax API calls
    GetCityWeather(t_string);
    GetForecast();

    return false;
}

/**
 * Store the user's serach into an array and keep it in local storage
 * 
 * @param {String} a_city The city the user searched
 */
function StoreSearch(a_city){
    // If the city has been searched
    if(searchHistory.includes(a_city) && searchHistory.length > 1){
        // Delete the history entry
        var t_index = searchHistory.lastIndexOf(a_city);
        searchHistory.splice(t_index,1);
    }
    // If the search history is full
    else if(searchHistory.length > 10){
        searchHistory.pop();
    }

    // Insert a_city into the array
    searchHistory.splice(0,0,a_city);

    // Store searchHistory into local storage
    var t_string = JSON.stringify(searchHistory);
    localStorage.setItem("searchHistory",t_string);
}