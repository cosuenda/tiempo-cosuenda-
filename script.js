const url = "https://meteo-cosuenda-api.luisromea.workers.dev/";

// Conversiones
const fToC = f => (parseFloat(f)-32)*5/9;
const mphToKmh = mph => parseFloat(mph)*1.60934;
const inToMm = inches => parseFloat(inches)*25.4;
const inHgToHpa = inHg => parseFloat(inHg)*33.8639;

// Direcciones del viento
function gradosADireccion(g){
    const d = ["N","NE","E","SE","S","SW","W","NW"];
    return d[Math.round(g/45)%8];
}

// Fecha de hoy
function hoyString(){
    const h = new Date();
    return h.getFullYear()+"-"+(h.getMonth()+1)+"-"+h.getDate();
}

// Comprobar cambio de día
function comprobarCambioDia(){
    const hoy = hoyString();
    const guardado = localStorage.getItem("diaActual");
    if(guardado !== hoy){
        localStorage.setItem("diaActual", hoy);
        localStorage.setItem("tempMin", "999");
        localStorage.setItem("tempMax", "-999");
        localStorage.setItem("windMax", "0");
    }
}
comprobarCambioDia();

// Colores dinámicos
function colorTemp(t){ return t<=0?"#00f":t>=30?"#f00":"#fff"; }
function colorHum(h){ return h>=80?"#0ff":"#fff"; }
function colorViento(w){ return w>=30?"#ff0":"#fff"; }
function colorLluvia(r){ return r>=5?"#0f0":"#fff"; }
function colorUV(u){ return u>=7?"#ff0":"#fff"; }

// Obtener datos
async function obtenerDatos(){
    try{
        const res = await fetch(url);
        const data = await res.json();
        if(data.code!==0) return;

        const o = data.data.outdoor;
        const w = data.data.wind;
        const rain = data.data.rainfall;
        const p = data.data.pressure;
        const uvIndex = data.data.solar_and_uvi?.uvi?.value ?? 0;
        const solar = data.data.solar_and_uvi?.solar?.value ?? "--";

        const tempC = fToC(o.temperature.value);
        const feels = o.feels_like ? fToC(o.feels_like.value) : tempC;
        const hum = parseFloat(o.humidity.value);
        const windKm = mphToKmh(w.wind_speed.value);
        const windDeg = parseFloat(w.wind_direction.value);
        const windGust = mphToKmh(w.wind_gust.value ?? 0);
        const rainMm = inToMm(rain.daily.value);
        const rainMonthMm = inToMm(rain.monthly?.value ?? 0);
        const pressHpa = inHgToHpa(p.relative.value);

        let tempMin = parseFloat(localStorage.getItem("tempMin"));
        let tempMax = parseFloat(localStorage.getItem("tempMax"));
        let windMax = parseFloat(localStorage.getItem("windMax"));

        if(tempC<tempMin){ tempMin=tempC; localStorage.setItem("tempMin", tempMin);}
        if(tempC>tempMax){ tempMax=tempC; localStorage.setItem("tempMax", tempMax);}
        if(windGust>windMax){ windMax=windGust; localStorage.setItem("windMax", windMax);}

        // Actualizar HTML
        const tempEl = document.getElementById("tempBig");
        tempEl.textContent = tempC.toFixed(1)+"°"; tempEl.style.color = colorTemp(tempC);
        const humEl = document.getElementById("hum"); humEl.textContent = hum+"%"; humEl.style.color = colorHum(hum);
        const windEl = document.getElementById("windValue"); windEl.textContent = windKm.toFixed(1); windEl.style.color = colorViento(windKm);
        document.getElementById("windMax").textContent = "Racha máxima diaria: "+windMax.toFixed(1);
        document.getElementById("windDirText").textContent = "Dirección: "+gradosADireccion(windDeg);
        document.getElementById("rain").textContent = rainMm.toFixed(1)+" mm"; document.getElementById("rainMonth").textContent = rainMonthMm.toFixed(1)+" mm";
        document.getElementById("press").textContent = pressHpa.toFixed(1)+" hPa";
        const uvEl = document.getElementById("uv"); uvEl.textContent = uvIndex; uvEl.style.color = colorUV(uvIndex);
        document.getElementById("solar").textContent = solar+" W/m²";
        document.getElementById("flechaViento").style.transform = `translateX(-50%) rotate(${windDeg}deg)`;
        const ahora = new Date(); document.getElementById("ultimaActualizacion").textContent = "Última actualización: "+ahora.getHours()+":"+String(ahora.getMinutes()).padStart(2,"0");

        // 🔥 Animaciones
        tempEl.style.animation="pulseSoft 0.6s ease"; setTimeout(()=>tempEl.style.animation="",600);
        if(uvIndex>=7){ uvEl.style.animation="glowStrong 1.5s infinite"; }else{ uvEl.style.animation=""; }
        if(windKm>=30){ windEl.style.animation="windShake 0.4s infinite"; }else{ windEl.style.animation=""; }
        if(hum>=80){ humEl.style.animation="breathe 2s infinite"; }else{ humEl.style.animation=""; }

    }catch(e){ console.log("Error conexión", e);}
}
obtenerDatos();
setInterval(obtenerDatos,300000);

