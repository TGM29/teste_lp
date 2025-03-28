// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAROjNKhAOy4jKhYd2uzJSNMRpztriw570",
  authDomain: "landingpage-e3122.firebaseapp.com",
  projectId: "landingpage-e3122",
  storageBucket: "landingpage-e3122.appspot.com",
  messagingSenderId: "1095068232112",
  appId: "1:1095068232112:web:ce8607ca2ff5bbe2368e75"
};

// URL para redirecionar após autenticação (definida globalmente para consistência)
const REDIRECT_URL = 'https://thenewscc.beehiiv.com/c/welcome?';

// Função de redirecionamento global para garantir consistência
function redirectToMainPage() {
  console.log("Redirecionando para", REDIRECT_URL);
  // Usando setTimeout para garantir que o redirecionamento ocorra
  setTimeout(() => {
    window.location.href = REDIRECT_URL;
  }, 300);
}

// Verificar se o Firebase está disponível
if (typeof firebase === 'undefined') {
  console.error('Firebase não está disponível. Verifique se os scripts foram carregados corretamente.');
  // Criar serviços simulados para evitar erros
  window.dbService = {
    saveEmailSubscription: function(email) {
      console.log('Modo simulado: E-mail que seria salvo:', email);
      // Redirecionar diretamente sem alert
      redirectToMainPage();
      return Promise.resolve(true);
    },
    saveGoogleSubscription: function(email, name) {
      console.log('Modo simulado: Usuário Google que seria salvo:', email, name);
      // Redirecionar diretamente sem alert
      redirectToMainPage();
      return Promise.resolve(true);
    }
  };
  
  // Serviço simulado de autenticação
  window.authService = {
    signInWithGoogle: function() {
      console.log('Modo simulado: Tentativa de login com Google');
      // Redirecionar sem alert
      redirectToMainPage();
      return Promise.resolve({ user: { email: 'usuario.simulado@gmail.com' } });
    },
    signInWithEmailAndPassword: function(email, password) {
      console.log('Modo simulado: Tentativa de login com email e senha:', email);
      return Promise.resolve({ user: { email: email } });
    }
  };
} else {
  try {
    // Adicionar debug para verificar configuração
    console.log('Iniciando Firebase com config:', JSON.stringify(firebaseConfig));
    
    // Inicializar Firebase
    if (!firebase.apps || !firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    
    console.log('Firebase inicializado com sucesso!');
    
    // Verificar se Firestore está disponível
    if (typeof firebase.firestore !== 'function') {
      throw new Error('Firestore não está disponível');
    }

    // Verificar se Auth está disponível
    if (typeof firebase.auth !== 'function') {
      throw new Error('Firebase Auth não está disponível');
    }

    // Testar autenticação
    console.log('Firebase Auth disponível, testando...');
    const authInstance = firebase.auth();
    console.log('Auth instance obtida:', authInstance !== null);

    // Referência ao Firestore
    const db = firebase.firestore();
    
    // Testar conexão com o Firestore
    console.log('Testando conexão com Firestore...');
    db.collection('_test').doc('_connection')
      .set({ timestamp: new Date().toISOString() })
      .then(() => console.log('Conexão com Firestore OK'))
      .catch(error => console.error('Erro ao conectar com Firestore:', error));

    // Função para salvar inscrição por e-mail
    function saveEmailSubscription(email) {
      return db.collection('emailSubscriptions').add({
        email: email,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        source: 'email_form'
      })
      .then((docRef) => {
        console.log("E-mail salvo com ID: ", docRef.id);
        return true;
      })
      .catch((error) => {
        console.error("Erro ao salvar e-mail: ", error);
        return false;
      });
    }

    // Função para salvar inscrição do Google
    function saveGoogleSubscription(email, name) {
      return db.collection('emailSubscriptions').add({
        email: email,
        name: name || '',
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        source: 'google_auth'
      })
      .then((docRef) => {
        console.log("Usuário Google salvo com ID: ", docRef.id);
        return true;
      })
      .catch((error) => {
        console.error("Erro ao salvar usuário Google: ", error);
        return false;
      });
    }

    // Função para login com Google - implementação alternativa
    function signInWithGoogle() {
      console.log("Iniciando login com Google...");
      
      try {
        // Usar redirect em vez de popup para evitar problemas
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');
        
        // Tentar usar redirecionamento para autenticação
        return firebase.auth().signInWithRedirect(provider)
          .then(() => {
            console.log("Redirecionamento para autenticação iniciado");
            return { redirect: true };
          })
          .catch((error) => {
            console.error("Erro ao iniciar redirecionamento:", error);
            
            // Se falhar, tentar login direto e redirecionar manualmente
            console.log("Redirecionando diretamente após falha na autenticação");
            redirectToMainPage();
            return { redirect: false, error: error };
          });
      } catch (error) {
        console.error("Erro crítico no login:", error);
        
        // Em caso de erro crítico, redirecionar de qualquer forma
        redirectToMainPage();
        return Promise.resolve({ error: error });
      }
    }

    // Exportar funções
    window.dbService = {
      saveEmailSubscription,
      saveGoogleSubscription
    };
    
    // Exportar serviço de autenticação
    window.authService = {
      signInWithGoogle
    };
    
    // Exportar função de redirecionamento globalmente
    window.redirectToMainPage = redirectToMainPage;
    
    // Verificar se há resultado de redirecionamento
    if (typeof firebase.auth === 'function') {
      firebase.auth().getRedirectResult().then((result) => {
        if (result && result.user) {
          console.log("Redirecionamento de autenticação bem-sucedido:", result.user.email);
          
          // Salvar dados do usuário
          if (result.user.email) {
            saveGoogleSubscription(result.user.email, result.user.displayName || '')
              .then(() => {
                console.log("Dados do usuário salvos após redirecionamento");
                redirectToMainPage();
              })
              .catch(error => {
                console.error("Erro ao salvar dados após redirecionamento:", error);
                redirectToMainPage();
              });
          } else {
            redirectToMainPage();
          }
        }
      }).catch(error => {
        console.error("Erro no resultado do redirecionamento:", error);
      });
    }
    
  } catch (error) {
    console.error('Erro ao inicializar Firebase:', error);
    // Criar serviços simulados para evitar erros
    window.dbService = {
      saveEmailSubscription: function(email) {
        console.log('Modo simulado (após erro): E-mail que seria salvo:', email);
        // Redirecionar diretamente sem alert
        redirectToMainPage();
        return Promise.resolve(true);
      },
      saveGoogleSubscription: function(email, name) {
        console.log('Modo simulado (após erro): Usuário Google que seria salvo:', email, name);
        // Redirecionar diretamente sem alert
        redirectToMainPage();
        return Promise.resolve(true);
      }
    };
    
    // Serviço simulado de autenticação
    window.authService = {
      signInWithGoogle: function() {
        console.log('Modo simulado: Tentativa de login com Google após erro');
        // Redirecionar diretamente sem alert
        redirectToMainPage();
        return Promise.resolve({ user: { email: 'usuario.simulado@gmail.com' } });
      }
    };
  }
} 