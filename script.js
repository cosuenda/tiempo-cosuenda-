const url = "https://meteocosuenda2026.kazurrito1988.workers.dev/";

// =====================
// Conversiones
// =====================
const fToC = f => f !== undefined ? (parseFloat(f) - 32) * 5 / 9 : "--";
const mphToKmh = mph => mph !== undefined ? parseFloat(mph) * 1.60934 : "--";
const inToMm = inches => inches !== undefined ? parseFloat(inches) * 25.4 : "--";
const inHgToHpa = inHg => inHg !== undefined ? parseFloat(inHg) * 33.8639 : "--";

// =====================
// Dirección del viento
// =====================
function gradosADireccion(g){
  const d=["N","NE","E","SE","S","SW","W","NW"];
  return g !== undefined ? d[Math.round(g/45)%8] : "--";
}

// =====================
// Variables guardadas
// =====================
let tempMinDia = parseFloat(localStorage.getItem("tempMinDia")) || null;
let tempMaxDia = parseFloat(localStorage.getItem("tempMaxDia")) || null;
let maxWindDia = parseFloat(localStorage.getItem("maxWindDia")) || null;
let fechaGuardada = localStorage.getItem("fechaDatos");

// =====================
// Historial gráfica
// =====================
let tempHistory = [];
const maxHistory = 12;

// =====================
// Gráfica
// =====================
const ctx = document.getElementById("grafTemp")?.getContext("2d");
let grafTemp;
if(ctx){
  grafTemp = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "°C",
        data: [],
        borderColor:"#1e90ff",
        backgroundColor:"rgba(30,144,255,0.2)",
        tension:0.3,
        fill:true
      }]
    },
    options: {
      responsive:true,
      scales:{ y:{beginAtZero:false}},
      plugins:{legend:{display:false}}
    }
  });
}

// =====================
// Función principal
// =====================
async function obtenerDatos(){
  try {
    const resp = await fetch(url);
    const json = await resp.json();
    if(!json || json.code !== 0) return;

    const data = json.data.data;

    // =====================
    // CONTROL DE DÍA (FIX REAL)
    // =====================
    const hoy = new Date().toISOString().split("T")[0];

    if(fechaGuardada !== hoy){
      tempMinDia = null;
      tempMaxDia = null;
      maxWindDia = null;

      localStorage.removeItem("tempMinDia");
      localStorage.removeItem("tempMaxDia");
      localStorage.removeItem("maxWindDia");

      localStorage.setItem("fechaDatos", hoy);
      fechaGuardada = hoy;
    }

    // =====================
    // TEMPERATURA
    // =====================
    const tempC = fToC(data.outdoor.temperature?.value);
    const feels = fToC(data.outdoor.feels_like?.value);

    document.getElementById("tempBig").textContent = tempC !== "--" ? tempC.toFixed(1)+"°" : "--";
    document.getElementById("sensacion").textContent = "Sensación térmica: " + (feels !== "--" ? feels.toFixed(1)+"°" : "--");

    if(tempC !== "--"){
      if(tempMinDia === null || tempC < tempMinDia){
        tempMinDia = tempC;
        localStorage.setItem("tempMinDia", tempMinDia);
      }
      if(tempMaxDia === null || tempC > tempMaxDia){
        tempMaxDia = tempC;
        localStorage.setItem("tempMaxDia", tempMaxDia);
      }
    }

    document.getElementById("tempMin").textContent = "Mínima diaria: " + (tempMinDia !== null? tempMinDia.toFixed(1)+"°":"--");
    document.getElementById("tempMax").textContent = "Máxima diaria: " + (tempMaxDia !== null? tempMaxDia.toFixed(1)+"°":"--");

    // =====================
    // HUMEDAD
    // =====================
    document.getElementById("hum").textContent = data.outdoor.humidity?.value + "%";

    // =====================
    // VIENTO
    // =====================
    const windKm = mphToKmh(data.wind.wind_speed?.value);
    document.getElementById("windValue").textContent = windKm !== "--" ? windKm.toFixed(1)+" km/h" : "--";

    document.getElementById("windDirText").textContent = "Dirección: "+gradosADireccion(data.wind.wind_direction?.value);

    const flecha = document.getElementById("flechaViento");
    if(flecha && data.wind.wind_direction?.value !== undefined){
      flecha.style.transform = `translate(-50%,-100%) rotate(${data.wind.wind_direction.value}deg)`;
    }

    // =====================
    // RACHA MÁXIMA (FIX)
    // =====================
    const windGustKm = mphToKmh(data.wind.wind_gust?.value);

    if(windGustKm !== "--"){
      if(maxWindDia === null || windGustKm > maxWindDia){
        maxWindDia = windGustKm;
        localStorage.setItem("maxWindDia", maxWindDia);
      }
    }

    document.getElementById("windMaxBig").textContent =
      maxWindDia !== null ? maxWindDia.toFixed(1) + " km/h" : "--";

    // =====================
    // LLUVIA
    // =====================
    const rainDay = inToMm(data.rainfall.daily?.value);
    const rainMonth = inToMm(data.rainfall.monthly?.value);
    const rainYear = inToMm(data.rainfall.yearly?.value);

    document.getElementById("rainValue").textContent = rainDay !== "--"?rainDay.toFixed(1)+" mm":"--";
    document.getElementById("rainMonthValue").textContent = rainMonth !== "--"?rainMonth.toFixed(1)+" mm":"--";
    document.getElementById("rainYearValue").textContent = rainYear !== "--"?rainYear.toFixed(1)+" mm":"--";

    const maxRain = Math.max(rainDay||0, rainMonth||0, rainYear||0, 1);
    [
      {bar:document.querySelector(".rainDay .bar"), val:rainDay},
      {bar:document.querySelector(".rainMonth .bar"), val:rainMonth},
      {bar:document.querySelector(".rainYear .bar"), val:rainYear}
    ].forEach(b => {
      if(b.bar) b.bar.style.width = `${Math.min((b.val/maxRain)*100,100)}%`;
    });

    // =====================
    // PRESIÓN
    // =====================
    document.getElementById("press").textContent =
      inHgToHpa(data.pressure.relative?.value) !== "--"
      ? inHgToHpa(data.pressure.relative.value).toFixed(1)
      : "--";

    // =====================
    // UV / SOLAR
    // =====================
    document.getElementById("uv").textContent = data.solar_and_uvi.uvi?.value ?? "--";
    document.getElementById("solar").textContent = data.solar_and_uvi.solar?.value ?? "--";

    // =====================
    // GRÁFICA
    // =====================
    if(tempC !== "--"){
      const now = new Date();
      const label = now.getHours().toString().padStart(2,'0')+":"+now.getMinutes().toString().padStart(2,'0');

      tempHistory.push({time:label, value:tempC});
      if(tempHistory.length > maxHistory) tempHistory.shift();

      if(grafTemp){
        grafTemp.data.labels = tempHistory.map(t=>t.time);
        grafTemp.data.datasets[0].data = tempHistory.map(t=>t.value);
        grafTemp.update();
      }
    }

    // =====================
    // ÚLTIMA ACTUALIZACIÓN
    // =====================
    document.getElementById("ultimaActualizacion").textContent =
      "Última actualización: " + new Date().toLocaleTimeString();

  } catch(e){
    console.error("Error:", e);
  }
}

// =====================
obtenerDatos();
setInterval(obtenerDatos, 120000);
