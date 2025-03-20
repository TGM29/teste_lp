// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDKxuYnYYnMlFxZkF-UqAFZwYxn9y5QGJU",
  authDomain: "landingpage-29c96.firebaseapp.com",
  projectId: "landingpage-29c96",
  storageBucket: "landingpage-29c96.appspot.com",
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
} else {
  try {
    // Inicializar Firebase
    firebase.initializeApp(firebaseConfig);
    
    // Verificar se Firestore está disponível
    if (typeof firebase.firestore !== 'function') {
      throw new Error('Firestore não está disponível');
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

    // Exportar funções
    window.dbService = {
      saveEmailSubscription,
      saveGoogleSubscription
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
  }
} 