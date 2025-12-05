/* =======================================
  2. JAVASCRIPT LOGIC (Content of map.js)
  ======================================= */

/* ---------------- UI SCRIPTS ---------------- */
const hamburgerBtn = document.getElementById("hamburgerBtn");
const mobileNav = document.getElementById("mobileNav");
const infoBox = document.querySelector('.info-box');

function checkScreen() {
    if(window.innerWidth <= 600){
        // Only show the hamburger on small screens
        hamburgerBtn.style.display = "block";
    } else {
        // Hide hamburger and mobile menu on larger screens
        hamburgerBtn.style.display = "none";
        mobileNav.style.display = "none";
    }
}
checkScreen();
window.addEventListener("resize", checkScreen);

hamburgerBtn.addEventListener("click", () => {
    mobileNav.style.display = mobileNav.style.display === "flex" ? "none" : "flex";
});

// Profile dropdown logic
const dropdown = document.querySelector(".dropdown");
const dropdownMenu = document.querySelector(".dropdown-menu");

dropdown.addEventListener("click", (e) => {
    e.stopPropagation(); 
    dropdownMenu.classList.toggle("show");
});

document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
        dropdownMenu.classList.remove("show");
    }
});

// Sidebar navigation active state
const navLinks = document.querySelectorAll(".sidebar nav a");
navLinks.forEach(link => {
    if (window.location.pathname.includes(link.getAttribute('href'))) {
        link.classList.add('active');
    }
});


/* ---------------- LEAFLET MAP & DATA ---------------- */

// Initialize Leaflet map centered on Manolo Fortich, Northern Mindanao
// NOTE: Centered on the Municipal Hall location from map.json's first entry
var map = L.map('map').setView([8.3695, 124.8643], 13);

// Add OSM tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Function to update the information box
function updateInfoBox(feature) {
    infoBox.innerHTML = `
        <h2>${feature.name}</h2>
        <p><strong>Description:</strong> ${feature.description}</p>
        <p><strong>Image File:</strong> ${feature.image}</p>
        <p><strong>Coordinates:</strong> ${feature.lat}, ${feature.lng}</p>
    `;
}

// Function to create a simple default marker icon
function createDefaultIcon(feature) {
    // Simple red circle icon for demonstration
    let iconHtml = `<div style="background-color: red; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-size: 14px; color: white;">📍</div>`;

    return L.divIcon({
        className: 'custom-simple-icon',
        html: iconHtml,
        iconSize: [25, 25],
        iconAnchor: [12, 25]
    });
}

// Fetch data from map.json
fetch('map.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(mapData => {
        // Set the initial info box content to the first feature found
        if (mapData.length > 0) {
            updateInfoBox(mapData[0]);
        }

        // Loop through the data array and create markers
        mapData.forEach(point => {
            // 1. Create a marker instance using lat/lng
            var marker = L.marker([point.lat, point.lng], {
                icon: createDefaultIcon(point)
            }).addTo(map);

            // 2. Bind a simple popup
            marker.bindPopup(`<strong>${point.name}</strong><br>${point.description}`);

            // 3. Set a click event to update the detailed info box
            marker.on('click', function() {
                updateInfoBox(point);
            });
        });

    })
    .catch(error => {
        console.error("Could not load the map data from map.json:", error);
        infoBox.innerHTML = '<h2>Error Loading Data</h2><p>Could not load location data. Check the console for details.</p>';
    });


// Refresh map size on window resize
window.addEventListener("resize", () => {
    map.invalidateSize();
});