// Configuração do Clerk para a autenticação com Google OAuth
const clerkConfig = {
    publishableKey: 'pk_test_bm92ZWwtZG9ua2V5LTQzLmNsZXJrLmFjY291bnRzLmRldiQ',
    // Redirecionar para a página inicial após autenticação
    redirectUrl: 'http://localhost:3001',
    // URLs de redirecionamento OAuth para o Google
    redirectURIs: [
        'http://localhost:3001/callback',
        'http://localhost:3001/oauth-callback',
        'http://localhost:3001'
    ]
};

// Exportar a configuração
if (typeof module !== 'undefined' && module.exports) {
    module.exports = clerkConfig;
} else {
    window.clerkConfig = clerkConfig;
} 