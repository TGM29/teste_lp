document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#email-form');
    const emailInput = document.querySelector('#email-input');
    const googleAuthButton = document.querySelector('#google-auth-button');
    
    // Debugging helper
    function debug(message) {
        console.log(`[DEBUG] ${message}`);
    }
    
    debug('DOM loaded, setting up authentication');
    debug(`Current hostname: ${window.location.hostname}`);
    
    // Verificar status do Clerk
    function checkClerkStatus() {
        const isAvailable = typeof window.Clerk !== 'undefined';
        debug(`Clerk is available: ${isAvailable}`);
        return isAvailable;
    }
    
    // Verificar inicialmente e após um pequeno atraso
    checkClerkStatus();
    setTimeout(checkClerkStatus, 1000);
    
    // Autenticação com o Google via Clerk
    if (googleAuthButton) {
        debug('Setting up Google auth button click handler');
        googleAuthButton.addEventListener('click', (e) => {
            e.preventDefault();
            debug('Google auth button clicked');
            
            // Tentar autenticação com Clerk
            handleClerkAuth();
        });
    }
    
    function handleClerkAuth() {
        debug('Handling auth with Clerk');
        
        if (!checkClerkStatus()) {
            debug('Clerk not available, retrying in 1s');
            setTimeout(() => {
                if (checkClerkStatus()) {
                    debug('Clerk now available, proceeding with auth');
                    openClerkSignIn();
                } else {
                    debug('Clerk still not available, showing error');
                    alert('Serviço de autenticação não disponível. Por favor, recarregue a página e tente novamente.');
                }
            }, 1000);
            return;
        }
        
        openClerkSignIn();
    }
    
    function openClerkSignIn() {
        try {
            debug('Opening Clerk sign in with Google');
            
            // Obter URL de redirecionamento do config
            const redirectUrl = window.clerkConfig.redirectUrl;
            debug(`Using redirect URL: ${redirectUrl}`);
            
            // Abrir tela de login usando o Clerk
            window.Clerk.openSignIn({
                redirectUrl: redirectUrl,
                appearance: {
                    elements: {
                        rootBox: {
                            boxShadow: 'none',
                            width: '100%',
                        }
                    }
                },
                signInUrl: redirectUrl,
                afterSignInUrl: redirectUrl
            });
        } catch (error) {
            debug('Error opening Clerk sign in: ' + error.message);
            console.error('Error opening Clerk sign in:', error);
            alert('Erro ao abrir tela de autenticação. Por favor, tente novamente.');
        }
    }
    
    // Email validation function
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Form validation
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
}); 