document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('signupForm');
    const steps = document.querySelectorAll('.form-step');
    const nextButtons = document.querySelectorAll('.next-btn');
    const prevButtons = document.querySelectorAll('.prev-btn');
    const roleRadios = document.querySelectorAll('input[name="role"]');
    const researchFields = document.querySelectorAll('.research-fields');
    const formStatus = document.getElementById('formStatus');
    const passwordToggles = document.querySelectorAll('.toggle-password-visibility');
    
    // Name fields validation (text only)
    const nameInputs = document.querySelectorAll('input[type="text"][id*="name"], input[type="text"][id="firstName"], input[type="text"][id="lastName"], input[type="text"][id="fullName"]');
    nameInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            // Only allow letters, spaces, hyphens, and apostrophes
            const value = this.value;
            const sanitizedValue = value.replace(/[^a-zA-Z\s\-']/g, '');
            
            if (value !== sanitizedValue) {
                this.value = sanitizedValue;
                showError(this, 'Only letters, spaces, hyphens and apostrophes are allowed');
            } else {
                clearError(this);
            }
        });
    });
    
    // South African phone number validation (+27 or starting with 06, 07, or 08)
    const phoneInputs = document.querySelectorAll('input[type="tel"], input[id*="phone"], input[id*="contact"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = this.value.replace(/\s+/g, ''); // Remove all spaces
            
            // Allow only digits, '+', and the first character
            const sanitizedValue = value.replace(/[^\d+]/g, '');
            this.value = sanitizedValue;
            
            // Check for valid South African format
            const isValid = validateSouthAfricanPhone(sanitizedValue);
            
            if (!isValid.valid) {
                showError(this, isValid.message);
            } else {
                clearError(this);
            }
        });
        
        // Also validate on blur to ensure complete number
        input.addEventListener('blur', function() {
            const value = this.value.trim();
            const isValid = validateSouthAfricanPhone(value);
            
            if (!isValid.valid) {
                showError(this, isValid.message);
            } else {
                // Format the number nicely
                if (value.startsWith('+27')) {
                    this.value = value; // Keep as is with +27 format
                } else if (value.startsWith('0')) {
                    // Keep as is with 0 format
                    this.value = value;
                }
                clearError(this);
            }
        });
    });
    
    function validateSouthAfricanPhone(phone) {
        // Empty is not valid but will be caught by required attribute
        if (!phone) return { valid: true, message: '' };
        
        // Check for +27 format
        if (phone.startsWith('+27')) {
            // +27 should be followed by 9 digits
            if (phone.length !== 12) {
                return { valid: false, message: 'Phone number must be +27 followed by 9 digits' };
            }
            
            // Check if the digit after +27 is 6, 7 or 8
            const thirdDigit = phone.charAt(3);
            if (!['6', '7', '8'].includes(thirdDigit)) {
                return { valid: false, message: 'After +27, number must start with 6, 7, or 8' };
            }
            
            return { valid: true, message: '' };
        } 
        // Check for 0 format (must be 10 digits starting with 06, 07, or 08)
        else if (phone.startsWith('0')) {
            if (phone.length !== 10) {
                return { valid: false, message: 'Phone number must be 10 digits' };
            }
            
            // Check if starts with 06, 07 or 08
            const secondDigit = phone.charAt(1);
            if (!['6', '7', '8'].includes(secondDigit)) {
                return { valid: false, message: 'Number must start with 06, 07, or 08' };
            }
            
            return { valid: true, message: '' };
        } 
        else {
            return { valid: false, message: 'Must start with +27 or 0' };
        }
    }
    
    // Wits University student email validation
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            const value = this.value.trim();
            validateWitsEmail(this, value);
        });
        
        emailInput.addEventListener('blur', function() {
            const value = this.value.trim();
            validateWitsEmail(this, value);
        });
    }
    
    function validateWitsEmail(input, email) {
        if (!email) return; // Empty will be caught by required attribute
        
        // Must match pattern: digits@students.wits.ac.za
        const witsEmailRegex = /^(\d+)@students\.wits\.ac\.za$/;
        
        if (!witsEmailRegex.test(email)) {
            showError(input, 'Email must be in format: studentnumber@students.wits.ac.za');
            return false;
        } else {
            clearError(input);
            return true;
        }
    }
    
    // Override the isValidEmail function to use our Wits validation
    function isValidEmail(email) {
        const witsEmailRegex = /^(\d+)@students\.wits\.ac\.za$/;
        return witsEmailRegex.test(email);
    }
    
    // Password visibility toggle
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });
    form.addEventListener('continue', async function(e){
        const fullName = document.getElementById('name').value.trim();
        const cellNumber = document.getElementById('phone').value.trim();
        const nameIsValid = /^[A-Za-z\s]+$/.test(fullName);
        const cellIsValid = /^\d{9}$/.test(cellNumber);
        
        if(!nameIsValid){
            e.preventDefault();
            alert("Please enter a valid name using letters only.");
            return;
        }
        if(!cellIsValid){
            e.preventDefault();
            alert("Please enter a valid 9-digit South African cellphone number.");
            return;
        }
        const fullNumber = "+27" + cellNumber;


    });
    // Password validation
    const password = document.getElementById('password');
    const lengthReq = document.getElementById('length');
    const uppercaseReq = document.getElementById('uppercase');
    const lowercaseReq = document.getElementById('lowercase');
    const numberReq = document.getElementById('number');
    const specialReq = document.getElementById('special');
    
    if (password) {
        password.addEventListener('input', function() {
            const value = this.value;
            
            // Length check
            if (value.length >= 8) {
                lengthReq.classList.add('valid');
            } else {
                lengthReq.classList.remove('valid');
            }
            
            // Uppercase check
            if (/[A-Z]/.test(value)) {
                uppercaseReq.classList.add('valid');
            } else {
                uppercaseReq.classList.remove('valid');
            }
            
            // Lowercase check
            if (/[a-z]/.test(value)) {
                lowercaseReq.classList.add('valid');
            } else {
                lowercaseReq.classList.remove('valid');
            }
            
            // Number check
            if (/\d/.test(value)) {
                numberReq.classList.add('valid');
            } else {
                numberReq.classList.remove('valid');
            }
            
            // Special character check
            if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
                specialReq.classList.add('valid');
            } else {
                specialReq.classList.remove('valid');
            }
        });
    }
    
    // Show/hide research fields based on selected role
    if (roleRadios && roleRadios.length > 0) {
        roleRadios.forEach(radio => {
            radio.addEventListener('change', updateResearchFields);
        });
        
        function updateResearchFields() {
            const selectedRole = document.querySelector('input[name="role"]:checked')?.value;
            if (!selectedRole) return;
            
            researchFields.forEach(field => {
                const roles = field.dataset.role.split(' ');
                if (roles.includes(selectedRole)) {
                    field.style.display = 'block';
                    const inputs = field.querySelectorAll('input, textarea, select');
                    inputs.forEach(input => input.required = true);
                } else {
                    field.style.display = 'none';
                    const inputs = field.querySelectorAll('input, textarea, select');
                    inputs.forEach(input => {
                        input.required = false;
                    });
                }
            });
        }
        
        // Initialize research fields visibility
        updateResearchFields();
    }
    
    // Email duplicate check
    let emailCheckTimeout;
    let emailCheckInProgress = false;
    let lastCheckedEmail = '';
    
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            const email = this.value.trim();
            if (email && isValidEmail(email) && email !== lastCheckedEmail) {
                checkEmailExists(email);
            }
        });
        
        // Also add a check on input with debounce to prevent too many requests
        emailInput.addEventListener('input', function() {
            clearTimeout(emailCheckTimeout);
            const email = this.value.trim();
            
            if (email && isValidEmail(email)) {
                emailCheckTimeout = setTimeout(() => {
                    if (email !== lastCheckedEmail && !emailCheckInProgress) {
                        checkEmailExists(email);
                    }
                }, 500);
            }
        });
    }
    
    function checkEmailExists(email) {
        emailCheckInProgress = true;
        lastCheckedEmail = email;
        
        fetch(`/api/check-email?email=${encodeURIComponent(email)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.exists) {
                showError(emailInput, 'This email is already registered. Please use a different email or login with your existing account.');
            } else {
                clearError(emailInput);
            }
        })
        .catch(error => {
            console.error('Email check error:', error);
        })
        .finally(() => {
            emailCheckInProgress = false;
        });
    }
    
    // Form step navigation
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get current step
            const currentStep = this.closest('.form-step');
            const currentStepIndex = Array.from(steps).indexOf(currentStep);
            
            // Basic validation for current step
            const inputs = currentStep.querySelectorAll('input[required], select[required], textarea[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    showError(input, 'This field is required');
                } else {
                    // Additional validation for specific field types
                    if (input.id === 'email') {
                        if (!validateWitsEmail(input, input.value.trim())) {
                            isValid = false;
                        }
                    } else if (input.type === 'tel' || input.id.includes('phone') || input.id.includes('contact')) {
                        const phoneValid = validateSouthAfricanPhone(input.value.trim());
                        if (!phoneValid.valid) {
                            showError(input, phoneValid.message);
                            isValid = false;
                        }
                    } else {
                        clearError(input);
                    }
                }
            });
            
            // If email field exists in current step, validate email format and check for duplicates
            const emailInput = currentStep.querySelector('#email');
            if (emailInput && emailInput.value) {
                if (!validateWitsEmail(emailInput, emailInput.value.trim())) {
                    isValid = false;
                } else {
                    // Check for duplicate email before proceeding
                    const emailError = emailInput.nextElementSibling;
                    if (emailError && 
                        emailError.classList.contains('error-message') && 
                        emailError.style.display !== 'none' &&
                        emailError.textContent.includes('already registered')) {
                        isValid = false;
                    } else {
                        // If we haven't already checked this email, do it now
                        if (emailInput.value.trim() !== lastCheckedEmail) {
                            // We need to check the email synchronously before proceeding
                            isValid = false; // Temporarily set to false, will be reset if email check passes
                            
                            // Indicate checking is in progress
                            const loadingMsg = document.createElement('section');
                            loadingMsg.className = 'checking-email';
                            loadingMsg.textContent = 'Checking email...';
                            
                            const existingMsg = emailInput.nextElementSibling;
                            if (existingMsg && existingMsg.classList.contains('error-message')) {
                                existingMsg.style.display = 'none';
                                emailInput.parentNode.insertBefore(loadingMsg, existingMsg);
                            } else {
                                emailInput.parentNode.appendChild(loadingMsg);
                            }
                            
                            // Force immediate email check and wait for result
                            fetch(`/api/check-email?email=${encodeURIComponent(emailInput.value.trim())}`, {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json',
                                }
                            })
                            .then(response => response.json())
                            .then(data => {
                                // Remove loading message
                                if (loadingMsg.parentNode) {
                                    loadingMsg.parentNode.removeChild(loadingMsg);
                                }
                                
                                if (data.exists) {
                                    showError(emailInput, 'This email is already registered. Please use a different email or login with your existing account.');
                                } else {
                                    clearError(emailInput);
                                    lastCheckedEmail = emailInput.value.trim();
                                    
                                    // Now that we've confirmed email is valid, proceed to next step
                                    proceedToNextStep(currentStep, currentStepIndex);
                                }
                            })
                            .catch(error => {
                                // Remove loading message
                                if (loadingMsg.parentNode) {
                                    loadingMsg.parentNode.removeChild(loadingMsg);
                                }
                                
                                console.error('Email check error:', error);
                                showError(emailInput, 'Could not verify email. Please try again.');
                            });
                            
                            return; // Important! Exit here so we wait for the async check
                        }
                    }
                }
            }
            
            // If password and confirm password fields exist, check if they match
            const passwordInput = currentStep.querySelector('#password');
            const confirmPasswordInput = currentStep.querySelector('#confirmPassword');
            if (passwordInput && confirmPasswordInput && passwordInput.value && confirmPasswordInput.value) {
                if (passwordInput.value !== confirmPasswordInput.value) {
                    isValid = false;
                    showError(confirmPasswordInput, 'Passwords do not match');
                }
            }
            
            if (!isValid) {
                return;
            }
            
            // Proceed to next step if all validation passes
            proceedToNextStep(currentStep, currentStepIndex);
        });
    });
    
    function proceedToNextStep(currentStep, currentStepIndex) {
        // Hide current step
        currentStep.classList.remove('active');
        
        // Show next step
        const nextStep = steps[currentStepIndex + 1];
        nextStep.classList.add('active');
        
        // Scroll to top
        window.scrollTo(0, 0);
    }
    
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get current step
            const currentStep = this.closest('.form-step');
            const currentStepIndex = Array.from(steps).indexOf(currentStep);
            
            // Hide current step
            currentStep.classList.remove('active');
            
            // Show previous step
            const prevStep = steps[currentStepIndex - 1];
            prevStep.classList.add('active');
            
            // Scroll to top
            window.scrollTo(0, 0);
        });
    });
    
    // Form submission
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Final validation
            const activeStep = document.querySelector('.form-step.active');
            const inputs = activeStep.querySelectorAll('input[required], select[required], textarea[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    showError(input, 'This field is required');
                } else {
                    // Additional validation for specific field types
                    if (input.id === 'email') {
                        if (!validateWitsEmail(input, input.value.trim())) {
                            isValid = false;
                        }
                    } else if (input.type === 'tel' || input.id.includes('phone') || input.id.includes('contact')) {
                        const phoneValid = validateSouthAfricanPhone(input.value.trim());
                        if (!phoneValid.valid) {
                            showError(input, phoneValid.message);
                            isValid = false;
                        }
                    } else {
                        clearError(input);
                    }
                }
            });
            
            // Check if terms are agreed
            const termsAgree = document.getElementById('termsAgree');
            if (termsAgree && !termsAgree.checked) {
                isValid = false;
                showError(termsAgree, 'You must agree to the terms and conditions');
            } else if (termsAgree) {
                clearError(termsAgree);
            }
            
            // Final email validation and duplication check
            const emailInput = document.getElementById('email');
            if (emailInput) {
                // Validate email format first
                if (!validateWitsEmail(emailInput, emailInput.value.trim())) {
                    isValid = false;
                }
                
                const emailError = document.querySelector(`output[for="email"]`) || emailInput.nextElementSibling;
                if (emailError && 
                    emailError.classList.contains('error-message') && 
                    emailError.style.display !== 'none' &&
                    emailError.textContent.includes('already registered')) {
                    isValid = false;
                }
                
                // If we haven't checked this email yet, check it now
                if (emailInput.value.trim() !== lastCheckedEmail && isValid) {
                    // We'll need to submit the form after the check if everything else is valid
                    checkEmailBeforeSubmit();
                    return;
                }
            }
            
            // Final validation for all phone fields in the form
            const allPhoneInputs = form.querySelectorAll('input[type="tel"], input[id*="phone"], input[id*="contact"]');
            allPhoneInputs.forEach(input => {
                if (input.value.trim()) {
                    const phoneValid = validateSouthAfricanPhone(input.value.trim());
                    if (!phoneValid.valid) {
                        showError(input, phoneValid.message);
                        isValid = false;
                    }
                }
            });
            
            // Final validation for all name fields in the form
            const allNameInputs = form.querySelectorAll('input[type="text"][id*="name"], input[type="text"][id="firstName"], input[type="text"][id="lastName"], input[type="text"][id="fullName"]');
            allNameInputs.forEach(input => {
                if (input.value.trim()) {
                    if (/[^a-zA-Z\s\-']/.test(input.value)) {
                        showError(input, 'Only letters, spaces, hyphens and apostrophes are allowed');
                        isValid = false;
                    }
                }
            });
            
            if (!isValid) {
                // If there are validation errors, focus the first field with an error
                const firstError = document.querySelector('.error');
                if (firstError) {
                    // Find the form step containing the error
                    const errorStep = firstError.closest('.form-step');
                    if (errorStep && !errorStep.classList.contains('active')) {
                        // Switch to that step first
                        const activeStep = document.querySelector('.form-step.active');
                        activeStep.classList.remove('active');
                        errorStep.classList.add('active');
                    }
                    
                    // Focus the field with error
                    if (firstError.tagName !== 'INPUT' && firstError.tagName !== 'SELECT' && firstError.tagName !== 'TEXTAREA') {
                        const inputInError = firstError.querySelector('input, select, textarea');
                        if (inputInError) {
                            inputInError.focus();
                        }
                    } else {
                        firstError.focus();
                    }
                }
                return;
            }
            
            // Submit the form now
            submitForm();
        });
    }
    
    function checkEmailBeforeSubmit() {
        const emailInput = document.getElementById('email');
        if (!emailInput) return;
        
        const email = emailInput.value.trim();
        
        // Show loading state
        const submitButton = document.querySelector('.submit-btn');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.classList.add('loading');
            submitButton.textContent = 'Checking...'; 
        }
        
        fetch(`/api/check-email?email=${encodeURIComponent(email)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.exists) {
                showError(emailInput, 'This email is already registered. Please use a different email or login with your existing account.');
                
                // Navigate to the step containing the email field
                const emailStep = emailInput.closest('.form-step');
                if (emailStep && !emailStep.classList.contains('active')) {
                    const activeStep = document.querySelector('.form-step.active');
                    activeStep.classList.remove('active');
                    emailStep.classList.add('active');
                }
                
                // Focus the email field
                emailInput.focus();
            } else {
                clearError(emailInput);
                lastCheckedEmail = email;
                
                // Now that we've confirmed email is unique, proceed with form submission
                submitForm();
            }
        })
        .catch(error => {
            console.error('Email check error:', error);
            showError(emailInput, 'Could not verify email. Please try again.');
            
            // Navigate to the step containing the email field
            const emailStep = emailInput.closest('.form-step');
            if (emailStep && !emailStep.classList.contains('active')) {
                const activeStep = document.querySelector('.form-step.active');
                activeStep.classList.remove('active');
                emailStep.classList.add('active');
            }
        })
        .finally(() => {
            // Reset button state
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.classList.remove('loading');
                submitButton.textContent = 'Submit'; // Or whatever the original text was
            }
        });
    }
    
    function submitForm() {
        // Show loading state
        const submitButton = document.querySelector('.submit-btn');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.classList.add('loading');
        }
        
        // Clear any previous status messages
        if (formStatus) {
            formStatus.textContent = '';
            formStatus.className = 'form-status-message';
            formStatus.style.display = 'none';
        }
        
        // Collect form data from ALL steps
        const formData = new FormData(form);
        const formDataObj = {};
        formData.forEach((value, key) => {
            formDataObj[key] = value;
        });
        
        // Add all form fields explicitly to ensure they're included
        const department = document.getElementById('department');
        const academicRole = document.getElementById('academicRole');
        if (department) {
            formDataObj.department = department.value;
        }
        if (academicRole) {
            formDataObj.academicRole = academicRole.value;
        }
        
        // Log form data for debugging
        console.log("Form data being sent:", formDataObj);
        
        // Use fetch to send the data to the server
        fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formDataObj),
        })
        .then(response => response.json())
        .then(data => {
            if (data.message && data.user) {
                // Success
                if (formStatus) {
                    formStatus.textContent = data.message;
                    formStatus.className = 'form-status-message success';
                    formStatus.style.display = 'block';
                }
                
                // Clear form
                form.reset();
                
                // Redirect to login page after a delay
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else if (data.errors) {
                // Validation errors
                Object.keys(data.errors).forEach(key => {
                    const input = document.getElementById(key);
                    if (input) {
                        showError(input, data.errors[key]);
                        
                        // If this is the email field and it's a duplicate, update lastCheckedEmail
                        if (key === 'email' && data.errors[key].includes('already registered')) {
                            lastCheckedEmail = input.value.trim();
                        }
                    }
                });
                
                if (formStatus) {
                    formStatus.textContent = data.message || 'Please correct the errors above.';
                    formStatus.className = 'form-status-message error';
                    formStatus.style.display = 'block';
                }
                
                // If there's an error with email, navigate to that step
                if (data.errors.email) {
                    const emailInput = document.getElementById('email');
                    if (emailInput) {
                        const emailStep = emailInput.closest('.form-step');
                        if (emailStep && !emailStep.classList.contains('active')) {
                            const activeStep = document.querySelector('.form-step.active');
                            activeStep.classList.remove('active');
                            emailStep.classList.add('active');
                        }
                    }
                }
            } else if (data.message) {
                // Other error, including duplicate email
                if (formStatus) {
                    formStatus.textContent = data.message;
                    formStatus.className = 'form-status-message error';
                    formStatus.style.display = 'block';
                }
                
                // If this is a duplicate email error, highlight the email field
                if (data.message.toLowerCase().includes('email') && 
                    (data.message.toLowerCase().includes('already registered') || 
                     data.message.toLowerCase().includes('already exists'))) {
                    const emailInput = document.getElementById('email');
                    if (emailInput) {
                        showError(emailInput, data.message);
                        lastCheckedEmail = emailInput.value.trim();
                        
                        // Navigate to the step containing the email field
                        const emailStep = emailInput.closest('.form-step');
                        if (emailStep && !emailStep.classList.contains('active')) {
                            const activeStep = document.querySelector('.form-step.active');
                            activeStep.classList.remove('active');
                            emailStep.classList.add('active');
                        }
                    }
                }
            }
        })
        .catch(error => {
            console.error('Signup error:', error);
            if (formStatus) {
                formStatus.textContent = 'An error occurred during signup. Please try again later.';
                formStatus.className = 'form-status-message error';
                formStatus.style.display = 'block';
            }
        })
        .finally(() => {
            // Reset button state
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.classList.remove('loading');
            }
        });
    }
    
    // Helper functions
    function showError(input, message) {
        const errorElement = document.querySelector(`output[for="${input.id}"]`) || input.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        input.classList.add('error');
        
        const formGroup = input.closest('.form-group');
        if (formGroup) {
            formGroup.classList.add('validated', 'error');
            formGroup.classList.remove('valid');
        }
    }
    
    function clearError(input) {
        const errorElement = document.querySelector(`output[for="${input.id}"]`) || input.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        input.classList.remove('error');
        input.classList.add('valid');
        
        const formGroup = input.closest('.form-group');
        if (formGroup) {
            formGroup.classList.add('validated', 'valid');
            formGroup.classList.remove('error');
        }
    }
});