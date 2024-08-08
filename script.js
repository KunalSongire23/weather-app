// - - - - - - - - - - - -Tab Handling- - - - - - - - - - - -//
const yourTab = document.querySelector(".yourTab");
const searchTab = document.querySelector(".searchTab");
const mainScreen = document.querySelector(".main-container");
const weatherInfoScreen = document.querySelector(".weather-info-container");
const grantAccessScreen = document.querySelector(".grant-access-container");
const searchScreen = document.querySelector(".search-form-container");
const searchInput = document.querySelector("[data-searchInput]");
const errorScreen = document.querySelector(".error-container");


const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";

// Setting default tab
let currentTab = yourTab;
currentTab.classList.add('current-tab');

function switchTab(clickedTab) {
    errorScreen.classList.remove('active');
    if(clickedTab !== currentTab) {
        currentTab.classList.remove('current-tab');
        currentTab = clickedTab;
        currentTab.classList.add('current-tab');
        if(!searchScreen.classList.contains('active')) {
            weatherInfoScreen.classList.remove('active');
            grantAccessScreen.classList.remove('active');
            searchScreen.classList.add('active');
        } else {
            searchScreen.classList.remove('active');
            weatherInfoScreen.classList.remove('active');
            getFromSessionStorage();
        }
        // console.log("current tab", currentTab);
    } 
};

// adding event listerner to tab-container: tabs
yourTab.addEventListener('click', () => {
    switchTab(yourTab);
});
searchTab.addEventListener('click', () => {
    switchTab(searchTab);
});

// - - - - - - - - - - - -User Weather Handling- - - - - - - - - - - -//
const loadingScreen = document.querySelector(".loading-container");
const grantAccessBtn = document.querySelector("[data-grantAccess");
const messageText = document.querySelector("[data-messageText");
const errorImage = document.querySelector("[data-errorImage]");
const errorText = document.querySelector("[data-errorText]");

// Check if coordinates are already present in Session Storage
function getFromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates) {
        grantAccessScreen.classList.add('active');
    } else {
        const coordinates = JSON.parse(localCoordinates);
        fetchWeatherInfo(coordinates);
    }
};

// Get Coordinates using geoLocation
function getLocation() {
    // suppport is available
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    }
    // support is not available
    else {
        grantAccessBtn.style.display = "none";
        messageText.innerText = "Geolocation is not supported by this browser.";
    }
};

// Store user coordinates
function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon : position.coords.longitude,
    }
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchWeatherInfo(userCoordinates);
};

// Handle any errors
function showError(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        messageText.innerText = "You denied the request for Geolocation.";
        break;
      case error.POSITION_UNAVAILABLE:
        messageText.innerText = "Location information is unavailable.";
        break;
      case error.TIMEOUT:
        messageText.innerText = "The request to get user location timed out.";
        break;
      case error.UNKNOWN_ERROR:
        messageText.innerText = "An unknown error occurred.";
        break;
    }
  };

getFromSessionStorage();
grantAccessBtn.addEventListener('click', getLocation);

// Fetch data from API - Weather Information
async function fetchWeatherInfo(coordinates) {
    const {lat, lon} = coordinates;

    grantAccessScreen.classList.remove("active");
    loadingScreen.classList.add('active');

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
        const data = await response.json();
        //  console.log("User - Api Fetch Data", data);
        if(!data.sys) {
            throw data;
        }
        loadingScreen.classList.remove('active');
        weatherInfoScreen.classList.add('active');
        renderWeatherInfo(data);
    } catch (error) {
        // console.log("User - Api Fetch Error", error.message);
        loadingScreen.classList.remove('active');
        errorScreen.classList.add('active');
        errorImage.style.display = "none";
        errorText.innerText = `Error: ${error?.message}`;
    }
};

// Render weather information in UI
function renderWeatherInfo(data) {
    //  console.log("Weather Info", data);
    const placeName = document.querySelector("[data-place]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    // fetch values from data object and put in UI elements 
    placeName.innerText = data?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${data?.sys?.country.toLowerCase()}.png`;
    desc.innerText = data?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${data?.weather?.[0]?.icon}.png`
    temp.innerText = `${data?.main?.temp.toFixed(2)} °C` ;
    windspeed.innerText = `${data?.wind?.speed.toFixed(2)}m/s`;
    humidity.innerText = `${data?.main?.humidity}%`;
    cloudiness.innerText = `${data?.clouds?.all}%`;
};

// Search weather handling
searchScreen.addEventListener('submit', (e) => {
    e.preventDefault();
    if (searchInput.value === "") return;
    // console.log(searchInput.value)
    fetchSearchWeatherInfo(searchInput.value);
    searchInput.value = "";

});

// Fetch data from API
async function fetchSearchWeatherInfo(placeName) {
    loadingScreen.classList.add('active');
    weatherInfoScreen.classList.remove('active');
    errorScreen.classList.remove('active');

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${placeName}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        // console.log("Search - Api Fetch Data", data);
        if (!data.sys) {
            throw data;
         }
        loadingScreen.classList.remove("active");
        weatherInfoScreen.classList.add("active");
        renderWeatherInfo(data);
    } catch (error) {
        // console.log("Search - Api Fetch Error", error.message);
        loadingScreen.classList.remove("active");
        errorScreen.classList.add("active");
        errorText.innerText = `${error?.message}`;
    }
};
