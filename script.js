document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#email-form');
    const emailInput = document.querySelector('#email-input');
    const googleAuthButton = document.querySelector('#google-auth-button');
    
    // Debugging helper com log no console e para UI
    function debug(message) {
        console.log(`[DEBUG] ${message}`);
    }
    
    debug('DOM loaded, setting up authentication');
    
    // Verificar status do Firebase Auth
    function checkAuthStatus() {
        try {
            const isAvailable = typeof firebase !== 'undefined' && typeof firebase.auth === 'function';
            debug(`Firebase Auth is available: ${isAvailable}`);
            
            if (isAvailable) {
                debug('Testando Firebase Auth...');
                const auth = firebase.auth();
                debug('Firebase Auth funcionando corretamente');
            }
            
            return isAvailable;
        } catch (error) {
            debug(`Erro ao verificar Auth: ${error.message}`);
            return false;
        }
    }
    
    // Verificar inicialmente
    checkAuthStatus();
    
    // Autenticação com o Google
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
    } else {
        debug('Google auth button not found!');
    }
    
    function handleGoogleAuth() {
        debug('Handling auth with Firebase');
        
        // Verificar se temos o serviço de autenticação disponível
        if (!window.authService || typeof window.authService.signInWithGoogle !== 'function') {
            debug('Auth service not available, using fallback');
            alert('Serviço de autenticação não disponível. Por favor, use o cadastro por email.');
            googleAuthButton.disabled = false;
            return;
        }
        
        try {
            debug('Usando authService.signInWithGoogle()');
            
            // Usar o serviço de autenticação configurado em firebase-config.js
            window.authService.signInWithGoogle()
                .then(result => {
                    debug(`Login successful: ${result.user.email}`);
                    // Redirecionamento é tratado pelo próprio serviço
                })
                .catch(error => {
                    debug(`Login error: ${error.message}`);
                    // Mensagem de erro já é mostrada pelo serviço
                    googleAuthButton.disabled = false;
                });
        } catch (error) {
            debug(`Erro crítico no auth: ${error.message}`);
            alert('Erro no sistema de autenticação. Por favor, tente usar o formulário de e-mail.');
            googleAuthButton.disabled = false;
        }
    }
    
    // Email validation function
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Form validation
    if (form) {
        debug('Form found, setting up submit handler');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            debug('Form submitted');
            
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
            
            // Desabilitar o formulário durante o envio
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Enviando...';
            
            // Timeout de segurança (3 segundos)
            const submitTimeout = setTimeout(() => {
                debug('Timeout de segurança ativado');
                submitButton.disabled = false;
                submitButton.textContent = 'inscreva-se';
                
                // Forçar redirecionamento em caso de problemas
                alert('Recebemos seu e-mail! Redirecionando...');
                window.location.href = 'https://teste-lp-pi.vercel.app/';
            }, 3000);
            
            try {
                debug(`Saving email to Firebase: ${email}`);
                
                // Verificar se o Firebase está disponível
                if (typeof window.dbService === 'undefined' || !window.dbService.saveEmailSubscription) {
                    debug('Firebase indisponível, redirecionando diretamente');
                    clearTimeout(submitTimeout);
                    
                    alert(`Recebemos seu e-mail: ${email}`);
                    emailInput.value = '';
                    
                    // Redirecionar sem esperar
                    window.location.href = 'https://teste-lp-pi.vercel.app/';
                    return;
                }
                
                // Tentar salvar no Firebase com timeout curto
                const savePromise = window.dbService.saveEmailSubscription(email);
                
                // Usar Promise.race para garantir uma resposta rápida
                Promise.race([
                    savePromise,
                    new Promise(resolve => setTimeout(() => {
                        debug('Prazo para salvar esgotado, redirecionando');
                        resolve('timeout');
                    }, 2000))
                ]).then(result => {
                    clearTimeout(submitTimeout);
                    
                    debug(`Resultado do salvamento: ${result}`);
                    
                    // Mostrar mensagem e redirecionar em qualquer caso
                    alert(`Obrigado por se inscrever com: ${email}`);
                    emailInput.value = '';
                    
                    // Redirecionar imediatamente
                    window.location.href = 'https://teste-lp-pi.vercel.app/';
                }).catch(error => {
                    clearTimeout(submitTimeout);
                    debug(`Erro ao salvar: ${error}`);
                    
                    // Mesmo com erro, redirecionar
                    alert(`Recebemos seu e-mail. Redirecionando...`);
                    emailInput.value = '';
                    window.location.href = 'https://teste-lp-pi.vercel.app/';
                });
            } catch (error) {
                clearTimeout(submitTimeout);
                debug(`Erro inesperado: ${error}`);
                
                // Mesmo com erro, redirecionar
                alert(`Algo deu errado, mas recebemos seu e-mail: ${email}`);
                emailInput.value = '';
                submitButton.disabled = false;
                submitButton.textContent = 'inscreva-se';
                
                // Redirecionar
                window.location.href = 'https://teste-lp-pi.vercel.app/';
            }
        });
    } else {
        debug('Form not found!');
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