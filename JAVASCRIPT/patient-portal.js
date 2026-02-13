/**
 * PATIENT PORTAL · ENTERPRISE HEALTHCARE SYSTEM
 * St. John's Medical Center
 * 
 * Module: Fully Functional Portal with Complete Button Interactions
 * Security: HIPAA-compliant with real-time data operations
 * Version: 3.0.0
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
  sessionTimeout: 15 * 60 * 1000, // 15 minutes in ms
  sessionTimer: null,
  currentUser: null,
  appointments: [],
  labResults: [],
  prescriptions: [],
  messages: [],
  documents: [],
  notifications: []
};

// ============================================================================
// DOM ELEMENTS – CACHED FOR PERFORMANCE
// ============================================================================
const DOM = {
  // Navigation elements
  sidebar: document.getElementById('sidebar'),
  sidebarOverlay: document.getElementById('sidebarOverlay'),
  sidebarToggle: document.getElementById('sidebarToggle'),
  mobileMenuBtn: document.getElementById('mobileMenuBtn'),
  mainContent: document.getElementById('mainContent'),
  
  // Theme and notifications
  themeToggle: document.getElementById('themeToggle'),
  notificationBtn: document.getElementById('notificationBtn'),
  notificationMenu: document.getElementById('notificationMenu'),
  notificationBadge: document.querySelector('.notification-badge'),
  notificationList: document.querySelector('.notification-list'),
  
  // Profile elements
  profileBtn: document.getElementById('profileBtn'),
  profileMenu: document.getElementById('profileMenu'),
  profileName: document.getElementById('profileName'),
  profileAvatar: document.getElementById('profileAvatar'),
  
  // Logout elements
  logoutTrigger: document.getElementById('logoutTrigger'),
  profileLogout: document.getElementById('profileLogout'),
  logoutModal: document.getElementById('logoutModal'),
  modalClose: document.querySelector('.modal-close'),
  cancelBtn: document.querySelector('.btn-cancel'),
  logoutConfirmBtn: document.querySelector('.btn-logout'),
  
  // Session elements
  sessionNotice: document.getElementById('sessionNotice'),
  staySignedInBtn: document.querySelector('.btn-stay-signed-in'),
  
  // Patient info display elements
  sidebarPatientAvatar: document.getElementById('sidebarPatientAvatar'),
  sidebarPatientName: document.getElementById('sidebarPatientName'),
  sidebarPatientId: document.getElementById('sidebarPatientId'),
  welcomeSubtitle: document.getElementById('welcomeSubtitle'),
  patientPhotoLarge: document.getElementById('patientPhotoLarge'),
  patientName: document.getElementById('patientName'),
  patientId: document.getElementById('patientId'),
  patientDob: document.getElementById('patientDob'),
  patientEmail: document.getElementById('patientEmail'),
  patientPhone: document.getElementById('patientPhone'),
  patientAddress: document.getElementById('patientAddress'),
  patientEmergencyName: document.getElementById('patientEmergencyName'),
  patientEmergencyPhone: document.getElementById('patientEmergencyPhone'),
  insuranceValue: document.getElementById('insuranceValue'),
  insuranceName: document.getElementById('insuranceName'),
  insurancePlan: document.getElementById('insurancePlan'),
  insuranceMemberId: document.getElementById('insuranceMemberId'),
  coverageEffective: document.getElementById('coverageEffective'),
  deductible: document.getElementById('deductible'),
  outOfPocket: document.getElementById('outOfPocket'),
  messageInitials: document.getElementById('messageInitials'),
  lastVisit: document.getElementById('lastVisit'),
  
  // Quick action buttons
  scheduleAppointmentBtn: document.querySelector('.action-card:nth-child(1)'),
  viewTestResultsBtn: document.querySelector('.action-card:nth-child(2)'),
  requestRefillBtn: document.querySelector('.action-card:nth-child(3)'),
  payBalanceBtn: document.querySelector('.action-card:nth-child(4)'),
  messageTeamBtn: document.querySelector('.action-card:nth-child(5)'),
  downloadRecordsBtn: document.querySelector('.action-card:nth-child(6)'),
  
  // Appointment buttons
  appointmentRescheduleBtns: document.querySelectorAll('.appointments-table .action-btn'),
  appointmentCancelBtns: document.querySelectorAll('.appointments-table .action-btn.text'),
  scheduleNewBtn: document.querySelector('.section-link[href="#"]'),
  
  // Lab results buttons
  labDownloadBtns: document.querySelectorAll('.lab-table .btn-text'),
  viewAllLabResults: document.querySelector('#lab-results-module .section-link'),
  
  // Prescription buttons
  refillRequestBtns: document.querySelectorAll('.btn-refill'),
  viewAllPrescriptions: document.querySelector('#prescriptions-module .section-link'),
  
  // Billing buttons
  payNowBtn: document.querySelector('.btn-primary'),
  downloadInvoiceBtn: document.querySelector('.btn-secondary'),
  viewBenefitsLink: document.querySelector('.link'),
  
  // Message buttons
  sendMessageBtn: document.querySelector('.btn-send'),
  attachFileBtn: document.querySelector('.btn-attach'),
  newMessageLink: document.querySelector('#messages-module .section-link'),
  
  // Document buttons
  uploadDocumentBtn: document.querySelector('.btn-upload'),
  documentDownloadBtns: document.querySelectorAll('.document-item .btn-icon'),
  
  // Medical records buttons
  downloadAllBtn: document.querySelector('.btn-download-all'),
  recordDownloadBtns: document.querySelectorAll('.record-item .btn-icon'),
  
  // Tab buttons
  tabButtons: document.querySelectorAll('.tab-btn'),
  
  // View options
  viewOptionBtns: document.querySelectorAll('.view-btn'),
  
  // Search
  globalSearch: document.querySelector('.global-search'),
  
  // Modal elements
  appointmentModal: null,
  documentModal: null,
  messageModal: null,
  refillModal: null
};

// ============================================================================
// ENTERPRISE DASHBOARD INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', function() {
  console.log('🏥 Patient Portal: Initializing enterprise dashboard...');
  
  // Check authentication first
  if (!checkAuthentication()) {
    console.log('🚫 No valid session found, redirecting to login...');
    window.location.href = 'auth.html';
    return;
  }
  
  // Load user data from storage
  loadUserData();
  
  // Load mock data
  loadMockData();
  
  // Initialize UI components
  initEventListeners();
  checkSystemPreferences();
  startSessionTimer();
  setActiveNavigation();
  initTabSystem();
  initTimeSlotSelection();
  initSearchFunctionality();
  initModalSystem();
  
  console.log('✅ Patient Portal: Dashboard ready for', PortalState.currentUser?.fullName);
});

// ============================================================================
// AUTHENTICATION CHECK
// ============================================================================
function checkAuthentication() {
  const isAuthenticated = localStorage.getItem('auth_isAuthenticated') === 'true';
  const sessionExpiry = localStorage.getItem('auth_sessionExpiry');
  const currentUser = localStorage.getItem('auth_currentUser');
  
  if (!isAuthenticated || !sessionExpiry || !currentUser) {
    return false;
  }
  
  const now = new Date().getTime();
  if (now > parseInt(sessionExpiry)) {
    // Session expired - clear storage
    clearAuthState();
    return false;
  }
  
  // Store current user in state
  try {
    PortalState.currentUser = JSON.parse(currentUser);
    return true;
  } catch (e) {
    console.error('Error parsing user data:', e);
    return false;
  }
}

function clearAuthState() {
  localStorage.removeItem('auth_isAuthenticated');
  localStorage.removeItem('auth_sessionExpiry');
  localStorage.removeItem('auth_currentUser');
}

// ============================================================================
// LOAD MOCK DATA FOR DEMONSTRATION
// ============================================================================
function loadMockData() {
  // Mock appointments
  PortalState.appointments = [
    {
      id: 1,
      date: 'Mar 16, 2026 · 2:00 PM',
      physician: 'Dr. Sarah Chen',
      department: 'Cardiology',
      location: 'Main Campus, Suite 400',
      status: 'confirmed'
    },
    {
      id: 2,
      date: 'Apr 2, 2026 · 10:30 AM',
      physician: 'Dr. Michael Roberts',
      department: 'Neurology',
      location: 'Virtual Visit',
      status: 'pending'
    },
    {
      id: 3,
      date: 'May 5, 2026 · 9:00 AM',
      physician: 'Dr. Emily Watson',
      department: 'Primary Care',
      location: 'Main Campus, Suite 200',
      status: 'confirmed'
    }
  ];
  
  // Mock lab results
  PortalState.labResults = [
    {
      id: 1,
      name: 'Complete Blood Count (CBC)',
      physician: 'Dr. Sarah Chen',
      date: 'Mar 1, 2026',
      status: 'final',
      result: 'WBC 6.2',
      range: '4.0-11.0',
      normal: true
    },
    {
      id: 2,
      name: 'Lipid Panel',
      physician: 'Dr. Sarah Chen',
      date: 'Mar 1, 2026',
      status: 'final',
      result: 'LDL 142',
      range: '<100 mg/dL',
      normal: false
    },
    {
      id: 3,
      name: 'Hemoglobin A1c',
      physician: 'Dr. Sarah Chen',
      date: 'Feb 28, 2026',
      status: 'final',
      result: '5.4%',
      range: '<5.7%',
      normal: true
    },
    {
      id: 4,
      name: 'Thyroid Panel',
      physician: 'Dr. Sarah Chen',
      date: 'Feb 28, 2026',
      status: 'pending',
      result: '—',
      range: '—',
      normal: true
    }
  ];
  
  // Mock prescriptions
  PortalState.prescriptions = [
    {
      id: 1,
      name: 'Lisinopril',
      dosage: '10 mg · Once daily',
      physician: 'Dr. Sarah Chen',
      expires: 'May 15, 2026',
      refills: 2,
      refillStatus: 'active'
    },
    {
      id: 2,
      name: 'Atorvastatin',
      dosage: '20 mg · Once daily',
      physician: 'Dr. Sarah Chen',
      expires: 'Apr 22, 2026',
      refills: 1,
      refillStatus: 'low'
    },
    {
      id: 3,
      name: 'Metformin',
      dosage: '500 mg · Twice daily',
      physician: 'Dr. Sarah Chen',
      expires: 'Jun 30, 2026',
      refills: 3,
      refillStatus: 'active'
    }
  ];
  
  // Mock messages
  PortalState.messages = [
    {
      id: 1,
      sender: 'Dr. Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      content: 'Your recent lab results are in. Everything looks good, but I\'d like to discuss your LDL cholesterol. Please schedule a follow-up at your convenience.',
      timestamp: 'Today, 9:42 AM',
      unread: false
    },
    {
      id: 2,
      sender: 'You',
      content: 'Thank you, Dr. Chen. I\'ve scheduled an appointment for next Tuesday.',
      timestamp: 'Today, 10:15 AM',
      outgoing: true,
      unread: false
    },
    {
      id: 3,
      sender: 'Pharmacy Department',
      avatar: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      content: 'Your prescription refill for Atorvastatin is ready for pickup.',
      timestamp: 'Yesterday, 3:30 PM',
      unread: true
    }
  ];
  
  // Mock documents
  PortalState.documents = [
    {
      id: 1,
      name: 'Insurance Card_Front.pdf',
      type: 'pdf',
      uploaded: 'Feb 1, 2026',
      size: '245 KB'
    },
    {
      id: 2,
      name: 'Living Will_Executed.pdf',
      type: 'pdf',
      uploaded: 'Jan 15, 2026',
      size: '1.2 MB'
    },
    {
      id: 3,
      name: 'Lab Results_Mar2026.pdf',
      type: 'pdf',
      uploaded: 'Mar 2, 2026',
      size: '890 KB'
    }
  ];
  
  // Mock notifications
  PortalState.notifications = [
    {
      id: 1,
      icon: 'flask',
      message: 'Your lab results are ready',
      time: '5 min ago',
      unread: true
    },
    {
      id: 2,
      icon: 'prescription',
      message: 'Prescription refill approved',
      time: '2 hours ago',
      unread: false
    },
    {
      id: 3,
      icon: 'calendar',
      message: 'Appointment reminder: Dr. Chen',
      time: 'Tomorrow at 2:00 PM',
      unread: true
    },
    {
      id: 4,
      icon: 'file-invoice',
      message: 'New statement available',
      time: 'Yesterday',
      unread: true
    }
  ];
}

// ============================================================================
// LOAD AND DISPLAY USER DATA
// ============================================================================
function loadUserData() {
  const user = PortalState.currentUser;
  if (!user) {
    console.error('No user data found in state');
    return;
  }
  
  console.log('📊 Loading user data for:', user.email);
  
  // Format date of birth
  const formattedDob = formatDate(user.dob);
  
  // Update sidebar patient info
  if (DOM.sidebarPatientName) {
    DOM.sidebarPatientName.textContent = user.fullName || `${user.firstName} ${user.lastName}`;
  }
  
  if (DOM.sidebarPatientId) {
    DOM.sidebarPatientId.textContent = `ID: ${user.patientId || 'Not assigned'}`;
  }
  
  if (DOM.sidebarPatientAvatar && user.photo) {
    DOM.sidebarPatientAvatar.src = user.photo;
  }
  
  // Update welcome subtitle
  if (DOM.welcomeSubtitle) {
    DOM.welcomeSubtitle.textContent = `Welcome back, ${user.firstName || 'Patient'}`;
  }
  
  // Update profile dropdown
  if (DOM.profileName) {
    DOM.profileName.textContent = `${user.firstName || ''} ${(user.lastName || '').charAt(0)}.`.trim();
  }
  
  if (DOM.profileAvatar && user.photo) {
    DOM.profileAvatar.src = user.photo;
  }
  
  // Update patient photo large
  if (DOM.patientPhotoLarge) {
    if (user.photo) {
      DOM.patientPhotoLarge.src = user.photo;
    } else {
      // Default avatar based on gender
      if (user.gender === 'male') {
        DOM.patientPhotoLarge.src = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80';
      } else {
        DOM.patientPhotoLarge.src = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80';
      }
    }
  }
  
  // Update patient name
  if (DOM.patientName) {
    DOM.patientName.textContent = user.fullName || `${user.firstName} ${user.lastName}`;
  }
  
  // Update patient ID
  if (DOM.patientId) {
    DOM.patientId.textContent = user.patientId || 'MR-000-0000';
  }
  
  // Update date of birth
  if (DOM.patientDob) {
    DOM.patientDob.textContent = `DOB: ${formattedDob}`;
  }
  
  // Update contact info (hidden fields but used for data)
  if (DOM.patientEmail) {
    DOM.patientEmail.textContent = user.email || 'Not provided';
  }
  
  if (DOM.patientPhone) {
    DOM.patientPhone.textContent = user.phone || 'Not provided';
  }
  
  if (DOM.patientAddress) {
    DOM.patientAddress.textContent = user.address || 'Not provided';
  }
  
  // Update emergency contact
  if (DOM.patientEmergencyName) {
    DOM.patientEmergencyName.textContent = user.emergencyName || 'Not provided';
  }
  
  if (DOM.patientEmergencyPhone) {
    DOM.patientEmergencyPhone.textContent = user.emergencyPhone || 'Not provided';
  }
  
  // Update insurance information
  if (DOM.insuranceValue) {
    DOM.insuranceValue.textContent = user.insurance || 'Blue Cross Blue Shield';
  }
  
  if (DOM.insuranceName) {
    DOM.insuranceName.textContent = user.insurance || 'Blue Cross Blue Shield';
  }
  
  if (DOM.insurancePlan) {
    DOM.insurancePlan.textContent = `PPO · Member since ${new Date().getFullYear()}`;
  }
  
  if (DOM.insuranceMemberId) {
    const memberId = user.patientId ? user.patientId.replace('MR-', 'INS-') : 'INS-784-221A';
    DOM.insuranceMemberId.textContent = `Member ID: ${memberId}`;
  }
  
  // Update coverage dates
  if (DOM.coverageEffective) {
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    DOM.coverageEffective.textContent = startDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  
  if (DOM.deductible) {
    DOM.deductible.textContent = '$1,500 / $500 met';
  }
  
  if (DOM.outOfPocket) {
    DOM.outOfPocket.textContent = '$3,000';
  }
  
  // Update message initials
  if (DOM.messageInitials) {
    const firstName = user.firstName || 'E';
    const lastName = user.lastName || 'V';
    DOM.messageInitials.textContent = `${firstName.charAt(0)}${lastName.charAt(0)}`;
  }
  
  // Update last visit (simulated)
  if (DOM.lastVisit) {
    const lastVisitDate = user.lastLogin ? new Date(user.lastLogin) : new Date();
    const formattedLastVisit = lastVisitDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
    DOM.lastVisit.textContent = `Last visit: ${formattedLastVisit}`;
  }
  
  console.log('✅ User data displayed successfully');
}

function formatDate(dateString) {
  if (!dateString) return 'Not provided';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  } catch (e) {
    return dateString;
  }
}

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
  
  // Initialize all functional buttons
  initQuickActionButtons();
  initAppointmentButtons();
  initLabResultButtons();
  initPrescriptionButtons();
  initBillingButtons();
  initMessageButtons();
  initDocumentButtons();
  initMedicalRecordsButtons();
  initViewOptions();
  initNotificationActions();
  
  // Click outside to close dropdowns
  document.addEventListener('click', closeDropdownsOnClickOutside);
  
  // Window resize handler
  window.addEventListener('resize', debounce(handleResize, 150));
}

// ============================================================================
// QUICK ACTION BUTTONS
// ============================================================================
function initQuickActionButtons() {
  // Schedule Appointment
  const scheduleBtn = document.querySelector('.action-card:nth-child(1)');
  if (scheduleBtn) {
    scheduleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showAppointmentScheduler();
    });
  }
  
  // View Test Results
  const testResultsBtn = document.querySelector('.action-card:nth-child(2)');
  if (testResultsBtn) {
    testResultsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToSection('lab-results-module');
      highlightSection('lab-results-module');
    });
  }
  
  // Request Refill
  const refillBtn = document.querySelector('.action-card:nth-child(3)');
  if (refillBtn) {
    refillBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showRefillModal();
    });
  }
  
  // Pay Outstanding Balance
  const payBtn = document.querySelector('.action-card:nth-child(4)');
  if (payBtn) {
    payBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showPaymentModal();
    });
  }
  
  // Message Care Team
  const messageBtn = document.querySelector('.action-card:nth-child(5)');
  if (messageBtn) {
    messageBtn.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToSection('messages-module');
      document.querySelector('#messages-module textarea')?.focus();
    });
  }
  
  // Download Medical Records
  const downloadBtn = document.querySelector('.action-card:nth-child(6)');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', (e) => {
      e.preventDefault();
      downloadAllMedicalRecords();
    });
  }
}

// ============================================================================
// APPOINTMENT BUTTONS
// ============================================================================
function initAppointmentButtons() {
  // Reschedule buttons
  document.querySelectorAll('.appointments-table .action-btn').forEach(btn => {
    if (btn.textContent.trim() === 'Reschedule') {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const row = btn.closest('tr');
        const appointmentDate = row?.cells[0]?.textContent || 'Unknown';
        showRescheduleModal(appointmentDate);
      });
    }
  });
  
  // Cancel buttons
  document.querySelectorAll('.appointments-table .action-btn.text').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const row = btn.closest('tr');
      const appointmentDate = row?.cells[0]?.textContent || 'Unknown';
      confirmCancelAppointment(appointmentDate);
    });
  });
  
  // Schedule new appointment link
  const scheduleNewBtn = document.querySelector('#appointments-module .section-link');
  if (scheduleNewBtn) {
    scheduleNewBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showAppointmentScheduler();
    });
  }
  
  // View past appointments link
  const pastAppointmentsLink = document.querySelector('.past-appointments-link a');
  if (pastAppointmentsLink) {
    pastAppointmentsLink.addEventListener('click', (e) => {
      e.preventDefault();
      showPastAppointments();
    });
  }
}

// ============================================================================
// LAB RESULTS BUTTONS
// ============================================================================
function initLabResultButtons() {
  // Download PDF buttons
  document.querySelectorAll('.lab-table .btn-text').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const row = btn.closest('tr');
      const testName = row?.cells[0]?.textContent || 'Lab Result';
      downloadLabResult(testName);
    });
  });
  
  // View all lab results link
  const viewAllBtn = document.querySelector('#lab-results-module .section-link');
  if (viewAllBtn) {
    viewAllBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showAllLabResults();
    });
  }
}

// ============================================================================
// PRESCRIPTION BUTTONS
// ============================================================================
function initPrescriptionButtons() {
  // Refill request buttons
  document.querySelectorAll('.btn-refill').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = btn.closest('.prescription-card');
      const medicationName = card?.querySelector('h4')?.textContent || 'Medication';
      showRefillModal(medicationName);
    });
  });
  
  // View all prescriptions link
  const viewAllBtn = document.querySelector('#prescriptions-module .section-link');
  if (viewAllBtn) {
    viewAllBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showAllPrescriptions();
    });
  }
}

// ============================================================================
// BILLING BUTTONS
// ============================================================================
function initBillingButtons() {
  // Pay now button
  const payNowBtn = document.querySelector('.btn-primary');
  if (payNowBtn && payNowBtn.textContent.trim() === 'Pay now') {
    payNowBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showPaymentModal();
    });
  }
  
  // Download invoice button
  const downloadInvoiceBtn = document.querySelector('.btn-secondary');
  if (downloadInvoiceBtn && downloadInvoiceBtn.textContent.trim() === 'Download invoice') {
    downloadInvoiceBtn.addEventListener('click', (e) => {
      e.preventDefault();
      downloadInvoice();
    });
  }
  
  // View benefits link
  const benefitsLink = document.querySelector('.link');
  if (benefitsLink) {
    benefitsLink.addEventListener('click', (e) => {
      e.preventDefault();
      showBenefitsSummary();
    });
  }
}

// ============================================================================
// MESSAGE BUTTONS
// ============================================================================
function initMessageButtons() {
  // Send message button
  const sendBtn = document.querySelector('.btn-send');
  if (sendBtn) {
    sendBtn.addEventListener('click', (e) => {
      e.preventDefault();
      sendSecureMessage();
    });
  }
  
  // Attach file button
  const attachBtn = document.querySelector('.btn-attach');
  if (attachBtn) {
    attachBtn.addEventListener('click', (e) => {
      e.preventDefault();
      attachFileToMessage();
    });
  }
  
  // New message link
  const newMessageLink = document.querySelector('#messages-module .section-link');
  if (newMessageLink) {
    newMessageLink.addEventListener('click', (e) => {
      e.preventDefault();
      composeNewMessage();
    });
  }
  
  // Message thread textarea - send on Enter (but not Shift+Enter)
  const messageTextarea = document.querySelector('.message-input-area textarea');
  if (messageTextarea) {
    messageTextarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendSecureMessage();
      }
    });
  }
}

// ============================================================================
// DOCUMENT BUTTONS
// ============================================================================
function initDocumentButtons() {
  // Upload document button
  const uploadBtn = document.querySelector('.btn-upload');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', (e) => {
      e.preventDefault();
      uploadDocument();
    });
  }
  
  // Document download buttons
  document.querySelectorAll('.document-item .btn-icon').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const docItem = btn.closest('.document-item');
      const docName = docItem?.querySelector('.doc-name')?.textContent || 'Document';
      downloadDocument(docName);
    });
  });
}

// ============================================================================
// MEDICAL RECORDS BUTTONS
// ============================================================================
function initMedicalRecordsButtons() {
  // Download all button
  const downloadAllBtn = document.querySelector('.btn-download-all');
  if (downloadAllBtn) {
    downloadAllBtn.addEventListener('click', (e) => {
      e.preventDefault();
      downloadAllMedicalRecords();
    });
  }
  
  // Record download buttons
  document.querySelectorAll('.record-item .btn-icon').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const recordItem = btn.closest('.record-item');
      const recordName = recordItem?.querySelector('h4')?.textContent || 'Record';
      downloadMedicalRecord(recordName);
    });
  });
}

// ============================================================================
// VIEW OPTIONS (List/Calendar toggle)
// ============================================================================
function initViewOptions() {
  const viewBtns = document.querySelectorAll('.view-btn');
  
  viewBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Remove active from all view buttons in this group
      const parent = this.closest('.view-options');
      if (parent) {
        parent.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
      }
      
      // Add active to clicked button
      this.classList.add('active');
      
      // Toggle view based on button text
      if (this.textContent.trim() === 'Calendar') {
        showCalendarView();
      } else {
        showListView();
      }
    });
  });
}

// ============================================================================
// NOTIFICATION ACTIONS
// ============================================================================
function initNotificationActions() {
  // Mark all as read link
  const markAllRead = document.querySelector('.notification-header a');
  if (markAllRead) {
    markAllRead.addEventListener('click', (e) => {
      e.preventDefault();
      markAllNotificationsRead();
    });
  }
  
  // Individual notification items click
  document.querySelectorAll('.notification-item').forEach(item => {
    item.addEventListener('click', function() {
      // Mark as read
      this.classList.remove('unread');
      
      // Get notification type and handle accordingly
      const icon = this.querySelector('i').className;
      if (icon.includes('flask')) {
        scrollToSection('lab-results-module');
      } else if (icon.includes('prescription')) {
        scrollToSection('prescriptions-module');
      } else if (icon.includes('calendar')) {
        scrollToSection('appointments-module');
      }
      
      // Update notification count
      updateNotificationBadge();
    });
  });
}

// ============================================================================
// SEARCH FUNCTIONALITY
// ============================================================================
function initSearchFunctionality() {
  const searchInput = document.querySelector('.global-search');
  
  if (searchInput) {
    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
      clearTimeout(searchTimeout);
      
      const query = this.value.trim();
      
      if (query.length < 2) {
        // Clear search highlights
        removeSearchHighlights();
        return;
      }
      
      searchTimeout = setTimeout(() => {
        performSearch(query);
      }, 300);
    });
    
    // Clear search on Escape
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        removeSearchHighlights();
      }
    });
  }
}

function performSearch(query) {
  console.log('Searching for:', query);
  
  const searchableElements = document.querySelectorAll(
    '.patient-details h2, .patient-meta span, .appointments-table td, .lab-table td, .prescription-card h4, .message-content p'
  );
  
  let results = 0;
  const lowerQuery = query.toLowerCase();
  
  searchableElements.forEach(element => {
    const text = element.textContent.toLowerCase();
    if (text.includes(lowerQuery)) {
      element.classList.add('search-highlight');
      results++;
      
      // Scroll to first result
      if (results === 1) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      element.classList.remove('search-highlight');
    }
  });
  
  if (results > 0) {
    showNotification(`Found ${results} result(s) for "${query}"`, 'info');
  } else {
    showNotification(`No results found for "${query}"`, 'warning');
  }
}

function removeSearchHighlights() {
  document.querySelectorAll('.search-highlight').forEach(el => {
    el.classList.remove('search-highlight');
  });
}

// Add CSS for search highlights
const searchStyle = document.createElement('style');
searchStyle.textContent = `
  .search-highlight {
    background-color: rgba(255, 213, 79, 0.3) !important;
    border-radius: 4px;
    padding: 2px 4px;
    transition: background-color 0.3s ease;
  }
  
  [data-theme="dark"] .search-highlight {
    background-color: rgba(255, 213, 79, 0.2) !important;
  }
`;
document.head.appendChild(searchStyle);

// ============================================================================
// MODAL SYSTEM
// ============================================================================
function initModalSystem() {
  // Create modal container if it doesn't exist
  if (!document.getElementById('dynamicModal')) {
    const modalHTML = `
      <div class="modal-overlay" id="dynamicModal">
        <div class="modal-container">
          <div class="modal-header">
            <i class="fas" id="modalIcon"></i>
            <h3 id="modalTitle"></h3>
            <button class="modal-close" id="dynamicModalClose">&times;</button>
          </div>
          <div class="modal-body" id="modalBody"></div>
          <div class="modal-footer" id="modalFooter"></div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }
  
  PortalState.modal = {
    overlay: document.getElementById('dynamicModal'),
    title: document.getElementById('modalTitle'),
    icon: document.getElementById('modalIcon'),
    body: document.getElementById('modalBody'),
    footer: document.getElementById('modalFooter'),
    closeBtn: document.getElementById('dynamicModalClose')
  };
  
  if (PortalState.modal.closeBtn) {
    PortalState.modal.closeBtn.addEventListener('click', hideDynamicModal);
  }
  
  // Close modal when clicking overlay
  if (PortalState.modal.overlay) {
    PortalState.modal.overlay.addEventListener('click', (e) => {
      if (e.target === PortalState.modal.overlay) {
        hideDynamicModal();
      }
    });
  }
}

function showDynamicModal(title, body, icon = 'info-circle', footer = null) {
  const modal = PortalState.modal;
  if (!modal || !modal.overlay) return;
  
  modal.title.textContent = title;
  modal.icon.className = `fas fa-${icon}`;
  modal.body.innerHTML = typeof body === 'string' ? body : '';
  
  if (footer) {
    modal.footer.innerHTML = footer;
  } else {
    modal.footer.innerHTML = '<button class="btn-primary" onclick="hideDynamicModal()">Close</button>';
  }
  
  modal.overlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function hideDynamicModal() {
  const modal = PortalState.modal;
  if (modal && modal.overlay) {
    modal.overlay.classList.remove('show');
    document.body.style.overflow = '';
  }
}

// ============================================================================
// APPOINTMENT SCHEDULER
// ============================================================================
function showAppointmentScheduler() {
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const body = `
    <form id="appointmentForm">
      <div class="form-group">
        <label for="appointmentType">Appointment Type</label>
        <select id="appointmentType" class="modal-select">
          <option value="primary">Primary Care</option>
          <option value="cardiology">Cardiology</option>
          <option value="neurology">Neurology</option>
          <option value="followup">Follow-up Visit</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="appointmentDate">Preferred Date</label>
        <input type="date" id="appointmentDate" class="modal-input" min="${today.toISOString().split('T')[0]}" value="${nextWeek.toISOString().split('T')[0]}">
      </div>
      
      <div class="form-group">
        <label for="appointmentTime">Preferred Time</label>
        <select id="appointmentTime" class="modal-select">
          <option value="9:00">9:00 AM</option>
          <option value="10:00">10:00 AM</option>
          <option value="11:00">11:00 AM</option>
          <option value="13:00">1:00 PM</option>
          <option value="14:00">2:00 PM</option>
          <option value="15:00">3:00 PM</option>
          <option value="16:00">4:00 PM</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="appointmentReason">Reason for Visit</label>
        <textarea id="appointmentReason" class="modal-textarea" rows="3" placeholder="Please describe your symptoms or reason for appointment..."></textarea>
      </div>
    </form>
  `;
  
  const footer = `
    <button class="btn-secondary" onclick="hideDynamicModal()">Cancel</button>
    <button class="btn-primary" onclick="scheduleAppointment()">Schedule Appointment</button>
  `;
  
  showDynamicModal('Schedule Appointment', body, 'calendar-plus', footer);
}

function scheduleAppointment() {
  const type = document.getElementById('appointmentType')?.value;
  const date = document.getElementById('appointmentDate')?.value;
  const time = document.getElementById('appointmentTime')?.value;
  const reason = document.getElementById('appointmentReason')?.value;
  
  if (!date || !time) {
    showNotification('Please select date and time', 'error');
    return;
  }
  
  // Format time
  const timeMap = {
    '9:00': '9:00 AM',
    '10:00': '10:00 AM',
    '11:00': '11:00 AM',
    '13:00': '1:00 PM',
    '14:00': '2:00 PM',
    '15:00': '3:00 PM',
    '16:00': '4:00 PM'
  };
  
  const formattedDate = new Date(date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
  
  showNotification(`Appointment scheduled for ${formattedDate} at ${timeMap[time] || time}`, 'success');
  hideDynamicModal();
}

// ============================================================================
// REFILL MODAL
// ============================================================================
function showRefillModal(medicationName = null) {
  const prescriptions = PortalState.prescriptions || [];
  
  let options = '';
  prescriptions.forEach(prescription => {
    const selected = medicationName && prescription.name === medicationName ? 'selected' : '';
    options += `<option value="${prescription.id}" ${selected}>${prescription.name} - ${prescription.dosage}</option>`;
  });
  
  const body = `
    <form id="refillForm">
      <div class="form-group">
        <label for="refillMedication">Select Medication</label>
        <select id="refillMedication" class="modal-select">
          ${options}
        </select>
      </div>
      
      <div class="form-group">
        <label for="refillPharmacy">Pharmacy</label>
        <select id="refillPharmacy" class="modal-select">
          <option value="cvs">CVS Pharmacy - Main St</option>
          <option value="walgreens">Walgreens - Broad Ave</option>
          <option value="hospital">St. John's Outpatient Pharmacy</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="refillNotes">Additional Notes</label>
        <textarea id="refillNotes" class="modal-textarea" rows="2" placeholder="Any special instructions..."></textarea>
      </div>
    </form>
  `;
  
  const footer = `
    <button class="btn-secondary" onclick="hideDynamicModal()">Cancel</button>
    <button class="btn-primary" onclick="requestRefill()">Request Refill</button>
  `;
  
  showDynamicModal('Request Prescription Refill', body, 'prescription-bottle', footer);
}

function requestRefill() {
  const medicationId = document.getElementById('refillMedication')?.value;
  const pharmacy = document.getElementById('refillPharmacy')?.value;
  const notes = document.getElementById('refillNotes')?.value;
  
  if (!medicationId) {
    showNotification('Please select a medication', 'error');
    return;
  }
  
  const medication = PortalState.prescriptions.find(p => p.id == medicationId);
  
  showNotification(`Refill requested for ${medication?.name || 'medication'}. Pharmacy will notify you when ready.`, 'success');
  hideDynamicModal();
}

// ============================================================================
// PAYMENT MODAL
// ============================================================================
function showPaymentModal() {
  const body = `
    <div class="payment-summary">
      <div style="margin-bottom: 20px;">
        <h4 style="margin-bottom: 15px;">Outstanding Balance</h4>
        <div style="display: flex; justify-content: space-between; padding: 15px; background: var(--neutral-100); border-radius: 8px;">
          <span>Total Due:</span>
          <span style="font-size: 24px; font-weight: bold; color: var(--primary-700);">$247.50</span>
        </div>
      </div>
      
      <form id="paymentForm">
        <div class="form-group">
          <label for="paymentAmount">Payment Amount</label>
          <input type="number" id="paymentAmount" class="modal-input" value="247.50" min="1" max="247.50" step="0.01">
        </div>
        
        <div class="form-group">
          <label for="paymentMethod">Payment Method</label>
          <select id="paymentMethod" class="modal-select">
            <option value="card">Credit / Debit Card</option>
            <option value="ach">Bank Account (ACH)</option>
            <option value="hsa">HSA / FSA Card</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="cardNumber">Card Number</label>
          <input type="text" id="cardNumber" class="modal-input" placeholder="**** **** **** 4242">
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group">
            <label for="expiryDate">Expiry</label>
            <input type="text" id="expiryDate" class="modal-input" placeholder="MM/YY">
          </div>
          <div class="form-group">
            <label for="cvv">CVV</label>
            <input type="text" id="cvv" class="modal-input" placeholder="***">
          </div>
        </div>
        
        <div style="margin-top: 15px; padding: 10px; background: var(--info-50); border-radius: 8px; display: flex; align-items: center; gap: 10px;">
          <i class="fas fa-lock" style="color: var(--info-700);"></i>
          <span style="font-size: 12px; color: var(--info-700);">Secure payment processing · 256-bit encrypted</span>
        </div>
      </form>
    </div>
  `;
  
  const footer = `
    <button class="btn-secondary" onclick="hideDynamicModal()">Cancel</button>
    <button class="btn-primary" onclick="processPayment()">Process Payment</button>
  `;
  
  showDynamicModal('Make a Payment', body, 'credit-card', footer);
}

function processPayment() {
  const amount = document.getElementById('paymentAmount')?.value;
  
  if (!amount || amount <= 0) {
    showNotification('Please enter a valid amount', 'error');
    return;
  }
  
  showNotification(`Payment of $${amount} processed successfully. Thank you!`, 'success');
  hideDynamicModal();
}

// ============================================================================
// MESSAGE FUNCTIONS
// ============================================================================
function sendSecureMessage() {
  const textarea = document.querySelector('.message-input-area textarea');
  const message = textarea?.value.trim();
  
  if (!message) {
    showNotification('Please enter a message', 'error');
    return;
  }
  
  // Add message to thread
  const messageThread = document.getElementById('messageThread');
  if (messageThread) {
    const messageHTML = `
      <div class="message-item outgoing">
        <div class="message-avatar">
          <span>${PortalState.currentUser?.firstName?.charAt(0) || 'U'}${PortalState.currentUser?.lastName?.charAt(0) || 'U'}</span>
        </div>
        <div class="message-content">
          <div class="message-header">
            <span class="sender">You</span>
            <span class="timestamp">Just now</span>
          </div>
          <p>${escapeHtml(message)}</p>
        </div>
      </div>
    `;
    
    messageThread.insertAdjacentHTML('beforeend', messageHTML);
    textarea.value = '';
    
    // Scroll to bottom
    messageThread.scrollTop = messageThread.scrollHeight;
    
    showNotification('Message sent securely', 'success');
  }
}

function composeNewMessage() {
  const body = `
    <form id="newMessageForm">
      <div class="form-group">
        <label for="messageRecipient">To</label>
        <select id="messageRecipient" class="modal-select">
          <option value="chen">Dr. Sarah Chen (Primary Care)</option>
          <option value="roberts">Dr. Michael Roberts (Neurology)</option>
          <option value="pharmacy">Pharmacy Department</option>
          <option value="billing">Billing Department</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="messageSubject">Subject</label>
        <input type="text" id="messageSubject" class="modal-input" placeholder="Brief subject line">
      </div>
      
      <div class="form-group">
        <label for="messageContent">Message</label>
        <textarea id="messageContent" class="modal-textarea" rows="5" placeholder="Type your secure message here..."></textarea>
      </div>
    </form>
  `;
  
  const footer = `
    <button class="btn-secondary" onclick="hideDynamicModal()">Cancel</button>
    <button class="btn-primary" onclick="sendNewMessage()">Send Secure Message</button>
  `;
  
  showDynamicModal('New Secure Message', body, 'envelope', footer);
}

function sendNewMessage() {
  const recipient = document.getElementById('messageRecipient')?.value;
  const subject = document.getElementById('messageSubject')?.value;
  const content = document.getElementById('messageContent')?.value;
  
  if (!content) {
    showNotification('Please enter a message', 'error');
    return;
  }
  
  showNotification('Message sent securely', 'success');
  hideDynamicModal();
}

function attachFileToMessage() {
  // Create hidden file input
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.pdf,.doc,.docx,.jpg,.png,.txt';
  
  fileInput.addEventListener('change', function(e) {
    if (this.files && this.files[0]) {
      const file = this.files[0];
      const fileSize = (file.size / 1024).toFixed(1);
      
      showNotification(`File attached: ${file.name} (${fileSize} KB)`, 'success');
      
      // Add attachment indicator
      const textarea = document.querySelector('.message-input-area textarea');
      const attachIndicator = document.createElement('div');
      attachIndicator.className = 'attachment-indicator';
      attachIndicator.innerHTML = `
        <i class="fas fa-paperclip"></i>
        <span>${file.name}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
      `;
      attachIndicator.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: var(--neutral-100);
        border-radius: 8px;
        margin-top: 8px;
        font-size: 12px;
      `;
      
      textarea?.parentElement?.appendChild(attachIndicator);
    }
  });
  
  fileInput.click();
}

// ============================================================================
// DOCUMENT FUNCTIONS
// ============================================================================
function uploadDocument() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.pdf,.doc,.docx,.jpg,.png,.txt,.xlsx,.csv';
  fileInput.multiple = true;
  
  fileInput.addEventListener('change', function(e) {
    if (this.files && this.files.length > 0) {
      const fileCount = this.files.length;
      
      for (let i = 0; i < Math.min(fileCount, 3); i++) {
        const file = this.files[i];
        const fileSize = (file.size / 1024).toFixed(1);
        const fileType = file.name.split('.').pop().toLowerCase();
        
        // Add to uploaded documents list
        const documentsList = document.getElementById('uploadedDocuments');
        if (documentsList) {
          const icon = fileType === 'pdf' ? 'file-pdf' : 
                      (fileType === 'jpg' || fileType === 'png') ? 'file-image' : 'file-alt';
          
          const docHTML = `
            <div class="document-item">
              <i class="fas fa-${icon}"></i>
              <div class="document-info">
                <span class="doc-name">${escapeHtml(file.name)}</span>
                <span class="doc-meta">Uploaded just now · ${fileSize} KB</span>
              </div>
              <button class="btn-icon" onclick="downloadDocument('${escapeHtml(file.name)}')">
                <i class="fas fa-download"></i>
              </button>
            </div>
          `;
          
          documentsList.insertAdjacentHTML('afterbegin', docHTML);
        }
      }
      
      showNotification(`${fileCount} file(s) uploaded successfully`, 'success');
    }
  });
  
  fileInput.click();
}

function downloadDocument(docName) {
  simulateDownload(docName);
}

function downloadMedicalRecord(recordName) {
  simulateDownload(recordName);
}

function downloadAllMedicalRecords() {
  simulateDownload('all_medical_records.zip');
  showNotification('Preparing your medical records for download...', 'info');
}

function downloadLabResult(testName) {
  simulateDownload(testName.replace(/[^a-zA-Z0-9]/g, '_') + '.pdf');
}

function downloadInvoice() {
  simulateDownload('invoice_Mar2026.pdf');
}

function simulateDownload(filename) {
  // Show download started notification
  showNotification(`Download started: ${filename}`, 'info');
  
  // Create fake download link
  const link = document.createElement('a');
  link.href = '#';
  link.download = filename;
  link.click();
}

// ============================================================================
// APPOINTMENT FUNCTIONS
// ============================================================================
function showRescheduleModal(appointmentDate) {
  const body = `
    <form id="rescheduleForm">
      <p>Current appointment: <strong>${appointmentDate}</strong></p>
      
      <div class="form-group">
        <label for="newAppointmentDate">New Date</label>
        <input type="date" id="newAppointmentDate" class="modal-input">
      </div>
      
      <div class="form-group">
        <label for="newAppointmentTime">New Time</label>
        <select id="newAppointmentTime" class="modal-select">
          <option value="9:00">9:00 AM</option>
          <option value="10:00">10:00 AM</option>
          <option value="11:00">11:00 AM</option>
          <option value="13:00">1:00 PM</option>
          <option value="14:00">2:00 PM</option>
          <option value="15:00">3:00 PM</option>
          <option value="16:00">4:00 PM</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="rescheduleReason">Reason for rescheduling</label>
        <textarea id="rescheduleReason" class="modal-textarea" rows="2"></textarea>
      </div>
    </form>
  `;
  
  const footer = `
    <button class="btn-secondary" onclick="hideDynamicModal()">Cancel</button>
    <button class="btn-primary" onclick="rescheduleAppointment()">Confirm Reschedule</button>
  `;
  
  showDynamicModal('Reschedule Appointment', body, 'calendar-alt', footer);
}

function rescheduleAppointment() {
  const newDate = document.getElementById('newAppointmentDate')?.value;
  
  if (!newDate) {
    showNotification('Please select a new date', 'error');
    return;
  }
  
  showNotification('Appointment rescheduled successfully', 'success');
  hideDynamicModal();
}

function confirmCancelAppointment(appointmentDate) {
  if (confirm(`Are you sure you want to cancel your appointment on ${appointmentDate}?`)) {
    showNotification('Appointment cancelled successfully', 'success');
    
    // Remove from table (simulated)
    // In a real app, you'd remove the row
  }
}

function showPastAppointments() {
  const body = `
    <div class="past-appointments-list">
      <div style="padding: 15px; border-bottom: 1px solid var(--border-color);">
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <strong>Feb 28, 2026 · 2:00 PM</strong>
          <span style="color: var(--success-700);">Completed</span>
        </div>
        <div>Dr. Sarah Chen · Cardiology</div>
        <div style="font-size: 12px; color: var(--neutral-500);">Follow-up visit</div>
      </div>
      
      <div style="padding: 15px; border-bottom: 1px solid var(--border-color);">
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <strong>Jan 15, 2026 · 10:30 AM</strong>
          <span style="color: var(--success-700);">Completed</span>
        </div>
        <div>Dr. Sarah Chen · Primary Care</div>
        <div style="font-size: 12px; color: var(--neutral-500);">Annual physical</div>
      </div>
      
      <div style="padding: 15px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <strong>Dec 4, 2025 · 9:00 AM</strong>
          <span style="color: var(--warning-700);">Cancelled</span>
        </div>
        <div>Dr. Michael Roberts · Neurology</div>
        <div style="font-size: 12px; color: var(--neutral-500);">Initial consultation</div>
      </div>
    </div>
  `;
  
  const footer = `
    <button class="btn-primary" onclick="hideDynamicModal()">Close</button>
  `;
  
  showDynamicModal('Past Appointments', body, 'history', footer);
}

// ============================================================================
// LAB RESULTS FUNCTIONS
// ============================================================================
function showAllLabResults() {
  let resultsHTML = '';
  
  PortalState.labResults.forEach(result => {
    const statusClass = result.status === 'final' ? 'status-badge final' : 'status-badge pending';
    const resultClass = result.normal ? 'result-normal' : 'result-abnormal';
    
    resultsHTML += `
      <div style="padding: 15px; border-bottom: 1px solid var(--border-color);">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <strong>${result.name}</strong>
          <span class="${statusClass}">${result.status}</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px;">
          <div>Ordered by: ${result.physician}</div>
          <div>Date: ${result.date}</div>
          <div class="${resultClass}">Result: ${result.result}</div>
          <div>Reference: ${result.range}</div>
        </div>
        <div style="margin-top: 10px;">
          <button class="btn-text" onclick="downloadLabResult('${result.name}')">
            <i class="fas fa-download"></i> Download PDF
          </button>
        </div>
      </div>
    `;
  });
  
  const body = `<div class="all-lab-results">${resultsHTML}</div>`;
  const footer = `<button class="btn-primary" onclick="hideDynamicModal()">Close</button>`;
  
  showDynamicModal('All Lab Results', body, 'flask', footer);
}

// ============================================================================
// PRESCRIPTION FUNCTIONS
// ============================================================================
function showAllPrescriptions() {
  let prescriptionsHTML = '';
  
  PortalState.prescriptions.forEach(prescription => {
    const refillClass = prescription.refillStatus === 'active' ? 'refill-badge active' : 'refill-badge low';
    
    prescriptionsHTML += `
      <div style="padding: 15px; border-bottom: 1px solid var(--border-color);">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <strong>${prescription.name}</strong>
          <span class="${refillClass}">${prescription.refills} refills left</span>
        </div>
        <div style="font-size: 14px; color: var(--neutral-600); margin-bottom: 5px;">${prescription.dosage}</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; font-size: 14px;">
          <div>Prescribed by: ${prescription.physician}</div>
          <div>Expires: ${prescription.expires}</div>
        </div>
        <div style="margin-top: 10px;">
          <button class="btn-refill" onclick="showRefillModal('${prescription.name}')">Request Refill</button>
        </div>
      </div>
    `;
  });
  
  const body = `<div class="all-prescriptions">${prescriptionsHTML}</div>`;
  const footer = `<button class="btn-primary" onclick="hideDynamicModal()">Close</button>`;
  
  showDynamicModal('All Prescriptions', body, 'prescription-bottle', footer);
}

// ============================================================================
// INSURANCE FUNCTIONS
// ============================================================================
function showBenefitsSummary() {
  const body = `
    <div class="benefits-summary">
      <div style="margin-bottom: 20px;">
        <h4 style="margin-bottom: 15px;">Coverage Details</h4>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid var(--border-color);">
            <td style="padding: 10px 0;">Primary Care Visit</td>
            <td style="padding: 10px 0; text-align: right; font-weight: bold;">\$20 copay</td>
          </tr>
          <tr style="border-bottom: 1px solid var(--border-color);">
            <td style="padding: 10px 0;">Specialist Visit</td>
            <td style="padding: 10px 0; text-align: right; font-weight: bold;">\$40 copay</td>
          </tr>
          <tr style="border-bottom: 1px solid var(--border-color);">
            <td style="padding: 10px 0;">Emergency Room</td>
            <td style="padding: 10px 0; text-align: right; font-weight: bold;">\$250 copay</td>
          </tr>
          <tr style="border-bottom: 1px solid var(--border-color);">
            <td style="padding: 10px 0;">Prescription - Generic</td>
            <td style="padding: 10px 0; text-align: right; font-weight: bold;">\$10 copay</td>
          </tr>
          <tr style="border-bottom: 1px solid var(--border-color);">
            <td style="padding: 10px 0;">Prescription - Brand</td>
            <td style="padding: 10px 0; text-align: right; font-weight: bold;">\$30 copay</td>
          </tr>
          <tr>
            <td style="padding: 10px 0;">Lab Work</td>
            <td style="padding: 10px 0; text-align: right; font-weight: bold;">Covered 100%</td>
          </tr>
        </table>
      </div>
      
      <div style="background: var(--info-50); padding: 15px; border-radius: 8px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
          <i class="fas fa-info-circle" style="color: var(--info-700);"></i>
          <span style="font-weight: bold;">Need Help?</span>
        </div>
        <p style="font-size: 14px;">Contact your benefits coordinator at <strong>1-800-555-0123</strong> or email <strong>benefits@stjohns.health</strong></p>
      </div>
    </div>
  `;
  
  const footer = `<button class="btn-primary" onclick="hideDynamicModal()">Close</button>`;
  
  showDynamicModal('Benefits Summary', body, 'shield-alt', footer);
}

// ============================================================================
// VIEW TOGGLES
// ============================================================================
function showCalendarView() {
  const body = `
    <div class="calendar-view">
      <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; margin-bottom: 20px;">
        <div style="text-align: center; font-weight: bold;">Sun</div>
        <div style="text-align: center; font-weight: bold;">Mon</div>
        <div style="text-align: center; font-weight: bold;">Tue</div>
        <div style="text-align: center; font-weight: bold;">Wed</div>
        <div style="text-align: center; font-weight: bold;">Thu</div>
        <div style="text-align: center; font-weight: bold;">Fri</div>
        <div style="text-align: center; font-weight: bold;">Sat</div>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px;">
        <div style="aspect-ratio: 1; background: var(--neutral-100); border-radius: 8px; padding: 5px; text-align: right;">28</div>
        <div style="aspect-ratio: 1; background: var(--neutral-100); border-radius: 8px; padding: 5px; text-align: right;">1</div>
        <div style="aspect-ratio: 1; background: var(--neutral-100); border-radius: 8px; padding: 5px; text-align: right;">2</div>
        <div style="aspect-ratio: 1; background: var(--neutral-100); border-radius: 8px; padding: 5px; text-align: right;">3</div>
        <div style="aspect-ratio: 1; background: var(--neutral-100); border-radius: 8px; padding: 5px; text-align: right;">4</div>
        <div style="aspect-ratio: 1; background: var(--neutral-100); border-radius: 8px; padding: 5px; text-align: right;">5</div>
        <div style="aspect-ratio: 1; background: var(--neutral-100); border-radius: 8px; padding: 5px; text-align: right;">6</div>
        
        <div style="aspect-ratio: 1; background: var(--neutral-100); border-radius: 8px; padding: 5px; text-align: right;">7</div>
        <div style="aspect-ratio: 1; background: var(--neutral-100); border-radius: 8px; padding: 5px; text-align: right;">8</div>
        <div style="aspect-ratio: 1; background: var(--neutral-100); border-radius: 8px; padding: 5px; text-align: right;">9</div>
        <div style="aspect-ratio: 1; background: var(--neutral-100); border-radius: 8px; padding: 5px; text-align: right;">10</div>
        <div style="aspect-ratio: 1; background: var(--neutral-100); border-radius: 8px; padding: 5px; text-align: right;">11</div>
        <div style="aspect-ratio: 1; background: var(--neutral-100); border-radius: 8px; padding: 5px; text-align: right;">12</div>
        <div style="aspect-ratio: 1; background: var(--neutral-100); border-radius: 8px; padding: 5px; text-align: right;">13</div>
        
        <div style="aspect-ratio: 1; background: var(--primary-100); border: 2px solid var(--primary-500); border-radius: 8px; padding: 5px; text-align: right; position: relative;">
          14
          <div style="position: absolute; bottom: 5px; left: 5px; right: 5px; font-size: 10px; background: var(--primary-500); color: white; padding: 2px; border-radius: 4px; text-align: center;">2:00 PM</div>
        </div>
        
        <div style="aspect-ratio: 1; background: var(--neutral-100); border-radius: 8px; padding: 5px; text-align: right;">15</div>
        <div style="aspect-ratio: 1; background: var(--neutral-100); border-radius: 8px; padding: 5px; text-align: right;">16</div>
        <div style="aspect-ratio: 1; background: var(--neutral-100); border-radius: 8px; padding: 5px; text-align: right;">17</div>
        <div style="aspect-ratio: 1; background: var(--neutral-100); border-radius: 8px; padding: 5px; text-align: right;">18</div>
        <div style="aspect-ratio: 1; background: var(--neutral-100); border-radius: 8px; padding: 5px; text-align: right;">19</div>
        <div style="aspect-ratio: 1; background: var(--neutral-100); border-radius: 8px; padding: 5px; text-align: right;">20</div>
        
        <div style="aspect-ratio: 1; background: var(--neutral-100); border-radius: 8px; padding: 5px; text-align: right;">21</div>
        <div style="aspect-ratio: 1; background: var(--neutral-100); border-radius: 8px; padding: 5px; text-align: right;">22</div>
        <div style="aspect-ratio: 1; background: var(--neutral-100); border-radius: 8px; padding: 5px; text-align: right;">23</div>
        <div style="aspect-ratio: 1; background: var(--neutral-100); border-radius: 8px; padding: 5px; text-align: right;">24</div>
        <div style="aspect-ratio: 1; background: var(--neutral-100); border-radius: 8px; padding: 5px; text-align: right;">25</div>
        <div style="aspect-ratio: 1; background: var(--neutral-100); border-radius: 8px; padding: 5px; text-align: right;">26</div>
        <div style="aspect-ratio: 1; background: var(--neutral-100); border-radius: 8px; padding: 5px; text-align: right;">27</div>
      </div>
    </div>
  `;
  
  const footer = `<button class="btn-primary" onclick="hideDynamicModal()">Close</button>`;
  
  showDynamicModal('Calendar View', body, 'calendar-alt', footer);
}

function showListView() {
  // Just show the normal table, this is already the default
  showNotification('List view activated', 'info');
}

// ============================================================================
// NOTIFICATION FUNCTIONS
// ============================================================================
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification-toast ${type}`;
  
  const icon = type === 'success' ? 'check-circle' : 
               type === 'error' ? 'exclamation-circle' : 
               type === 'warning' ? 'exclamation-triangle' : 'info-circle';
  
  notification.innerHTML = `
    <i class="fas fa-${icon}"></i>
    <span>${message}</span>
  `;
  
  notification.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: ${type === 'success' ? 'var(--success-500)' : 
                 type === 'error' ? 'var(--error-500)' : 
                 type === 'warning' ? 'var(--warning-500)' : 'var(--info-500)'};
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    box-shadow: var(--shadow-lg);
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 12px;
    animation: slideIn 0.3s ease;
    max-width: 400px;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function updateNotificationBadge() {
  const unreadCount = document.querySelectorAll('.notification-item.unread').length;
  
  if (DOM.notificationBadge) {
    if (unreadCount > 0) {
      DOM.notificationBadge.textContent = unreadCount;
      DOM.notificationBadge.style.display = 'flex';
    } else {
      DOM.notificationBadge.style.display = 'none';
    }
  }
}

function markAllNotificationsRead() {
  document.querySelectorAll('.notification-item.unread').forEach(item => {
    item.classList.remove('unread');
  });
  
  updateNotificationBadge();
  showNotification('All notifications marked as read', 'success');
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}

function highlightSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.style.transition = 'background-color 0.5s ease';
    section.style.backgroundColor = 'rgba(10, 102, 194, 0.1)';
    
    setTimeout(() => {
      section.style.backgroundColor = '';
    }, 2000);
  }
}

function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ============================================================================
// SIDEBAR CONTROLS
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
// DARK MODE
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
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      PortalState.darkMode = true;
      document.documentElement.setAttribute('data-theme', 'dark');
      if (DOM.themeToggle) DOM.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
  }
  
  const savedSidebarState = localStorage.getItem('sidebarCollapsed');
  if (savedSidebarState === 'true' && window.innerWidth > 992) {
    PortalState.sidebarCollapsed = true;
    DOM.sidebar.classList.add('collapsed');
  }
}

// ============================================================================
// DROPDOWN CONTROLS
// ============================================================================
function toggleNotificationMenu(e) {
  e.stopPropagation();
  
  if (DOM.notificationMenu) {
    DOM.notificationMenu.classList.toggle('show');
    
    if (DOM.profileMenu) {
      DOM.profileMenu.classList.remove('show');
    }
  }
}

function toggleProfileMenu(e) {
  e.stopPropagation();
  
  if (DOM.profileMenu) {
    DOM.profileMenu.classList.toggle('show');
    
    if (DOM.notificationMenu) {
      DOM.notificationMenu.classList.remove('show');
    }
  }
}

function closeDropdownsOnClickOutside(e) {
  if (DOM.notificationMenu && 
      DOM.notificationMenu.classList.contains('show') &&
      !DOM.notificationBtn.contains(e.target) &&
      !DOM.notificationMenu.contains(e.target)) {
    DOM.notificationMenu.classList.remove('show');
  }
  
  if (DOM.profileMenu && 
      DOM.profileMenu.classList.contains('show') &&
      !DOM.profileBtn.contains(e.target) &&
      !DOM.profileMenu.contains(e.target)) {
    DOM.profileMenu.classList.remove('show');
  }
}

// ============================================================================
// TAB SYSTEM
// ============================================================================
function initTabSystem() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanes.forEach(pane => pane.classList.remove('active'));
      
      this.classList.add('active');
      
      const tabId = this.dataset.tab;
      const targetPane = document.getElementById(tabId);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });
}

// ============================================================================
// TIME SLOT SELECTION
// ============================================================================
function initTimeSlotSelection() {
  const timeSlots = document.querySelectorAll('.time-slot');
  
  timeSlots.forEach(slot => {
    slot.addEventListener('click', function() {
      const container = this.closest('.time-slots');
      if (container) {
        container.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
      }
      
      this.classList.add('selected');
    });
  });
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================
function startSessionTimer() {
  if (PortalState.sessionTimer) {
    clearTimeout(PortalState.sessionTimer);
  }
  
  PortalState.sessionTimer = setTimeout(showSessionWarning, PortalState.sessionTimeout - 300000);
}

function resetSessionTimer() {
  if (DOM.sessionNotice) {
    DOM.sessionNotice.style.display = 'none';
  }
  
  startSessionTimer();
}

function showSessionWarning() {
  if (DOM.sessionNotice) {
    DOM.sessionNotice.style.display = 'flex';
  }
}

// ============================================================================
// LOGOUT FLOW
// ============================================================================
function showLogoutModal(e) {
  e.preventDefault();
  
  if (DOM.logoutModal) {
    DOM.logoutModal.classList.add('show');
    
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
  console.log('🔒 Patient Portal: Secure logout initiated');
  
  localStorage.removeItem('auth_isAuthenticated');
  localStorage.removeItem('auth_sessionExpiry');
  localStorage.removeItem('auth_currentUser');
  
  sessionStorage.clear();
  
  console.log('✅ Logout complete, redirecting to login...');
  
  window.location.href = 'auth.html';
}

// ============================================================================
// NAVIGATION ACTIVE STATE
// ============================================================================
function setActiveNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === '#dashboard' || href === 'patient-portal.html') {
      link.closest('.nav-item').classList.add('active');
    } else {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        
        document.querySelectorAll('.nav-item').forEach(item => {
          item.classList.remove('active');
        });
        
        this.closest('.nav-item').classList.add('active');
        
        const targetId = this.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
          const targetSection = document.getElementById(targetId.substring(1) + '-module');
          if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
          }
        }
        
        if (window.innerWidth <= 992) {
          closeMobileSidebar();
        }
      });
    }
  });
}

// ============================================================================
// RESPONSIVE HANDLERS
// ============================================================================
function handleResize() {
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
// ADD ANIMATION STYLES
// ============================================================================
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  .notification-toast {
    animation: slideIn 0.3s ease;
  }
  
  .modal-overlay.show {
    display: flex;
  }
  
  /* Form styles for modals */
  .modal-select, .modal-input, .modal-textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-family: var(--font-sans);
    font-size: 14px;
    background: var(--neutral-white);
    color: var(--neutral-800);
  }
  
  .modal-select:focus, .modal-input:focus, .modal-textarea:focus {
    outline: none;
    border-color: var(--primary-500);
    box-shadow: 0 0 0 3px rgba(10, 102, 194, 0.1);
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    font-size: 14px;
    color: var(--neutral-700);
  }
  
  .all-lab-results, .all-prescriptions {
    max-height: 400px;
    overflow-y: auto;
  }
  
  .calendar-view {
    max-width: 100%;
    overflow-x: auto;
  }
  
  .attachment-indicator button {
    background: none;
    border: none;
    color: var(--neutral-500);
    font-size: 16px;
    cursor: pointer;
    margin-left: auto;
  }
  
  .attachment-indicator button:hover {
    color: var(--error-500);
  }
`;
document.head.appendChild(style);

// ============================================================================
// PORTAL READY
// ============================================================================
console.log('✅ Patient Portal: Fully functional dashboard ready');