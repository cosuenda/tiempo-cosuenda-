const url="https://meteo-cosuenda-api.luisromea.workers.dev/";

const fToC=f=>(parseFloat(f)-32)*5/9;
const mphToKmh=mph=>parseFloat(mph)*1.60934;
const inToMm=i=>parseFloat(i)*25.4;
const inHgToHpa=p=>parseFloat(p)*33.8639;

async function obtenerDatos(){

const r=await fetch(url);
const d=await r.json();

const o=d.data.outdoor;
const w=d.data.wind;
const rain=d.data.rainfall;
const p=d.data.pressure;

const temp=fToC(o.temperature.value);
const hum=o.humidity.value;

const wind=mphToKmh(w.wind_speed.value);
const windDeg=w.wind_direction.value;

const rainMm=inToMm(rain.daily.value);
const rainMonthMm=inToMm(rain.monthly.value);

const press=inHgToHpa(p.relative.value);

const uv=d.data.solar_and_uvi.uvi.value;
const solar=d.data.solar_and_uvi.solar.value;

document.getElementById("tempBig").textContent=temp.toFixed(1)+"°";
document.getElementById("hum").textContent=hum+"%";
document.getElementById("windValue").textContent=wind.toFixed(1)+" km/h";

document.getElementById("rain").textContent=rainMm.toFixed(1)+" mm";
document.getElementById("rainMonth").textContent=rainMonthMm.toFixed(1)+" mm";

document.getElementById("press").textContent=press.toFixed(1)+" hPa";

document.getElementById("uv").textContent=uv;
document.getElementById("solar").textContent=solar+" W/m²";

document.getElementById("flechaViento").style.transform=
`translate(-50%,-50%) rotate(${windDeg}deg)`;

const ahora=new Date();
document.getElementById("ultimaActualizacion").textContent=
"Última actualización "+ahora.getHours()+":"+String(ahora.getMinutes()).padStart(2,"0");

}

obtenerDatos();
setInterval(obtenerDatos,300000);
