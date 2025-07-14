let trackInterval;
    let map, marker;
    let logElement = document.getElementById("log");

    function logMessage(msg) {
      const p = document.createElement("p");
      p.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
      logElement.appendChild(p);
      logElement.scrollTop = logElement.scrollHeight;
    }

    function updateMap(lat, lon) {
      if (!map) {
       map = L.map("map").setView([lat, lon], 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors"
        }).addTo(map);
        marker = L.marker([lat, lon]).addTo(map).bindPopup("You are here!").openPopup();
      } else {
        map.setView([lat, lon], 13);
        marker.setLatLng([lat, lon]).openPopup();
      }
    }

    async function getLocationName(lat, lon) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
        const data = await res.json();
        document.getElementById("locationName").textContent = data.display_name || "Unknown location";
      } catch (err) {
        document.getElementById("locationName").textContent = "Error fetching name";
      }
    }

    function startWorkout() {
      document.getElementById("tracking").textContent = "Active";
      logMessage("Workout started");

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
          const { latitude, longitude } = pos.coords;
          document.getElementById("location").textContent = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          updateMap(latitude, longitude);
          getLocationName(latitude, longitude);
          logMessage("Initial location fetched");
        });

        // Track location and save in background every 5 seconds
        trackInterval = setInterval(() => {
          navigator.geolocation.getCurrentPosition(pos => {
            const { latitude, longitude } = pos.coords;
            document.getElementById("location").textContent = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            updateMap(latitude, longitude);
            getLocationName(latitude, longitude);
            logMessage("Location updated in background");
          });
        }, 10000);
      } else {
        alert("Geolocation not supported");
      }
    }

    function stopWorkout() {
      clearInterval(trackInterval);
      document.getElementById("tracking").textContent = "Inactive";
      logMessage("Workout stopped");
    }

    // Network Information API
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    function updateNetworkInfo() {
      const netBox = document.getElementById("network");
      if (conn) {
        netBox.textContent = `${conn.effectiveType}, Downlink: ${conn.downlink} Mbps`;
        if (conn.downlink < 1) {
          logMessage("Warning: Poor internet connection");
        }
      } else {
        netBox.textContent = navigator.onLine ? "Online" : "Offline";

      }
    }

    window.addEventListener("online", updateNetworkInfo);
    window.addEventListener("offline", updateNetworkInfo);
    if (conn) conn.addEventListener("change", updateNetworkInfo);
    updateNetworkInfo();

    // Background Task Simulation
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => {
        logMessage("Background task initialized with requestIdleCallback");
      });
    } else {
      setTimeout(() => {
        logMessage("Background task initialized with setTimeout fallback");
      }, 15000);
    }