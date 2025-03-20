// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCpkOXoaEl7Z75f-O1BfCJGJqU2jPZ89r8",
  authDomain: "thenews-landing.firebaseapp.com",
  projectId: "thenews-landing",
  storageBucket: "thenews-landing.appspot.com",
  messagingSenderId: "485356977028",
  appId: "1:485356977028:web:72fb4ccb0a6dbc8bd3fc3a"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referência ao Firestore
const db = firebase.firestore();

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