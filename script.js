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
var forecastArray = [];

/** openWeather API link */
var weather_URL = `https://api.openweathermap.org/data/2.5/weather?q=${query.name}&appid=` + apiKey;
/** openWeather UV API link */
var weatherUV_URL = `http://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${query.lat}&lon=${query.lon}`
/** openWeather Forecast API link */
var forecast_URL = `http://api.openweathermap.org/data/2.5/forecast?q=${query.name}&appid=${apiKey}`;
/** openWeather param to return units in Imperial */
var imperial_suffix = "&units=imperial";



/**
 * ==================================================
 * RUNTIME
 * ==================================================
 */



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
}

function DisplayForecast(){

    // For each day
    for(let i = 0; i < 5; i++){

        // Display forecastArray[i] members
        $("#conditions-" + (i + 1)).text(forecastArray[i].conditions);
        $("#temp-" + (i + 1)).text(forecastArray[i].tempHigh + "/" + forecastArray[i]).tempLow;
        $("#humidity-" + (i + 1)).text(forecastArray[i].humidity);

    }

}


 /**
  * --------------------------------------------------
  * Wrapped Ajax calls
  * --------------------------------------------------
  */

/**
 * Makes an Ajax call to openWeather 
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
 * Makes the Ajax call to get the 5 day forecast
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
        console.log(response); 
    });

}

function UpdateForecast(a_query){
    // For each day
    for(let i = 0; i < 5; i++){
            
        // Init helper vars
        var t_temp_min;
        var t_temp_max;
        var t_humidiy_avg = 0;

        // For each 3hour forecast
        for(let j = 0; j < 8; j++){
            console.log(a_query.list[8 * i + j ].main);
            // If temperature is highest
            if(a_query.list[8 * i + j ].main.temp > t_temp_max || (i + j) == 0){
                t_temp_max = a_query.list[8 * i + j ].main.temp;
            }

            // If temperature is lowest
            if(a_query.list[8 * i + j ].main.temp < t_temp_min || (i+j) == 0){
                t_temp_min = a_query.list[8 * i + j ].main.temp;
            }

            // Add to humidity
            t_humidiy_avg += a_query.list[8 * i + j ].main.humidity;
        }

        // Store data in the array
        forecastArray[i] = {conditions: 0, tempHigh: t_temp_max, tempLow: t_temp_min, humidity: t_humidiy_avg / 8};
    }
}

function Test(a_city){
    GetCityWeather(a_city);
    GetForecast();
    
    DisplayCityWeather();
}