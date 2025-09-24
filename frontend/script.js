const loginNav = document.getElementById('loginNav');
const modal = document.getElementById('loginModal');
const closeBtn = document.getElementById('closeModal');
const loginForm = document.getElementById('loginForm');
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const forgotModal = document.getElementById('forgotModal');
const forgotForm = document.getElementById('forgotForm');
const forgotClose = document.getElementById('forgotClose');
const otpModal = document.getElementById('otpModal');
const otpForm = document.getElementById('otpForm');
const otpClose = document.getElementById('otpClose');
const resendOtp = document.getElementById('resendOtp');
const otpGoBack = document.getElementById('otpGoBack');
const resetModal = document.getElementById('resetModal');
const resetForm = document.getElementById('resetForm');
const resetClose = document.getElementById('resetClose');

let userEmail = '';

// Show the login modal
loginNav.onclick = function(e) {
  e.preventDefault();
  modal.style.display = "flex";
};

// Close the login modal
closeBtn.onclick = function() {
  modal.style.display = "none";
};

// Close modals by clicking outside them
window.onclick = function(event) {
  if (event.target === modal) modal.style.display = "none";
  if (event.target === forgotModal) forgotModal.style.display = "none";
  if (event.target === otpModal) otpModal.style.display = "none";
  if (event.target === resetModal) resetModal.style.display = "none";
};

// Login form handler
loginForm.onsubmit = function(e) {
  e.preventDefault();
  const employee_id = document.getElementById('employee_id').value;
  const password = document.getElementById('password').value;
  fetch('http://localhost:5000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employee_id, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.message) {
      alert(data.message); // Login successful!
      modal.style.display = "none";
    } else {
      alert(data.error);   // Show error
    }
  });
};

// Password show/hide toggle
togglePassword.onclick = function () {
  const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
  passwordInput.setAttribute('type', type);
};

// ===== FORGOT PASSWORD FLOW =====

// Show forgot password modal
document.querySelector('.forgot').onclick = function(e) {
  e.preventDefault();
  forgotModal.style.display = 'flex';
  otpModal.style.display = 'none';
  resetModal.style.display = 'none';
};

// Close forgot password modal
forgotClose.onclick = () => forgotModal.style.display = 'none';

// Handle "Send OTP"
forgotForm.onsubmit = function(e) {
  e.preventDefault();
  userEmail = document.getElementById('forgotEmail').value;
  fetch('http://localhost:5000/api/request-reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: userEmail })
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message || data.error);
    if (data.message) {
      forgotModal.style.display = 'none';
      otpModal.style.display = 'flex';
    }
  });
};

// ===== OTP FLOW =====

// Close OTP modal
otpClose.onclick = () => otpModal.style.display = 'none';

// Go back to forgotModal
otpGoBack.onclick = function(e) {
  e.preventDefault();
  otpModal.style.display = 'none';
  forgotModal.style.display = 'flex';
};

// Resend OTP
resendOtp.onclick = function(e) {
  e.preventDefault();
  forgotForm.onsubmit(new Event('submit'));
};

// Handle OTP confirm
otpForm.onsubmit = function(e) {
  e.preventDefault();
  const otp = document.getElementById('otpInput').value;
  fetch('http://localhost:5000/api/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: userEmail, otp })
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message || data.error);
    if (data.message === "Valid OTP") {
      otpModal.style.display = 'none';
      resetModal.style.display = 'flex';
    }
  });
};

// ===== RESET PASSWORD FLOW =====

// Close reset modal
resetClose.onclick = () => resetModal.style.display = 'none';

// Handle reset form
resetForm.onsubmit = function(e) {
  e.preventDefault();
  const newPassword = document.getElementById('newPassword').value;
  fetch('http://localhost:5000/api/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: userEmail, newPassword })
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message || data.error);
    if (data.message === "Password updated.") {
      resetModal.style.display = 'none';
    }
  });
  // ... Login logic ...

// Registration form handler (NOT inside resetForm.onsubmit!)
// Place this at the top level of your script.jsdocument.getElementById('registerForm').onsubmit = function(e){
  e.preventDefault();
  let form = e.target;
  let scheme = form.scheme.value;

  fetch('/api/register-member', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      name: form.name.value,
      mobile: form.mobile.value,
      scheme: scheme,
      register_date: form.date.value
    })
  })
  .then(res => res.json())
  .then(data => { 
    // Optional: show user card/modal, add to member table, etc.
    alert("Registration successful for " + data.name + " (" + data.member_id + ")");
  });

};
