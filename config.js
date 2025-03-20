// Configuração do Clerk para a autenticação com Google OAuth
const clerkConfig = {
    publishableKey: 'pk_test_bm92ZWwtZG9ua2V5LTQzLmNsZXJrLmFjY291bnRzLmRldiQ',
    
    // Detectar ambiente automaticamente
    get redirectUrl() {
        // Verifica se estamos em produção (Vercel) ou desenvolvimento local
        const isProduction = typeof window !== 'undefined' && 
            (window.location.hostname !== 'localhost' && 
             window.location.hostname !== '127.0.0.1');
             
        return isProduction 
            ? 'https://' + window.location.hostname 
            : 'http://localhost:3001';
    },
    
    // URLs de redirecionamento OAuth para o Google
    get redirectURIs() {
        // Verifica se estamos em produção (Vercel) ou desenvolvimento local
        const isProduction = typeof window !== 'undefined' && 
            (window.location.hostname !== 'localhost' && 
             window.location.hostname !== '127.0.0.1');
             
        const hostname = isProduction 
            ? 'https://' + window.location.hostname 
            : 'http://localhost:3001';
            
        return [
            `${hostname}/callback`,
            `${hostname}/oauth-callback`,
            `${hostname}`
        ];
    }
};

// Exportar a configuração
if (typeof module !== 'undefined' && module.exports) {
    module.exports = clerkConfig;
} else {
    window.clerkConfig = clerkConfig;
} 