document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#email-form');
    const emailInput = document.querySelector('#email-input');
    const googleAuthButton = document.querySelector('#google-auth-button');
    
    // Constante para URL de redirecionamento
    const REDIRECT_URL = 'https://thenewscc.beehiiv.com/c/welcome?';
    
    // Debugging helper com log no console e para UI
    function debug(message) {
        console.log(`[DEBUG] ${message}`);
    }
    
    // Função de redirecionamento com fallback
    function redirectToMainPage() {
        debug('Redirecionando para: ' + REDIRECT_URL);
        
        // Usar a função global se disponível, ou redirecionar diretamente
        if (window.redirectToMainPage) {
            window.redirectToMainPage();
        } else {
            // Usar setTimeout para garantir que o redirecionamento ocorra
            setTimeout(() => {
                window.location.href = REDIRECT_URL;
            }, 300);
        }
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
            
            // Indicador visual de carregamento (em vez de desabilitar o botão)
            googleAuthButton.classList.add('loading');
            
            // Definir um timeout de segurança para o botão de Google
            const buttonTimeout = setTimeout(() => {
                debug('Google button timeout - redirecionando');
                googleAuthButton.classList.remove('loading');
                
                // Em último caso, redirecionar diretamente
                redirectToMainPage();
            }, 5000);
            
            // Tentar autenticação com Firebase
            handleGoogleAuth(buttonTimeout);
        });
    } else {
        debug('Google auth button not found!');
    }
    
    function handleGoogleAuth(buttonTimeout) {
        debug('Handling auth with Firebase');
        
        // Verificar se temos o serviço de autenticação disponível
        if (!window.authService || typeof window.authService.signInWithGoogle !== 'function') {
            debug('Auth service not available, using fallback');
            clearTimeout(buttonTimeout);
            googleAuthButton.classList.remove('loading');
            
            // Redirecionar diretamente em vez de mostrar alerta
            redirectToMainPage();
            return;
        }
        
        try {
            debug('Usando authService.signInWithGoogle()');
            
            // Usar o serviço de autenticação configurado em firebase-config.js
            window.authService.signInWithGoogle()
                .then(result => {
                    clearTimeout(buttonTimeout);
                    debug(`Login iniciado: ${JSON.stringify(result)}`);
                    
                    // Se for um redirecionamento, não precisamos fazer nada
                    // O Firebase irá lidar com o redirecionamento e o resultado
                    if (!result || !result.redirect) {
                        // Se não foi redirecionamento, garantir redirecionamento manual
                        debug('Redirecionando manualmente após autenticação');
                        redirectToMainPage();
                    }
                })
                .catch(error => {
                    clearTimeout(buttonTimeout);
                    debug(`Login error: ${error.message}`);
                    
                    // Restaurar o botão
                    googleAuthButton.classList.remove('loading');
                    
                    // Redirecionar mesmo em caso de erro
                    redirectToMainPage();
                });
        } catch (error) {
            clearTimeout(buttonTimeout);
            debug(`Erro crítico no auth: ${error.message}`);
            googleAuthButton.classList.remove('loading');
            
            // Redirecionar em caso de erro crítico
            redirectToMainPage();
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
                redirectToMainPage();
            }, 3000);
            
            try {
                debug(`Saving email to Firebase: ${email}`);
                
                // Verificar se o Firebase está disponível
                if (typeof window.dbService === 'undefined' || !window.dbService.saveEmailSubscription) {
                    debug('Firebase indisponível, redirecionando diretamente');
                    clearTimeout(submitTimeout);
                    
                    // Redirecionar sem mostrar alerta
                    redirectToMainPage();
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
                    
                    // Redirecionar imediatamente, sem alerta
                    redirectToMainPage();
                }).catch(error => {
                    clearTimeout(submitTimeout);
                    debug(`Erro ao salvar: ${error}`);
                    
                    // Redirecionar sem mostrar alerta
                    redirectToMainPage();
                });
            } catch (error) {
                clearTimeout(submitTimeout);
                debug(`Erro inesperado: ${error}`);
                
                // Redirecionar sem alerta
                redirectToMainPage();
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