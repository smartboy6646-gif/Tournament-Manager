import { auth, db, onAuthStateChanged, collection, addDoc, getDocs, query, where, doc, getDoc } from './firebase.js';

let currentAdminTourney = null;

// Admin Guard
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // In a real app, verify admin claim via Firebase Functions or Firestore lookup
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if(!userDoc.exists() || userDoc.data().role !== 'admin') {
            alert("Unauthorized access");
            window.location.href = '/index.html';
        }
    } else {
        window.location.href = '/login.html';
    }
});

// Generate Join Code
function generateCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

document.getElementById('createTourneyBtn').addEventListener('click', async () => {
    const name = document.getElementById('tName').value;
    const slots = parseInt(document.getElementById('tSlots').value);
    const code = generateCode();

    if(!name) return alert("Name required");

    const tRef = await addDoc(collection(db, "tournaments"), {
        name,
        totalSlots: slots,
        joined: 0,
        code,
        status: 'open',
        format: 'knockout',
        createdAt: new Date()
    });

    currentAdminTourney = tRef.id;
    document.getElementById('displayCode').innerText = code;
    document.getElementById('slotCounter').innerText = `0/${slots}`;
    alert("Tournament Created! Share code: " + code);
});

// Randomize Bracket Logic
document.getElementById('randomizeBtn').addEventListener('click', async () => {
    if(!currentAdminTourney) return alert("Select a tournament first!");

    // 1. Fetch all registered players
    const q = query(collection(db, "registrations"), where("tournamentId", "==", currentAdminTourney));
    const snapshot = await getDocs(q);
    
    let players = [];
    snapshot.forEach(doc => players.push({ id: doc.id, ...doc.data() }));

    if(players.length === 0) return alert("No players registered yet.");

    // 2. Shuffle Array (Fisher-Yates)
    for (let i = players.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [players[i], players[j]] = [players[j], players[i]];
    }

    // 3. Create Matches
    const bracketVisual = document.getElementById('bracketVisual');
    bracketVisual.innerHTML = '';
    document.getElementById('bracketArea').classList.remove('hidden');

    for (let i = 0; i < players.length; i += 2) {
        let p1 = players[i];
        let p2 = players[i+1] || { gameId: "BYE" }; // Handle odd numbers if slots aren't full

        // Save match to Firestore
        await addDoc(collection(db, "matches"), {
            tournamentId: currentAdminTourney,
            round: 1,
            player1: p1.id,
            player2: p2.id === "BYE" ? "BYE" : p2.id,
            winner: null,
            status: 'pending'
        });

        // 4. Dramatic UI Reveal (Animate assignment process)
        setTimeout(() => {
            const matchCard = document.createElement('div');
            matchCard.className = "bg-[#15151a] border border-gray-700 p-4 rounded min-w-[200px] reveal-card bracket-line";
            matchCard.innerHTML = `
                <div class="text-[#39ff14] border-b border-gray-800 pb-2 mb-2">${p1.gameId}</div>
                <div class="text-[#00f3ff]">${p2.gameId}</div>
            `;
            bracketVisual.appendChild(matchCard);
        }, i * 300); // Stagger animation
    }
});
