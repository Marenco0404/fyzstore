/**
 * app.js (FINAL · Firebase v9 COMPAT)
 * ----------------------------------
 * Inicializa sistemas según la página actual
 */

const App = {
  // Inyectar botón WhatsApp flotante global en todas las páginas
  injectWhatsAppButton() {
    // Si el botón ya existe, solo actualizamos el mensaje si necesario
    let whatsappButton = document.getElementById('whatsapp-button-global');
    
    if (whatsappButton) {
      console.log('ℹ️ Botón WhatsApp ya existe, actualizando...');
      // Simplemente actualizamos el href por si cambió la página
      const path = window.location.pathname;
      const file = (path.split("/").pop() || "index.html").toLowerCase();
      let mensaje = "Hola%20F%26Z%20Store%20%21%20Necesito%20m%C3%A1s%20informaci%C3%B3n%20sobre%20sus%20productos";
      if (file === "perfumeria.html") {
        mensaje = "Hola%20F%26Z%20Store%20%21%20Necesito%20m%C3%A1s%20informaci%C3%B3n%20sobre%20sus%20perfumes";
      } else if (file === "sexshop.html") {
        mensaje = "Hola%20F%26Z%20Store%20%21%20Tengo%20una%20consulta%20sobre%20productos";
      }
      whatsappButton.href = `https://wa.me/50672932253?text=${mensaje}`;
      return;
    }

    // Obtener el mensaje según la página
    const path = window.location.pathname;
    const file = (path.split("/").pop() || "index.html").toLowerCase();
    
    let mensaje = "Hola%20F%26Z%20Store%20%21%20Necesito%20m%C3%A1s%20informaci%C3%B3n%20sobre%20sus%20productos";
    
    if (file === "perfumeria.html") {
      mensaje = "Hola%20F%26Z%20Store%20%21%20Necesito%20m%C3%A1s%20informaci%C3%B3n%20sobre%20sus%20perfumes";
    } else if (file === "sexshop.html") {
      mensaje = "Hola%20F%26Z%20Store%20%21%20Tengo%20una%20consulta%20sobre%20productos";
    }

    // Crear el botón
    whatsappButton = document.createElement('a');
    whatsappButton.id = 'whatsapp-button-global';
    whatsappButton.href = `https://wa.me/50672932253?text=${mensaje}`;
    whatsappButton.target = '_blank';
    whatsappButton.rel = 'noopener noreferrer';
    whatsappButton.className = 'whatsapp-button';
    whatsappButton.title = 'Contactar por WhatsApp';
    
    whatsappButton.innerHTML = `
      <span class="whatsapp-tooltip">¡Hablemos!</span>
      <i class="fab fa-whatsapp"></i>
    `;
    
    // Inyectar en el body (si no existe)
    if (document.body) {
      document.body.appendChild(whatsappButton);
      console.log('✅ Botón WhatsApp flotante inyectado en la página:', file);
    } else {
      console.warn('⚠️ Body no existe aún, reintentando...');
      // Reintentar en 100ms
      setTimeout(() => this.injectWhatsAppButton(), 100);
    }
  },

  initMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (!menuToggle || !navMenu) return;

    // Evitar duplicar listeners (algunas páginas tenían init inline)
    if (menuToggle.dataset.bound === '1') return;
    menuToggle.dataset.bound = '1';

    const closeMenu = () => {
      navMenu.classList.remove('active');
      document.body.classList.remove('menu-open');
    };

    const openMenu = () => {
      navMenu.classList.add('active');
      document.body.classList.add('menu-open');
    };

    menuToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (navMenu.classList.contains('active')) closeMenu();
      else openMenu();
    });

    // Cerrar al navegar
    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => closeMenu());
    });

    // Cerrar al tocar fuera
    document.addEventListener('click', (e) => {
      if (!navMenu.classList.contains('active')) return;
      if (navMenu.contains(e.target) || menuToggle.contains(e.target)) return;
      closeMenu();
    });

    // Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });

    // Si vuelves a escritorio, lo cerramos
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) closeMenu();
    });
  },
  init() {
    document.addEventListener("DOMContentLoaded", () => {
      const path = window.location.pathname;
      const file = (path.split("/").pop() || "index.html").toLowerCase();

      const isAuthPage = file === "login.html" || file === "registro.html";
      const isAdminPage = path.includes("/admin/");

      console.log("📍 Página:", file);

      // ✨ Inyectar botón WhatsApp flotante (TODAS las páginas)
      App.injectWhatsAppButton();

      // Menú hamburguesa (mobile)
      App.initMobileMenu();

      // Auth en todas
      if (window.AuthSystem?.init) {
        AuthSystem.init();
      }

      // ❌ NO carrito en login / registro
      if (!isAuthPage && window.Carrito?.init) {
        Carrito.init();
      }

      // Admin
      if (isAdminPage && window.AdminSystem?.init) {
        AdminSystem.init();
        return;
      }

      // Tienda
      if (
        file === "index.html" ||
        file === "perfumeria.html" ||
        file === "sexshop.html"
      ) {
        window.ProductosSystem?.init?.();
      }

      // Checkout
      if (file === "finalizarcompra.html") {
        window.CheckoutSystem?.init?.();
      }

      if (file === "confirmacion.html") {
        window.CheckoutSystem?.initConfirmacion?.();
      }
    });

    // Inyectar el botón también cuando se cargan nuevos contenidos (navegación sin reload)
    // Pero solo si el DOM ya está ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => App.injectWhatsAppButton(), 100);
      });
    } else {
      // El DOM ya está cargado, inyectar inmediatamente
      setTimeout(() => App.injectWhatsAppButton(), 100);
    }
  }
};

App.init();
