/**
 * PATIENT PORTAL · ENTERPRISE HEALTHCARE SYSTEM
 * St. John's Medical Center
 * 
 * Module: Core Portal Interactions
 * Security: HIPAA-compliant UI patterns
 * Version: 1.0.0
 */

'use strict';

// ============================================================================
// PORTAL STATE MANAGEMENT
// ============================================================================
const PortalState = {
  sidebarCollapsed: false,
  darkMode: false,
  currentTheme: 'light',
  activeNotifications: 3,
  sessionTimeout: 900000, // 15 minutes in ms
  sessionTimer: null
};

// ============================================================================
// DOM ELEMENTS – CACHED FOR PERFORMANCE
// ============================================================================
const DOM = {
  sidebar: document.getElementById('sidebar'),
  sidebarOverlay: document.getElementById('sidebarOverlay'),
  sidebarToggle: document.getElementById('sidebarToggle'),
  mobileMenuBtn: document.getElementById('mobileMenuBtn'),
  mainContent: document.getElementById('mainContent'),
  themeToggle: document.getElementById('themeToggle'),
  notificationBtn: document.getElementById('notificationBtn'),
  notificationMenu: document.getElementById('notificationMenu'),
  profileBtn: document.getElementById('profileBtn'),
  profileMenu: document.getElementById('profileMenu'),
  logoutTrigger: document.getElementById('logoutTrigger'),
  profileLogout: document.getElementById('profileLogout'),
  logoutModal: document.getElementById('logoutModal'),
  modalClose: document.querySelector('.modal-close'),
  cancelBtn: document.querySelector('.btn-cancel'),
  logoutConfirmBtn: document.querySelector('.btn-logout'),
  sessionNotice: document.getElementById('sessionNotice'),
  staySignedInBtn: document.querySelector('.btn-stay-signed-in')
};

// ============================================================================
// ENTERPRISE DASHBOARD INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', function() {
  console.log('Patient Portal: Initializing enterprise dashboard...');
  
  initEventListeners();
  checkSystemPreferences();
  startSessionTimer();
  setActiveNavigation();
  initTabSystem();
  initTimeSlotSelection();
});

// ============================================================================
// EVENT LISTENER REGISTRY
// ============================================================================
function initEventListeners() {
  // Sidebar toggles
  if (DOM.sidebarToggle) {
    DOM.sidebarToggle.addEventListener('click', toggleSidebar);
  }
  
  if (DOM.mobileMenuBtn) {
    DOM.mobileMenuBtn.addEventListener('click', openMobileSidebar);
  }
  
  if (DOM.sidebarOverlay) {
    DOM.sidebarOverlay.addEventListener('click', closeMobileSidebar);
  }
  
  // Theme toggle
  if (DOM.themeToggle) {
    DOM.themeToggle.addEventListener('click', toggleDarkMode);
  }
  
  // Notification dropdown
  if (DOM.notificationBtn) {
    DOM.notificationBtn.addEventListener('click', toggleNotificationMenu);
  }
  
  // Profile dropdown
  if (DOM.profileBtn) {
    DOM.profileBtn.addEventListener('click', toggleProfileMenu);
  }
  
  // Logout flow
  if (DOM.logoutTrigger) {
    DOM.logoutTrigger.addEventListener('click', showLogoutModal);
  }
  
  if (DOM.profileLogout) {
    DOM.profileLogout.addEventListener('click', showLogoutModal);
  }
  
  // Modal controls
  if (DOM.modalClose) {
    DOM.modalClose.addEventListener('click', hideLogoutModal);
  }
  
  if (DOM.cancelBtn) {
    DOM.cancelBtn.addEventListener('click', hideLogoutModal);
  }
  
  if (DOM.logoutConfirmBtn) {
    DOM.logoutConfirmBtn.addEventListener('click', performLogout);
  }
  
  // Session keep-alive
  if (DOM.staySignedInBtn) {
    DOM.staySignedInBtn.addEventListener('click', resetSessionTimer);
  }
  
  // Click outside to close dropdowns
  document.addEventListener('click', closeDropdownsOnClickOutside);
  
  // Window resize handler
  window.addEventListener('resize', debounce(handleResize, 150));
}

// ============================================================================
// SIDEBAR CONTROLS – ENTERPRISE GRADE
// ============================================================================
function toggleSidebar() {
  PortalState.sidebarCollapsed = !PortalState.sidebarCollapsed;
  
  if (PortalState.sidebarCollapsed) {
    DOM.sidebar.classList.add('collapsed');
    localStorage.setItem('sidebarCollapsed', 'true');
  } else {
    DOM.sidebar.classList.remove('collapsed');
    localStorage.setItem('sidebarCollapsed', 'false');
  }
}

function openMobileSidebar() {
  DOM.sidebar.classList.add('mobile-open');
  DOM.sidebarOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeMobileSidebar() {
  DOM.sidebar.classList.remove('mobile-open');
  DOM.sidebarOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

// ============================================================================
// DARK MODE – SYSTEM PREFERENCE + MANUAL TOGGLE
// ============================================================================
function toggleDarkMode() {
  PortalState.darkMode = !PortalState.darkMode;
  
  if (PortalState.darkMode) {
    document.documentElement.setAttribute('data-theme', 'dark');
    DOM.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
    DOM.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    localStorage.setItem('theme', 'light');
  }
}

function checkSystemPreferences() {
  // Check localStorage first
  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme === 'dark') {
    PortalState.darkMode = true;
    document.documentElement.setAttribute('data-theme', 'dark');
    if (DOM.themeToggle) DOM.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  } else if (savedTheme === 'light') {
    PortalState.darkMode = false;
    document.documentElement.removeAttribute('data-theme');
    if (DOM.themeToggle) DOM.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  } else {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      PortalState.darkMode = true;
      document.documentElement.setAttribute('data-theme', 'dark');
      if (DOM.themeToggle) DOM.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
  }
  
  // Check sidebar state
  const savedSidebarState = localStorage.getItem('sidebarCollapsed');
  if (savedSidebarState === 'true' && window.innerWidth > 992) {
    PortalState.sidebarCollapsed = true;
    DOM.sidebar.classList.add('collapsed');
  }
}

// ============================================================================
// DROPDOWN CONTROLS – NOTIFICATIONS & PROFILE
// ============================================================================
function toggleNotificationMenu(e) {
  e.stopPropagation();
  
  if (DOM.notificationMenu) {
    DOM.notificationMenu.classList.toggle('show');
    
    // Close profile menu if open
    if (DOM.profileMenu) {
      DOM.profileMenu.classList.remove('show');
    }
  }
}

function toggleProfileMenu(e) {
  e.stopPropagation();
  
  if (DOM.profileMenu) {
    DOM.profileMenu.classList.toggle('show');
    
    // Close notification menu if open
    if (DOM.notificationMenu) {
      DOM.notificationMenu.classList.remove('show');
    }
  }
}

function closeDropdownsOnClickOutside(e) {
  // Notifications
  if (DOM.notificationMenu && 
      DOM.notificationMenu.classList.contains('show') &&
      !DOM.notificationBtn.contains(e.target) &&
      !DOM.notificationMenu.contains(e.target)) {
    DOM.notificationMenu.classList.remove('show');
  }
  
  // Profile
  if (DOM.profileMenu && 
      DOM.profileMenu.classList.contains('show') &&
      !DOM.profileBtn.contains(e.target) &&
      !DOM.profileMenu.contains(e.target)) {
    DOM.profileMenu.classList.remove('show');
  }
}

// ============================================================================
// TAB SYSTEM – MEDICAL RECORDS
// ============================================================================
function initTabSystem() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons and panes
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanes.forEach(pane => pane.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
      
      // Show corresponding pane
      const tabId = this.dataset.tab;
      const targetPane = document.getElementById(tabId);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });
}

// ============================================================================
// APPOINTMENT TIME SLOT SELECTION
// ============================================================================
function initTimeSlotSelection() {
  const timeSlots = document.querySelectorAll('.time-slot');
  
  timeSlots.forEach(slot => {
    slot.addEventListener('click', function() {
      // Remove selected from all slots in same container
      const container = this.closest('.time-slots');
      if (container) {
        container.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
      }
      
      // Add selected to clicked slot
      this.classList.add('selected');
    });
  });
}

// ============================================================================
// SESSION MANAGEMENT – ENTERPRISE SECURITY
// ============================================================================
function startSessionTimer() {
  // Clear existing timer
  if (PortalState.sessionTimer) {
    clearTimeout(PortalState.sessionTimer);
  }
  
  // Set new timer
  PortalState.sessionTimer = setTimeout(showSessionWarning, PortalState.sessionTimeout);
}

function resetSessionTimer() {
  // Hide session notice if visible
  if (DOM.sessionNotice) {
    DOM.sessionNotice.style.display = 'none';
  }
  
  // Restart timer
  startSessionTimer();
}

function showSessionWarning() {
  // Show session timeout warning
  if (DOM.sessionNotice) {
    DOM.sessionNotice.style.display = 'flex';
  }
}

// ============================================================================
// LOGOUT FLOW – SECURE EXIT
// ============================================================================
function showLogoutModal(e) {
  e.preventDefault();
  
  if (DOM.logoutModal) {
    DOM.logoutModal.classList.add('show');
    
    // Close any open dropdowns
    if (DOM.notificationMenu) DOM.notificationMenu.classList.remove('show');
    if (DOM.profileMenu) DOM.profileMenu.classList.remove('show');
  }
}

function hideLogoutModal() {
  if (DOM.logoutModal) {
    DOM.logoutModal.classList.remove('show');
  }
}

function performLogout() {
  // Simulate secure logout
  console.log('Patient Portal: Secure logout initiated');
  
  // Clear session storage
  localStorage.removeItem('session');
  sessionStorage.clear();
  
  // Redirect to login page (simulated)
  window.location.href = '/login.html';
}

// ============================================================================
// NAVIGATION ACTIVE STATE
// ============================================================================
function setActiveNavigation() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === '#dashboard' || href === 'patient-portal.html') {
      link.closest('.nav-item').classList.add('active');
    }
  });
}

// ============================================================================
// RESPONSIVE HANDLERS
// ============================================================================
function handleResize() {
  // Close mobile sidebar on resize to desktop
  if (window.innerWidth > 992) {
    if (DOM.sidebar.classList.contains('mobile-open')) {
      DOM.sidebar.classList.remove('mobile-open');
      DOM.sidebarOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
}

// ============================================================================
// UTILITIES
// ============================================================================
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ============================================================================
// FORM INTERACTIONS (PLACEHOLDER FOR BACKEND INTEGRATION)
// ============================================================================
document.addEventListener('submit', function(e) {
  const form = e.target.closest('form');
  
  if (form) {
    e.preventDefault();
    
    // Simulate form submission
    console.log('Form submitted:', form.id);
    
    // Show success message (placeholder)
    alert('Your request has been submitted securely.');
  }
});

// ============================================================================
// PDF DOWNLOAD SIMULATION (UI PATTERN)
// ============================================================================
document.querySelectorAll('.btn-icon, .btn-text, .btn-download-all').forEach(btn => {
  if (btn.innerHTML.includes('download') || 
      btn.innerHTML.includes('PDF') || 
      btn.classList.contains('btn-icon')) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Secure document download initiated');
      
      // Simulate download
      const notification = document.createElement('div');
      notification.className = 'download-notification';
      notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>Download started securely</span>
      `;
      notification.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: var(--success-500);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideIn 0.3s ease;
      `;
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 3000);
    });
  }
});

// ============================================================================
// KEYBOARD ACCESSIBILITY
// ============================================================================
document.addEventListener('keydown', function(e) {
  // ESC key closes modals and dropdowns
  if (e.key === 'Escape') {
    if (DOM.logoutModal?.classList.contains('show')) {
      hideLogoutModal();
    }
    
    if (DOM.notificationMenu?.classList.contains('show')) {
      DOM.notificationMenu.classList.remove('show');
    }
    
    if (DOM.profileMenu?.classList.contains('show')) {
      DOM.profileMenu.classList.remove('show');
    }
    
    if (DOM.sidebar.classList.contains('mobile-open')) {
      closeMobileSidebar();
    }
  }
  
  // CMD+K or CTRL+K focuses search
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    const searchInput = document.querySelector('.global-search');
    if (searchInput) {
      searchInput.focus();
    }
  }
});

// ============================================================================
// PORTAL READY
// ============================================================================
console.log('Patient Portal: Enterprise dashboard ready');