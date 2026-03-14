const url = "https://meteocosuenda2026.kazurrito1988.workers.dev/";

// Conversión de unidades
const fToC = f => f !== undefined ? (parseFloat(f) - 32) * 5 / 9 : "--";
const mphToKmh = mph => mph !== undefined ? parseFloat(mph) * 1.60934 : "--";
const inToMm = inches => inches !== undefined ? parseFloat(inches) * 25.4 : "--";
const inHgToHpa = inHg => inHg !== undefined ? parseFloat(inHg) * 33.8639 : "--";

// Dirección del viento
function gradosADireccion(g){
  const d=["N","NE","E","SE","S","SW","W","NW"];
  return g !== undefined ? d[Math.round(g/45)%8] : "--";
}

// Persistencia mínima/máxima diaria
let diaActual = new Date().getDate();
let tempMinDia = parseFloat(localStorage.getItem("tempMinDia")) || null;
let tempMaxDia = parseFloat(localStorage.getItem("tempMaxDia")) || null;

// Historial de temperaturas para la gráfica
let tempHistory = [];
const maxHistory = 12; // Últimas 12 mediciones (~24 min)

// Función principal
async function obtenerDatos(){
  try{
    const resp = await fetch(url);
    const json = await resp.json();
    if(!json || json.code !== 0) return;
    const data = json.data.data;

    const o = data?.outdoor ?? {};
    const w = data?.wind ?? {};
    const rain = data?.rainfall ?? {};
    const p = data?.pressure ?? {};
    const uv = data?.solar_and_uvi?.uvi?.value ?? "--";
    const solar = data?.solar_and_uvi?.solar?.value ?? "--";

    // Reinicio diario de min/max
    const hoy = new Date().getDate();
    if(hoy !== diaActual){
      diaActual = hoy;
      tempMinDia = null;
      tempMaxDia = null;
      localStorage.removeItem("tempMinDia");
      localStorage.removeItem("tempMaxDia");
    }

    // Temperatura actual
    const tempC = fToC(o.temperature?.value);
    const feels = fToC(o.feels_like?.value);

    const tempBigEl = document.getElementById("tempBig");
    if(tempBigEl) tempBigEl.textContent = tempC !== "--" ? tempC.toFixed(1)+"°" : "--";

    const sensEl = document.getElementById("sensacion");
    if(sensEl) sensEl.textContent = "Sensación térmica: "+(feels !== "--" ? feels.toFixed(1)+"°" : "--");

    // Min/Max persistentes
    if(tempC !== "--"){
      if(tempMinDia === null || tempC < tempMinDia){ tempMinDia = tempC; localStorage.setItem("tempMinDia", tempMinDia);}
      if(tempMaxDia === null || tempC > tempMaxDia){ tempMaxDia = tempC; localStorage.setItem("tempMaxDia", tempMaxDia);}
    }

    const tempMinEl = document.getElementById("tempMin");
    const tempMaxEl = document.getElementById("tempMax");
    if(tempMinEl) tempMinEl.textContent = "Mínima diaria: "+(tempMinDia !== null ? tempMinDia.toFixed(1)+"°" : "--");
    if(tempMaxEl) tempMaxEl.textContent = "Máxima diaria: "+(tempMaxDia !== null ? tempMaxDia.toFixed(1)+"°" : "--");

    // Actualizar historial para gráfica
    if(tempC !== "--"){
      const now = new Date();
      const hora = now.getHours().toString().padStart(2,'0');
      const min = now.getMinutes().toString().padStart(2,'0');
      tempHistory.push({time:`${hora}:${min}`, value: tempC.toFixed(1)});
      if(tempHistory.length > maxHistory) tempHistory.shift();
    }

    // Humedad
    const humEl = document.getElementById("hum");
    if(humEl) humEl.textContent = o.humidity?.value ?? "--";

    // Viento y flecha
    const windEl = document.getElementById("windValue");
    const windDirEl = document.getElementById("windDirText");
    const flecha = document.getElementById("flechaViento");
    const windKm = mphToKmh(w.wind_speed?.value);
    if(windEl) windEl.textContent = windKm !== "--" ? windKm.toFixed(1)+" km/h" : "--";
    if(windDirEl) windDirEl.textContent = "Dirección: "+gradosADireccion(w.wind_direction?.value);
    if(flecha && w.wind_direction?.value !== undefined){
      flecha.style.transform = `translate(-50%,-100%) rotate(${w.wind_direction.value}deg)`;
    }

    // Racha máxima
    const windMaxEl = document.getElementById("windMaxBig");
    if(windMaxEl) windMaxEl.textContent = mphToKmh(w.wind_gust?.value) !== "--" ? mphToKmh(w.wind_gust.value).toFixed(1)+" km/h" : "--";

    // Lluvia diaria, mensual, anual
    const rainDay = inToMm(rain.daily?.value);
    const rainMonth = inToMm(rain.monthly?.value);
    const rainYear = inToMm(rain.yearly?.value);

    const rainEl = document.getElementById("rainValue");
    const rainMonthEl = document.getElementById("rainMonthValue");
    const rainYearEl = document.getElementById("rainYearValue");
    if(rainEl) rainEl.textContent = rainDay !== "--" ? rainDay.toFixed(1)+" mm" : "--";
    if(rainMonthEl) rainMonthEl.textContent = rainMonth !== "--" ? rainMonth.toFixed(1)+" mm" : "--";
    if(rainYearEl) rainYearEl.textContent = rainYear !== "--" ? rainYear.toFixed(1)+" mm" : "--";

    // Barras de lluvia
    const maxRain = Math.max(rainDay||0, rainMonth||0, rainYear||0, 1);
    const bars = [
      {bar: document.querySelector(".rainDay .bar"), value: rainDay},
      {bar: document.querySelector(".rainMonth .bar"), value: rainMonth},
      {bar: document.querySelector(".rainYear .bar"), value: rainYear}
    ];
    bars.forEach(b=>{
      if(b.bar) b.bar.style.width = `${Math.min((b.value/maxRain)*100,100)}%`;
    });

    // Presión
    const presEl = document.getElementById("press");
    if(presEl) presEl.textContent = inHgToHpa(p.relative?.value) !== "--" ? inHgToHpa(p.relative.value).toFixed(1) : "--";

    // UV y Solar
    const uvEl = document.getElementById("uv");
    const solarEl = document.getElementById("solar");
    if(uvEl) uvEl.textContent = uv;
    if(solarEl) solarEl.textContent = solar;

    // Última actualización
    const updEl = document.getElementById("ultimaActualizacion");
    if(updEl) updEl.textContent = "Última actualización: "+new Date().toLocaleTimeString();

    // Gráfica de temperaturas
    const ctx = document.getElementById("grafTemp");
    if(ctx){
      if(!ctx.chart){
        ctx.chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: tempHistory.map(t=>t.time),
            datasets: [{
              label: 'Temperatura (°C)',
              data: tempHistory.map(t=>t.value),
              borderColor: '#1e90ff',
              backgroundColor: 'rgba(30,144,255,0.2)',
              tension: 0.4,
              fill: true,
              pointRadius: 4
            }]
          },
          options: {
            responsive: true,
            plugins: {legend:{display:false}},
            scales:{y:{beginAtZero:false}}
          }
        });
      } else {
        ctx.chart.data.labels = tempHistory.map(t=>t.time);
        ctx.chart.data.datasets[0].data = tempHistory.map(t=>t.value);
        ctx.chart.update();
      }
    }

  } catch(e){
    console.error("Error actualizando datos:", e);
  }
}

// Inicialización y actualización cada 2 minutos
obtenerDatos();
setInterval(obtenerDatos, 120000);
