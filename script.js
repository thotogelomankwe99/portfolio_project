//API Configuration
const API_KEY = "b2664dde99adc5312fafd9663289aa1e";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// DOM Elements
const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const locationBtn = document.getElementById("location-btn");
const locationElement = document.getElementById("location");
const dateElement = document.getElementById("date");
const tempElement = document.getElementById("temperature");
const conditionsElement = document.getElementById("condition");
const weatherIconElement = document.getElementById("weather-icon");
const feelslikeElement = document.getElementById("feels-like");
const humidityElement = document.getElementById("humidity");
const windElement = document.getElementById("wind");
const forecastElement = document.getElementById("forecast");
const loadingElement = document.getElementById("loading");

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  getLocationWeather();
});

// Event Listeners
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) getWeatherByCity(city);
});

locationBtn.addEventListener("click", getLocationWeather);

cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const city = cityInput.value.trim();
    if (city) getWeatherByCity(city);
  }
});

//Functions
function showLoading() {
  loadingElement.style.display = "flex";
}

function hideLoading() {
  loadingElement.style.display = "none";
}

function updateDateTime() {
  const now = new Date();
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  dateElement.textContent = now.toLocaleDateString("en-US", options);
}

async function getWeatherByCity(city) {
  showLoading();
  try {
    const currentResponse = await fetch(`${BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`);
    const currentData = await currentResponse.json();

    const forecastResponse = await fetch(`${BASE_URL}/forecast?q=${city}&units=metric&appid=${API_KEY}`);
    const forecastData = await forecastResponse.json();

    updateWeatherUI(currentData, forecastData);
  } catch (error) {
    alert("Error: " + error.message);
    hideLoading();
  }
}

async function getLocationWeather() {
  showLoading();
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const currentResponse = await fetch(`${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`);
          const forecastResponse = await fetch(`${BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`);

          const currentData = await currentResponse.json();
          const forecastData = await forecastResponse.json();

          updateWeatherUI(currentData, forecastData);
        } catch (error) {
          alert("Error: " + error.message);
          hideLoading();
        }
      },
      (error) => {
        alert("Geolocation error: " + error.message);
        getWeatherByCity("Johannesburg");
      }
    );
  } else {
    alert("Geolocation not supported by your browser");
    getWeatherByCity("Johannesburg");
  }
}

function updateWeatherUI(current, forecastData) {
  // Current Weather
  locationElement.textContent = `${current.name}, ${current.sys.country}`;
  updateDateTime();
  tempElement.textContent = `${Math.round(current.main.temp)}°C`;
  conditionsElement.textContent = current.weather[0].description;
  weatherIconElement.src = `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`;
  weatherIconElement.alt = current.weather[0].main;
  feelslikeElement.textContent = `Feels like: ${Math.round(current.main.feels_like)}°C`;
  humidityElement.textContent = `Humidity: ${current.main.humidity}%`;
  windElement.textContent = `Wind: ${Math.round(current.wind.speed * 3.6)} km/h`;

  updateForecast(forecastData);
  hideLoading();
}

function updateForecast(forecastData) {
  const dailyForecast = {};

  forecastData.list.forEach((item) => {
    const date = new Date(item.dt * 1000).toLocaleDateString();
    if (!dailyForecast[date]) dailyForecast[date] = [];
    dailyForecast[date].push(item);
  });

  const forecastDays = Object.keys(dailyForecast).slice(1, 6); // next 5 days
  forecastElement.innerHTML = "";

  forecastDays.forEach((day) => {
    const dayData = dailyForecast[day];
    const dayName = new Date(day).toLocaleDateString("en-US", { weekday: "short" });
    const dayHigh = Math.max(...dayData.map((item) => item.main.temp_max));
    const dayLow = Math.min(...dayData.map((item) => item.main.temp_min));
    const dayIcon = dayData[Math.floor(dayData.length / 2)].weather[0].icon;

    const forecastItem = document.createElement("div");
    forecastItem.className = "forecast-item";
    forecastItem.innerHTML = `
      <div class="forecast-day">${dayName}</div>
      <div class="forecast-icon">
        <img src="https://openweathermap.org/img/wn/${dayIcon}.png" alt="${dayData[0].weather[0].main}">
      </div>
      <div class="forecast-temp">
        <span class="forecast-high">${Math.round(dayHigh)}°</span>
        <span class="forecast-low">${Math.round(dayLow)}°</span>
      </div>
    `;
    forecastElement.appendChild(forecastItem);
  });
}

  


