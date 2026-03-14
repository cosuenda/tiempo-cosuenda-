const url = "https://meteocosuenda2026.kazurrito1988.workers.dev/";

// Conversiones
const fToC = f => f !== undefined ? (parseFloat(f)-32)*5/9 : "--";
const mphToKmh = mph => mph !== undefined ? parseFloat(mph)*1.60934 : "--";
const inToMm = inches => inches !== undefined ? parseFloat(inches)*25.4 : "--";
const inHgToHpa = inHg => inHg !== undefined ? parseFloat(inHg)*33.8639 : "--";

// Direcciones del viento
function gradosADireccion(g){
  const d=["N","NE","E","SE","S","SW","W","NW"];
  return g !== undefined ? d[Math.round(g/45)%8] : "--";
}

// Variables para temp min/max y gráfico
let diaActual = new Date().getDate();
let tempMinDia = parseFloat(localStorage.getItem("tempMinDia")) || null;
let tempMaxDia = parseFloat(localStorage.getItem("tempMaxDia")) || null;
let tempHistory = [];
const maxHistory = 12;

// Inicializamos gráfica
const ctx = document.getElementById("grafTemp").getContext("2d");
const grafTemp = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [{
      label: "°C",
      data: [],
      borderColor: "#ffcc00",
      backgroundColor: "rgba(255,204,0,0.2)",
      tension: 0.3,
      fill: true,
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: false }
    },
    plugins: { legend: { display: false } }
  }
});

// Función principal para actualizar datos
async function obtenerDatos(){
  try{
    const resp = await fetch(url);
    const json = await resp.json();
    if(!json || json.code!==0) return;
    const data = json.data.data;

    // Reinicio diario min/max
    const hoy = new Date().getDate();
    if(hoy !== diaActual){
      diaActual = hoy;
      tempMinDia = null;
      tempMaxDia = null;
      localStorage.removeItem("tempMinDia");
      localStorage.removeItem("tempMaxDia");
    }

    // Temperatura
    const tempC = fToC(data.outdoor.temperature?.value);
    const feels = fToC(data.outdoor.feels_like?.value);

    if(document.getElementById("tempBig")) document.getElementById("tempBig").textContent = tempC!=="--"?tempC.toFixed(1)+"°":"--";
    if(document.getElementById("sensacion")) document.getElementById("sensacion").textContent = "Sensación térmica: "+(feels!=="--"?feels.toFixed(1)+"°":"--");

    if(tempC !== "--"){
      if(tempMinDia === null || tempC < tempMinDia){ tempMinDia = tempC; localStorage.setItem("tempMinDia", tempMinDia);}
      if(tempMaxDia === null || tempC > tempMaxDia){ tempMaxDia = tempC; localStorage.setItem("tempMaxDia", tempMaxDia);}
    }
    if(document.getElementById("tempMin")) document.getElementById("tempMin").textContent = "Mínima diaria: "+(tempMinDia!==null?tempMinDia.toFixed(1)+"°":"--");
    if(document.getElementById("tempMax")) document.getElementById("tempMax").textContent = "Máxima diaria: "+(tempMaxDia!==null?tempMaxDia.toFixed(1)+"°":"--");

    // Actualizamos historial para gráfica
    if(tempC !== "--"){
      const now = new Date();
      const hora = now.getHours().toString().padStart(2,'0');
      const min = now.getMinutes().toString().padStart(2,'0');
      tempHistory.push({time: `${hora}:${min}`, value: tempC.toFixed(1)});
      if(tempHistory.length > maxHistory) tempHistory.shift();

      grafTemp.data.labels = tempHistory.map(t => t.time);
      grafTemp.data.datasets[0].data = tempHistory.map(t => t.value);
      grafTemp.update();
    }

    // Humedad
    if(document.getElementById("hum")) document.getElementById("hum").textContent = data.outdoor.humidity?.value ?? "--";

    // Viento
    const windKm = mphToKmh(data.wind.wind_speed?.value);
    const windGustKm = mphToKmh(data.wind.wind_gust?.value);
    const windDir = gradosADireccion(data.wind.wind_direction?.value);

    if(document.getElementById("windValue")) document.getElementById("windValue").textContent = windKm!=="--"?windKm.toFixed(1)+" km/h":"--";
    if(document.getElementById("windMaxBig")) document.getElementById("windMaxBig").textContent = windGustKm!=="--"?windGustKm.toFixed(1)+" km/h":"--";
    if(document.getElementById("windDirText")) document.getElementById("windDirText").textContent = "Dirección: "+windDir;

    if(document.getElementById("flechaViento") && data.wind.wind_direction?.value!==undefined){
      document.getElementById("flechaViento").style.transform = `translate(-50%,-100%) rotate(${data.wind.wind_direction.value}deg)`;
    }

    // Lluvia
    const rainDay = inToMm(data.rainfall.daily?.value);
    const rainMonth = inToMm(data.rainfall.monthly?.value);
    const rainYear = inToMm(data.rainfall.yearly?.value);

    if(document.getElementById("rainValue")) document.getElementById("rainValue").textContent = rainDay!=="--"?rainDay.toFixed(1)+" mm":"--";
    if(document.getElementById("rainMonthValue")) document.getElementById("rainMonthValue").textContent = rainMonth!=="--"?rainMonth.toFixed(1)+" mm":"--";
    if(document.getElementById("rainYearValue")) document.getElementById("rainYearValue").textContent = rainYear!=="--"?rainYear.toFixed(1)+" mm":"--";

    // Ajustar barras de lluvia
    const maxRain = Math.max(rainDay||0, rainMonth||0, rainYear||0, 1);
    const bars = [
      {bar: document.querySelector(".rainDay .bar"), value: rainDay},
      {bar: document.querySelector(".rainMonth .bar"), value: rainMonth},
      {bar: document.querySelector(".rainYear .bar"), value: rainYear}
    ];
    bars.forEach(b => { if(b.bar) b.bar.style.width = `${Math.min((b.value/maxRain)*100,100)}%`; });

    // Presión
    if(document.getElementById("press")) document.getElementById("press").textContent = inHgToHpa(data.pressure.relative?.value)!=="--"?inHgToHpa(data.pressure.relative.value).toFixed(1):"--";

    // UV y Solar con colores dinámicos
    const uvEl = document.getElementById("uv");
    const solarEl = document.getElementById("solar");
    if(uvEl){
      uvEl.textContent = data.solar_and_uvi.uvi?.value ?? "--";
      if(uvEl.textContent!=="--") uvEl.style.color = data.solar_and_uvi.uvi.value>3 ? "#ffcc00":"#66ff66";
    }
    if(solarEl){
      solarEl.textContent = data.solar_and_uvi.solar?.value ?? "--";
      if(solarEl.textContent!=="--") solarEl.style.color = data.solar_and_uvi.solar.value>50 ? "#1e90ff":"#66ccff";
    }

    // Última actualización
    if(document.getElementById("ultimaActualizacion")) document.getElementById("ultimaActualizacion").textContent = "Última actualización: "+new Date().toLocaleTimeString();

  } catch(e){
    console.error("Error actualizando datos:", e);
  }
}

obtenerDatos();
setInterval(obtenerDatos, 120000);
