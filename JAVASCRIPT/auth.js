/**
 * AUTHENTICATION GATEWAY · ENTERPRISE HEALTHCARE SYSTEM
 * St. John's Medical Center
 * 
 * Module: Secure Authentication & Multi‑Step Signup
 * HIPAA‑Compliant · 256‑bit Encryption Simulation
 * Multi-User Support with Dynamic Dashboard Population
 * 
 * @version 2.1.0
 */

'use strict';

// ============================================================================
// AUTHENTICATION STATE MANAGEMENT
// ============================================================================
const AuthState = {
  currentView: 'login',          // 'login' or 'signup'
  currentStep: 1,                // 1-4 for signup wizard
  isAuthenticated: false,
  users: [],                     // Array of registered users
  currentUser: null,             // Currently logged in user
  signupData: {                  // Collected signup data across steps
    step1: {},
    step2: {},
    step3: {},
    step4: {}
  },
  sessionTimer: null,
  sessionTimeout: 900000,        // 15 minutes in ms
  darkMode: false
};

// ============================================================================
// DOM ELEMENT CACHING – PERFORMANCE OPTIMIZED
// ============================================================================
const DOM = {
  // Toggles
  loginToggle: document.getElementById('loginToggle'),
  signupToggle: document.getElementById('signupToggle'),
  toggleIndicator: document.getElementById('toggleIndicator'),
  
  // Forms
  loginForm: document.getElementById('loginForm'),
  signupForm: document.getElementById('signupForm'),
  loginFormElement: document.getElementById('loginFormElement'),
  
  // Step containers
  step1: document.getElementById('step1'),
  step2: document.getElementById('step2'),
  step3: document.getElementById('step3'),
  step4: document.getElementById('step4'),
  
  // Step forms
  step1Form: document.getElementById('step1Form'),
  step2Form: document.getElementById('step2Form'),
  step4Form: document.getElementById('step4Form'),
  
  // Progress
  progressFill: document.getElementById('progressFill'),
  steps: document.querySelectorAll('.step'),
  
  // Navigation buttons
  step1Next: document.getElementById('step1Next'),
  step2Prev: document.getElementById('step2Prev'),
  step2Next: document.getElementById('step2Next'),
  step3Prev: document.getElementById('step3Prev'),
  step3Next: document.getElementById('step3Next'),
  step4Prev: document.getElementById('step4Prev'),
  signupSubmit: document.getElementById('signupSubmit'),
  
  // Login elements
  loginEmail: document.getElementById('loginEmail'),
  loginPassword: document.getElementById('loginPassword'),
  rememberDevice: document.getElementById('rememberDevice'),
  loginSubmit: document.getElementById('loginSubmit'),
  loginErrorContainer: document.getElementById('loginErrorContainer'),
  loginGeneralError: document.getElementById('loginGeneralError'),
  
  // Signup inputs
  firstName: document.getElementById('firstName'),
  lastName: document.getElementById('lastName'),
  signupEmail: document.getElementById('signupEmail'),
  phone: document.getElementById('phone'),
  dob: document.getElementById('dob'),
  gender: document.getElementById('gender'),
  insurance: document.getElementById('insurance'),
  emergencyName: document.getElementById('emergencyName'),
  emergencyPhone: document.getElementById('emergencyPhone'),
  address: document.getElementById('address'),
  password: document.getElementById('password'),
  confirmPassword: document.getElementById('confirmPassword'),
  termsCheckbox: document.getElementById('termsCheckbox'),
  privacyCheckbox: document.getElementById('privacyCheckbox'),
  
  // Photo
  photoUpload: document.getElementById('photoUpload'),
  uploadPhotoBtn: document.getElementById('uploadPhotoBtn'),
  takePhotoBtn: document.getElementById('takePhotoBtn'),
  cameraContainer: document.getElementById('cameraContainer'),
  cameraFeed: document.getElementById('cameraFeed'),
  capturePhotoBtn: document.getElementById('capturePhotoBtn'),
  cancelCameraBtn: document.getElementById('cancelCameraBtn'),
  cameraFallback: document.getElementById('cameraFallback'),
  profileImage: document.getElementById('profileImage'),
  removePhoto: document.getElementById('removePhoto'),
  
  // Password strength
  strengthBar: document.getElementById('strengthBar'),
  strengthText: document.getElementById('strengthText'),
  
  // Modals
  successModal: document.getElementById('successModal'),
  sessionTimeoutModal: document.getElementById('sessionTimeoutModal'),
  userEmailDisplay: document.getElementById('userEmailDisplay'),
  modalContinueBtn: document.getElementById('modalContinueBtn'),
  modalResendBtn: document.getElementById('modalResendBtn'),
  staySignedInBtn: document.getElementById('staySignedInBtn'),
  logoutNowBtn: document.getElementById('logoutNowBtn'),
  
  // Theme
  themeToggle: document.getElementById('authThemeToggle'),
  
  // Error displays
  loginEmailError: document.getElementById('loginEmailError'),
  loginPasswordError: document.getElementById('loginPasswordError'),
  firstNameError: document.getElementById('firstNameError'),
  lastNameError: document.getElementById('lastNameError'),
  signupEmailError: document.getElementById('signupEmailError'),
  phoneError: document.getElementById('phoneError'),
  dobError: document.getElementById('dobError'),
  genderError: document.getElementById('genderError'),
  insuranceError: document.getElementById('insuranceError'),
  emergencyNameError: document.getElementById('emergencyNameError'),
  emergencyPhoneError: document.getElementById('emergencyPhoneError'),
  addressError: document.getElementById('addressError'),
  passwordError: document.getElementById('passwordError'),
  confirmPasswordError: document.getElementById('confirmPasswordError'),
  
  // Switch links
  switchToSignup: document.getElementById('switchToSignup'),
  
  // Password toggles
  passwordToggles: document.querySelectorAll('.password-toggle')
};

// ============================================================================
// INITIALIZATION – LOAD USERS & CHECK AUTH STATE
// ============================================================================
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔐 Auth Gateway: Initializing secure authentication...');
  
  // Load existing users from localStorage
  loadUsersFromStorage();
  
  // Check if already authenticated
  checkAuthState();
  
  // Initialize UI
  initEventListeners();
  initPasswordToggles();
  checkSystemPreferences();
  initFormValidation();
  
  // Set default step states
  updateProgressBar();
  validateStep1();
  
  console.log(`✅ Auth Gateway: Loaded ${AuthState.users.length} users from storage`);
});

// ============================================================================
// USER MANAGEMENT – LOAD FROM STORAGE
// ============================================================================
function loadUsersFromStorage() {
  const storedUsers = localStorage.getItem('hospital_users');
  if (storedUsers) {
    try {
      AuthState.users = JSON.parse(storedUsers);
    } catch (e) {
      console.error('Failed to parse users from storage:', e);
      AuthState.users = [];
    }
  } else {
    AuthState.users = [];
    // Save empty array to initialize
    localStorage.setItem('hospital_users', JSON.stringify([]));
  }
}

function saveUsersToStorage() {
  localStorage.setItem('hospital_users', JSON.stringify(AuthState.users));
  console.log('💾 Users saved to storage:', AuthState.users.length);
}

// ============================================================================
// AUTHENTICATION STATE CHECK (Redirect if already logged in)
// ============================================================================
function checkAuthState() {
  const isAuthenticated = localStorage.getItem('auth_isAuthenticated') === 'true';
  const sessionExpiry = localStorage.getItem('auth_sessionExpiry');
  const currentUser = localStorage.getItem('auth_currentUser');
  
  if (isAuthenticated && sessionExpiry && currentUser) {
    const now = new Date().getTime();
    if (now < parseInt(sessionExpiry)) {
      // Valid session – redirect to dashboard if on auth page
      if (window.location.pathname.includes('auth.html')) {
        console.log('🔄 Valid session found, redirecting to dashboard...');
        window.location.href = 'patient-portal.html';
      }
    } else {
      // Session expired – clear storage
      clearAuthState();
    }
  }
}

function clearAuthState() {
  localStorage.removeItem('auth_isAuthenticated');
  localStorage.removeItem('auth_sessionExpiry');
  localStorage.removeItem('auth_currentUser');
  console.log('🚪 Auth state cleared');
}

// ============================================================================
// EVENT LISTENER REGISTRY
// ============================================================================
function initEventListeners() {
  // Toggle between Login and Signup
  if (DOM.loginToggle) {
    DOM.loginToggle.addEventListener('click', () => switchView('login'));
  }
  
  if (DOM.signupToggle) {
    DOM.signupToggle.addEventListener('click', () => switchView('signup'));
  }
  
  // Switch links
  if (DOM.switchToSignup) {
    DOM.switchToSignup.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('signup');
    });
  }
  
  // Login form submission
  if (DOM.loginFormElement) {
    DOM.loginFormElement.addEventListener('submit', handleLogin);
  }
  
  // Step navigation
  if (DOM.step1Next) {
    DOM.step1Next.addEventListener('click', () => {
      if (validateStep1()) {
        saveStep1Data();
        goToStep(2);
      }
    });
  }
  
  if (DOM.step2Prev) {
    DOM.step2Prev.addEventListener('click', () => goToStep(1));
  }
  
  if (DOM.step2Next) {
    DOM.step2Next.addEventListener('click', () => {
      if (validateStep2()) {
        saveStep2Data();
        goToStep(3);
      }
    });
  }
  
  if (DOM.step3Prev) {
    DOM.step3Prev.addEventListener('click', () => goToStep(2));
  }
  
  if (DOM.step3Next) {
    DOM.step3Next.addEventListener('click', () => {
      saveStep3Data();
      goToStep(4);
    });
  }
  
  if (DOM.step4Prev) {
    DOM.step4Prev.addEventListener('click', () => goToStep(3));
  }
  
  // Signup submission
  if (DOM.signupSubmit) {
    DOM.signupSubmit.addEventListener('click', (e) => {
      e.preventDefault();
      handleSignup();
    });
  }
  
  // Real‑time validation
  if (DOM.firstName) DOM.firstName.addEventListener('input', validateStep1);
  if (DOM.lastName) DOM.lastName.addEventListener('input', validateStep1);
  if (DOM.signupEmail) DOM.signupEmail.addEventListener('input', validateStep1);
  if (DOM.phone) DOM.phone.addEventListener('input', validateStep1);
  if (DOM.dob) DOM.dob.addEventListener('change', validateStep1);
  if (DOM.gender) DOM.gender.addEventListener('change', validateStep1);
  
  if (DOM.insurance) DOM.insurance.addEventListener('input', validateStep2);
  if (DOM.emergencyName) DOM.emergencyName.addEventListener('input', validateStep2);
  if (DOM.emergencyPhone) DOM.emergencyPhone.addEventListener('input', validateStep2);
  if (DOM.address) DOM.address.addEventListener('input', validateStep2);
  
  if (DOM.password) {
    DOM.password.addEventListener('input', () => {
      validateStep4();
      updatePasswordStrength();
    });
  }
  if (DOM.confirmPassword) DOM.confirmPassword.addEventListener('input', validateStep4);
  if (DOM.termsCheckbox) DOM.termsCheckbox.addEventListener('change', validateStep4);
  if (DOM.privacyCheckbox) DOM.privacyCheckbox.addEventListener('change', validateStep4);
  
  // Photo handling
  if (DOM.uploadPhotoBtn) {
    DOM.uploadPhotoBtn.addEventListener('click', () => {
      DOM.photoUpload.click();
    });
  }
  
  if (DOM.photoUpload) {
    DOM.photoUpload.addEventListener('change', handlePhotoUpload);
  }
  
  if (DOM.takePhotoBtn) {
    DOM.takePhotoBtn.addEventListener('click', handleTakePhoto);
  }
  
  if (DOM.capturePhotoBtn) {
    DOM.capturePhotoBtn.addEventListener('click', capturePhoto);
  }
  
  if (DOM.cancelCameraBtn) {
    DOM.cancelCameraBtn.addEventListener('click', stopCamera);
  }
  
  if (DOM.removePhoto) {
    DOM.removePhoto.addEventListener('click', removePhoto);
  }
  
  // Modal actions
  if (DOM.modalContinueBtn) {
    DOM.modalContinueBtn.addEventListener('click', () => {
      hideModal(DOM.successModal);
      switchView('login');
      // Pre-fill email if available
      if (DOM.signupEmail && DOM.signupEmail.value) {
        DOM.loginEmail.value = DOM.signupEmail.value;
      }
    });
  }
  
  if (DOM.modalResendBtn) {
    DOM.modalResendBtn.addEventListener('click', () => {
      alert('📧 Verification email resent (simulated)');
    });
  }
  
  if (DOM.staySignedInBtn) {
    DOM.staySignedInBtn.addEventListener('click', () => {
      hideModal(DOM.sessionTimeoutModal);
      resetSessionTimer();
    });
  }
  
  if (DOM.logoutNowBtn) {
    DOM.logoutNowBtn.addEventListener('click', () => {
      hideModal(DOM.sessionTimeoutModal);
      logout();
    });
  }
  
  // Theme toggle
  if (DOM.themeToggle) {
    DOM.themeToggle.addEventListener('click', toggleDarkMode);
  }
}

// ============================================================================
// VIEW TOGGLING (LOGIN / SIGNUP)
// ============================================================================
function switchView(view) {
  AuthState.currentView = view;
  
  // Update toggle buttons
  if (view === 'login') {
    DOM.loginToggle.classList.add('active');
    DOM.signupToggle.classList.remove('active');
    DOM.toggleIndicator.classList.remove('signup');
    DOM.loginForm.classList.add('active');
    DOM.signupForm.classList.remove('active');
  } else {
    DOM.loginToggle.classList.remove('active');
    DOM.signupToggle.classList.add('active');
    DOM.toggleIndicator.classList.add('signup');
    DOM.loginForm.classList.remove('active');
    DOM.signupForm.classList.add('active');
    
    // Reset signup to step 1
    goToStep(1);
  }
}

// ============================================================================
// STEP NAVIGATION – SIGNUP WIZARD
// ============================================================================
function goToStep(step) {
  if (step < 1 || step > 4) return;
  
  // Hide all steps
  DOM.step1.classList.remove('active');
  DOM.step2.classList.remove('active');
  DOM.step3.classList.remove('active');
  DOM.step4.classList.remove('active');
  
  // Show target step
  document.getElementById(`step${step}`).classList.add('active');
  
  // Update step indicators
  DOM.steps.forEach((s, index) => {
    const stepNum = index + 1;
    s.classList.remove('active', 'completed');
    
    if (stepNum === step) {
      s.classList.add('active');
    } else if (stepNum < step) {
      s.classList.add('completed');
    }
  });
  
  AuthState.currentStep = step;
  updateProgressBar();
  
  // Validate current step to enable/disable next button
  if (step === 1) validateStep1();
  else if (step === 2) validateStep2();
  else if (step === 4) validateStep4();
  
  console.log(`📝 Navigated to step ${step}`);
}

function updateProgressBar() {
  if (DOM.progressFill) {
    const progress = (AuthState.currentStep / 4) * 100;
    DOM.progressFill.style.width = `${progress}%`;
  }
}

// ============================================================================
// DATA SAVING FROM STEPS
// ============================================================================
function saveStep1Data() {
  AuthState.signupData.step1 = {
    firstName: DOM.firstName?.value.trim() || '',
    lastName: DOM.lastName?.value.trim() || '',
    email: DOM.signupEmail?.value.trim() || '',
    phone: DOM.phone?.value.trim() || '',
    dob: DOM.dob?.value || '',
    gender: DOM.gender?.value || ''
  };
  console.log('✅ Step 1 data saved:', AuthState.signupData.step1.email);
}

function saveStep2Data() {
  AuthState.signupData.step2 = {
    insurance: DOM.insurance?.value.trim() || '',
    emergencyName: DOM.emergencyName?.value.trim() || '',
    emergencyPhone: DOM.emergencyPhone?.value.trim() || '',
    address: DOM.address?.value.trim() || ''
  };
  console.log('✅ Step 2 data saved');
}

function saveStep3Data() {
  AuthState.signupData.step3 = {
    photo: AuthState.signupData.step3?.photo || null
  };
  console.log('✅ Step 3 data saved');
}

function saveStep4Data() {
  AuthState.signupData.step4 = {
    password: DOM.password?.value || '',
    terms: DOM.termsCheckbox?.checked || false,
    privacy: DOM.privacyCheckbox?.checked || false
  };
  console.log('✅ Step 4 data saved');
}

// ============================================================================
// STEP VALIDATION
// ============================================================================
function validateStep1() {
  const firstName = DOM.firstName?.value.trim() || '';
  const lastName = DOM.lastName?.value.trim() || '';
  const email = DOM.signupEmail?.value.trim() || '';
  const phone = DOM.phone?.value.trim() || '';
  const dob = DOM.dob?.value || '';
  const gender = DOM.gender?.value || '';
  
  let isValid = true;
  
  // First Name
  if (!firstName) {
    showError('firstNameError', 'First name is required');
    isValid = false;
  } else {
    showError('firstNameError', '');
  }
  
  // Last Name
  if (!lastName) {
    showError('lastNameError', 'Last name is required');
    isValid = false;
  } else {
    showError('lastNameError', '');
  }
  
  // Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    showError('signupEmailError', 'Email is required');
    isValid = false;
  } else if (!emailRegex.test(email)) {
    showError('signupEmailError', 'Please enter a valid email');
    isValid = false;
  } else {
    // Check if email already exists
    const existingUser = AuthState.users.find(u => u.email === email);
    if (existingUser) {
      showError('signupEmailError', 'An account with this email already exists');
      isValid = false;
    } else {
      showError('signupEmailError', '');
    }
  }
  
  // Phone (simple validation)
  const phoneRegex = /^[\d\s\-+()]{10,}$/;
  if (!phone) {
    showError('phoneError', 'Phone number is required');
    isValid = false;
  } else if (!phoneRegex.test(phone)) {
    showError('phoneError', 'Please enter a valid phone number');
    isValid = false;
  } else {
    showError('phoneError', '');
  }
  
  // Date of Birth
  if (!dob) {
    showError('dobError', 'Date of birth is required');
    isValid = false;
  } else {
    const age = calculateAge(new Date(dob));
    if (age < 18) {
      showError('dobError', 'You must be at least 18 years old');
      isValid = false;
    } else {
      showError('dobError', '');
    }
  }
  
  // Gender
  if (!gender) {
    showError('genderError', 'Please select your gender');
    isValid = false;
  } else {
    showError('genderError', '');
  }
  
  if (DOM.step1Next) {
    DOM.step1Next.disabled = !isValid;
  }
  
  return isValid;
}

function validateStep2() {
  const insurance = DOM.insurance?.value.trim() || '';
  const emergencyName = DOM.emergencyName?.value.trim() || '';
  const emergencyPhone = DOM.emergencyPhone?.value.trim() || '';
  const address = DOM.address?.value.trim() || '';
  
  let isValid = true;
  
  if (!insurance) {
    showError('insuranceError', 'Insurance provider is required');
    isValid = false;
  } else {
    showError('insuranceError', '');
  }
  
  if (!emergencyName) {
    showError('emergencyNameError', 'Emergency contact name is required');
    isValid = false;
  } else {
    showError('emergencyNameError', '');
  }
  
  const phoneRegex = /^[\d\s\-+()]{10,}$/;
  if (!emergencyPhone) {
    showError('emergencyPhoneError', 'Emergency contact phone is required');
    isValid = false;
  } else if (!phoneRegex.test(emergencyPhone)) {
    showError('emergencyPhoneError', 'Please enter a valid phone number');
    isValid = false;
  } else {
    showError('emergencyPhoneError', '');
  }
  
  if (!address) {
    showError('addressError', 'Address is required');
    isValid = false;
  } else {
    showError('addressError', '');
  }
  
  if (DOM.step2Next) {
    DOM.step2Next.disabled = !isValid;
  }
  
  return isValid;
}

function validateStep4() {
  const password = DOM.password?.value || '';
  const confirm = DOM.confirmPassword?.value || '';
  const terms = DOM.termsCheckbox?.checked || false;
  const privacy = DOM.privacyCheckbox?.checked || false;
  
  let isValid = true;
  
  // Password strength is handled separately
  if (!password) {
    showError('passwordError', 'Password is required');
    isValid = false;
  } else if (password.length < 8) {
    showError('passwordError', 'Password must be at least 8 characters');
    isValid = false;
  } else {
    showError('passwordError', '');
  }
  
  if (!confirm) {
    showError('confirmPasswordError', 'Please confirm your password');
    isValid = false;
  } else if (password !== confirm) {
    showError('confirmPasswordError', 'Passwords do not match');
    isValid = false;
  } else {
    showError('confirmPasswordError', '');
  }
  
  if (!terms) {
    isValid = false;
  }
  
  if (!privacy) {
    isValid = false;
  }
  
  if (DOM.signupSubmit) {
    DOM.signupSubmit.disabled = !isValid;
  }
  
  return isValid;
}

function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = message;
  }
}

function calculateAge(birthDate) {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// ============================================================================
// PASSWORD STRENGTH INDICATOR
// ============================================================================
function updatePasswordStrength() {
  const password = DOM.password?.value || '';
  
  if (!password) {
    DOM.strengthBar.style.setProperty('--strength-width', '0%');
    DOM.strengthText.textContent = 'Enter password';
    return;
  }
  
  let strength = 0;
  let strengthColor = 'var(--error-500)';
  let strengthLabel = 'Weak';
  
  // Length check
  if (password.length >= 8) strength += 25;
  if (password.length >= 12) strength += 10;
  
  // Character variety
  if (/[a-z]/.test(password)) strength += 15;
  if (/[A-Z]/.test(password)) strength += 15;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 20;
  
  // Cap at 100
  strength = Math.min(strength, 100);
  
  // Determine label and color
  if (strength < 40) {
    strengthColor = 'var(--error-500)';
    strengthLabel = 'Weak';
  } else if (strength < 70) {
    strengthColor = 'var(--warning-500)';
    strengthLabel = 'Fair';
  } else if (strength < 90) {
    strengthColor = 'var(--info-500)';
    strengthLabel = 'Good';
  } else {
    strengthColor = 'var(--success-500)';
    strengthLabel = 'Strong';
  }
  
  DOM.strengthBar.style.setProperty('--strength-width', `${strength}%`);
  DOM.strengthBar.style.setProperty('--strength-color', strengthColor);
  DOM.strengthText.textContent = `Password strength: ${strengthLabel}`;
  DOM.strengthText.style.color = strengthColor;
}

// ============================================================================
// LOGIN HANDLER – VALIDATE AGAINST STORED USERS
// ============================================================================
async function handleLogin(e) {
  e.preventDefault();
  
  const emailOrId = DOM.loginEmail?.value.trim();
  const password = DOM.loginPassword?.value;
  
  // Clear previous errors
  if (DOM.loginGeneralError) DOM.loginGeneralError.textContent = '';
  if (DOM.loginErrorContainer) DOM.loginErrorContainer.style.display = 'none';
  
  // Simple validation
  if (!emailOrId || !password) {
    showLoginError('Please enter both email/ID and password');
    return;
  }
  
  // Show loading state
  const submitBtn = DOM.loginSubmit;
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoader = submitBtn.querySelector('.btn-loader');
  
  btnText.style.display = 'none';
  btnLoader.style.display = 'inline-block';
  submitBtn.disabled = true;
  
  console.log(`🔑 Login attempt: ${emailOrId}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Find user by email (or patient ID)
  const user = AuthState.users.find(u => 
    u.email === emailOrId || (u.patientId && u.patientId === emailOrId)
  );
  
  if (user && user.password === password) {
    // Successful login
    console.log(`✅ Login successful for: ${user.email}`);
    
    const sessionExpiry = new Date().getTime() + 15 * 60 * 1000; // 15 minutes
    
    // Remove password from stored user object for security
    const { password: pwd, ...safeUser } = user;
    
    localStorage.setItem('auth_isAuthenticated', 'true');
    localStorage.setItem('auth_sessionExpiry', sessionExpiry.toString());
    localStorage.setItem('auth_currentUser', JSON.stringify(safeUser));
    
    // Update last login
    user.lastLogin = new Date().toISOString();
    saveUsersToStorage();
    
    // Redirect to dashboard
    console.log('🔄 Redirecting to patient portal...');
    window.location.href = 'patient-portal.html';
  } else {
    // Failed login
    console.log(`❌ Login failed for: ${emailOrId}`);
    showLoginError('Invalid email/ID or password. Please try again.');
    
    // Reset button state
    btnText.style.display = 'inline';
    btnLoader.style.display = 'none';
    submitBtn.disabled = false;
  }
}

function showLoginError(message) {
  if (DOM.loginGeneralError) {
    DOM.loginGeneralError.textContent = message;
  }
  if (DOM.loginErrorContainer) {
    DOM.loginErrorContainer.style.display = 'block';
  }
}

// ============================================================================
// SIGNUP HANDLER – CREATE NEW USER
// ============================================================================
async function handleSignup() {
  console.log('📝 Signup process initiated');
  
  // Save final step data
  saveStep4Data();
  
  // Final validation
  if (!validateStep4()) {
    console.log('❌ Signup validation failed');
    return;
  }
  
  // Ensure all step data is saved
  const step1Data = AuthState.signupData.step1;
  const step2Data = AuthState.signupData.step2;
  const step3Data = AuthState.signupData.step3;
  const step4Data = AuthState.signupData.step4;
  
  // Check if we have all required data
  if (!step1Data.email || !step1Data.firstName || !step1Data.lastName) {
    console.log('❌ Missing step 1 data, returning to step 1');
    goToStep(1);
    return;
  }
  
  // Generate patient ID (simulated)
  const patientId = generatePatientId();
  
  // Collect all data
  const newUser = {
    patientId: patientId,
    firstName: step1Data.firstName,
    lastName: step1Data.lastName,
    fullName: `${step1Data.firstName} ${step1Data.lastName}`,
    email: step1Data.email,
    phone: step1Data.phone,
    dob: step1Data.dob,
    gender: step1Data.gender,
    insurance: step2Data.insurance,
    emergencyName: step2Data.emergencyName,
    emergencyPhone: step2Data.emergencyPhone,
    address: step2Data.address,
    photo: AuthState.signupData.step3?.photo || null,
    password: step4Data.password, // In production, hash this!
    createdAt: new Date().toISOString(),
    lastLogin: null
  };
  
  console.log('👤 New user data:', { 
    email: newUser.email, 
    patientId: newUser.patientId,
    name: newUser.fullName 
  });
  
  // Show loading state
  const submitBtn = DOM.signupSubmit;
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoader = submitBtn.querySelector('.btn-loader');
  
  btnText.style.display = 'none';
  btnLoader.style.display = 'inline-block';
  submitBtn.disabled = true;
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Add to users array
  AuthState.users.push(newUser);
  saveUsersToStorage();
  
  // Store email for modal
  if (DOM.userEmailDisplay) {
    DOM.userEmailDisplay.textContent = newUser.email;
  }
  
  // Show success modal
  showModal(DOM.successModal);
  
  // Reset button state
  btnText.style.display = 'inline';
  btnLoader.style.display = 'none';
  submitBtn.disabled = false;
  
  // Reset signup data for next user
  AuthState.signupData = { step1: {}, step2: {}, step3: {}, step4: {} };
  
  console.log('✅ Signup completed successfully');
}

function generatePatientId() {
  const prefix = 'MR';
  const random = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${random}`;
}

// ============================================================================
// PHOTO HANDLING – getUserMedia API
// ============================================================================
function handlePhotoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(event) {
    DOM.profileImage.src = event.target.result;
    DOM.removePhoto.style.display = 'flex';
    AuthState.signupData.step3 = AuthState.signupData.step3 || {};
    AuthState.signupData.step3.photo = event.target.result;
    console.log('📸 Photo uploaded');
  };
  reader.readAsDataURL(file);
}

async function handleTakePhoto() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    
    // Show camera container
    DOM.cameraContainer.style.display = 'block';
    DOM.cameraFeed.srcObject = stream;
    
    // Hide upload button area if needed
    DOM.uploadPhotoBtn.style.display = 'none';
    DOM.takePhotoBtn.style.display = 'none';
    
    console.log('📷 Camera activated');
    
  } catch (err) {
    console.error('Camera access denied:', err);
    DOM.cameraFallback.style.display = 'block';
  }
}

function capturePhoto() {
  const canvas = document.createElement('canvas');
  canvas.width = DOM.cameraFeed.videoWidth;
  canvas.height = DOM.cameraFeed.videoHeight;
  
  canvas.getContext('2d').drawImage(DOM.cameraFeed, 0, 0, canvas.width, canvas.height);
  
  const photoData = canvas.toDataURL('image/jpeg');
  DOM.profileImage.src = photoData;
  DOM.removePhoto.style.display = 'flex';
  AuthState.signupData.step3 = AuthState.signupData.step3 || {};
  AuthState.signupData.step3.photo = photoData;
  
  console.log('📸 Photo captured');
  stopCamera();
}

function stopCamera() {
  const stream = DOM.cameraFeed.srcObject;
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
  
  DOM.cameraContainer.style.display = 'none';
  DOM.uploadPhotoBtn.style.display = 'inline-flex';
  DOM.takePhotoBtn.style.display = 'inline-flex';
  DOM.cameraFallback.style.display = 'none';
}

function removePhoto() {
  DOM.profileImage.src = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80';
  DOM.removePhoto.style.display = 'none';
  AuthState.signupData.step3 = AuthState.signupData.step3 || {};
  AuthState.signupData.step3.photo = null;
  console.log('🗑️ Photo removed');
}

// ============================================================================
// PASSWORD VISIBILITY TOGGLE
// ============================================================================
function initPasswordToggles() {
  DOM.passwordToggles.forEach(toggle => {
    toggle.addEventListener('click', function() {
      const input = this.closest('.input-wrapper').querySelector('input');
      const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
      input.setAttribute('type', type);
      
      // Toggle icon
      const icon = this.querySelector('i');
      icon.classList.toggle('fa-eye');
      icon.classList.toggle('fa-eye-slash');
    });
  });
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================
function startSessionTimer() {
  if (AuthState.sessionTimer) {
    clearTimeout(AuthState.sessionTimer);
  }
  
  AuthState.sessionTimer = setTimeout(() => {
    showModal(DOM.sessionTimeoutModal);
  }, AuthState.sessionTimeout);
}

function resetSessionTimer() {
  startSessionTimer();
}

function logout() {
  clearAuthState();
  window.location.href = 'auth.html';
}

// ============================================================================
// MODAL CONTROLS
// ============================================================================
function showModal(modal) {
  if (modal) {
    modal.classList.add('show');
  }
}

function hideModal(modal) {
  if (modal) {
    modal.classList.remove('show');
  }
}

// ============================================================================
// DARK MODE
// ============================================================================
function toggleDarkMode() {
  AuthState.darkMode = !AuthState.darkMode;
  
  if (AuthState.darkMode) {
    document.documentElement.setAttribute('data-theme', 'dark');
    DOM.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    localStorage.setItem('authTheme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
    DOM.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    localStorage.setItem('authTheme', 'light');
  }
}

function checkSystemPreferences() {
  const savedTheme = localStorage.getItem('authTheme');
  
  if (savedTheme === 'dark') {
    AuthState.darkMode = true;
    document.documentElement.setAttribute('data-theme', 'dark');
    if (DOM.themeToggle) DOM.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  } else if (savedTheme === 'light') {
    AuthState.darkMode = false;
    document.documentElement.removeAttribute('data-theme');
    if (DOM.themeToggle) DOM.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      AuthState.darkMode = true;
      document.documentElement.setAttribute('data-theme', 'dark');
      if (DOM.themeToggle) DOM.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
  }
}

// ============================================================================
// FORM VALIDATION INIT
// ============================================================================
function initFormValidation() {
  // Set default date to 30 years ago (minimum age)
  if (DOM.dob) {
    const today = new Date();
    const minDate = new Date(today.setFullYear(today.getFullYear() - 18));
    const yyyy = minDate.getFullYear();
    const mm = String(minDate.getMonth() + 1).padStart(2, '0');
    const dd = String(minDate.getDate()).padStart(2, '0');
    DOM.dob.max = `${yyyy}-${mm}-${dd}`;
  }
  
  // Initial validation
  validateStep1();
  validateStep2();
  validateStep4();
}

// ============================================================================
// EXPOSE TO GLOBAL SCOPE (for dashboard integration)
// ============================================================================
window.Auth = {
  logout: logout,
  checkAuth: () => localStorage.getItem('auth_isAuthenticated') === 'true',
  getCurrentUser: () => {
    const user = localStorage.getItem('auth_currentUser');
    return user ? JSON.parse(user) : null;
  }
};

console.log('🔐 Auth Gateway: Enterprise authentication ready');