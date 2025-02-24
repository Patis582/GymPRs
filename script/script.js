// Import Firebase funkcí
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

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
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// Registrace nového uživatele
window.register = function(event) {
  event.preventDefault();
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value.trim();

  if (!name || !email || !password) {
    alert('Vyplňte všechny údaje!');
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email
      });
      alert('Úspěšná registrace!');
      console.log('Registrován:', user);
      window.location.href = "./login.html"; // Přesměrování na přihlašovací stránku po registraci
    })
    .catch(error => {
      alert("Registrace se nezdařila");
      console.error("Error during registration:", error);
    });
}

// Přihlášení uživatele
window.login = function(event) {
  event.preventDefault();
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
     // Načtení PRs po ověření přihlášení
  } else {
    console.log('Nikdo není přihlášen');
     // Načtení PRs i když není nikdo přihlášen
  }
});

// Přidání PR do Firestore
window.addPR = async function(event) {
  event.preventDefault();
  const user = auth.currentUser;
  if (user) {
    const exercise = document.getElementById('prExercise').value;
    const weight = document.getElementById('prWeight').value;

    try {
      await addDoc(collection(db, "prs"), {
        userId: user.uid,
        exercise: exercise,
        weight: weight,
        date: new Date().toISOString()
      });
      alert("PR úspěšně přidán!");
       // Načtení PRs po přidání nového PR
      loadPRs();
    } catch (error) {
      console.error("Chyba při přidávání PR:", error);
    }
  } else {
    alert("Musíte být přihlášeni!");
    window.location.href = "./login.html";
  }
};

// Načtení PRs z Firestore
window.loadPRs = async function() {
  try {
    console.log("Loading PRs...");
    const querySnapshot = await getDocs(collection(db, "prs"));
    const tbody = document.querySelector('.leaderboard__table--body');
    tbody.innerHTML = ''; // Vyčistí tabulku před přidáním nových dat

    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data();
      console.log("Document data:", data);

      const userDoc = await getDoc(doc(db, "users", data.userId));
      const userData = userDoc.data();
      console.log("User data:", userData);

      const row = document.createElement('tr');
      row.classList.add('leaderboard--row');

      const nameCell = document.createElement('td');
      nameCell.classList.add('leaderboard--cell');
      nameCell.textContent = userData.name;

      const exerciseCell = document.createElement('td');
      exerciseCell.classList.add('leaderboard--cell');
      exerciseCell.textContent = data.exercise;

      const weightCell = document.createElement('td');
      weightCell.classList.add('leaderboard--cell');
      weightCell.textContent = `${data.weight}kg`;

      row.appendChild(nameCell);
      row.appendChild(exerciseCell);
      row.appendChild(weightCell);

      tbody.appendChild(row);
    }
  } catch (error) {
    console.error("Error loading PRs:", error);
  }
};
//Load top3----------------------------------
window.loadTop3 = async function() {
  try {
    console.log("Loading Top 3...");

    // Načteme všechna PRs
    const querySnapshot = await getDocs(collection(db, "prs"));
    console.log("Query Snapshot Size:", querySnapshot.size);

    // Inicializace objektu pro uložení dat uživatelů
    const users = {};
    const userIdSet = new Set(); // Sada pro ukládání všech unikátních userId

    // Procházení všech PRs
    querySnapshot.forEach(docSnapshot => {
      const data = docSnapshot.data();
      const userId = data.userId;
      const exercise = data.exercise;
      const weight = parseInt(data.weight); // Převod váhy na číslo
    
      // Přeskočíme neplatné váhy
      if (isNaN(weight) || weight <= 0) {
        console.warn("Neplatná váha:", data.weight);
        return;
      }
    
      // Přidáme userId do sady pro pozdější načtení jména
      userIdSet.add(userId);
    
      // Pokud uživatel ještě není v objektu, inicializujeme ho
      if (!users[userId]) {
        users[userId] = {
          userName: "Neznámý uživatel", 
          BenchPress: 0,
          Squat: 0,
          Deadlift: 0,
          total: 0
        };
      }
    
      // Najdeme nejlepší váhu pro každý cvik
      if (exercise.toLowerCase() === "bench press" && weight > users[userId].BenchPress) {
        users[userId].BenchPress = weight;
      } else if (exercise.toLowerCase() === "squat" && weight > users[userId].Squat) {
        users[userId].Squat = weight;
      } else if (exercise.toLowerCase() === "deadlift" && weight > users[userId].Deadlift) {
        users[userId].Deadlift = weight;
      }
    
      // Po aktualizaci cviků spočítáme total
      users[userId].total = users[userId].BenchPress + users[userId].Squat + users[userId].Deadlift;
    });
    

    // Načtení jmen uživatelů podle userId
    const userIdArray = Array.from(userIdSet);
    const userPromises = userIdArray.map(async (userId) => {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("User Data:", userData);
        users[userId].userName = userData.name || "Neznámý uživatel";
      }
    });

    // Čekáme na dokončení všech dotazů na jména
    await Promise.all(userPromises);

    // Sečteme celkové váhy pro každého uživatele
    for (let userId in users) {
      users[userId].total = 
        users[userId].BenchPress + 
        users[userId].Squat + 
        users[userId].Deadlift;
    }

    // Převod objektu na pole a seřazení podle celkového součtu sestupně
    const sortedUsers = Object.values(users).sort((a, b) => b.total - a.total);

    // Výběr Top 3 uživatelů
    const top3 = sortedUsers.slice(0, 3);
    console.log("Top 3 Data:", top3);

    // Změna textu pro první místo
    if (top3[0]) {
      document.querySelector('.leaderboard__place--name.leaderboard__place__name--first').textContent = top3[0].userName;
      document.querySelector('.leaderboard__podium--first .leaderboard__podium--weight').textContent = "Total: " + `${top3[0].total} kg`;
    }

    // Změna textu pro druhé místo
    if (top3[1]) {
      document.querySelector('.leaderboard__place--name.leaderboard__place__name--second').textContent = top3[1].userName;
      document.querySelector('.leaderboard__podium--second .leaderboard__podium--weight').textContent = "Total: " + `${top3[1].total} kg`;
    }

    // Změna textu pro třetí místo
    if (top3[2]) {
      document.querySelector('.leaderboard__place--name.leaderboard__place__name--third').textContent = top3[2].userName;
      document.querySelector('.leaderboard__podium--third .leaderboard__podium--weight').textContent = "Total: " + `${top3[2].total} kg`;
    }
  } catch (error) {
    console.error("Error loading Top 3:", error);
  }
};





//kontrrola pri pridani PR jestli je uzivatel prihlasen
window.checkUser = function() {
  onAuthStateChanged(auth, user => {
    if (!user) {
      window.location.href = "./login.html";
    } else {
      document.querySelector('.modal--AddPR').style.display = 'flex';
    }
    document.querySelector('.modal--AddPR__close').addEventListener('click', function() {
      document.querySelector('.modal--AddPR').style.display = 'none';
    });
  });
}

// Spusť načtení PRs po načtení stránky
window.onload = function() {
  loadPRs();
  loadTop3();
};
