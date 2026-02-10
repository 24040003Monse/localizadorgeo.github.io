// ============================================
// SISTEMA DE AUTENTICACIÓN
// ============================================

// Usuarios válidos (en una aplicación real, esto estaría en el backend)
const validUsers = {
    'admin': 'geo2024',
    'usuario': '123456'
};

// Event listener para el formulario de login
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }

    // Verificar si ya hay sesión activa
    checkSession();
});

// Función para manejar el login
function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('login-error');

    // Validar credenciales
    if (validUsers[username] && validUsers[username] === password) {
        // Login exitoso
        sessionStorage.setItem('loggedIn', 'true');
        sessionStorage.setItem('username', username);
        
        // Mostrar aplicación principal
        showMainApp(username);
    } else {
        // Login fallido
        errorMessage.textContent = '❌ Usuario o contraseña incorrectos';
        errorMessage.classList.add('show');
        
        // Ocultar mensaje después de 3 segundos
        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 3000);
    }
}

// Función para mostrar la aplicación principal
function showMainApp(username) {
    const loginScreen = document.getElementById('login-screen');
    const mainApp = document.getElementById('main-app');
    const userNameDisplay = document.getElementById('user-name');

    // Ocultar login y mostrar app
    loginScreen.style.display = 'none';
    mainApp.style.display = 'block';
    
    // Mostrar nombre de usuario
    userNameDisplay.textContent = `👤 ${username}`;

    // Animación de entrada
    mainApp.style.opacity = '0';
    setTimeout(() => {
        mainApp.style.transition = 'opacity 0.5s ease';
        mainApp.style.opacity = '1';
    }, 100);
}

// Función para verificar sesión
function checkSession() {
    const loggedIn = sessionStorage.getItem('loggedIn');
    const username = sessionStorage.getItem('username');

    if (loggedIn === 'true' && username) {
        showMainApp(username);
    }
}

// Función para cerrar sesión
function logout() {
    // Limpiar sesión
    sessionStorage.removeItem('loggedIn');
    sessionStorage.removeItem('username');

    // Recargar página
    window.location.reload();
}

// Exportar función logout para uso global
window.logout = logout;

console.log('✅ Sistema de autenticación cargado');