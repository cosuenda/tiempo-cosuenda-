const url = "https://meteo-cosuenda-api.luisromea.workers.dev/";

const fToC = f => (parseFloat(f)-32)*5/9;
const mphToKmh = mph => parseFloat(mph)*1.60934;
const inToMm = inches => parseFloat(inches)*25.4;
const inHgToHpa = inHg => parseFloat(inHg)*33.8639;

function gradosADireccion(g){
const d=["N","NE","E","SE","S","SW","W","NW"];
return d[Math.round(g/45)%8];
}

let historialTemp = JSON.parse(localStorage.getItem("histTemp") || "[]");

let chart;

function actualizarGrafica(temp){

const ahora=new Date();
const horaLabel = ahora.getHours()+":"+String(ahora.getMinutes()).padStart(2,"0");

historialTemp.push({temp,tempHora:horaLabel});

if(historialTemp.length>24) historialTemp.shift();

localStorage.setItem("histTemp",JSON.stringify(historialTemp));

const ctx=document.getElementById("grafTemp");

if(chart) chart.destroy();

chart=new Chart(ctx,{
type:"line",
data:{
labels:historialTemp.map(d=>d.tempHora),
datasets:[{
data:historialTemp.map(d=>d.temp),
borderColor:"#ffcc00",
backgroundColor:"rgba(255,204,0,0.2)",
tension:0.4
}]
},
options:{
responsive:true,
plugins:{legend:{display:false}}
}
});

}

async function obtenerDatos(){

try{

const response=await fetch(url);
const data=await response.json();

if(data.code!==0) return;

const o=data.data.outdoor;
const w=data.data.wind;
const rain=data.data.rainfall;
const p=data.data.pressure;

const tempC=fToC(o.temperature.value);
const feels=fToC(o.feels_like.value);
const hum=o.humidity.value;

const windKm=mphToKmh(w.wind_speed.value);
const windDeg=w.wind_direction.value;
const windGust=mphToKmh(w.wind_gust.value);

const pressHpa=inHgToHpa(p.relative.value);

const uv=data.data.solar_and_uvi.uvi.value;
const solar=data.data.solar_and_uvi.solar.value;

document.getElementById("tempBig").textContent=tempC.toFixed(1)+"°";
document.getElementById("sensacion").textContent="Sensación térmica: "+feels.toFixed(1)+"°";
document.getElementById("hum").textContent=hum+"%";

document.getElementById("windValue").textContent=windKm.toFixed(1)+" km/h";
document.getElementById("windDirText").textContent="Dirección "+gradosADireccion(windDeg);

document.getElementById("windMaxBig").textContent=windGust.toFixed(1)+" km/h";

document.getElementById("press").textContent=pressHpa.toFixed(1)+" hPa";

document.getElementById("uv").textContent=uv;
document.getElementById("solar").textContent=solar+" W/m²";

document.getElementById("flechaViento").style.transform=`translate(-50%,-100%) rotate(${windDeg}deg)`;

actualizarGrafica(tempC);

const ahora=new Date();

document.getElementById("ultimaActualizacion").textContent="Última actualización "+ahora.getHours()+":"+String(ahora.getMinutes()).padStart(2,"0");

}catch(error){

console.log(error);

}

}

obtenerDatos();

setInterval(obtenerDatos,120000);
