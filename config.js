// Configuração para autenticação direta com Google OAuth
window.googleAuth = {
    clientId: '485356977028-bk2rlvr3fdj8k8vg4nnv4rqs0vlrgp1p.apps.googleusercontent.com',
    scopes: 'email profile',
    // Detectar ambiente atual
    get redirectUrl() {
        const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
        return isProduction ? `https://${window.location.hostname}` : 'http://localhost:3001';
    }
}; 