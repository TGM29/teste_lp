// Configuração para autenticação com Clerk
window.clerkConfig = {
    publishableKey: 'pk_test_bm92ZWwtZG9ua2V5LTQzLmNsZXJrLmFjY291bnRzLmRldiQ',
    domain: 'novel-donkey-43.clerk.accounts.dev',
    // URL principal para redirecionamento
    mainUrl: 'https://teste-lp-pi.vercel.app/',
    // Detectar ambiente atual
    get redirectUrl() {
        const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
        return isProduction ? 'https://teste-lp-pi.vercel.app/' : 'http://localhost:3001';
    },
    // Retornar URLs de redirecionamento para OAuth
    get redirectURIs() {
        const baseUrl = this.redirectUrl;
        return [
            baseUrl,
            `${baseUrl}callback`,
            `${baseUrl}oauth-callback`
        ];
    }
}; 