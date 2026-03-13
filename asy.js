const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const message = document.getElementById("message");
const historyList = document.getElementById("historyList");
const logBox = document.getElementById("logBox");

const STORAGE_KEY = "weatherSearchHistory";

// Log function for UI + browser console
function addLog(text) {
  console.log(text);
  logBox.textContent += text + "\n";
  logBox.scrollTop = logBox.scrollHeight;
}

// Show messages
function showMessage(text, type = "") {
  message.textContent = text;
  message.className = "message";
  if (type) {
    message.classList.add(type);
  }
}

// Save city in local storage
function saveToHistory(city) {
  let history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  history = history.filter(
    (item) => item.toLowerCase() !== city.toLowerCase()
  );

  history.unshift(city);

  if (history.length > 5) {
    history = history.slice(0, 5);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  renderHistory();
}

// Render history list
function renderHistory() {
  const history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  historyList.innerHTML = "";

  if (history.length === 0) {
    historyList.innerHTML = "<li>No recent searches yet.</li>";
    return;
  }

  history.forEach((city) => {
    const li = document.createElement("li");
    li.textContent = city;
    li.addEventListener("click", () => {
      cityInput.value = city;
      fetchWeather(city);
    });
    historyList.appendChild(li);
  });
}

// Update weather UI
function updateWeatherUI(city, temp, weatherCondition) {
  cityName.textContent = city;
  temperature.textContent = `${temp} °C`;
  condition.textContent = weatherCondition;
}

// Clear weather UI
function clearWeatherUI() {
  cityName.textContent = "-";
  temperature.textContent = "-";
  condition.textContent = "-";
}

// Function using .then() / .catch() just for promise demonstration
function logPromiseDemo(city) {
  const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;

  addLog("Promise demo started with .then() / .catch()");

  fetch(url)
    .then((response) => {
      addLog(".then() called after fetch response received");
      return response.json();
    })
    .then(() => {
      addLog("Second .then() executed after JSON parsed");
    })
    .catch((error) => {
      addLog(".catch() handled an error: " + error.message);
    });
}

// Main async function using async/await + try...catch
async function fetchWeather(cityParam) {
  const city = cityParam || cityInput.value.trim();

  addLog("----------------------------------------");
  addLog("1. Search button clicked / fetchWeather called");

  if (!city) {
    showMessage("Please enter a city name.", "error");
    clearWeatherUI();
    addLog("2. Empty input detected, function stopped");
    return;
  }

  showMessage("Fetching weather...", "success");
  addLog("2. Valid city entered: " + city);
  addLog("3. Before fetch() call");
  addLog("4. Synchronous code continues while fetch waits in background");

  try {
    const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;

    const response = await fetch(url);
    addLog("5. After await fetch(), response received");

    if (!response.ok) {
      throw new Error("Network response was not OK");
    }

    const data = await response.json();
    addLog("6. JSON data parsed successfully");

    if (
      !data ||
      !data.current_condition ||
      !data.current_condition[0]
    ) {
      throw new Error("Invalid API response");
    }

    const current = data.current_condition[0];
    const tempC = current.temp_C;
    const weatherCondition =
      current.weatherDesc && current.weatherDesc[0]
        ? current.weatherDesc[0].value
        : "Not available";

    updateWeatherUI(city, tempC, weatherCondition);
    showMessage("Weather fetched successfully!", "success");
    saveToHistory(city);

    addLog("7. UI updated successfully");
    addLog("8. Search history saved to Local Storage");
  } catch (error) {
    showMessage("Error: " + error.message, "error");
    clearWeatherUI();
    addLog("Error caught in try...catch: " + error.message);
  }

  addLog("9. fetchWeather function finished");
  logPromiseDemo(city);
}

// Event listeners
searchBtn.addEventListener("click", () => {
  fetchWeather();
});

cityInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    fetchWeather();
  }
});

// On page load
window.addEventListener("load", () => {
  addLog("Page loaded");
  addLog("Rendering search history from Local Storage");
  renderHistory();
});
