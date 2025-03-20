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
    
    // Verificar status do Firebase Auth
    function checkAuthStatus() {
        const isAvailable = typeof firebase !== 'undefined' && typeof firebase.auth === 'function';
        debug(`Firebase Auth is available: ${isAvailable}`);
        return isAvailable;
    }
    
    // Verificar inicialmente e após um pequeno atraso
    checkAuthStatus();
    
    // Autenticação com o Google via Firebase
    if (googleAuthButton) {
        debug('Setting up Google auth button click handler');
        googleAuthButton.addEventListener('click', (e) => {
            e.preventDefault();
            debug('Google auth button clicked');
            
            // Desabilitar o botão durante a autenticação
            googleAuthButton.disabled = true;
            
            // Tentar autenticação com Firebase
            handleGoogleAuth();
        });
    }
    
    function handleGoogleAuth() {
        debug('Handling auth with Firebase');
        
        if (!checkAuthStatus()) {
            debug('Firebase Auth not available, showing error');
            alert('Serviço de autenticação não disponível. Por favor, recarregue a página e tente novamente.');
            googleAuthButton.disabled = false;
            return;
        }
        
        // Usar o serviço de autenticação para login com Google
        window.authService.signInWithGoogle()
            .then(result => {
                debug(`Login successful: ${result.user.email}`);
                
                // Redirecionar para a página principal após o login
                setTimeout(() => {
                    window.location.href = 'https://teste-lp-pi.vercel.app/';
                }, 1000);
            })
            .catch(error => {
                debug(`Login error: ${error.message}`);
                alert('Erro durante a autenticação. Por favor, tente novamente.');
                googleAuthButton.disabled = false;
            });
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
            
            // Disable the form while submitting
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Enviando...';
            
            // Define um timeout para garantir que o botão não fique preso em "Enviando..."
            const submitTimeout = setTimeout(() => {
                debug('Submission timeout reached, resetting form');
                submitButton.disabled = false;
                submitButton.textContent = 'inscreva-se';
            }, 8000); // 8 segundos de timeout
            
            try {
                // Salvar no Firebase
                debug('Saving email to Firebase');
                
                // Simular sucesso se o Firebase não estiver disponível
                if (typeof window.dbService === 'undefined' || !window.dbService.saveEmailSubscription) {
                    debug('Firebase service not available, proceeding with mock success');
                    clearTimeout(submitTimeout);
                    
                    // Mostrar mensagem de sucesso e redirecionamento
                    alert(`Obrigado por se inscrever com: ${email}`);
                    emailInput.value = '';
                    submitButton.disabled = false;
                    submitButton.textContent = 'inscreva-se';
                    
                    // Redirecionar diretamente para a página principal
                    window.location.href = 'https://teste-lp-pi.vercel.app/';
                    return;
                }
                
                window.dbService.saveEmailSubscription(email)
                    .then(success => {
                        clearTimeout(submitTimeout);
                        if (success) {
                            debug('Email saved successfully');
                            
                            // Mensagem de sucesso e redirecionamento
                            alert(`Obrigado por se inscrever com: ${email}`);
                            emailInput.value = '';
                            
                            // Redirecionar diretamente para a página principal sem delay
                            window.location.href = 'https://teste-lp-pi.vercel.app/';
                        } else {
                            // Erro ao salvar
                            debug('Error saving email');
                            showError('Erro ao salvar sua inscrição. Por favor, tente novamente.');
                            submitButton.disabled = false;
                            submitButton.textContent = 'inscreva-se';
                        }
                    })
                    .catch(error => {
                        clearTimeout(submitTimeout);
                        debug('Error saving email: ' + error);
                        showError('Erro ao salvar sua inscrição. Por favor, tente novamente.');
                        submitButton.disabled = false;
                        submitButton.textContent = 'inscreva-se';
                    });
            } catch (error) {
                clearTimeout(submitTimeout);
                debug('Unexpected error in form submission: ' + error);
                showError('Ocorreu um erro. Por favor, tente novamente.');
                submitButton.disabled = false;
                submitButton.textContent = 'inscreva-se';
            }
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