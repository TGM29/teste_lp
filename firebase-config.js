// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAROjNKhAOy4jKhYd2uzJSNMRpztriw570",
  authDomain: "landingpage-e3122.firebaseapp.com",
  projectId: "landingpage-e3122",
  storageBucket: "landingpage-e3122.appspot.com",
  messagingSenderId: "1095068232112",
  appId: "1:1095068232112:web:ce8607ca2ff5bbe2368e75"
};

// Verificar se o Firebase está disponível
if (typeof firebase === 'undefined') {
  console.error('Firebase não está disponível. Verifique se os scripts foram carregados corretamente.');
  // Criar serviços simulados para evitar erros
  window.dbService = {
    saveEmailSubscription: function(email) {
      console.log('Modo simulado: E-mail que seria salvo:', email);
      return Promise.resolve(true);
    },
    saveGoogleSubscription: function(email, name) {
      console.log('Modo simulado: Usuário Google que seria salvo:', email, name);
      return Promise.resolve(true);
    }
  };
  
  // Serviço simulado de autenticação
  window.authService = {
    signInWithGoogle: function() {
      console.log('Modo simulado: Tentativa de login com Google');
      return Promise.resolve({ user: { email: 'usuario.simulado@gmail.com' } });
    },
    signInWithEmailAndPassword: function(email, password) {
      console.log('Modo simulado: Tentativa de login com email e senha:', email);
      return Promise.resolve({ user: { email: email } });
    }
  };
} else {
  try {
    // Inicializar Firebase
    firebase.initializeApp(firebaseConfig);
    
    // Verificar se Firestore está disponível
    if (typeof firebase.firestore !== 'function') {
      throw new Error('Firestore não está disponível');
    }

    // Verificar se Auth está disponível
    if (typeof firebase.auth !== 'function') {
      throw new Error('Firebase Auth não está disponível');
    }

    // Referência ao Firestore
    const db = firebase.firestore();
    
    // Testar conexão com o Firestore
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

    // Função para login com Google
    function signInWithGoogle() {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      return firebase.auth().signInWithPopup(provider)
        .then((result) => {
          console.log("Login com Google bem-sucedido:", result.user.email);
          
          // Salvar os dados do usuário no Firestore
          saveGoogleSubscription(result.user.email, result.user.displayName);
          
          return result;
        })
        .catch((error) => {
          console.error("Erro no login com Google:", error);
          throw error;
        });
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
    
  } catch (error) {
    console.error('Erro ao inicializar Firebase:', error);
    // Criar serviços simulados para evitar erros
    window.dbService = {
      saveEmailSubscription: function(email) {
        console.log('Modo simulado (após erro): E-mail que seria salvo:', email);
        return Promise.resolve(true);
      },
      saveGoogleSubscription: function(email, name) {
        console.log('Modo simulado (após erro): Usuário Google que seria salvo:', email, name);
        return Promise.resolve(true);
      }
    };
    
    // Serviço simulado de autenticação
    window.authService = {
      signInWithGoogle: function() {
        console.log('Modo simulado: Tentativa de login com Google');
        return Promise.resolve({ user: { email: 'usuario.simulado@gmail.com' } });
      }
    };
  }
} 