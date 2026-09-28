const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

menuToggle?.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => navLinks.classList.remove("open"));
});


// Dynamic "Today in the Lab" timetable. Entries are transcribed from the supplied timetable.
const weeklyLabSchedule = {
  Monday: [{ time: "9:00 – 11:00", group: "BTech. CSE 2", instructor: "Dr. Shiju. E" }],
  Tuesday: [{ time: "2:00 – 4:00", group: "BTech. CSE 1", instructor: "Dr. Shiju. E" }],
  Wednesday: [{ time: "9:00 – 11:00", group: "BTech. ECE", instructor: "Dr. Shiju. E" }],
  Thursday: [
    { time: "9:00 – 11:00", group: "BTech. ECE", instructor: "Dr. Shiju. E" },
    { time: "2:00 – 4:00", group: "BTech. CSE 1", instructor: "Dr. Shiju. E" }
  ],
  Friday: [{ time: "9:00 – 11:00", group: "BTech. CSE 2", instructor: "Dr. Shiju. E" }],
  Saturday: [], Sunday: []
};

function parseSessionStart(timeText){
  const m = timeText.match(/(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/);
  if(!m) return null;
  let hour = Number(m[1]), minute = Number(m[2]);
  // The supplied timetable uses 24-hour time.
  return {hour, minute};
}

function getUpcomingSessions(now, count = 2){
  const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const upcoming = [];
  for(let offset = 1; offset <= 7 && upcoming.length < count; offset++){
    const d = new Date(now);
    d.setHours(0,0,0,0);
    d.setDate(d.getDate() + offset);
    const day = dayNames[d.getDay()];
    (weeklyLabSchedule[day] || []).forEach(session => {
      const start = parseSessionStart(session.time);
      if(!start) return;
      const occurrence = new Date(d);
      occurrence.setHours(start.hour, start.minute, 0, 0);
      if(occurrence > now){
        upcoming.push({date: occurrence, day, ...session});
      }
    });
  }
  return upcoming.sort((a,b)=>a.date-b.date).slice(0,count);
}

function renderTodayLab() {
  const dateEl = document.getElementById("today-date"), statusEl = document.getElementById("today-status"), listEl = document.getElementById("session-list"), upcomingList = document.getElementById("upcoming-list");
  if (!dateEl || !statusEl || !listEl) return;
  const now = new Date();
  const day = now.toLocaleDateString("en-US", { weekday: "long" });
  const date = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const sessions = weeklyLabSchedule[day] || [];
  dateEl.textContent = date;
  statusEl.textContent = sessions.length ? `${sessions.length} lab session${sessions.length > 1 ? "s" : ""} scheduled today` : "No lab sessions scheduled today";
  listEl.innerHTML = sessions.length ? sessions.map(session => `<article class="session-card"><div class="session-time">${session.time}<small>LAB SESSION</small></div><div class="session-main"><strong>FOUNDATION OF QUANTUM AND PHOTONIC TECHNOLOGIES LAB</strong><span>${session.group} · ${session.instructor}</span></div></article>`).join("") : `<div class="today-empty">There are no FOUNDATION OF QUANTUM AND PHOTONIC TECHNOLOGIES LAB sessions scheduled for ${day}.</div>`;

  if(upcomingList){
    const upcoming = getUpcomingSessions(now, 2);
    upcomingList.innerHTML = upcoming.length ? upcoming.map(session => {
      const dateLabel = session.date.toLocaleDateString("en-IN", {weekday:"short", day:"numeric", month:"short"});
      return `<article class="upcoming-card"><div class="upcoming-date">${dateLabel}</div><div class="upcoming-time">${session.time}</div><div class="upcoming-main"><strong>${session.group}</strong><span>${session.instructor}</span></div></article>`;
    }).join("") : `<div class="today-empty">No upcoming lab sessions found.</div>`;
  }
}
renderTodayLab();


// Compact homepage search. Results are rendered as an overlay beneath the header,
// so opening/searching never increases the header height.
const navSearch = document.getElementById("nav-search");
const navSearchInput = document.getElementById("nav-search-input");
const navSearchButton = document.getElementById("nav-search-button");
const navSearchResults = document.getElementById("nav-search-results");

const labSearchIndex = [
  {e:"01", title:"Diffraction Grating", section:"Theory", id:"theory", terms:"diffraction grating fraunhofer interference grating element d sin theta n lambda wavelength mercury spectral lines"},
  {e:"01", title:"Diffraction Grating", section:"Visualize", id:"visual", terms:"diffraction interference wave interference path difference maxima minima"},
  {e:"01", title:"Diffraction Grating", section:"Calculations", id:"calculator", terms:"least count main scale division vernier wavelength angle readings spectrometer regression linear fit"},
  {e:"01", title:"Diffraction Grating", section:"Procedure", id:"procedure", terms:"spectrometer telescope collimator grating normal incidence first order spectrum"},
  {e:"02", title:"Refractive Index of Prism", section:"Theory", id:"theory", terms:"prism refraction refractive index minimum deviation snell law prism angle incidence emergence internal symmetry"},
  {e:"02", title:"Refractive Index of Prism", section:"Calculations", id:"calculator", terms:"minimum deviation 2a b minus a prism angle spectrometer msr vsr total reading vernier"},
  {e:"02", title:"Refractive Index of Prism", section:"Procedure", id:"procedure", terms:"spectrometer prism direct image refracted image minimum deviation telescope collimator"},
  {e:"03", title:"Photoelectric Effect", section:"Theory", id:"theory", terms:"photoelectric effect photon planck constant h nu work function stopping potential einstein equation threshold frequency"},
  {e:"03", title:"Photoelectric Effect", section:"Calculations", id:"calculations", terms:"planck constant work function frequency wavelength stopping potential slope graph linear regression"},
  {e:"03", title:"Photoelectric Effect", section:"Calculations", id:"calculator", terms:"filter readings voltage frequency stopping potential current"},
  {e:"04", title:"Circular Coil", section:"Theory", id:"theory", terms:"biot savart law circular coil magnetic field current carrying coil earth horizontal magnetic field"},
  {e:"04", title:"Circular Coil", section:"Visualize", id:"visualize", terms:"magnetic field circular coil axis field variation axial distance center"},
  {e:"04", title:"Circular Coil", section:"Calculations", id:"calculations", terms:"tangent law deflection magnetometer earth field bh tan theta current radius number turns"},
  {e:"04", title:"Circular Coil", section:"Demonstration", id:"demonstration", terms:"circular coil magnetometer deflection experiment bh"},
  {e:"04", title:"Circular Coil", section:"Observations", id:"observations", terms:"axial distance left right reading magnetic field graph variation center coil"}
];

function normaliseSearchText(value){
  return value.toLowerCase().replace(/[–—−]/g,"-").replace(/[^a-z0-9.\s-]/g," ").replace(/\s+/g," ").trim();
}
function scoreSearchResult(item, query){
  const q=normaliseSearchText(query);
  const tokens=q.split(/\s+/).filter(Boolean);
  if(!tokens.length) return 0;
  const title=normaliseSearchText(item.title), section=normaliseSearchText(item.section), terms=normaliseSearchText(item.terms);
  let score=0;
  if(title.includes(q)) score+=12;
  if(section.includes(q)) score+=7;
  if(terms.includes(q)) score+=8;
  tokens.forEach(t=>{
    if(title.includes(t)) score+=5;
    else if(section.includes(t)) score+=3;
    else if(terms.includes(t)) score+=1;
  });
  return score;
}
function closeNavSearch(){
  navSearchResults?.classList.remove("open");
  navSearchInput?.setAttribute("aria-expanded","false");
}
function renderNavSearch(query){
  if(!navSearchResults || !navSearchInput) return;
  const q=query.trim();
  if(!q){ navSearchResults.innerHTML=""; closeNavSearch(); return; }
  const results=labSearchIndex.map((item,index)=>({item,index,score:scoreSearchResult(item,q)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score || a.index-b.index).slice(0,6);
  navSearchResults.innerHTML=results.length ? results.map(({item})=>`<a class="nav-search-result" role="option" href="experiment-${item.e}.html#${item.id}"><strong>Experiment ${item.e} · ${item.title}</strong><span>${item.section} <em>↗</em></span></a>`).join("") : `<div class="nav-search-message">No matching experiment section found.</div>`;
  navSearchResults.classList.add("open");
  navSearchInput.setAttribute("aria-expanded","true");
}

navSearchInput?.addEventListener("input", e=>renderNavSearch(e.target.value));
navSearchInput?.addEventListener("focus", e=>{ if(e.target.value.trim()) renderNavSearch(e.target.value); });
navSearchButton?.addEventListener("click", ()=>{
  if(!navSearchInput) return;
  if(navSearchInput.value.trim()) renderNavSearch(navSearchInput.value);
  navSearchInput.focus();
});
navSearchResults?.addEventListener("click", ()=>closeNavSearch());
document.addEventListener("click", e=>{ if(navSearch && !navSearch.contains(e.target)) closeNavSearch(); });
document.addEventListener("keydown", e=>{ if(e.key==="Escape") closeNavSearch(); });
