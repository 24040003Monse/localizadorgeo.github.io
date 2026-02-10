
let map;
let currentMarker;
let watchId; // Para rastreo continuo de ubicación

document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initMapWhenSectionActive();
});

function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetSection = button.getAttribute('data-section');
            
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            sections.forEach(section => section.classList.remove('active'));
            const targetElement = document.getElementById(targetSection);
            if (targetElement) {
                targetElement.classList.add('active');
            }
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            if (targetSection === 'mapa') {
                setTimeout(() => {
                    if (!map) {
                        initMap();
                    } else {
                        map.invalidateSize();
                    }
                }, 100);
            }
        });
    });
}

function initMapWhenSectionActive() {
    const mapaButton = document.querySelector('[data-section="mapa"]');
    if (mapaButton) {
        mapaButton.addEventListener('click', () => {
            setTimeout(() => {
                if (!map) {
                    initMap();
                } else {
                    map.invalidateSize();
                }
            }, 100);
        });
    }
}

function initMap() {
    // Verificar que el contenedor del mapa exista
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) {
        console.error('Contenedor del mapa no encontrado');
        return;
    }

    map = L.map('map-container').setView([25.4232, -100.9931], 10);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        minZoom: 3
    }).addTo(map);

    showLocation(
        25.4232, 
        -100.9931, 
        'Saltillo, Coahuila', 
        'Capital del estado de Coahuila, conocida por su producción automotriz y dulces típicos'
    );

    console.log('Mapa inicializado correctamente');
}

function showLocation(lat, lng, title, description) {
  
    if (!map) {
        console.error('El mapa no está inicializado');
        initMap();
  
        setTimeout(() => showLocation(lat, lng, title, description), 500);
        return;
    }

    if (currentMarker) {
        map.removeLayer(currentMarker);
    }

    map.setView([lat, lng], 15, {
        animate: true,
        duration: 1.5,
        easeLinearity: 0.5
    });

    const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            background: linear-gradient(135deg, #00ff88, #00d4ff);
            width: 30px;
            height: 30px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid #050814;
            box-shadow: 0 0 20px rgba(0, 255, 136, 0.8);
        "></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30]
    });

    currentMarker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
    
    const popupContent = `
        <div style="font-family: 'Jost', sans-serif; padding: 10px;">
            <h3 style="color: #00ff88; margin: 0 0 10px 0; font-family: 'Orbitron', sans-serif; font-size: 1.2rem;">
                ${title}
            </h3>
            <p style="margin: 0; color: #333; line-height: 1.6;">
                ${description}
            </p>
            <p style="margin: 10px 0 0 0; font-size: 0.9em; color: #666;">
                <strong>📍 Coordenadas:</strong><br>
                Latitud: ${lat.toFixed(6)}°<br>
                Longitud: ${lng.toFixed(6)}°
            </p>
        </div>
    `;
    
    currentMarker.bindPopup(popupContent, {
        maxWidth: 300,
        closeButton: true
    }).openPopup();

    console.log(`Ubicación mostrada: ${title} (${lat}, ${lng})`);
}

// ============================================
// OBTENER UBICACIÓN ACTUAL DEL USUARIO
// ============================================
function getCurrentPosition() {
    if (!('geolocation' in navigator)) {
        alert('❌ Tu navegador no soporta geolocalización');
        return;
    }

    // Mostrar indicador de carga
    const loadingMsg = document.createElement('div');
    loadingMsg.id = 'loading-location';
    loadingMsg.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(10, 14, 39, 0.95);
            backdrop-filter: blur(20px);
            border: 2px solid #00ff88;
            border-radius: 15px;
            padding: 2rem;
            z-index: 10000;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 255, 136, 0.4);
        ">
            <div style="font-size: 3rem; animation: spin 1s linear infinite;">📍</div>
            <p style="color: #00ff88; margin-top: 1rem; font-weight: 600;">Obteniendo tu ubicación...</p>
        </div>
    `;
    document.body.appendChild(loadingMsg);

    // Opciones para mayor precisión
    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
        (position) => {
            // Remover indicador de carga
            const loader = document.getElementById('loading-location');
            if (loader) loader.remove();

            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const accuracy = position.coords.accuracy;
            
            // Obtener nombre del lugar usando Nominatim (geocodificación inversa)
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
                .then(response => response.json())
                .then(data => {
                    const placeName = data.display_name || 'Tu ubicación actual';
                    const address = data.address || {};
                    
                    let detailedLocation = '📍 Tu ubicación actual';
                    if (address.city || address.town || address.village) {
                        detailedLocation = `${address.city || address.town || address.village}`;
                    }
                    if (address.state) {
                        detailedLocation += `, ${address.state}`;
                    }
                    if (address.country) {
                        detailedLocation += `, ${address.country}`;
                    }
                    
                    showLocation(
                        lat,
                        lng,
                        detailedLocation,
                        `<strong>Dirección:</strong> ${placeName}<br><br><strong>Precisión:</strong> ±${accuracy.toFixed(0)} metros`
                    );

                    if (window.accuracyCircle) {
                        map.removeLayer(window.accuracyCircle);
                    }
                    window.accuracyCircle = L.circle([lat, lng], {
                        radius: accuracy,
                        color: '#00ff88',
                        fillColor: '#00ff88',
                        fillOpacity: 0.1,
                        weight: 2
                    }).addTo(map);

                    console.log('✅ Ubicación actual obtenida:', lat, lng, 'Precisión:', accuracy);
                })
                .catch(error => {
                    console.error('Error en geocodificación:', error);
                    showLocation(
                        lat,
                        lng,
                        '📍 Tu ubicación actual',
                        `Coordenadas obtenidas con éxito<br><br><strong>Precisión:</strong> ±${accuracy.toFixed(0)} metros`
                    );
                });
        },
        (error) => {
          
            const loader = document.getElementById('loading-location');
            if (loader) loader.remove();

            let errorMessage = '';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = '❌ Permiso denegado. Por favor, permite el acceso a tu ubicación en la configuración del navegador.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = '❌ Ubicación no disponible. Verifica tu conexión GPS/WiFi.';
                    break;
                case error.TIMEOUT:
                    errorMessage = '⏱️ Tiempo de espera agotado. Intenta nuevamente.';
                    break;
                default:
                    errorMessage = '❌ Error desconocido al obtener ubicación.';
            }
            
            console.error('Error de geolocalización:', error.message);
            
            // Mostrar mensaje de error
            const errorDiv = document.createElement('div');
            errorDiv.innerHTML = `
                <div style="
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(10, 14, 39, 0.95);
                    backdrop-filter: blur(20px);
                    border: 2px solid #ff006e;
                    border-radius: 15px;
                    padding: 2rem;
                    z-index: 10000;
                    text-align: center;
                    max-width: 400px;
                    box-shadow: 0 20px 60px rgba(255, 0, 110, 0.4);
                ">
                    <div style="font-size: 3rem;">⚠️</div>
                    <p style="color: #ff006e; margin-top: 1rem; font-weight: 600; line-height: 1.6;">${errorMessage}</p>
                    <button onclick="this.parentElement.parentElement.remove()" style="
                        margin-top: 1rem;
                        padding: 0.8rem 1.5rem;
                        background: linear-gradient(135deg, #ff006e, #00d4ff);
                        border: none;
                        border-radius: 8px;
                        color: white;
                        font-weight: 600;
                        cursor: pointer;
                    ">Cerrar</button>
                </div>
            `;
            document.body.appendChild(errorDiv);
            
            setTimeout(() => errorDiv.remove(), 5000);
        },
        options
    );
}

function startLocationTracking() {
    if (!('geolocation' in navigator)) {
        alert('❌ Tu navegador no soporta geolocalización');
        return;
    }

    const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    watchId = navigator.geolocation.watchPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const accuracy = position.coords.accuracy;
            
            if (currentMarker) {
                currentMarker.setLatLng([lat, lng]);
            }
            
            if (window.accuracyCircle) {
                window.accuracyCircle.setLatLng([lat, lng]);
                window.accuracyCircle.setRadius(accuracy);
            }

            console.log('📍 Ubicación actualizada:', lat, lng);
        },
        (error) => {
            console.error('Error en rastreo:', error.message);
        },
        options
    );

    console.log('🎯 Rastreo de ubicación iniciado');
}

function stopLocationTracking() {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        console.log('🛑 Rastreo de ubicación detenido');
    }
}


function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance.toFixed(2);
}

function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

window.showLocation = showLocation;
window.initMap = initMap;
window.getCurrentPosition = getCurrentPosition;
window.startLocationTracking = startLocationTracking;
window.stopLocationTracking = stopLocationTracking;
window.calculateDistance = calculateDistance;

console.log('✅ Script principal cargado correctamente');
console.log('🎯 Funciones disponibles: showLocation, initMap, getCurrentPosition, startLocationTracking, stopLocationTracking, calculateDistance');