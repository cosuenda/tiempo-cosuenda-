const url = "https://meteocosuenda2026.kazurrito1988.workers.dev/";

const fToC = f => (f - 32) * 5 / 9;
const mphToKmh = m => m * 1.60934;

let grafTemp;

grafTemp = new Chart(document.getElementById("grafTemp"), {
  type: "line",
  data: {
    labels: [],
    datasets: [{
      data: [],
      borderWidth: 2,
      tension: 0.4,
      fill: true
    }]
  },
  options: {
    plugins: { legend: { display: false } }
  }
});

async function cargar() {
  const res = await fetch(url);
  const json = await res.json();

  const d = json.data.data;
  const e = json.extra;

  const tempC = fToC(d.outdoor.temperature.value);
  const wind = mphToKmh(d.wind.wind_speed.value);

  document.getElementById("tempBig").textContent = tempC.toFixed(1) + "°";
  document.getElementById("hum").textContent = d.outdoor.humidity.value + "%";

  document.getElementById("tempMax").textContent = "Max: " + e.tempMax.toFixed(1);
  document.getElementById("tempMin").textContent = "Min: " + e.tempMin.toFixed(1);

  document.getElementById("windValue").textContent = wind.toFixed(1) + " km/h";
  document.getElementById("windMaxBig").textContent = e.windMax.toFixed(1) + " km/h";

  document.getElementById("press").textContent =
    d.pressure.relative.value + " hPa";

  document.getElementById("uv").textContent =
    d.solar_and_uvi.uvi.value;

  document.getElementById("solar").textContent =
    d.solar_and_uvi.solar.value;

  document.getElementById("ultimaActualizacion").textContent =
    "Actualizado: " + new Date().toLocaleTimeString();

  grafTemp.data.labels = e.historial.map(p =>
    new Date(p.t).toLocaleTimeString()
  );

  grafTemp.data.datasets[0].data = e.historial.map(p => p.temp);

  grafTemp.update();

  // fondo dinámico
  if (tempC < 5) document.body.className = "temp-cold";
  else if (tempC < 18) document.body.className = "temp-normal";
  else if (tempC < 28) document.body.className = "temp-warm";
  else document.body.className = "temp-hot";
}

cargar();
setInterval(cargar, 60000);
