const $ = id => document.getElementById(id);
let lang = localStorage.getItem("kc_lang") || "en";
let mode = "login";
let user = null;
let imageData = "";

const words = {
  en: {
    dashboard:"Dashboard",diagnosis:"Crop Doctor",soil:"Soil Health",weather:"Weather",reports:"My Reports",
    login:"Login",signup:"Sign up",required:"Please complete the required fields.",
    cropTitle:"Preliminary Crop Guidance",soilTitle:"Soil Observation Report",
    warning:"Important: this is preliminary guidance, not a confirmed diagnosis. Do not apply pesticides or fertilisers based only on this result.",
    next:"Suggested next steps",expert:"If symptoms spread, contact your local Krishi Vigyan Kendra (KVK), agriculture extension officer, or qualified agronomist. A soil test can help guide fertiliser decisions.",
    yellow:"Yellow leaves may be linked to nutrient issues, water stress, root problems or disease. Check older and younger leaves, soil moisture and recent weather.",
    spots:"Leaf spots may be caused by disease, insects or environmental stress. Photograph both sides of leaves and check whether spots are spreading.",
    wilt:"Wilting can be linked to water stress, root damage, waterlogging or disease. Check soil moisture and roots before changing irrigation.",
    pest:"Inspect the underside of leaves and growing tips for insects. Identify the pest before choosing a control method.",
    growth:"Slow growth can be linked to soil pH, nutrients, water, compaction, seed quality or pests. A soil test and field inspection can help.",
    general:"Compare affected and healthy plants. Inspect leaves and roots, and note recent irrigation, rainfall and fertiliser use.",
    soilWarning:"Visual observations cannot confirm nutrient levels or soil pH. Consider a recognised soil test before making major fertiliser changes.",
    saved:"Report saved in this browser.",noReports:"No reports saved yet.",read:"🔊 Read aloud",print:"Print",save:"Save report",remove:"Delete",
    weatherLoading:"Checking weather…",weatherError:"Could not find that place. Check spelling or try a nearby town.",weatherFail:"Weather service is unavailable. Please try again later.",
    clearConfirm:"Delete all saved reports from this browser?",micFail:"Voice input is not supported in this browser.",listening:"Listening… speak now.",
    photoLarge:"Please select an image smaller than 5 MB.",nameNeeded:"Please enter your name.",
    signError:"Please check your email and password (at least 4 characters).",
    soilWater:"If soil is waterlogged, avoid unnecessary irrigation and check drainage. Standing water can harm roots.",
    soilDry:"If the soil is very dry, check moisture below the surface and follow crop-specific irrigation guidance.",
    soilCare:"For long-term soil care, consider locally suitable organic matter and crop rotation based on soil test results and local agricultural advice."
  },
  hi: {
    dashboard:"डैशबोर्ड",diagnosis:"फसल डॉक्टर",soil:"मिट्टी की सेहत",weather:"मौसम",reports:"मेरी रिपोर्ट",
    login:"लॉग इन",signup:"खाता बनाएं",required:"कृपया ज़रूरी जानकारी भरें।",
    cropTitle:"फसल के लिए शुरुआती सलाह",soilTitle:"मिट्टी की स्थिति की रिपोर्ट",
    warning:"महत्वपूर्ण: यह शुरुआती सलाह है, पुष्टि किया गया निदान नहीं। केवल इस नतीजे के आधार पर कीटनाशक या खाद न डालें।",
    next:"सुझाए गए अगले कदम",expert:"यदि लक्षण फैल रहे हैं, तो स्थानीय कृषि विज्ञान केंद्र (KVK), कृषि अधिकारी या योग्य कृषि विशेषज्ञ से संपर्क करें। खाद के फैसले में मिट्टी की जाँच मदद कर सकती है।",
    yellow:"पीली पत्तियाँ पोषक तत्वों की कमी, पानी के तनाव, जड़ों की समस्या या बीमारी से जुड़ी हो सकती हैं। पुरानी और नई पत्तियाँ, मिट्टी की नमी और हाल का मौसम जाँचें।",
    spots:"पत्तियों के धब्बे बीमारी, कीट या मौसम के तनाव से हो सकते हैं। पत्ती के दोनों तरफ की फोटो लें और देखें कि धब्बे फैल रहे हैं या नहीं।",
    wilt:"पौधे पानी की कमी, जड़ों के नुकसान, खेत में अधिक पानी या बीमारी से मुरझा सकते हैं। सिंचाई बदलने से पहले मिट्टी की नमी और जाँचें देखें।",
    pest:"पत्तियों के नीचे और नई बढ़त पर कीट देखें। नियंत्रण का तरीका चुनने से पहले कीट की पहचान करें।",
    growth:"धीमी बढ़त मिट्टी के pH, पोषक तत्व, पानी, कठोर मिट्टी, बीज की गुणवत्ता या कीटों से जुड़ी हो सकती है। मिट्टी की जाँच मदद कर सकती है।",
    general:"प्रभावित और स्वस्थ पौधों की तुलना करें। पत्तियाँ और जड़ें देखें, और हाल की सिंचाई, बारिश व खाद का रिकॉर्ड रखें।",
    soilWarning:"केवल देखकर मिट्टी के पोषक तत्वों या pH की पुष्टि नहीं होती। खाद में बड़े बदलाव से पहले मान्यता प्राप्त मिट्टी परीक्षण कराएं।",
    saved:"रिपोर्ट इस ब्राउज़र में सेव हो गई।",noReports:"अभी कोई रिपोर्ट सेव नहीं है।",read:"🔊 रिपोर्ट सुनें",print:"प्रिंट",save:"रिपोर्ट सेव करें",remove:"हटाएँ",
    weatherLoading:"मौसम की जानकारी खोजी जा रही है…",weatherError:"यह जगह नहीं मिली। नाम जाँचें या पास के शहर का नाम डालें।",weatherFail:"मौसम सेवा अभी उपलब्ध नहीं है। बाद में कोशिश करें।",
    clearConfirm:"इस ब्राउज़र से सभी सेव रिपोर्ट हटानी हैं?",micFail:"इस ब्राउज़र में आवाज़ से लिखने की सुविधा नहीं है।",listening:"सुन रहे हैं… अब बोलें।",
    photoLarge:"कृपया 5 MB से छोटी फोटो चुनें।",nameNeeded:"कृपया अपना नाम लिखें।",
    signError:"ईमेल और पासवर्ड जाँचें। पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।",
    soilWater:"यदि मिट्टी में पानी भरा है, तो अनावश्यक सिंचाई रोकें और पानी निकासी देखें। जमा पानी जड़ों को नुकसान पहुँचा सकता है।",
    soilDry:"यदि मिट्टी बहुत सूखी है, तो सतह के नीचे नमी जाँचें और फसल के अनुसार सिंचाई सलाह अपनाएं।",
    soilCare:"मिट्टी की लंबे समय तक देखभाल के लिए स्थानीय कृषि सलाह और मिट्टी परीक्षण के अनुसार जैविक पदार्थ व फसल चक्र अपनाने पर विचार करें।"
  }
};
const t = key => words[lang][key] || words.en[key] || key;

function setLanguage(value) {
  lang = value === "hi" ? "hi" : "en";
  localStorage.setItem("kc_lang", lang);
  document.documentElement.lang = lang;
  $("language").value = lang;
  $("language2").value = lang;

  document.querySelectorAll("[data-en]").forEach(el => {
    el.textContent = el.dataset[lang];
  });
  document.querySelectorAll("[data-en-placeholder]").forEach(el => {
    el.placeholder = el.dataset[lang + "Placeholder"];
  });

  if ($("authSubmit")) $("authSubmit").textContent = mode === "login" ? t("login") : t("signup");
  const page = document.querySelector(".page:not(.hidden)");
  if (page) $("pageTitle").textContent = page.id === "dashboard"
    ? t("dashboard") : t(page.id);
  renderReports();
}
$("language").addEventListener("change", e => setLanguage(e.target.value));
$("language2").addEventListener("change", e => setLanguage(e.target.value));

function getUsers() {
  try { return JSON.parse(localStorage.getItem("kc_users") || "{}"); }
  catch { return {}; }
}
function setMode(value) {
  mode = value;
  $("loginTab").classList.toggle("active", mode === "login");
  $("signupTab").classList.toggle("active", mode === "signup");
  $("name").classList.toggle("hidden", mode !== "signup");
  $("nameLabel").classList.toggle("hidden", mode !== "signup");
  $("name").required = mode === "signup";
  $("authSubmit").textContent = t(mode);
  $("authMessage").textContent = "";
}
$("loginTab").onclick = () => setMode("login");
$("signupTab").onclick = () => setMode("signup");

$("authForm").addEventListener("submit", e => {
  e.preventDefault();
  const email = $("email").value.trim().toLowerCase();
  const password = $("password").value;
  const users = getUsers();

  if (password.length < 4) {
    $("authMessage").textContent = t("signError");
    return;
  }

  if (mode === "signup") {
    const name = $("name").value.trim();
    if (!name) {
      $("authMessage").textContent = t("nameNeeded");
      return;
    }
    users[email] = { name, password };
    localStorage.setItem("kc_users", JSON.stringify(users));
    user = { name, email };
  } else {
    // Demo only: a new email can also enter without creating an account.
    if (users[email] && users[email].password !== password) {
      $("authMessage").textContent = t("signError");
      return;
    }
    user = { name: users[email]?.name || email.split("@")[0], email };
  }

  localStorage.setItem("kc_session", JSON.stringify(user));
  showApp();
});

function showApp() {
  if (!user) return;
  $("authScreen").classList.add("hidden");
  $("app").classList.remove("hidden");
  $("userName").textContent = user.name;
  $("welcomeName").textContent = user.name;
  updateCount();
  renderReports();
}
$("logout").onclick = () => {
  localStorage.removeItem("kc_session");
  user = null;
  $("app").classList.add("hidden");
  $("authScreen").classList.remove("hidden");
  $("password").value = "";
  setMode("login");
};

function goTo(page) {
  document.querySelectorAll(".page").forEach(p => p.classList.toggle("hidden", p.id !== page));
  document.querySelectorAll(".nav").forEach(b => b.classList.toggle("active", b.dataset.page === page));
  $("pageTitle").textContent = t(page === "dashboard" ? "dashboard" : page);
  $("sidebar").classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}
document.querySelectorAll("[data-page]").forEach(b => b.addEventListener("click", () => goTo(b.dataset.page)));
$("menu").onclick = () => $("sidebar").classList.toggle("open");

$("photo").addEventListener("change", e => {
  const file = e.target.files[0];
  $("preview").innerHTML = "";
  imageData = "";
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    alert(t("photoLarge"));
    e.target.value = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    imageData = reader.result;
    const img = document.createElement("img");
    img.src = imageData;
    img.alt = "Crop preview";
    $("preview").appendChild(img);
  };
  reader.readAsDataURL(file);
});

$("voice").onclick = () => {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    $("voiceStatus").textContent = t("micFail");
    return;
  }
  const rec = new Recognition();
  rec.lang = lang === "hi" ? "hi-IN" : "en-IN";
  rec.onstart = () => $("voiceStatus").textContent = t("listening");
  rec.onresult = e => {
    $("problem").value += ($("problem").value ? " " : "") + e.results[0][0].transcript;
    $("voiceStatus").textContent = "";
  };
  rec.onerror = () => $("voiceStatus").textContent = t("micFail");
  rec.start();
};

function getReports() {
  try { return JSON.parse(localStorage.getItem("kc_reports") || "[]"); }
  catch { return []; }
}
function saveReports(items) {
  localStorage.setItem("kc_reports", JSON.stringify(items));
  updateCount();
  renderReports();
}
function makeReport(type, title, summary, extra = {}) {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    type, title, summary, extra,
    date: new Date().toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")
  };
}
function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function getAdvice(problem) {
  const s = problem.toLowerCase();
  if (/yellow|पीला|पीली|पीलापन/.test(s)) return t("yellow");
  if (/spot|धब्ब|दाग/.test(s)) return t("spots");
  if (/wilt|मुरझ/.test(s)) return t("wilt");
  if (/pest|insect|कीट|कीड़ा|इल्ली/.test(s)) return t("pest");
  if (/slow|growth|बढ़त|कमजोर|विकास/.test(s)) return t("growth");
  return t("general");
}
function speak(text) {
  if (!("speechSynthesis" in window)) return alert(t("micFail"));
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === "hi" ? "hi-IN" : "en-IN";
  speechSynthesis.speak(utterance);
}
function printReport(title, summary, advice) {
  const w = window.open("", "_blank");
  if (!w) return window.print();
  w.document.write(`<html lang="${lang}"><meta charset="utf-8"><title>${esc(title)}</title>
  <style>body{font:16px Arial;max-width:750px;margin:40px auto;line-height:1.7;color:#203329}h1{color:#246b45}</style>
  <body><h1>🌱 ${esc(title)}</h1><p>${esc(summary)}</p><p>${esc(advice)}</p><p>${esc(t("warning"))}</p>
  <script>window.onload=()=>window.print()<\/script></body></html>`);
  w.document.close();
}

$("cropForm").addEventListener("submit", e => {
  e.preventDefault();
  const crop = $("crop").value;
  const problem = $("problem").value.trim();
  if (!crop || !problem) return alert(t("required"));

  const advice = getAdvice(problem);
  const title = `${t("cropTitle")} — ${crop}`;
  const summary = `${crop} | ${$("stage").selectedOptions[0].textContent} | ${problem}`;
  const details = [
    `${lang === "hi" ? "फसल" : "Crop"}: ${crop}`,
    `${lang === "hi" ? "समस्या" : "Problem"}: ${problem}`,
    advice,
    t("expert")
  ];

  $("cropResult").innerHTML = `
    <h2>🌱 ${esc(title)}</h2>
    <p class="result-warning">${esc(t("warning"))}</p>
    <p><b>${esc(summary)}</b></p>
    <h3>${esc(t("next"))}</h3>
    <ul>${details.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
    <p>${esc(t("expert"))}</p>
    <button class="secondary" id="readCrop">${esc(t("read"))}</button>
    <button class="secondary" id="printCrop">${esc(t("print"))}</button>
    <button class="btn" id="saveCrop">${esc(t("save"))}</button>`;
  $("cropResult").classList.remove("hidden");

  $("readCrop").onclick = () => speak(`${title}. ${summary}. ${details.join(". ")}`);
  $("printCrop").onclick = () => printReport(title, summary, details.join(" "));
  $("saveCrop").onclick = () => {
    const items = getReports();
    items.unshift(makeReport("crop", title, summary, { advice: details.join(" ") }));
    saveReports(items);
    alert(t("saved"));
  };
  $("cropResult").scrollIntoView({ behavior: "smooth" });
});

$("soilForm").addEventListener("submit", e => {
  e.preventDefault();
  let advice = t("soilWarning");
  if ($("moisture").value === "Waterlogged" || $("moisture").value === "पानी भरा हुआ") advice = t("soilWater");
  if ($("moisture").value === "Dry" || $("moisture").value === "सूखी") advice = t("soilDry");

  const details = [
    `${$("soilColor").previousElementSibling.textContent}: ${$("soilColor").value}`,
    `${$("moisture").previousElementSibling.textContent}: ${$("moisture").value}`,
    `${$("texture").previousElementSibling.textContent}: ${$("texture").value}`,
    `${$("concern").previousElementSibling.textContent}: ${$("concern").value}`,
    $("soilNotes").value
  ].filter(Boolean);
  const title = t("soilTitle");
  const summary = details.join(" | ");

  $("soilResult").innerHTML = `
    <h2>🌍 ${esc(title)}</h2>
    <p>${esc(t("soilWarning"))}</p>
    <ul>${details.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
    <p>${esc(advice)}</p><p>${esc(t("soilCare"))}</p>
    <button class="secondary" id="readSoil">${esc(t("read"))}</button>
    <button class="secondary" id="printSoil">${esc(t("print"))}</button>
    <button class="btn" id="saveSoil">${esc(t("save"))}</button>`;
  $("soilResult").classList.remove("hidden");
  $("readSoil").onclick = () => speak(`${title}. ${summary}. ${advice}. ${t("soilCare")}`);
  $("printSoil").onclick = () => printReport(title, summary, advice);
  $("saveSoil").onclick = () => {
    const items = getReports();
    items.unshift(makeReport("soil", title, summary, { advice }));
    saveReports(items);
    alert(t("saved"));
  };
});

function updateCount() {
  $("cropCount").textContent = getReports().filter(r => r.type === "crop").length;
}
function renderReports() {
  if (!$("allReports")) return;
  const reports = getReports();
  const render = list => {
    if (!list.length) return `<p class="empty">${esc(t("noReports"))}</p>`;
    return list.map(r => `
      <article class="report">
        <b>${r.type === "soil" ? "🌍" : r.type === "weather" ? "🌦️" : "🌱"} ${esc(r.title)}</b>
        <small>${esc(r.date || "")}</small>
        <p>${esc(r.summary)}</p>
        <div class="report-actions">
          <button data-read="${r.id}">${esc(t("read"))}</button>
          <button data-print="${r.id}">${esc(t("print"))}</button>
          <button data-delete="${r.id}">${esc(t("remove"))}</button>
        </div>
      </article>`).join("");
  };
  $("allReports").innerHTML = render(reports);
  $("recentReports").innerHTML = render(reports.slice(0, 3));

  document.querySelectorAll("[data-read]").forEach(b => b.onclick = () => {
    const r = getReports().find(x => x.id === b.dataset.read);
    if (r) speak(`${r.title}. ${r.summary}. ${r.extra.advice || ""}`);
  });
  document.querySelectorAll("[data-print]").forEach(b => b.onclick = () => {
    const r = getReports().find(x => x.id === b.dataset.print);
    if (r) printReport(r.title, r.summary, r.extra.advice || "");
  });
  document.querySelectorAll("[data-delete]").forEach(b => b.onclick = () => {
    saveReports(getReports().filter(x => x.id !== b.dataset.delete));
  });
}
$("clearReports").onclick = () => {
  if (confirm(t("clearConfirm"))) saveReports([]);
};

async function getWeather(place) {
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=1&language=${lang}&format=json`;
  const geoResponse = await fetch(geoUrl);
  if (!geoResponse.ok) throw new Error("geo");
  const geoData = await geoResponse.json();
  if (!geoData.results?.length) throw new Error("not-found");
  const placeData = geoData.results[0];

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${placeData.latitude}&longitude=${placeData.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&forecast_days=4&timezone=auto`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("weather");
 const responseText = await response.text();
console.log("Chat API status:", response.status);
console.log("Chat API response:", responseText);

const data = JSON.parse(responseText);
  return { placeData, data };
}


function weatherText(code) {
  const hi = lang === "hi";
  if (code === 0) return hi ? "साफ आसमान" : "Clear sky";
  if ([1,2,3].includes(code)) return hi ? "आंशिक बादल" : "Partly cloudy";
  if ([45,48].includes(code)) return hi ? "कोहरा" : "Fog";
  if ([51,53,55,56,57].includes(code)) return hi ? "बूंदाबांदी" : "Drizzle";
  if ([61,63,65,80,81,82].includes(code)) return hi ? "बारिश" : "Rain";
  if ([95,96,99].includes(code)) return hi ? "गरज के साथ तूफान" : "Thunderstorm";
  return hi ? "मौसम की स्थिति" : "Weather conditions";
}
$("weatherForm").addEventListener("submit", async e => {
  e.preventDefault();
  const place = $("weatherPlace").value.trim();
  $("weatherResult").innerHTML = `<div class="card">${esc(t("weatherLoading"))}</div>`;
  try {
    const { placeData, data } = await getWeather(place);
    const c = data.current, d = data.daily;
    const forecast = d.time.map((day, i) => `
      <div><b>${new Date(day + "T12:00:00").toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {weekday:"short",day:"numeric"})}</b>
      <p>${weatherText(d.weather_code[i])}</p>
      <b>${Math.round(d.temperature_2m_max[i])}° / ${Math.round(d.temperature_2m_min[i])}°</b>
      <p>${lang === "hi" ? "बारिश की संभावना" : "Rain chance"}: ${d.precipitation_probability_max?.[i] ?? "—"}%</p></div>`).join("");

    $("weatherResult").innerHTML = `
      <article class="card weather-card">
        <h2>📍 ${esc(placeData.name)}, ${esc(placeData.country || "")}</h2>
        <div class="weather-number">${Math.round(c.temperature_2m)}°C</div>
        <h3>${weatherText(c.weather_code)}</h3>
        <p>${lang === "hi" ? "महसूस होने वाला तापमान" : "Feels like"}: ${Math.round(c.apparent_temperature)}°C</p>
        <p>${lang === "hi" ? "नमी" : "Humidity"}: ${c.relative_humidity_2m}%</p>
        <p>${lang === "hi" ? "हवा की गति" : "Wind speed"}: ${Math.round(c.wind_speed_10m)} km/h</p>
      </article>
      <article class="card"><h2>${lang === "hi" ? "आने वाले दिन" : "Next few days"}</h2>
      <div class="forecast">${forecast}</div></article>
      <p>${lang === "hi" ? "पूर्वानुमान बदल सकता है। खेत में काम करने से पहले स्थानीय सलाह देखें।" : "Forecasts can change. Check local advisories before field operations."}</p>`;

    const items = getReports();
    items.unshift(makeReport("weather", `Weather: ${placeData.name}`, `${Math.round(c.temperature_2m)}°C — ${weatherText(c.weather_code)}`));
    saveReports(items);
  } catch (err) {
    $("weatherResult").innerHTML = `<div class="card">${esc(err.message === "not-found" ? t("weatherError") : t("weatherFail"))}</div>`;
  }
});

setLanguage(lang);
try { user = JSON.parse(localStorage.getItem("kc_session") || "null"); } catch {}
if (user) showApp();
function initChatbot() {
 console.log("KisanCare JavaScript is running!"); 
  const form = document.getElementById("chatForm");
  const input = document.getElementById("chatInput");
  const messages = document.getElementById("chatMessages");

  if (!form || !input || !messages) {
    console.error("Chatbot HTML elements not found.");
    return;
  }

  if (form.dataset.initialized === "true") return;
  form.dataset.initialized = "true";

  let conversationId = null;

  form.addEventListener("submit", async function (event) {
    console.log("SUBMIT HANDLER STARTED");
    event.preventDefault();

    const message = input.value.trim();
    if (!message) return;

    const userMessage = document.createElement("p");
    userMessage.textContent = "You: " + message;
    messages.appendChild(userMessage);
    console.log("Chat message added:", messages.innerHTML);
    
    input.disabled = true;

    const loading = document.createElement("p");
    loading.textContent = "🌱 KisanCare is thinking...";
    messages.appendChild(loading);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
  message: message,
  language: lang,
  crop: "",
  location: "",
  conversation_id: conversationId || ""
})
      });
      const responseText = await response.text();

if (!responseText.trim()) {
  throw new Error(
    `Backend returned an empty response (HTTP ${response.status})`
  );
}

let data;

try {
  data = JSON.parse(responseText);
} catch {
  throw new Error(
    "Invalid JSON response: " + responseText.slice(0, 150)
  );
}
      loading.remove();

      if (!response.ok) {
        throw new Error(data.error || "Chat request failed.");
      }

      conversationId = data.conversation_id || conversationId;
      input.value = "";
      const botMessage = document.createElement("p");
      botMessage.textContent = "🌱 KisanCare: " + data.reply;
      messages.appendChild(botMessage);
      console.log("Bot reply added:", messages.innerHTML);

    } catch (error) {
      loading.textContent = "Chat error: " + error.message;
      input.value = message;
      console.error("Chatbot API error:", error);
    } finally {
      input.disabled = false;
      input.focus();
      messages.scrollTop = messages.scrollHeight;
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initChatbot);
} else {
  initChatbot();
}
