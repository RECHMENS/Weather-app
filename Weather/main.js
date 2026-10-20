const cityInput = document.getElementById("city");
const els = {
    temp: document.getElementById("temp"),
    feel: document.getElementById("feel"),
    high: document.getElementById("high"),
    low: document.getElementById("low"),
    wind: document.getElementById("wind"),
    humidity: document.getElementById("humidity"),
    pressure: document.getElementById("pressure"),
};

function getTimeOfDay(c) {
    const HOUR = 3600;
    const now = c.dt;
    const sunrise = c.sys.sunrise;
    const sunset = c.sys.sunset;

    if (now < sunrise - HOUR / 2 || now > sunset + HOUR / 2) return "night";
    if (now < sunrise + 2 * HOUR) return "morning";
    if (now > sunset - 2 * HOUR) return "evening";
    return "day";
}

function getWeatherState(id) {
    if (id >= 200 && id < 300) return "thunder";
    if (id >= 300 && id < 600) return "rain";
    if (id === 800) return "clear";
    if (id === 801 || id === 802) return "partly";
    if (id === 803 || id === 804) return "cloudy";
    return "none";
}

async function loadWeather(params) {
    try {
        const res = await fetch("weather.php?" + new URLSearchParams(params));
        const data = await res.json();

        if (!res.ok) {
            alert(data.error || "Could not load weather");
            return;
        }

        const c = data.current;

        const id = c.weather && c.weather[0] ? c.weather[0].id : 0;
        document.querySelector(".main-text").dataset.weather = getWeatherState(id);
        document.documentElement.dataset.time = getTimeOfDay(c);

        cityInput.value = c.name;
        els.temp.textContent = Math.round(c.main.temp) + "°C";
        els.feel.textContent = "Feels like " + Math.round(c.main.feels_like) + "°C";
        els.high.textContent = "High " + Math.round(c.main.temp_max) + "°C";
        els.low.textContent = "Low " + Math.round(c.main.temp_min) + "°C";
        els.wind.textContent = Math.round(c.wind.speed * 3.6) + " km/h";
        els.humidity.textContent = c.main.humidity + "%";
        els.pressure.textContent = c.main.pressure + " hPa";

        console.log(data.forecast);
    } catch (err) {
        console.error(err);
        alert("Network error");
    }
}

cityInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && cityInput.value.trim()) {
        loadWeather({ city: cityInput.value.trim() });
    }
});

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        (pos) => loadWeather({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => loadWeather({ city: "Riga" }),
        { timeout: 8000 }
    );
} else {
    loadWeather({ city: "Riga" });
}