/* ---------------------- SLIDER LOGIC ---------------------- */
let slides = document.querySelectorAll('.slide');
let index = 0;

setInterval(() => {
  slides[index].classList.remove('active');
  index = (index + 1) % slides.length;
  slides[index].classList.add('active');
}, 6000); 


/* ---------------------- PASSWORD TOGGLE LOGIC ---------------------- */
document.querySelectorAll('.password-toggle').forEach(toggle => {
    toggle.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const passwordInput = document.getElementById(targetId);

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            this.classList.remove('fa-eye-slash');
            this.classList.add('fa-eye');
        } else {
            passwordInput.type = 'password';
            this.classList.remove('fa-eye');
            this.classList.add('fa-eye-slash');
        }
    });
});

/* ---------------------- FORM VALIDATION & MATCHING LOGIC ---------------------- */
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const signupButton = document.querySelector('.signup-btn');
// Note: We are excluding the 'MI' field from required validation
const allRequiredInputs = document.querySelectorAll('.form-wrapper input:not(#mi)'); 

/**
 * Updates the visual state of an input field (success/error).
 * @param {HTMLElement} element - The input element.
 * @param {string} message - The error message to display.
 * @param {boolean} isSuccess - True for success, false for error.
 */
function setValidationState(element, message, isSuccess) {
    // Find the closest parent .input-group
    const inputGroup = element.closest('.input-group');
    // Find the specific error message div associated with this input
    const errorMessage = inputGroup.querySelector('.error-message');

    // Skip elements that don't have an error message container (like MI)
    if (!errorMessage) return; 

    inputGroup.classList.remove('success', 'error');
    
    if (isSuccess) {
        inputGroup.classList.add('success');
        errorMessage.textContent = '';
    } else {
        inputGroup.classList.add('error');
        errorMessage.textContent = message;
    }
}

/**
 * Checks if password and confirm password fields match and meet basic length criteria.
 */
function checkPasswordsMatch() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const passValid = password.length >= 8; // Example: Minimum length check

    // Only run visual check if both fields have content
    if (password.length > 0 && confirmPassword.length > 0) {
        if (password === confirmPassword && passValid) {
            setValidationState(passwordInput, '', true);
            setValidationState(confirmPasswordInput, '', true);
            return true;
        } else {
            // Determine the specific error message
            const msg = password === confirmPassword ? 'Password must be at least 8 characters.' : 'Passwords must match.';
            setValidationState(passwordInput, msg, false);
            setValidationState(confirmPasswordInput, 'Passwords must match.', false);
            return false;
        }
    }
    // If one is empty, clear success/error state but return false for submission
    if (password.length === 0 || confirmPassword.length === 0) {
        passwordInput.closest('.input-group').classList.remove('success', 'error');
        confirmPasswordInput.closest('.input-group').classList.remove('success', 'error');
        document.getElementById('password-error').textContent = '';
        document.getElementById('confirm-password-error').textContent = '';
    }
    return false;
}

// --- Event Listeners for Live Password Validation ---
passwordInput.addEventListener('input', checkPasswordsMatch);
confirmPasswordInput.addEventListener('input', checkPasswordsMatch);

// --- Submission Logic ---
signupButton.addEventListener('click', function(e) {
    e.preventDefault(); // Prevent page reload
    
    let formIsValid = true;

    // 1. Check all required fields for emptiness
    allRequiredInputs.forEach(input => {
        // If the field is for password, skip initial empty check and rely on checkPasswordsMatch for length/match
        if (input.id === 'password' || input.id === 'confirm-password') return;
        
        if (input.value.trim() === '') {
            const labelText = input.previousElementSibling.textContent;
            setValidationState(input, `${labelText} is required.`, false);
            formIsValid = false;
        } else {
           setValidationState(input, '', true); // Mark as success if not empty
        }
    });

    // 2. Check password match and length
    const passwordsMatch = checkPasswordsMatch();
    if (!passwordsMatch) {
        formIsValid = false;
        // Ensure password fields show appropriate error message if invalid
        if (passwordInput.value.trim() === '') {
           setValidationState(passwordInput, 'Password is required.', false);
        }
         if (confirmPasswordInput.value.trim() === '') {
           setValidationState(confirmPasswordInput, 'Confirmation is required.', false);
        }
    }

    // 3. Final Form Submission
    if (formIsValid && passwordsMatch) {
        // Replace this alert with actual form submission logic (e.g., AJAX or form.submit())
        alert('Account created successfully! Proceeding to backend submission...');
        // document.getElementById('your-form-id').submit();
    }
});