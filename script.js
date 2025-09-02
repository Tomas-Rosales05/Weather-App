const apiData = {
  url: "https://api.openweathermap.org/data/2.5/",
  key: "124b92a8dd9ec01ffb0dbf64bc44af3c",
};

const cityInput = document.querySelector("#get-city");
const form = document.querySelector("#search-form");
const cityName = document.querySelector("#city");
const cityTemp = document.querySelector(".temperature");
const cityHumidity = document.querySelector(".humedity");
const cityWind = document.querySelector(".wind");
const cityCondition = document.querySelector(".clima");
const weatherIcon = document.querySelector(".weather-icon");
const forecastItems = document.querySelectorAll(".weather-week");
const weatherBox = document.querySelector("#weather-box");

// Loader
function showLoader() {
  weatherBox.innerHTML = `<p>Cargando datos...</p>`;
}

// Mostrar error
function showError(message) {
  weatherBox.innerHTML = `<p style="color: #ffaaaa">${message}</p>`;
}

// Buscar ciudad
form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (cityInput.value.trim() !== "") {
    fetchDataFromApi(cityInput.value.trim());
    cityInput.value = "";
  }
});

// Cargar Buenos Aires al inicio
fetchDataFromApi("buenos aires");

// Obtener datos
async function fetchDataFromApi(city) {
  try {
    showLoader();

    const urlActual = `${apiData.url}weather?q=${city}&appid=${apiData.key}&units=metric&lang=es`;
    const urlForecast = `${apiData.url}forecast?q=${city}&appid=${apiData.key}&units=metric&lang=es`;

    const [resCurrent, resForecast] = await Promise.all([
      fetch(urlActual),
      fetch(urlForecast),
    ]);

    if (!resCurrent.ok || !resForecast.ok) {
      throw new Error("Ciudad no encontrada");
    }

    const dataCurrent = await resCurrent.json();
    const dataForecast = await resForecast.json();

    addDataToDom(dataCurrent);
    addForecastToDom(dataForecast);

  } catch (error) {
    console.error("Error:", error);
    showError("⚠️ No se pudo obtener el clima. Verifica la ciudad.");
  }
}

// Agregar clima actual al DOM
function addDataToDom(data) {
  weatherBox.innerHTML = `
    <h2 id="city">${data.name}, ${data.sys.country}</h2>
    <p class="temperature">${Math.round(data.main.temp)}°C</p>
    <img class="weather-icon" src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}">
    <p class="clima">${capitalize(data.weather[0].description)}</p>
    <p class="humedity">Humedad: ${data.main.humidity}%</p>
    <p class="wind">Viento: ${(data.wind.speed * 3.6).toFixed(1)} km/h</p>
  `;
}

// Agregar pronóstico
function addForecastToDom(data) {
  const dailyForecasts = data.list.filter(f => f.dt_txt.includes("12:00:00"));

  forecastItems.forEach((item, i) => {
    if (dailyForecasts[i]) {
      const forecast = dailyForecasts[i];
      const date = new Date(forecast.dt_txt);
      const dayName = capitalize(date.toLocaleDateString("es-ES", { weekday: "short" }));
      const temp = Math.round(forecast.main.temp);
      const desc = capitalize(forecast.weather[0].description);
      const icon = forecast.weather[0].icon;

      item.innerHTML = `
        <strong>${dayName}</strong><br>
        ${temp}°C<br>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}" width="50"><br>
        ${desc}
      `;
    } else {
      item.innerHTML = "";
    }
  });
}

// Capitalizar
function capitalize(string) {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
}
