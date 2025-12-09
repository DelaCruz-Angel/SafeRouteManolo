// ---------------- Initialize default hazards ----------------
if (!localStorage.getItem('markers')) {
  let hazards = [
    { title: "Flood", desc: "River overflow", severity: "High", images: [] }
  ];
  localStorage.setItem('markers', JSON.stringify(hazards));
}

// ---------------- Mobile Menu ----------------
const mobileBtn = document.getElementById('mobileBtn');
const navLinks = document.getElementById('navLinks');
mobileBtn.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  mobileBtn.textContent = navLinks.classList.contains('open') ? '✖' : '☰';
});

// ---------------- Dropdown ----------------
const dropdown = document.querySelector(".dropdown");
const dropdownMenu = document.querySelector(".dropdown-menu");
dropdown.addEventListener("click", () => dropdownMenu.classList.toggle("show"));
document.addEventListener("click", e => { if (!dropdown.contains(e.target)) dropdownMenu.classList.remove("show"); });

// ---------------- Logout ----------------
document.querySelector('.dropdown-item.logout').addEventListener('click', () => {
  localStorage.removeItem('user');
  window.location.href = 'index.html';
});

// ---------------- Display Username ----------------
document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    const fullName = `${user.firstName?.toUpperCase() || ""} ${user.mi ? user.mi[0].toUpperCase() + '.' : ""} ${user.lastName?.toUpperCase() || ""}`.trim();
    document.getElementById("displayUsername").textContent = fullName;
  }
});

// ---------------- Escape HTML ----------------
function escapeHtml(s) {
  return s ? s.replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])) : '';
}

// ---------------- Load Dashboard Posts ----------------
function loadDashboardPosts() {
  const cardContainer = document.getElementById("cardContainer");
  cardContainer.innerHTML = '';
  const posts = JSON.parse(localStorage.getItem('markers')) || [];

  posts.forEach((post, index) => {
    const card = document.createElement('div');
    card.className = 'data-card';

    const textDiv = document.createElement('div');
    textDiv.className = 'text-content';
    textDiv.innerHTML = `
      <div class="field-title"><strong>${escapeHtml(post.title)}</strong></div>
      <div class="field-value">${escapeHtml(post.desc)}</div>
      <div class="field-value"><strong>Severity:</strong> ${post.severity || 'N/A'}</div>
    `;

    const imagesDiv = document.createElement('div');
    if(post.images?.length===1) imagesDiv.className='images one';
    else if(post.images?.length===2) imagesDiv.className='images two';
    else if(post.images?.length>=3) imagesDiv.className='images more';

    post.images?.forEach(src => {
      const img = document.createElement('img');
      img.src = src;
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => showFullImage(src));
      imagesDiv.appendChild(img);
    });

    // CRUD Buttons
    const btnDiv = document.createElement('div');
    btnDiv.style.marginTop = "8px";
    const editBtn = document.createElement('button');
    editBtn.textContent = "Edit";
    editBtn.addEventListener('click', () => editHazard(index));
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener('click', () => deleteHazard(index));
    btnDiv.appendChild(editBtn);
    btnDiv.appendChild(deleteBtn);

    card.appendChild(textDiv);
    card.appendChild(imagesDiv);
    card.appendChild(btnDiv);
    cardContainer.appendChild(card);
  });
}

// ---------------- Image Popup ----------------
function showFullImage(src) {
  document.getElementById('popupImg').src = src;
  document.getElementById('imagePopup').classList.add('show');
}
document.getElementById('imagePopup').addEventListener('click', () => {
  document.getElementById('imagePopup').classList.remove('show');
  setTimeout(() => document.getElementById('popupImg').src = '', 200);
});

// ---------------- Severity Chart ----------------
function renderSeverityChart() {
  const posts = JSON.parse(localStorage.getItem('markers')) || [];
  const severityCount = { High:0, Medium:0, Low:0 };
  posts.forEach(p => {
    const sev = p.severity?.toLowerCase();
    if(sev==='high') severityCount.High++;
    else if(sev==='medium') severityCount.Medium++;
    else if(sev==='low') severityCount.Low++;
  });
  const ctx = document.getElementById('severityChart').getContext('2d');
  new Chart(ctx, {
    type:'bar',
    data:{labels:['High','Medium','Low'],datasets:[{label:'Hazard Severity',data:[severityCount.High,severityCount.Medium,severityCount.Low],backgroundColor:['#ff0000','#ffa500','#00cc00'],borderWidth:1}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true},x:{}}}
  });
}

// ---------------- Weather API ----------------
async function loadWeather() {
  const apiKey = "a086e741534d42a385c31855251511";
  const location = "Manolo Fortich";
  const weatherBox = document.getElementById("weatherBox");
  weatherBox.innerHTML = "<p class='placeholder-text'>Loading Weather...</p>";
  try {
    const res = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}`);
    const data = await res.json();
    if(data.error) throw new Error(data.error.message);
    weatherBox.innerHTML = `
      <div class="weather-horizontal">
        <div class="weather-left">
          <img src="https:${data.current.condition.icon}">
          <div class="temp">${data.current.temp_c}°C</div>
        </div>
        <div class="weather-right">
          <h2>${data.location.name}</h2>
          <h4>${data.location.region}</h4>
          <div>${data.current.condition.text}</div>
          <div class="weather-details">Wind: ${data.current.wind_kph} kph | Humidity: ${data.current.humidity}%</div>
        </div>
      </div>
    `;
  } catch(err){ weatherBox.innerHTML = "<p class='placeholder-text'>Unable to load weather data.</p>"; }
}
loadWeather(); setInterval(loadWeather,600000);

// ---------------- CRUD Operations ----------------
document.getElementById('addHazardForm').addEventListener('submit', e => {
  e.preventDefault();
  const title = document.getElementById('hazardTitle').value;
  const desc = document.getElementById('hazardDesc').value;
  const severity = document.getElementById('hazardSeverity').value;
  if(!title || !desc || !severity) return;
  const posts = JSON.parse(localStorage.getItem('markers'))||[];
  posts.push({title,desc,severity,images:[]});
  localStorage.setItem('markers', JSON.stringify(posts));
  loadDashboardPosts();
  renderSeverityChart();
  e.target.reset();
});

function deleteHazard(index) {
  const posts = JSON.parse(localStorage.getItem('markers'))||[];
  posts.splice(index,1);
  localStorage.setItem('markers', JSON.stringify(posts));
  loadDashboardPosts();
  renderSeverityChart();
}

function editHazard(index) {
  const posts = JSON.parse(localStorage.getItem('markers'))||[];
  const post = posts[index];
  const newTitle = prompt("Edit Title", post.title) || post.title;
  const newDesc = prompt("Edit Description", post.desc) || post.desc;
  const newSeverity = prompt("Edit Severity (High, Medium, Low)", post.severity) || post.severity;
  posts[index] = {...post,title:newTitle,desc:newDesc,severity:newSeverity};
  localStorage.setItem('markers', JSON.stringify(posts));
  loadDashboardPosts();
  renderSeverityChart();
}

// ---------------- Initial Load ----------------
document.addEventListener("DOMContentLoaded", () => { loadDashboardPosts(); renderSeverityChart(); });

// ---------------- Auto Refresh on localStorage changes ----------------
window.addEventListener('storage', e => { if(e.key==='markers'){ loadDashboardPosts(); renderSeverityChart(); } });
