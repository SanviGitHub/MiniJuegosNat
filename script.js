// --- FIREBASE INTEGRATION ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
    getFirestore, doc, getDoc, setDoc, updateDoc, onSnapshot, getDocs, collection
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// Tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB4gsmP4npxwgHRN0882sqG-ruZj1DL0V0",
    authDomain: "mjcnt-c25a8.firebaseapp.com",
    projectId: "mjcnt-c25a8",
    storageBucket: "mjcnt-c25a8.appspot.com",
    messagingSenderId: "534683522875",
    appId: "1:534683522875:web:c53aa00beec9888446491e",
    measurementId: "G-6WB1D5N7Q7"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- USUARIOS Y CONTRASEÑAS LOCALES ---
const USERS = {
    "fila 1": "fila",
    "fila 2": "fila",
    "fila 3": "fila",
    "fila 4": "fila",
    "profesoranatu": "2025naturales2025juegos"
};
const FILAS_VALIDAS = ["fila 1", "fila 2", "fila 3", "fila 4"];
const PROFESORA = "profesoranatu";

// --- SESIÓN ---
function saveSession(user) { localStorage.setItem('user', user); }
function getSession() { return localStorage.getItem('user'); }
function clearSession() { localStorage.removeItem('user'); }

// --- GLOBALES ---
let currentUser = null;
let currentGame = null;
let gameData = null;

// --- FIRESTORE FUNCIONES ---
async function getFilaCoins(fila) {
    const ref = doc(db, "filas", fila);
    const snap = await getDoc(ref);
    if (snap.exists() && typeof snap.data().coins !== "undefined") {
        return Number(snap.data().coins) || 0;
    }
    await setDoc(ref, { coins: 0 });
    return 0;
}
async function setCoinsDB(fila, coins) {
    const ref = doc(db, "filas", fila);
    await setDoc(ref, { coins: Number(coins) }, { merge: true });
}
async function getAllFilasFromDB() {
    const snapshot = await getDocs(collection(db, "filas"));
    let filasData = {};
    snapshot.forEach(doc => filasData[doc.id] = doc.data());
    return filasData;
}
async function setMultipleCoinsDB(filasConMonedas) {
    const promises = [];
    for (const fila in filasConMonedas) {
        promises.push(setCoinsDB(fila, filasConMonedas[fila]));
    }
    await Promise.all(promises);
}
async function sumarCoinsAFila(fila, cantidad) {
    const prevCoins = await getFilaCoins(fila);
    const newCoins = prevCoins + Number(cantidad);
    await setCoinsDB(fila, newCoins);
}

// --- LOGIN Y LOGOUT ---
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

window.login = async function login() {
    const username = document.getElementById('username').value.toLowerCase().trim();
    const password = document.getElementById('password').value;

    if (!USERS[username] || USERS[username] !== password) {
        await wait(2000); // Espera 2 segundos
        alert('Usuario o contraseña incorrectos');
        return;
    }
    
    currentUser = username;
    saveSession(username);
    document.getElementById('loginScreen').classList.add('hidden');
    document.querySelector('.logout-btn').classList.remove('hidden');
    if (username === PROFESORA) {
        document.getElementById('teacherScreen').classList.remove('hidden');
        await loadTeacherPanel();
    } else {
        document.getElementById('studentScreen').classList.remove('hidden');
        document.getElementById('currentUser').textContent = username.toUpperCase();
        document.getElementById('filaBadge').textContent = username.toUpperCase();
        onSnapshot(doc(db, "filas", username), async snap => {
            let coins = 0;
            if (snap.exists()) {
                coins = Number(snap.data().coins) || 0;
            } else {
                await setDoc(doc(db, "filas", username), { coins: 0 });
                coins = 0;
            }
            document.getElementById('userCoins').textContent = coins;
        });
    }
};
window.logout = function logout() {
    currentUser = null;
    clearSession();
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('studentScreen').classList.add('hidden');
    document.getElementById('teacherScreen').classList.add('hidden');
    document.querySelector('.logout-btn').classList.add('hidden');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    closeGame();
};
window.onload = async function() {
    const usuario = getSession();
    if (usuario) {
        document.getElementById('username').value = usuario;
        document.getElementById('password').value = '';
        await login();
    }
};

// --- PANEL PROFESORA ---
window.loadTeacherPanel = async function loadTeacherPanel() {
    const filas = await getAllFilasFromDB();
    const filasManagement = document.getElementById('filasManagement');
    filasManagement.innerHTML = '';
    FILAS_VALIDAS.forEach(fila => {
        const coins = Number((filas[fila] && filas[fila].coins) || 0);
        const filaDiv = document.createElement('div');
        filaDiv.className = 'fila-row';
        filaDiv.innerHTML = `
            <div class="fila-info">
                <h4>${fila.toUpperCase()}</h4>
                <div class="fila-coins">💰 ${coins} Minecoins</div>
            </div>
            <div class="fila-controls">
                <input type="number" id="coins-${fila}" placeholder="Cantidad" min="1">
                <button class="btn btn-success" onclick="addCoinsToFila('${fila}')">+ Dar</button>
                <button class="btn btn-danger" onclick="removeCoinsFromFila('${fila}')">- Quitar</button>
            </div>
        `;
        filasManagement.appendChild(filaDiv);
    });
};
window.addCoinsToFila = async function addCoinsToFila(fila) {
    const input = document.getElementById(`coins-${fila}`);
    const amount = parseInt(input.value);
    if (!amount || amount <= 0) {
        alert('Ingresa una cantidad válida');
        return;
    }
    const prevCoins = await getFilaCoins(fila);
    const newCoins = prevCoins + amount;
    await setCoinsDB(fila, newCoins);
    input.value = '';
    await loadTeacherPanel();
    alert(`Se agregaron ${amount} minecoins a ${fila.toUpperCase()}`);
};
window.removeCoinsFromFila = async function removeCoinsFromFila(fila) {
    const input = document.getElementById(`coins-${fila}`);
    const amount = parseInt(input.value);
    if (!amount || amount <= 0) {
        alert('Ingresa una cantidad válida');
        return;
    }
    const prevCoins = await getFilaCoins(fila);
    const newCoins = Math.max(0, prevCoins - amount);
    await setCoinsDB(fila, newCoins);
    input.value = '';
    await loadTeacherPanel();
    alert(`Se quitaron ${amount} minecoins de ${fila.toUpperCase()}`);
};
window.addCoinsToAll = async function addCoinsToAll() {
    const amount = parseInt(document.getElementById('globalCoins').value);
    if (!amount || amount <= 0) {
        alert('Ingresa una cantidad válida');
        return;
    }
    const filas = await getAllFilasFromDB();
    let updateObj = {};
    FILAS_VALIDAS.forEach(fila => {
        updateObj[fila] = (Number((filas[fila] && filas[fila].coins) || 0)) + amount;
    });
    await setMultipleCoinsDB(updateObj);
    document.getElementById('globalCoins').value = '';
    await loadTeacherPanel();
    alert(`Se agregaron ${amount} minecoins a todas las filas`);
};
window.removeCoinsFromAll = async function removeCoinsFromAll() {
    const amount = parseInt(document.getElementById('globalCoins').value);
    if (!amount || amount <= 0) {
        alert('Ingresa una cantidad válida');
        return;
    }
    const filas = await getAllFilasFromDB();
    let updateObj = {};
    FILAS_VALIDAS.forEach(fila => {
        updateObj[fila] = Math.max(0, (Number((filas[fila] && filas[fila].coins) || 0)) - amount);
    });
    await setMultipleCoinsDB(updateObj);
    document.getElementById('globalCoins').value = '';
    await loadTeacherPanel();
    alert(`Se quitaron ${amount} minecoins de todas las filas`);
};

// --- FUNCION PARA RANDOMIZAR ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// --- PREGUNTAS Y DATOS JUEGOS ---
// (gameQuestions, memoryCards, crucigrama)
const gameQuestions = {
    biosfera: [
        { question: "¿Qué es la biosfera?", options: ["El conjunto de todos los seres vivos del planeta", "Solo los océanos", "Solo la atmósfera", "Solo las plantas"], correct: 0 },
        { question: "¿Qué gas producen las plantas durante la fotosíntesis?", options: ["Oxígeno", "Dióxido de carbono", "Nitrógeno", "Metano"], correct: 0 },
        { question: "¿Cuál es la fuente principal de energía para la biosfera?", options: ["El sol", "El viento", "El agua", "La luna"], correct: 0 },
        { question: "¿Qué capa de la Tierra contiene la biosfera?", options: ["Litosfera", "Hidrosfera", "Atmósfera", "Todas"], correct: 3 },
        { question: "¿Qué organismo es considerado un descomponedor?", options: ["Árbol", "Hongo", "Conejo", "Pez"], correct: 1 },
        { question: "¿Qué ciclo describe el movimiento del agua en la Tierra?", options: ["Ciclo del oxígeno", "Ciclo del agua", "Ciclo del carbono", "Ciclo del nitrógeno"], correct: 1 },
        { question: "¿Cómo se llama el conjunto de organismos de una misma especie en un área?", options: ["Población", "Comunidad", "Ecosistema", "Biosfera"], correct: 0 },
        { question: "¿Cuál es el principal gas de efecto invernadero?", options: ["Oxígeno", "Dióxido de carbono", "Nitrógeno", "Helio"], correct: 1 },
        { question: "¿Qué animales pertenecen al grupo de los consumidores primarios?", options: ["Plantas", "Herbívoros", "Carnívoros", "Descomponedores"], correct: 1 },
        { question: "¿Cuál de estos es un ejemplo de mutualismo?", options: ["Abeja y flor", "León y cebra", "Hongo y árbol muerto", "Lobo y conejo"], correct: 0 }
    ],
    vertebrados: [
        { question: "¿Cuál de estos animales es un mamífero?", options: ["Serpiente", "Delfín", "Águila", "Rana"], correct: 1 },
        { question: "¿Qué característica tienen todos los vertebrados?", options: ["Plumas", "Columna vertebral", "Branquias", "Pelos"], correct: 1 },
        { question: "¿Cuál de estos es un anfibio?", options: ["Lagarto", "Salamandra", "Pez", "Ave"], correct: 1 },
        { question: "¿Cuántas cámaras tiene el corazón de un ave?", options: ["2", "3", "4", "5"], correct: 2 },
        { question: "¿Qué tipo de animal pone huevos con cáscara dura?", options: ["Mamíferos", "Anfibios", "Reptiles", "Peces"], correct: 2 },
        { question: "¿Cuál de estos animales es ovíparo?", options: ["Ballena", "Cebra", "Gallina", "Perro"], correct: 2 },
        { question: "¿Qué animal respira por branquias?", options: ["Gato", "Tiburón", "Águila", "Lobo"], correct: 1 },
        { question: "¿Cuál es el grupo más numeroso de vertebrados?", options: ["Mamíferos", "Aves", "Peces", "Anfibios"], correct: 2 },
        { question: "¿Qué animal es de sangre fría?", options: ["Delfín", "Serpiente", "Humano", "Perro"], correct: 1 },
        { question: "¿Qué grupo tiene plumas?", options: ["Aves", "Reptiles", "Peces", "Anfibios"], correct: 0 }
    ],
    invertebrados: [
        { question: "¿Cuántas patas tiene un insecto?", options: ["4", "6", "8", "10"], correct: 1 },
        { question: "¿Cuál de estos animales es un molusco?", options: ["Araña", "Caracol", "Libélula", "Cangrejo"], correct: 1 },
        { question: "¿Cómo se llama el proceso de cambio de larva a adulto?", options: ["Metamorfosis", "Reproducción", "Digestión", "Respiración"], correct: 0 },
        { question: "¿Cuál es el invertebrado más grande del mundo?", options: ["Pulpo gigante", "Calamar colosal", "Medusa gigante", "Araña Goliat"], correct: 1 },
        { question: "¿Cuántas patas tienen los arácnidos?", options: ["6", "8", "10", "12"], correct: 1 },
        { question: "¿Cuál de estos NO es invertebrado?", options: ["Lombriz", "Mariposa", "Tiburón", "Caracol"], correct: 2 },
        { question: "¿A qué grupo pertenece la medusa?", options: ["Moluscos", "Poríferos", "Cnidarios", "Artrópodos"], correct: 2 },
        { question: "¿Qué animal fabrica seda?", options: ["Araña", "Hormiga", "Escarabajo", "Ciempiés"], correct: 0 },
        { question: "¿Cuál de los siguientes es un crustáceo?", options: ["Cangrejo", "Mariposa", "Araña", "Lombriz"], correct: 0 },
        { question: "¿Cómo se llaman los insectos que pasan por pupa?", options: ["Holometábolos", "Hemimetábolos", "Ametábolos", "Isometábolos"], correct: 0 }
    ],
    plantas: [
        { question: "¿Qué parte de la planta absorbe agua?", options: ["Raíz", "Tallo", "Hoja", "Flor"], correct: 0 },
        { question: "¿Dónde ocurre la fotosíntesis?", options: ["Raíz", "Hoja", "Flor", "Semilla"], correct: 1 },
        { question: "¿Qué transporta el xilema?", options: ["Agua", "Azúcares", "Oxígeno", "CO2"], correct: 0 },
        { question: "¿Qué parte de la flor produce polen?", options: ["Estambre", "Pistilo", "Hoja", "Raíz"], correct: 0 },
        { question: "¿Qué necesitan las plantas para crecer?", options: ["Luz, agua y aire", "Solo agua", "Solo tierra", "Solo aire"], correct: 0 },
        { question: "¿Cómo se llama la pérdida de agua en hojas?", options: ["Fotosíntesis", "Transpiración", "Germinación", "Polinización"], correct: 1 },
        { question: "¿Cuál es el órgano sexual femenino de la flor?", options: ["Estambre", "Pistilo", "Petalo", "Sépalo"], correct: 1 },
        { question: "¿Qué tipo de planta pierde hojas en otoño?", options: ["Perennes", "Caduco", "Sucu", "Epífita"], correct: 1 },
        { question: "¿Qué producen las semillas?", options: ["Nuevas plantas", "Flores", "Frutos", "Raíces"], correct: 0 },
        { question: "¿Qué parte protege la semilla?", options: ["Fruto", "Raíz", "Tallo", "Flor"], correct: 0 }
    ],
    agua: [
        { question: "¿Qué estado del agua es el hielo?", options: ["Sólido", "Líquido", "Gaseoso", "Plasma"], correct: 0 },
        { question: "¿Cómo se llama el cambio de líquido a gas?", options: ["Evaporación", "Condensación", "Sublimación", "Fusión"], correct: 0 },
        { question: "¿Qué ciclo describe el viaje del agua en la naturaleza?", options: ["Ciclo del agua", "Ciclo del oxígeno", "Ciclo del carbono", "Ciclo del nitrógeno"], correct: 0 },
        { question: "¿Cómo se llama el agua subterránea almacenada?", options: ["Acuífero", "Lago", "Río", "Glaciar"], correct: 0 },
        { question: "¿Qué porcentaje del agua en la Tierra es dulce?", options: ["3%", "20%", "50%", "97%"], correct: 0 },
        { question: "¿Qué capa contiene la mayor parte del agua?", options: ["Hidrosfera", "Atmósfera", "Litosfera", "Biosfera"], correct: 0 },
        { question: "¿Qué proceso forma las nubes?", options: ["Condensación", "Evaporación", "Precipitación", "Fusión"], correct: 0 },
        { question: "¿Qué es el deshielo?", options: ["Derretimiento del hielo", "Evaporación del agua", "Congelamiento", "Condensación"], correct: 0 },
        { question: "¿Cómo se llama el agua que cae como lluvia?", options: ["Precipitación", "Condensación", "Filtración", "Evaporación"], correct: 0 },
        { question: "¿La mayor parte del agua dulce está en...?", options: ["Glaciares", "Ríos", "Mares", "Acuíferos"], correct: 0 }
    ],
    energia: [
        { question: "¿Cuál es la fuente primaria de energía en la Tierra?", options: ["El sol", "El viento", "El petróleo", "El carbón"], correct: 0 },
        { question: "La energía eléctrica se transporta por...", options: ["Cables", "Tuberías", "Carreteras", "Redes sociales"], correct: 0 },
        { question: "¿Qué es una energía renovable?", options: ["Inagotable", "Contamina mucho", "Se agota", "No existe"], correct: 0 },
        { question: "¿Cuál NO es energía renovable?", options: ["Solar", "Eólica", "Petróleo", "Hidráulica"], correct: 2 },
        { question: "¿Qué aparato transforma energía eléctrica en luz?", options: ["Bombilla", "Motor", "Batería", "Turbina"], correct: 0 },
        { question: "¿Qué aparato transforma energía eléctrica en movimiento?", options: ["Motor", "Bombilla", "Radiador", "Ventilador"], correct: 0 },
        { question: "¿Cómo se llama la energía almacenada en los alimentos?", options: ["Química", "Luminosa", "Eléctrica", "Térmica"], correct: 0 },
        { question: "¿Qué energía tienen los cuerpos en movimiento?", options: ["Cinética", "Potencial", "Luminosa", "Nuclear"], correct: 0 },
        { question: "¿Qué energía aprovecha las olas del mar?", options: ["Mareomotriz", "Solar", "Eólica", "Geotérmica"], correct: 0 },
        { question: "¿Qué energía se produce con paneles solares?", options: ["Solar", "Eólica", "Mecánica", "Química"], correct: 0 }
    ],
    aire: [
        { question: "¿Cuál es el gas más abundante en el aire?", options: ["Nitrógeno", "Oxígeno", "CO2", "Argón"], correct: 0 },
        { question: "¿Qué gas respiramos los humanos?", options: ["Oxígeno", "Nitrógeno", "CO2", "Ozono"], correct: 0 },
        { question: "¿Cuál es el proceso donde las plantas producen oxígeno?", options: ["Fotosíntesis", "Respiración", "Evaporación", "Condensación"], correct: 0 },
        { question: "¿Dónde ocurre la mayor parte de la vida aérea?", options: ["Troposfera", "Estratosfera", "Mesosfera", "Termosfera"], correct: 0 },
        { question: "¿Qué contaminante proviene de los autos?", options: ["Monóxido de carbono", "Ozono", "Nitrógeno", "Argón"], correct: 0 },
        { question: "¿Qué gas contribuye al efecto invernadero?", options: ["CO2", "Oxígeno", "Nitrógeno", "Helio"], correct: 0 },
        { question: "¿Qué forma la lluvia ácida?", options: ["Contaminantes", "Ozono", "Vapor de agua", "CO2"], correct: 0 },
        { question: "¿Qué instrumento mide la presión del aire?", options: ["Barómetro", "Termómetro", "Anemómetro", "Pluviómetro"], correct: 0 },
        { question: "¿Cómo se llama el movimiento del aire?", options: ["Viento", "Oleaje", "Corriente", "Marea"], correct: 0 },
        { question: "¿Qué capa protege de rayos UV?", options: ["Ozono", "CO2", "Nitrógeno", "Argón"], correct: 0 }
    ],
    suelo: [
        { question: "¿Dónde viven las lombrices?", options: ["Suelo", "Agua", "Aire", "Hojas"], correct: 0 },
        { question: "¿Qué capa de la Tierra cultivamos?", options: ["Superficial", "Profunda", "Núcleo", "Manto"], correct: 0 },
        { question: "¿Cómo se llama la capa fértil del suelo?", options: ["Humus", "Arena", "Roca", "Arcilla"], correct: 0 },
        { question: "¿Qué animal ayuda a airear el suelo?", options: ["Lombriz", "Gato", "Perro", "Ratón"], correct: 0 },
        { question: "¿Qué planta fija nitrógeno?", options: ["Leguminosa", "Cactus", "Pino", "Roble"], correct: 0 },
        { question: "¿Qué es la erosión?", options: ["Desgaste del suelo", "Formación de suelo", "Riego", "Siembra"], correct: 0 },
        { question: "¿Qué es un mineral?", options: ["Sustancia inorgánica", "Planta", "Animal", "Microbio"], correct: 0 },
        { question: "¿Para qué sirve el compost?", options: ["Abonar", "Quemar", "Construir", "Limpiar"], correct: 0 },
        { question: "¿Qué aporta el humus?", options: ["Nutrientes", "Plástico", "Piedras", "Arena"], correct: 0 },
        { question: "¿Qué es la arcilla?", options: ["Tipo de suelo", "Planta", "Animal", "Gas"], correct: 0 }
    ],
    cuerpo: [
        { question: "¿Cuál es el órgano principal de la sangre?", options: ["Corazón", "Cerebro", "Pulmón", "Hígado"], correct: 0 },
        { question: "¿Dónde se realiza la digestión?", options: ["Estómago", "Corazón", "Huesos", "Pulmón"], correct: 0 },
        { question: "¿Qué sistema controla los movimientos?", options: ["Nervioso", "Digestivo", "Respiratorio", "Óseo"], correct: 0 },
        { question: "¿Qué hueso protege el cerebro?", options: ["Cráneo", "Fémur", "Tibia", "Radio"], correct: 0 },
        { question: "¿Cuántos pulmones tiene el ser humano?", options: ["2", "3", "1", "4"], correct: 0 },
        { question: "¿Qué órgano filtra la sangre?", options: ["Riñón", "Pulmón", "Corazón", "Estómago"], correct: 0 },
        { question: "¿Cuál es el hueso más largo?", options: ["Fémur", "Húmero", "Cráneo", "Tibia"], correct: 0 },
        { question: "¿Dónde están los alveolos?", options: ["Pulmones", "Estómago", "Riñón", "Corazón"], correct: 0 },
        { question: "¿Cómo se llama el tubo digestivo?", options: ["Intestino", "Vena", "Arteria", "Alvéolo"], correct: 0 },
        { question: "¿Qué sistema transporta oxígeno?", options: ["Circulatorio", "Digestivo", "Nervioso", "Óseo"], correct: 0 }
    ],
    sentidos: [
        { question: "¿Con qué órgano vemos?", options: ["Ojo", "Oreja", "Nariz", "Mano"], correct: 0 },
        { question: "¿Qué sentido usa la lengua?", options: ["Gusto", "Oído", "Vista", "Tacto"], correct: 0 },
        { question: "¿Cuál es el órgano del olfato?", options: ["Nariz", "Boca", "Oído", "Ojo"], correct: 0 },
        { question: "¿Qué sentido necesita la piel?", options: ["Tacto", "Gusto", "Vista", "Oído"], correct: 0 },
        { question: "¿Qué sentido usamos para escuchar?", options: ["Oído", "Vista", "Tacto", "Gusto"], correct: 0 },
        { question: "¿Dónde están las papilas gustativas?", options: ["Lengua", "Nariz", "Oído", "Ojo"], correct: 0 },
        { question: "¿Qué órgano capta la luz?", options: ["Ojo", "Oído", "Nariz", "Lengua"], correct: 0 },
        { question: "¿Qué sentido capta las temperaturas?", options: ["Tacto", "Oído", "Gusto", "Vista"], correct: 0 },
        { question: "¿Qué órgano tiene tímpano?", options: ["Oído", "Ojo", "Nariz", "Lengua"], correct: 0 },
        { question: "¿Qué sentido ayuda a identificar sabores?", options: ["Gusto", "Oído", "Vista", "Tacto"], correct: 0 }
    ],
    alimentos: [
        { question: "¿Qué alimento es fuente de proteína?", options: ["Carne", "Azúcar", "Aceite", "Sal"], correct: 0 },
        { question: "¿Qué alimento es fuente de energía rápida?", options: ["Azúcar", "Carne", "Agua", "Sal"], correct: 0 },
        { question: "¿Qué mineral aporta la leche?", options: ["Calcio", "Hierro", "Yodo", "Potasio"], correct: 0 },
        { question: "¿Qué alimento es rico en fibra?", options: ["Frutas", "Azúcar", "Sal", "Carne"], correct: 0 },
        { question: "¿Qué vitamina aporta la naranja?", options: ["Vitamina C", "Vitamina A", "Vitamina D", "Vitamina K"], correct: 0 },
        { question: "¿Qué alimento es fuente de hierro?", options: ["Lenteja", "Harina", "Aceite", "Sal"], correct: 0 },
        { question: "¿Qué tipo de alimento es la papa?", options: ["Tubérculo", "Fruta", "Carne", "Lácteo"], correct: 0 },
        { question: "¿Qué alimento es fuente de grasa saludable?", options: ["Aceite de oliva", "Harina", "Azúcar", "Sal"], correct: 0 },
        { question: "¿Qué grupo alimenticio aporta energía principal?", options: ["Carbohidratos", "Vitaminas", "Minerales", "Agua"], correct: 0 },
        { question: "¿Qué mineral previene la anemia?", options: ["Hierro", "Calcio", "Yodo", "Magnesio"], correct: 0 }
    ],
    animales: [
        { question: "¿Qué animal es un mamífero?", options: ["Ballena", "Cocodrilo", "Gallina", "Tortuga"], correct: 0 },
        { question: "¿Qué animal pone huevos?", options: ["Gallina", "Vaca", "Perro", "Gato"], correct: 0 },
        { question: "¿Qué animal es un reptil?", options: ["Serpiente", "Delfín", "Pato", "León"], correct: 0 },
        { question: "¿Qué animal vuela?", options: ["Águila", "Elefante", "Tiburón", "Rana"], correct: 0 },
        { question: "¿Qué animal tiene aletas?", options: ["Tiburón", "Águila", "León", "Caballo"], correct: 0 },
        { question: "¿Qué animal es un insecto?", options: ["Mariposa", "Ratón", "Tortuga", "Pato"], correct: 0 },
        { question: "¿Qué animal vive en el agua?", options: ["Pez", "Perro", "Ave", "Gato"], correct: 0 },
        { question: "¿Qué animal es ovíparo?", options: ["Gallina", "Gato", "Perro", "Humano"], correct: 0 },
        { question: "¿Qué animal es herbívoro?", options: ["Vaca", "León", "Tiburón", "Serpiente"], correct: 0 },
        { question: "¿Qué animal es carnívoro?", options: ["León", "Vaca", "Caballo", "Conejo"], correct: 0 }
    ],
    universo: [
        { question: "¿Cuál es el planeta más cercano al Sol?", options: ["Mercurio", "Venus", "Tierra", "Marte"], correct: 0 },
        { question: "¿Qué estrella está más cerca de la Tierra?", options: ["El Sol", "Sirio", "Proxima Centauri", "Betelgeuse"], correct: 0 },
        { question: "¿Cuántos planetas hay en el sistema solar?", options: ["8", "7", "9", "10"], correct: 0 },
        { question: "¿Qué planeta es conocido como el planeta rojo?", options: ["Marte", "Venus", "Júpiter", "Saturno"], correct: 0 },
        { question: "¿Cómo se llama la galaxia donde vivimos?", options: ["Vía Láctea", "Andrómeda", "Magallanes", "Centauro"], correct: 0 },
        { question: "¿Qué planeta tiene anillos visibles?", options: ["Saturno", "Tierra", "Marte", "Venus"], correct: 0 },
        { question: "¿Cuál es el satélite natural de la Tierra?", options: ["La Luna", "El Sol", "Marte", "Júpiter"], correct: 0 },
        { question: "¿Qué astro da luz y calor a la Tierra?", options: ["El Sol", "La Luna", "Marte", "Venus"], correct: 0 },
        { question: "¿Cuánto tarda la Tierra en dar la vuelta al Sol?", options: ["1 año", "1 mes", "1 semana", "1 día"], correct: 0 },
        { question: "¿Qué planeta es el más grande?", options: ["Júpiter", "Tierra", "Venus", "Saturno"], correct: 0 }
    ],
    materia: [
        { question: "¿En cuántos estados se presenta la materia?", options: ["3", "2", "4", "5"], correct: 0 },
        { question: "¿Cuál NO es un estado de la materia?", options: ["Plástico", "Sólido", "Líquido", "Gaseoso"], correct: 0 },
        { question: "¿Qué estado tiene forma y volumen definidos?", options: ["Sólido", "Líquido", "Gas", "Plasma"], correct: 0 },
        { question: "¿Qué cambio ocurre al derretir hielo?", options: ["Fusión", "Evaporación", "Sublimación", "Condensación"], correct: 0 },
        { question: "¿Qué es una mezcla?", options: ["Combinación de sustancias", "Elemento puro", "Gas", "Átomo"], correct: 0 },
        { question: "¿Qué es un átomo?", options: ["Partícula mínima", "Molécula", "Elemento", "Mezcla"], correct: 0 },
        { question: "¿Qué es un compuesto?", options: ["Dos o más elementos", "Un solo elemento", "Gas", "Sólido"], correct: 0 },
        { question: "¿Qué es evaporación?", options: ["Líquido a gas", "Sólido a gas", "Gas a líquido", "Sólido a líquido"], correct: 0 },
        { question: "¿Qué es condensación?", options: ["Gas a líquido", "Líquido a gas", "Sólido a líquido", "Líquido a sólido"], correct: 0 },
        { question: "¿Qué es una solución?", options: ["Mezcla homogénea", "Mezcla heterogénea", "Elemento", "Compuesto"], correct: 0 }
    ],
    tecnologia: [
        { question: "¿Qué invento permite hablar a distancia?", options: ["Teléfono", "Televisor", "Radio", "Computadora"], correct: 0 },
        { question: "¿Qué aparato sirve para calcular?", options: ["Calculadora", "Lámpara", "Ratón", "Reloj"], correct: 0 },
        { question: "¿Qué aparato proyecta imágenes?", options: ["Proyector", "Ventilador", "Balanza", "Licuadora"], correct: 0 },
        { question: "¿Qué invento revolucionó la escritura?", options: ["Imprenta", "Lámpara", "Bicicleta", "Reloj"], correct: 0 },
        { question: "¿Qué aparato graba sonidos?", options: ["Grabadora", "Televisor", "Termómetro", "Bicicleta"], correct: 0 },
        { question: "¿Qué aparato mide la temperatura?", options: ["Termómetro", "Barómetro", "Microscopio", "Lupa"], correct: 0 },
        { question: "¿Qué aparato permite ver cosas pequeñas?", options: ["Microscopio", "Televisor", "Reloj", "Imán"], correct: 0 },
        { question: "¿Qué aparato sirve para escribir en la computadora?", options: ["Teclado", "Pantalla", "Bocina", "Mouse"], correct: 0 },
        { question: "¿Qué invento permitió volar?", options: ["Avión", "Auto", "Bicicleta", "Tren"], correct: 0 },
        { question: "¿Qué invento sirve para iluminar de noche?", options: ["Lámpara", "Teléfono", "Reloj", "Rueda"], correct: 0 }
    ],
    historia: [
        { question: "¿Quién descubrió América?", options: ["Cristóbal Colón", "Magallanes", "Galileo", "Einstein"], correct: 0 },
        { question: "¿En qué año se firmó la independencia argentina?", options: ["1816", "1810", "1789", "1853"], correct: 0 },
        { question: "¿Quién fue el primer presidente de Argentina?", options: ["Rivadavia", "San Martín", "Sarmiento", "Belgrano"], correct: 0 },
        { question: "¿Qué civilización construyó las pirámides?", options: ["Egipcia", "Griega", "Romana", "China"], correct: 0 },
        { question: "¿Quién inventó la imprenta?", options: ["Gutenberg", "Newton", "Edison", "Tesla"], correct: 0 },
        { question: "¿Qué guerra terminó en 1945?", options: ["Segunda Guerra Mundial", "Primera Guerra Mundial", "Independencia", "Civil"], correct: 0 },
        { question: "¿Qué se celebra el 25 de mayo en Argentina?", options: ["Revolución de Mayo", "Día de la Bandera", "Independencia", "Navidad"], correct: 0 },
        { question: "¿Quién fue el libertador de Perú?", options: ["San Martín", "Bolívar", "Rivadavia", "Belgrano"], correct: 0 },
        { question: "¿Dónde nació el tango?", options: ["Buenos Aires", "Madrid", "Roma", "Londres"], correct: 0 },
        { question: "¿Quién fue María Curie?", options: ["Científica", "Escritora", "Pintora", "Reina"], correct: 0 }
    ],
    salud: [
        { question: "¿Qué fruta es rica en vitamina C?", options: ["Naranja", "Papa", "Manzana", "Tomate"], correct: 0 },
        { question: "¿Por qué es importante lavarse las manos?", options: ["Evita enfermedades", "Da sueño", "Enseña", "Aburre"], correct: 0 },
        { question: "¿Cuántos vasos de agua se recomienda tomar al día?", options: ["8", "2", "1", "15"], correct: 0 },
        { question: "¿Qué es la fiebre?", options: ["Aumento de temperatura", "Dolor de cabeza", "Tos", "Sed"], correct: 0 },
        { question: "¿Qué se usa para curar heridas?", options: ["Agua y jabón", "Tierra", "Aceite", "Sal"], correct: 0 },
        { question: "¿Qué órgano filtra la sangre?", options: ["Riñón", "Pulmón", "Corazón", "Estómago"], correct: 0 },
        { question: "¿Qué es una vacuna?", options: ["Protección contra enfermedades", "Comida", "Ropa", "Juguete"], correct: 0 },
        { question: "¿Por qué hay que dormir bien?", options: ["Recuperar energía", "Comer", "Jugar", "Correr"], correct: 0 },
        { question: "¿Qué ejercicio fortalece el corazón?", options: ["Correr", "Ver TV", "Dormir", "Comer"], correct: 0 },
        { question: "¿Qué previene la higiene dental?", options: ["Caries", "Resfriado", "Fiebre", "Tos"], correct: 0 }
    ],
    reciclaje: [
        { question: "¿Qué color es el tacho para plástico?", options: ["Amarillo", "Verde", "Azul", "Rojo"], correct: 0 },
        { question: "¿Qué material es reciclable?", options: ["Papel", "Comida", "Huesos", "Tierra"], correct: 0 },
        { question: "¿Por qué reciclar?", options: ["Cuidar el ambiente", "Gastar más", "Enfermarse", "Contaminar"], correct: 0 },
        { question: "¿Qué se recicla en el contenedor azul?", options: ["Papel y cartón", "Vidrio", "Comida", "Plástico"], correct: 0 },
        { question: "¿Qué producto NO se puede reciclar?", options: ["Pañal usado", "Botella", "Lata", "Papel"], correct: 0 },
        { question: "¿Qué se hace con el vidrio?", options: ["Reciclar", "Quemar", "Comer", "Romper"], correct: 0 },
        { question: "¿Qué es compostar?", options: ["Hacer abono", "Quemar basura", "Plantar árboles", "Cortar césped"], correct: 0 },
        { question: "¿Qué tipo de residuo es la cáscara de banana?", options: ["Orgánico", "Plástico", "Vidrio", "Metal"], correct: 0 },
        { question: "¿Qué se hace con las pilas usadas?", options: ["Llevar a punto limpio", "Tirar al suelo", "Quemar", "Compostar"], correct: 0 },
        { question: "¿Qué significa reducir?", options: ["Producir menos residuos", "Comprar más", "Tirar más", "Contaminar"], correct: 0 },
        
    ]
};
const memoryCards = [
    { id: 1, name: 'León', type: 'Mamífero', emoji: '🦁' },
    { id: 2, name: 'Águila', type: 'Ave', emoji: '🦅' },
    { id: 3, name: 'Serpiente', type: 'Reptil', emoji: '🐍' },
    { id: 4, name: 'Rana', type: 'Anfibio', emoji: '🐸' },
    { id: 5, name: 'Tiburón', type: 'Pez', emoji: '🦈' },
    { id: 6, name: 'Araña', type: 'Arácnido', emoji: '🕷️' }
];
const crucigrama = {
    words: [
        { word: 'CELULA', clue: 'Unidad básica de la vida', direction: 'horizontal', startRow: 2, startCol: 1 },
        { word: 'ECOSISTEMA', clue: 'Comunidad de seres vivos y su ambiente', direction: 'vertical', startRow: 1, startCol: 3 },
        { word: 'VERTEBRADO', clue: 'Animal con columna vertebral', direction: 'horizontal', startRow: 4, startCol: 2 },
        { word: 'BIOSFERA', clue: 'Conjunto de todos los seres vivos', direction: 'vertical', startRow: 2, startCol: 6 }
    ]
};

// --- JUEGOS ---
window.openGame = function openGame(gameType) {
    if (currentUser === PROFESORA) {
        alert('Los juegos son solo para estudiantes');
        return;
    }
    currentGame = gameType;
    const modal = document.getElementById('gameModal');
    modal.style.display = 'block';
    if (gameQuestions[gameType]) {
        startQuizGame(gameType);
    } else if (gameType === 'memoria') {
        startMemoryGame();
    } else if (gameType === 'crucigrama') {
        startCrucigramaGame();
    } else if (gameType === 'clasificacion') {
        startClasificacionGame();
    } else {
        document.getElementById('gameContent').innerHTML = '<h3>Juego en desarrollo</h3><p>Este juego estará disponible pronto.</p>';
    }
};
window.closeGame = function closeGame() {
    document.getElementById('gameModal').style.display = 'none';
    currentGame = null;
    gameData = null;
};

// --- QUIZ (opciones randomizadas) ---
window.startQuizGame = function startQuizGame(gameType) {
    const originalQuestions = gameQuestions[gameType];
    const questions = originalQuestions.map(q => {
        const optionObjs = q.options.map((opt, idx) => ({ option: opt, origIndex: idx }));
        shuffleArray(optionObjs);
        const newCorrect = optionObjs.findIndex(optObj => optObj.origIndex === q.correct);
        return {
            question: q.question,
            options: optionObjs.map(optObj => optObj.option),
            correct: newCorrect
        };
    });
    gameData = {
        questions: questions,
        currentQuestion: 0,
        score: 0,
        selectedAnswers: []
    };
    showQuestion();
};
window.showQuestion = function showQuestion() {
    const content = document.getElementById('gameContent');
    const question = gameData.questions[gameData.currentQuestion];
    const progress = ((gameData.currentQuestion + 1) / gameData.questions.length) * 100;
    content.innerHTML = `
        <h2>Quiz: ${currentGame.charAt(0).toUpperCase() + currentGame.slice(1)}</h2>
        <div class="game-progress">
            <div>Pregunta ${gameData.currentQuestion + 1} de ${gameData.questions.length}</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <div class="score-display">Puntuación: ${gameData.score}/${gameData.questions.length}</div>
        </div>
        <div class="question">
            <h3>${question.question}</h3>
            <div class="options">
                ${question.options.map((option, index) => 
                    `<div class="option" onclick="selectAnswer(${index})">${option}</div>`
                ).join('')}
            </div>
        </div>
    `;
};
window.selectAnswer = function selectAnswer(selectedIndex) {
    const question = gameData.questions[gameData.currentQuestion];
    const options = document.querySelectorAll('.option');
    options.forEach(option => option.style.pointerEvents = 'none');
    options[question.correct].classList.add('correct');
    if (selectedIndex !== question.correct) {
        options[selectedIndex].classList.add('incorrect');
    } else {
        gameData.score++;
    }
    gameData.selectedAnswers.push(selectedIndex);
    setTimeout(() => {
        gameData.currentQuestion++;
        if (gameData.currentQuestion < gameData.questions.length) {
            showQuestion();
        } else {
            showQuizResults();
        }
    }, 2000);
};
window.showQuizResults = async function showQuizResults() {
    const content = document.getElementById('gameContent');
    const percentage = (gameData.score / gameData.questions.length) * 100;
    let reward = 0;
    if (percentage >= 75) {
        reward = currentGame === 'biosfera' ? 10 : 15;
    } else if (percentage >= 50) {
        reward = Math.floor((currentGame === 'biosfera' ? 10 : 15) * 0.5);
    }
    if (reward > 0) {
        await sumarCoinsAFila(currentUser, reward);
    }
    content.innerHTML = `
        <div class="game-completed">
            <h3>¡Quiz Completado!</h3>
            <div class="score-display">
                Respuestas correctas: ${gameData.score}/${gameData.questions.length}
                <br>
                Porcentaje: ${percentage.toFixed(1)}%
            </div>
            ${reward > 0 ? 
                `<div class="coins-earned">
                    <div class="coin-icon">₿</div>
                    ¡Ganaste ${reward} Minecoins!
                </div>` : 
                '<p>Necesitas al menos 50% para ganar monedas. ¡Inténtalo de nuevo!</p>'
            }
            <button class="btn" onclick="closeGame()" style="margin-top: 20px;">Cerrar</button>
            <button class="btn" onclick="startQuizGame('${currentGame}')" style="margin-top: 20px; margin-left: 10px;">Jugar de Nuevo</button>
        </div>
    `;
};

// --- MEMORIA ---
window.startMemoryGame = function startMemoryGame() {
    const cards = [...memoryCards, ...memoryCards].sort(() => Math.random() - 0.5);
    gameData = {
        cards: cards,
        flippedCards: [],
        matchedPairs: 0,
        moves: 0
    };
    const content = document.getElementById('gameContent');
    content.innerHTML = `
        <h2>Juego de Memoria - Animales</h2>
        <div class="game-progress">
            <div>Movimientos: <span id="moves">0</span></div>
            <div>Parejas encontradas: <span id="pairs">0</span>/6</div>
        </div>
        <div class="memory-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 20px 0;">
            ${cards.map((card, index) => 
                `<div class="memory-card" onclick="flipCard(${index})" data-id="${card.id}">
                    <div class="card-front">?</div>
                    <div class="card-back hidden">${card.emoji}<br><small>${card.name}</small></div>
                </div>`
            ).join('')}
        </div>
    `;
};
window.flipCard = function flipCard(index) {
    if (gameData.flippedCards.length === 2) return;
    const card = document.querySelectorAll('.memory-card')[index];
    if (card.classList.contains('flipped')) return;
    card.classList.add('flipped');
    card.querySelector('.card-front').classList.add('hidden');
    card.querySelector('.card-back').classList.remove('hidden');
    gameData.flippedCards.push(index);
    if (gameData.flippedCards.length === 2) {
        gameData.moves++;
        document.getElementById('moves').textContent = gameData.moves;
        setTimeout(checkMemoryMatch, 1000);
    }
};
window.checkMemoryMatch = function checkMemoryMatch() {
    const [first, second] = gameData.flippedCards;
    const cards = document.querySelectorAll('.memory-card');
    const firstId = gameData.cards[first].id;
    const secondId = gameData.cards[second].id;
    if (firstId === secondId) {
        cards[first].classList.add('matched');
        cards[second].classList.add('matched');
        gameData.matchedPairs++;
        document.getElementById('pairs').textContent = gameData.matchedPairs;
        if (gameData.matchedPairs === 6) {
            setTimeout(showMemoryResults, 500);
        }
    } else {
        cards[first].classList.remove('flipped');
        cards[first].querySelector('.card-front').classList.remove('hidden');
        cards[first].querySelector('.card-back').classList.add('hidden');
        cards[second].classList.remove('flipped');
        cards[second].querySelector('.card-front').classList.remove('hidden');
        cards[second].querySelector('.card-back').classList.add('hidden');
    }
    gameData.flippedCards = [];
};
window.showMemoryResults = async function showMemoryResults() {
    let reward = 12;
    if (gameData.moves <= 15) reward = 15;
    else if (gameData.moves > 25) reward = 8;
    await sumarCoinsAFila(currentUser, reward);
    const content = document.getElementById('gameContent');
    content.innerHTML = `
        <div class="game-completed">
            <h3>¡Memoria Completada!</h3>
            <div class="score-display">
                Completado en ${gameData.moves} movimientos
            </div>
            <div class="coins-earned">
                <div class="coin-icon">₿</div>
                ¡Ganaste ${reward} Minecoins!
            </div>
            <button class="btn" onclick="closeGame()" style="margin-top: 20px;">Cerrar</button>
            <button class="btn" onclick="startMemoryGame()" style="margin-top: 20px; margin-left: 10px;">Jugar de Nuevo</button>
        </div>
    `;
};

// --- CRUCIGRAMA ---
window.startCrucigramaGame = function startCrucigramaGame() {
    const content = document.getElementById('gameContent');
    content.innerHTML = `
        <h2>Crucigrama Científico</h2>
        <div class="crucigrama-container">
            <div class="clues">
                <h4>Pistas:</h4>
                <ol>
                    <li>Unidad básica de la vida (6 letras)</li>
                    <li>Comunidad de seres vivos y su ambiente (10 letras)</li>
                    <li>Animal con columna vertebral (10 letras)</li>
                    <li>Conjunto de todos los seres vivos (8 letras)</li>
                </ol>
            </div>
            <div class="crucigrama-inputs" style="margin: 20px 0;">
                <div class="word-input">
                    <label>1. Horizontal:</label>
                    <input type="text" id="word1" maxlength="6" placeholder="CELULA">
                </div>
                <div class="word-input">
                    <label>2. Vertical:</label>
                    <input type="text" id="word2" maxlength="10" placeholder="ECOSISTEMA">
                </div>
                <div class="word-input">
                    <label>3. Horizontal:</label>
                    <input type="text" id="word3" maxlength="10" placeholder="VERTEBRADO">
                </div>
                <div class="word-input">
                    <label>4. Vertical:</label>
                    <input type="text" id="word4" maxlength="8" placeholder="BIOSFERA">
                </div>
            </div>
            <button class="btn" onclick="checkCrucigrama()">Verificar Respuestas</button>
        </div>
    `;
};
window.checkCrucigrama = async function checkCrucigrama() {
    const answers = {
        word1: 'CELULA',
        word2: 'ECOSISTEMA',
        word3: 'VERTEBRADO',
        word4: 'BIOSFERA'
    };
    let correct = 0;
    Object.keys(answers).forEach(wordId => {
        const input = document.getElementById(wordId);
        if (input.value.toUpperCase() === answers[wordId]) {
            correct++;
            input.style.backgroundColor = '#d4edda';
        } else {
            input.style.backgroundColor = '#f8d7da';
        }
    });
    const reward = Math.floor((correct / 4) * 20);
    if (reward > 0) {
        await sumarCoinsAFila(currentUser, reward);
    }
    setTimeout(() => {
        const content = document.getElementById('gameContent');
        content.innerHTML = `
            <div class="game-completed">
                <h3>Crucigrama Completado</h3>
                <div class="score-display">
                    Respuestas correctas: ${correct}/4
                </div>
                ${reward > 0 ? 
                    `<div class="coins-earned">
                        <div class="coin-icon">₿</div>
                        ¡Ganaste ${reward} Minecoins!
                    </div>` : 
                    '<p>¡Sigue intentando para ganar monedas!</p>'
                }
                <button class="btn" onclick="closeGame()" style="margin-top: 20px;">Cerrar</button>
                <button class="btn" onclick="startCrucigramaGame()" style="margin-top: 20px; margin-left: 10px;">Intentar de Nuevo</button>
            </div>
        `;
    }, 2000);
};

// --- CLASIFICACION ---
window.startClasificacionGame = function startClasificacionGame() {
    const animals = [
        { name: 'León', group: 'Mamíferos', emoji: '🦁' },
        { name: 'Águila', group: 'Aves', emoji: '🦅' },
        { name: 'Serpiente', group: 'Reptiles', emoji: '🐍' },
        { name: 'Rana', group: 'Anfibios', emoji: '🐸' },
        { name: 'Tiburón', group: 'Peces', emoji: '🦈' },
        { name: 'Araña', group: 'Arácnidos', emoji: '🕷️' }
    ];
    gameData = {
        animals: animals.sort(() => Math.random() - 0.5),
        classified: { Mamíferos: [], Aves: [], Reptiles: [], Anfibios: [], Peces: [], Arácnidos: [] }
    };
    const content = document.getElementById('gameContent');
    content.innerHTML = `
        <h2>Clasificación de Animales</h2>
        <p>Arrastra cada animal a su grupo correspondiente:</p>
        <div class="animals-to-classify" style="margin: 20px 0; display: flex; gap: 10px; flex-wrap: wrap;">
            ${animals.map((animal, index) => 
                `<div class="draggable-animal" draggable="true" ondragstart="drag(event)" data-animal="${animal.name}" data-group="${animal.group}">
                    ${animal.emoji} ${animal.name}
                </div>`
            ).join('')}
        </div>
        <div class="classification-groups" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            ${Object.keys(gameData.classified).map(group => 
                `<div class="drop-zone" ondrop="drop(event)" ondragover="allowDrop(event)" data-group="${group}">
                    <h4>${group}</h4>
                    <div class="dropped-animals" id="zone-${group}"></div>
                </div>`
            ).join('')}
        </div>
        <button class="btn" onclick="checkClasificacion()" style="margin-top: 20px;">Verificar Clasificación</button>
    `;
};
window.allowDrop = function allowDrop(ev) { ev.preventDefault(); };
window.drag = function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.dataset.animal);
    ev.dataTransfer.setData("group", ev.target.dataset.group);
};
window.drop = function drop(ev) {
    ev.preventDefault();
    const animalName = ev.dataTransfer.getData("text");
    const correctGroup = ev.dataTransfer.getData("group");
    const dropZone = ev.target.closest('.drop-zone');
    const targetGroup = dropZone.dataset.group;
    const draggedElement = document.querySelector(`[data-animal="${animalName}"]`);
    if (!draggedElement) return;
    const droppedArea = dropZone.querySelector('.dropped-animals');
    if ([...droppedArea.children].some(child => child.dataset.animal === animalName)) return;
    droppedArea.appendChild(draggedElement);
    Object.keys(gameData.classified).forEach(group => {
        gameData.classified[group] = gameData.classified[group].filter(a => a.name !== animalName);
    });
    gameData.classified[targetGroup].push({ name: animalName, correct: correctGroup === targetGroup });
};
window.checkClasificacion = async function checkClasificacion() {
    let correct = 0;
    let total = 0;
    Object.values(gameData.classified).forEach(group => {
        group.forEach(animal => {
            total++;
            if (animal.correct) correct++;
        });
    });
    const percentage = (correct / total) * 100;
    const reward = Math.floor((percentage / 100) * 18);
    if (reward > 0) {
        await sumarCoinsAFila(currentUser, reward);
    }
    const content = document.getElementById('gameContent');
    content.innerHTML = `
        <div class="game-completed">
            <h3>Clasificación Completada</h3>
            <div class="score-display">
                Clasificaciones correctas: ${correct}/${total}
                <br>
                Porcentaje: ${percentage.toFixed(1)}%
            </div>
            ${reward > 0 ? 
                `<div class="coins-earned">
                    <div class="coin-icon">₿</div>
                    ¡Ganaste ${reward} Minecoins!
                </div>` : 
                '<p>¡Mejora tu clasificación para ganar más monedas!</p>'
            }
            <button class="btn" onclick="closeGame()" style="margin-top: 20px;">Cerrar</button>
            <button class="btn" onclick="startClasificacionGame()" style="margin-top: 20px; margin-left: 10px;">Intentar de Nuevo</button>
        </div>
    `;
};