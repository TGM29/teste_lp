document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#email-form');
    const emailInput = document.querySelector('#email-input');
    const googleAuthButton = document.querySelector('#google-auth-button');
    
    // Debugging helper
    function debug(message) {
        console.log(`[DEBUG] ${message}`);
    }
    
    debug('DOM loaded, setting up authentication');
    
    // Check that Google button exists and Clerk is loaded
    debug(`Google button found: ${googleAuthButton !== null}`);
    debug(`Clerk is available: ${typeof window.Clerk !== 'undefined'}`);
    debug(`Config is available: ${typeof window.clerkConfig !== 'undefined'}`);
    
    // Handle Google authentication button click
    if (googleAuthButton) {
        debug('Setting up Google auth button click handler');
        googleAuthButton.addEventListener('click', (e) => {
            debug('Google auth button clicked');
            e.preventDefault();
            handleGoogleAuth();
        });
    }
    
    function handleGoogleAuth() {
        debug('Handling Google auth with Clerk');
        try {
            if (!window.Clerk) {
                debug('Clerk is not available. Make sure it is properly loaded.');
                alert('Erro de inicialização. Por favor, recarregue a página.');
                return;
            }
            
            debug('Opening Clerk sign-in with Google');
            // Use Clerk's OAuth with Google
            window.Clerk.openSignIn({
                appearance: {
                    elements: {
                        rootBox: {
                            boxShadow: 'none',
                            width: '100%',
                        }
                    }
                },
                signInUrl: window.clerkConfig.redirectUrl,
                afterSignInUrl: window.clerkConfig.redirectUrl,
                initialValues: {
                    strategy: 'oauth_google'
                }
            });
        } catch (error) {
            console.error('Error with Clerk authentication:', error);
            alert('Erro ao autenticar com Google. Por favor, tente novamente.');
        }
    }
    
    // Email validation function
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Check for a common typo in email domains
    function hasCommonTypo(email) {
        const commonTypos = [
            'gmial.com', 'gmil.com', 'gmal.com', 'gmai.com', 'gmail.co', 
            'hotmai.com', 'hotmial.com', 'hotmal.com', 'hotmil.com', 'hotmail.co',
            'outloo.com', 'outlok.com', 'outlook.co',
            'yahoocom', 'yaho.com', 'yahoo.co'
        ];
        
        const domain = email.split('@')[1];
        return commonTypos.includes(domain);
    }
    
    // Function to suggest correction for common typos
    function suggestCorrection(email) {
        const [username, domain] = email.split('@');
        
        if (domain.startsWith('gm')) return `${username}@gmail.com`;
        if (domain.startsWith('hotm')) return `${username}@hotmail.com`;
        if (domain.startsWith('outl')) return `${username}@outlook.com`;
        if (domain.startsWith('yah')) return `${username}@yahoo.com`;
        
        return null;
    }
    
    // Show error message
    function showError(message) {
        // Remove any existing error message
        const existingError = form.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add error class to input
        emailInput.classList.add('error');
        
        // Create and append error message
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        form.appendChild(errorElement);
    }
    
    // Clear error
    function clearError() {
        emailInput.classList.remove('error');
        const existingError = form.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }
    
    // Handle input event to clear error when user types
    emailInput.addEventListener('input', () => {
        clearError();
    });
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = emailInput.value.trim();
            
            if (!email) {
                showError('Por favor, insira seu e-mail.');
                return;
            }
            
            if (!isValidEmail(email)) {
                showError('Por favor, insira um e-mail válido.');
                return;
            }
            
            if (hasCommonTypo(email)) {
                const suggestion = suggestCorrection(email);
                if (suggestion) {
                    showError(`Você quis dizer ${suggestion}?`);
                    return;
                }
            }
            
            // Submit the form - in a real implementation, you would send this to your server
            alert(`Obrigado por se inscrever com: ${email}`);
            emailInput.value = '';
        });
    }
}); 