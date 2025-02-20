// Import Firebase funkcí
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";

// Konfigurace Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDMoEnT2xBRyqC2wPW404eBq5XSMjQ4-lM",
  authDomain: "gymprs-1ab39.firebaseapp.com",
  projectId: "gymprs-1ab39",
  storageBucket: "gymprs-1ab39.firebasestorage.app",
  messagingSenderId: "501305308944",
  appId: "1:501305308944:web:c310b5979a313f43edd795",
  measurementId: "G-NCMXSM5425"
};



// Inicializace Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Registrace nového uživatele
window.register = function() {
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value.trim();

  if (!email || !password) {
    alert('Vyplňte všechny údaje!');
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      alert('Úspěšná registrace!');
      console.log('Registrován:', userCredential.user);
      window.location.href = "./index.html";
    })
    .catch(error => {
      alert("Registrace se nezdařila");
    });
}


// Přihlášení uživatele
window.login = function() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (!email || !password) {
    alert('Vyplňte všechny údaje!');
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      alert('Úspěšné přihlášení!');
      console.log('Přihlášen:', userCredential.user);
      window.location.href = "./index.html"; // Přesměrování se provede jen při úspěchu
    })
    .catch(error => {
      alert("Špatné heslo nebo email"); // Chyba se zobrazí a zůstaneš na login stránce
    });
}


// Odhlášení uživatele
window.logout = function() {
  signOut(auth)
    .then(() => {
      alert('Odhlášen!');
      window.location.href = "./login.html"; // Přesměrování na login stránku
    })
    .catch(error => {
      alert(error.message);
    });
}

// Sledování stavu přihlášení
onAuthStateChanged(auth, user => {
  if (user) {
    console.log('Uživatel přihlášen:', user);
  } else {
    console.log('Nikdo není přihlášen');
  }
});

//kontrrola pri pridani PR jestli je uzivatel prihlasen
window.checkUser = function() {
  onAuthStateChanged(auth, user => {
    if (!user) {
      window.location.href = "./login.html";
    }
  });
}
