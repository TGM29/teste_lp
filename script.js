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
        debug(`Clerk is available: ${typeof window.Clerk !== 'undefined'}`);
        if (typeof window.Clerk !== 'undefined') {
            debug('Clerk object found!');
        } else {
            debug('Clerk object NOT found!');
        }
    }
    
    // Verificar inicialmente e após um pequeno atraso
    checkClerkStatus();
    setTimeout(checkClerkStatus, 1000);
    setTimeout(checkClerkStatus, 3000);
    
    // Simplificar a autenticação com o Google - Método direto
    if (googleAuthButton) {
        debug('Setting up Google auth button click handler');
        googleAuthButton.addEventListener('click', (e) => {
            e.preventDefault();
            debug('Google auth button clicked');
            
            // Tentar abrir a autenticação com o Google via Clerk
            tryGoogleAuth();
        });
    }
    
    function tryGoogleAuth() {
        debug('Trying Google auth');
        
        // Determinar o URL de redirecionamento baseado no ambiente
        const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
        const redirectUrl = isProduction ? `https://${window.location.hostname}` : 'http://localhost:3001';
        
        debug(`Redirect URL: ${redirectUrl}`);
        
        // Verificar se o Clerk está disponível
        if (typeof window.Clerk !== 'undefined') {
            debug('Using Clerk for authentication');
            
            try {
                // Abrir a tela de login do Google
                window.Clerk.openSignIn({
                    redirectUrl: redirectUrl
                });
            } catch (error) {
                console.error('Clerk openSignIn error:', error);
                // Fallback para URL direta de autenticação
                useDirectGoogleAuth();
            }
        } else {
            debug('Clerk not available, using direct approach');
            useDirectGoogleAuth();
        }
    }
    
    // Método alternativo direto para o OAuth do Google com Clerk
    function useDirectGoogleAuth() {
        debug('Using direct Google auth URL');
        
        // URL direto para o endpoint de autenticação do Clerk para Google
        const clerkDomain = 'https://clerk.novel-donkey-43.clerk.accounts.dev';
        const directAuthUrl = `${clerkDomain}/oauth/google?redirect_url=${encodeURIComponent(window.location.href)}`;
        
        debug(`Redirecting to: ${directAuthUrl}`);
        
        // Redirecionar para a URL de autenticação do Google
        window.location.href = directAuthUrl;
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