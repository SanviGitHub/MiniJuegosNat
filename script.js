// script.js (Versión con Notificaciones en Tiempo Real)

// --- 1. CONFIGURACIÓN Y MÓDULOS DE FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, onSnapshot, getDocs, collection, deleteField, addDoc, query, where, orderBy, serverTimestamp, limit } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

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


// --- 2. DATOS COMPLETOS DE LOS JUEGOS ---

const GAME_LIST = {
    quizzes: [
        { id: 'biosfera', icon: '🌍', title: 'Quiz de la Biosfera', desc: 'Preguntas sobre ecosistemas y la vida en la Tierra.', reward: 10 },
        { id: 'vertebrados', icon: '🦎', title: 'Quiz de Vertebrados', desc: 'Mamíferos, aves, reptiles, etc.', reward: 10 },
        { id: 'invertebrados', icon: '🐛', title: 'Quiz de Invertebrados', desc: 'Insectos, moluscos y más.', reward: 10 },
        { id: 'plantas', icon: '🌱', title: 'Quiz de Plantas', desc: 'Partes, crecimiento y funciones.', reward: 10 },
        { id: 'agua', icon: '💧', title: 'Quiz del Agua', desc: 'Propiedades y el ciclo del agua.', reward: 10 },
        { id: 'energia', icon: '⚡', title: 'Quiz de Energía', desc: 'Fuentes y tipos de energía.', reward: 10 },
        { id: 'aire', icon: '🌬️', title: 'Quiz del Aire', desc: 'La atmósfera y los gases.', reward: 10 },
        { id: 'suelo', icon: '🌾', title: 'Quiz del Suelo', desc: 'Tipos de suelo y su importancia.', reward: 10 },
        { id: 'cuerpo', icon: '🧍‍♂️', title: 'Quiz del Cuerpo Humano', desc: 'Órganos y sistemas del cuerpo.', reward: 10 },
        { id: 'sentidos', icon: '👀', title: 'Quiz de los Sentidos', desc: 'Los 5 sentidos y sus órganos.', reward: 10 },
        { id: 'alimentos', icon: '🍎', title: 'Quiz de Alimentos', desc: 'Nutrición y tipos de alimentos.', reward: 10 },
        { id: 'animales', icon: '🦁', title: 'Quiz de Animales', desc: 'Animales del mundo.', reward: 10 },
        { id: 'universo', icon: '🌌', title: 'Quiz del Universo', desc: 'Sistema solar y el espacio.', reward: 10 },
        { id: 'materia', icon: '🔬', title: 'Quiz de la Materia', desc: 'Estados y cambios de la materia.', reward: 10 },
        { id: 'tecnologia', icon: '💻', title: 'Quiz de Tecnología', desc: 'Inventos, aparatos y ciencia aplicada.', reward: 10 },
        { id: 'reyLeon', icon: '🦁', title: 'Quiz de El Rey León', desc: 'La biología y los ecosistemas de la sabana.', reward: 10 },
    ],
    geologia: [
        { id: 'capasTierra', icon: '🌎', title: 'Quiz de Capas de la Tierra', desc: 'Conoce la estructura interna de nuestro planeta.', reward: 10 },
        { id: 'volcanes', icon: '🌋', title: 'Quiz de Volcanes y Terremotos', desc: 'Las fuerzas internas de la Tierra.', reward: 10 },
        { id: 'rocasMinerales', icon: '💎', title: 'Quiz de Rocas y Minerales', desc: 'Descubre los componentes de la corteza.', reward: 10 },
        { id: 'fosiles', icon: '🦴', title: 'Quiz de Fósiles', desc: 'Ventanas al pasado prehistórico.', reward: 10 },
    ],
    special: [
        { id: 'memoria', icon: '🧠', title: 'Memory Card', desc: 'Encuentra las parejas de animales.', reward: '8-15' },
        { id: 'crucigrama', icon: '📝', title: 'Crucigrama', desc: 'Desafío de palabras científicas.', reward: 20 },
        { id: 'clasificacion', icon: '🗂️', title: 'Clasificación', desc: 'Arrastra cada animal a su grupo.', reward: 18 },
    ]
};

const gameQuestions = {
    biosfera: [{ question: "¿Qué es la biosfera?", options: ["El conjunto de todos los seres vivos del planeta", "Solo los océanos", "Solo la atmósfera", "Solo las plantas"], correct: 0 }, { question: "¿Qué gas producen las plantas durante la fotosíntesis?", options: ["Oxígeno", "Dióxido de carbono", "Nitrógeno", "Metano"], correct: 0 }, { question: "¿Cuál es la fuente principal de energía para la biosfera?", options: ["El sol", "El viento", "El agua", "La luna"], correct: 0 }, { question: "¿Qué capa de la Tierra contiene la biosfera?", options: ["Litosfera", "Hidrosfera", "Atmósfera", "Todas"], correct: 3 }, { question: "¿Qué organismo es considerado un descomponedor?", options: ["Árbol", "Hongo", "Conejo", "Pez"], correct: 1 }, { question: "¿Qué ciclo describe el movimiento del agua en la Tierra?", options: ["Ciclo del oxígeno", "Ciclo del agua", "Ciclo del carbono", "Ciclo del nitrógeno"], correct: 1 }, { question: "¿Cómo se llama el conjunto de organismos de una misma especie en un área?", options: ["Población", "Comunidad", "Ecosistema", "Biosfera"], correct: 0 }, { question: "¿Cuál es el principal gas de efecto invernadero?", options: ["Oxígeno", "Dióxido de carbono", "Nitrógeno", "Helio"], correct: 1 }, { question: "¿Qué animales pertenecen al grupo de los consumidores primarios?", options: ["Plantas", "Herbívoros", "Carnívoros", "Descomponedores"], correct: 1 }, { question: "¿Cuál de estos es un ejemplo de mutualismo?", options: ["Abeja y flor", "León y cebra", "Hongo y árbol muerto", "Lobo y conejo"], correct: 0 }],
    vertebrados: [{ question: "¿Cuál de estos animales es un mamífero?", options: ["Serpiente", "Delfín", "Águila", "Rana"], correct: 1 }, { question: "¿Qué característica tienen todos los vertebrados?", options: ["Plumas", "Columna vertebral", "Branquias", "Pelos"], correct: 1 }, { question: "¿Cuál de estos es un anfibio?", options: ["Lagarto", "Salamandra", "Pez", "Ave"], correct: 1 }, { question: "¿Cuántas cámaras tiene el corazón de un ave?", options: ["2", "3", "4", "5"], correct: 2 }, { question: "¿Qué tipo de animal pone huevos con cáscara dura?", options: ["Mamíferos", "Anfibios", "Reptiles", "Peces"], correct: 2 }, { question: "¿Cuál de estos animales es ovíparo?", options: ["Ballena", "Cebra", "Gallina", "Perro"], correct: 2 }, { question: "¿Qué animal respira por branquias?", options: ["Gato", "Tiburón", "Águila", "Lobo"], correct: 1 }, { question: "¿Cuál es el grupo más numeroso de vertebrados?", options: ["Mamíferos", "Aves", "Peces", "Anfibios"], correct: 2 }, { question: "¿Qué animal es de sangre fría?", options: ["Delfín", "Serpiente", "Humano", "Perro"], correct: 1 }, { question: "¿Qué grupo tiene plumas?", options: ["Aves", "Reptiles", "Peces", "Anfibios"], correct: 0 }],
    invertebrados: [{ question: "¿Cuántas patas tiene un insecto?", options: ["4", "6", "8", "10"], correct: 1 }, { question: "¿Cuál de estos animales es un molusco?", options: ["Araña", "Caracol", "Libélula", "Cangrejo"], correct: 1 }, { question: "¿Cómo se llama el proceso de cambio de larva a adulto?", options: ["Metamorfosis", "Reproducción", "Digestión", "Respiración"], correct: 0 }, { question: "¿Cuál es el invertebrado más grande del mundo?", options: ["Pulpo gigante", "Calamar colosal", "Medusa gigante", "Araña Goliat"], correct: 1 }, { question: "¿Cuántas patas tienen los arácnidos?", options: ["6", "8", "10", "12"], correct: 1 }, { question: "¿Cuál de estos NO es invertebrado?", options: ["Lombriz", "Mariposa", "Tiburón", "Caracol"], correct: 2 }, { question: "¿A qué grupo pertenece la medusa?", options: ["Moluscos", "Poríferos", "Cnidarios", "Artrópodos"], correct: 2 }, { question: "¿Qué animal fabrica seda?", options: ["Araña", "Hormiga", "Escarabajo", "Ciempiés"], correct: 0 }, { question: "¿Cuál de los siguientes es un crustáceo?", options: ["Cangrejo", "Mariposa", "Araña", "Lombriz"], correct: 0 }, { question: "¿Cómo se llaman los insectos que pasan por pupa?", options: ["Holometábolos", "Hemimetábolos", "Ametábolos", "Isometábolos"], correct: 0 }],
    plantas: [{ question: "¿Qué parte de la planta absorbe agua?", options: ["Raíz", "Tallo", "Hoja", "Flor"], correct: 0 }, { question: "¿Dónde ocurre la fotosíntesis?", options: ["Raíz", "Hoja", "Flor", "Semilla"], correct: 1 }, { question: "¿Qué transporta el xilema?", options: ["Agua", "Azúcares", "Oxígeno", "CO2"], correct: 0 }, { question: "¿Qué parte de la flor produce polen?", options: ["Estambre", "Pistilo", "Hoja", "Raíz"], correct: 0 }, { question: "¿Qué necesitan las plantas para crecer?", options: ["Luz, agua y aire", "Solo agua", "Solo tierra", "Solo aire"], correct: 0 }, { question: "¿Cómo se llama la pérdida de agua en hojas?", options: ["Fotosíntesis", "Transpiración", "Germinación", "Polinización"], correct: 1 }, { question: "¿Cuál es el órgano sexual femenino de la flor?", options: ["Estambre", "Pistilo", "Petalo", "Sépalo"], correct: 1 }, { question: "¿Qué tipo de planta pierde hojas en otoño?", options: ["Perennes", "Caduco", "Sucu", "Epífita"], correct: 1 }, { question: "¿Qué producen las semillas?", options: ["Nuevas plantas", "Flores", "Frutos", "Raíces"], correct: 0 }, { question: "¿Qué parte protege la semilla?", options: ["Fruto", "Raíz", "Tallo", "Flor"], correct: 0 }],
    agua: [{ question: "¿Qué estado del agua es el hielo?", options: ["Sólido", "Líquido", "Gaseoso", "Plasma"], correct: 0 }, { question: "¿Cómo se llama el cambio de líquido a gas?", options: ["Evaporación", "Condensación", "Sublimación", "Fusión"], correct: 0 }, { question: "¿Qué ciclo describe el viaje del agua en la naturaleza?", options: ["Ciclo del agua", "Ciclo del oxígeno", "Ciclo del carbono", "Ciclo del nitrógeno"], correct: 0 }, { question: "¿Cómo se llama el agua subterránea almacenada?", options: ["Acuífero", "Lago", "Río", "Glaciar"], correct: 0 }, { question: "¿Qué porcentaje del agua en la Tierra es dulce?", options: ["3%", "20%", "50%", "97%"], correct: 0 }, { question: "¿Qué capa contiene la mayor parte del agua?", options: ["Hidrosfera", "Atmósfera", "Litosfera", "Biosfera"], correct: 0 }, { question: "¿Qué proceso forma las nubes?", options: ["Condensación", "Evaporación", "Precipitación", "Fusión"], correct: 0 }, { question: "¿Qué es el deshielo?", options: ["Derretimiento del hielo", "Evaporación del agua", "Congelamiento", "Condensación"], correct: 0 }, { question: "¿Cómo se llama el agua que cae como lluvia?", options: ["Precipitación", "Condensación", "Filtración", "Evaporación"], correct: 0 }, { question: "¿La mayor parte del agua dulce está en...?", options: ["Glaciares", "Ríos", "Mares", "Acuíferos"], correct: 0 }],
    energia: [{ question: "¿Cuál es la fuente primaria de energía en la Tierra?", options: ["El sol", "El viento", "El petróleo", "El carbón"], correct: 0 }, { question: "La energía eléctrica se transporta por...", options: ["Cables", "Tuberías", "Carreteras", "Redes sociales"], correct: 0 }, { question: "¿Qué es una energía renovable?", options: ["Inagotable", "Contamina mucho", "Se agota", "No existe"], correct: 0 }, { question: "¿Cuál NO es energía renovable?", options: ["Solar", "Eólica", "Petróleo", "Hidráulica"], correct: 2 }, { question: "¿Qué aparato transforma energía eléctrica en luz?", options: ["Bombilla", "Motor", "Batería", "Turbina"], correct: 0 }, { question: "¿Qué aparato transforma energía eléctrica en movimiento?", options: ["Motor", "Bombilla", "Radiador", "Ventilador"], correct: 0 }, { question: "¿Cómo se llama la energía almacenada en los alimentos?", options: ["Química", "Luminosa", "Eléctrica", "Térmica"], correct: 0 }, { question: "¿Qué energía tienen los cuerpos en movimiento?", options: ["Cinética", "Potencial", "Luminosa", "Nuclear"], correct: 0 }, { question: "¿Qué energía aprovecha las olas del mar?", options: ["Mareomotriz", "Solar", "Eólica", "Geotérmica"], correct: 0 }, { question: "¿Qué energía se produce con paneles solares?", options: ["Solar", "Eólica", "Mecánica", "Química"], correct: 0 }],
    aire: [{ question: "¿Cuál es el gas más abundante en el aire?", options: ["Nitrógeno", "Oxígeno", "CO2", "Argón"], correct: 0 }, { question: "¿Qué gas respiramos los humanos?", options: ["Oxígeno", "Nitrógeno", "CO2", "Ozono"], correct: 0 }, { question: "¿Cuál es el proceso donde las plantas producen oxígeno?", options: ["Fotosíntesis", "Respiración", "Evaporación", "Condensación"], correct: 0 }, { question: "¿Dónde ocurre la mayor parte de la vida aérea?", options: ["Troposfera", "Estratosfera", "Mesosfera", "Termosfera"], correct: 0 }, { question: "¿Qué contaminante proviene de los autos?", options: ["Monóxido de carbono", "Ozono", "Nitrógeno", "Argón"], correct: 0 }, { question: "¿Qué gas contribuye al efecto invernadero?", options: ["CO2", "Oxígeno", "Nitrógeno", "Helio"], correct: 0 }, { question: "¿Qué forma la lluvia ácida?", options: ["Contaminantes", "Ozono", "Vapor de agua", "CO2"], correct: 0 }, { question: "¿Qué instrumento mide la presión del aire?", options: ["Barómetro", "Termómetro", "Anemómetro", "Pluviómetro"], correct: 0 }, { question: "¿Cómo se llama el movimiento del aire?", options: ["Viento", "Oleaje", "Corriente", "Marea"], correct: 0 }, { question: "¿Qué capa protege de rayos UV?", options: ["Ozono", "CO2", "Nitrógeno", "Argón"], correct: 0 }],
    suelo: [{ question: "¿Dónde viven las lombrices?", options: ["Suelo", "Agua", "Aire", "Hojas"], correct: 0 }, { question: "¿Qué capa de la Tierra cultivamos?", options: ["Superficial", "Profunda", "Núcleo", "Manto"], correct: 0 }, { question: "¿Cómo se llama la capa fértil del suelo?", options: ["Humus", "Arena", "Roca", "Arcilla"], correct: 0 }, { question: "¿Qué animal ayuda a airear el suelo?", options: ["Lombriz", "Gato", "Perro", "Ratón"], correct: 0 }, { question: "¿Qué planta fija nitrógeno?", options: ["Leguminosa", "Cactus", "Pino", "Roble"], correct: 0 }, { question: "¿Qué es la erosión?", options: ["Desgaste del suelo", "Formación de suelo", "Riego", "Siembra"], correct: 0 }, { question: "¿Qué es un mineral?", options: ["Sustancia inorgánica", "Planta", "Animal", "Microbio"], correct: 0 }, { question: "¿Para qué sirve el compost?", options: ["Abonar", "Quemar", "Construir", "Limpiar"], correct: 0 }, { question: "¿Qué aporta el humus?", options: ["Nutrientes", "Plástico", "Piedras", "Arena"], correct: 0 }, { question: "¿Qué es la arcilla?", options: ["Tipo de suelo", "Planta", "Animal", "Gas"], correct: 0 }],
    cuerpo: [{ question: "¿Cuál es el órgano principal de la sangre?", options: ["Corazón", "Cerebro", "Pulmón", "Hígado"], correct: 0 }, { question: "¿Dónde se realiza la digestión?", options: ["Estómago", "Corazón", "Huesos", "Pulmón"], correct: 0 }, { question: "¿Qué sistema controla los movimientos?", options: ["Nervioso", "Digestivo", "Respiratorio", "Óseo"], correct: 0 }, { question: "¿Qué hueso protege el cerebro?", options: ["Cráneo", "Fémur", "Tibia", "Radio"], correct: 0 }, { question: "¿Cuántos pulmones tiene el ser humano?", options: ["2", "3", "1", "4"], correct: 0 }, { question: "¿Qué órgano filtra la sangre?", options: ["Riñón", "Pulmón", "Corazón", "Estómago"], correct: 0 }, { question: "¿Cuál es el hueso más largo?", options: ["Fémur", "Húmero", "Cráneo", "Tibia"], correct: 0 }, { question: "¿Dónde están los alveolos?", options: ["Pulmones", "Estómago", "Riñón", "Corazón"], correct: 0 }, { question: "¿Cómo se llama el tubo digestivo?", options: ["Intestino", "Vena", "Arteria", "Alvéolo"], correct: 0 }, { question: "¿Qué sistema transporta oxígeno?", options: ["Circulatorio", "Digestivo", "Nervioso", "Óseo"], correct: 0 }],
    sentidos: [{ question: "¿Con qué órgano vemos?", options: ["Ojo", "Oreja", "Nariz", "Mano"], correct: 0 }, { question: "¿Qué sentido usa la lengua?", options: ["Gusto", "Oído", "Vista", "Tacto"], correct: 0 }, { question: "¿Cuál es el órgano del olfato?", options: ["Nariz", "Boca", "Oído", "Ojo"], correct: 0 }, { question: "¿Qué sentido necesita la piel?", options: ["Tacto", "Gusto", "Vista", "Oído"], correct: 0 }, { question: "¿Qué sentido usamos para escuchar?", options: ["Oído", "Vista", "Tacto", "Gusto"], correct: 0 }, { question: "¿Dónde están las papilas gustativas?", options: ["Lengua", "Nariz", "Oído", "Ojo"], correct: 0 }, { question: "¿Qué órgano capta la luz?", options: ["Ojo", "Oído", "Nariz", "Lengua"], correct: 0 }, { question: "¿Qué sentido capta las temperaturas?", options: ["Tacto", "Oído", "Gusto", "Vista"], correct: 0 }, { question: "¿Qué órgano tiene tímpano?", options: ["Oído", "Ojo", "Nariz", "Lengua"], correct: 0 }, { question: "¿Qué sentido ayuda a identificar sabores?", options: ["Gusto", "Oído", "Vista", "Tacto"], correct: 0 }],
    alimentos: [{ question: "¿Qué alimento es fuente de proteína?", options: ["Carne", "Azúcar", "Aceite", "Sal"], correct: 0 }, { question: "¿Qué alimento es fuente de energía rápida?", options: ["Azúcar", "Carne", "Agua", "Sal"], correct: 0 }, { question: "¿Qué mineral aporta la leche?", options: ["Calcio", "Hierro", "Yodo", "Potasio"], correct: 0 }, { question: "¿Qué alimento es rico en fibra?", options: ["Frutas", "Azúcar", "Sal", "Carne"], correct: 0 }, { question: "¿Qué vitamina aporta la naranja?", options: ["Vitamina C", "Vitamina A", "Vitamina D", "Vitamina K"], correct: 0 }, { question: "¿Qué alimento es fuente de hierro?", options: ["Lenteja", "Harina", "Aceite", "Sal"], correct: 0 }, { question: "¿Qué tipo de alimento es la papa?", options: ["Tubérculo", "Fruta", "Carne", "Lácteo"], correct: 0 }, { question: "¿Qué alimento es fuente de grasa saludable?", options: ["Aceite de oliva", "Harina", "Azúcar", "Sal"], correct: 0 }, { question: "¿Qué grupo alimenticio aporta energía principal?", options: ["Carbohidratos", "Vitaminas", "Minerales", "Agua"], correct: 0 }, { question: "¿Qué mineral previene la anemia?", options: ["Hierro", "Calcio", "Yodo", "Magnesio"], correct: 0 }],
    animales: [{ question: "¿Qué animal es un mamífero?", options: ["Ballena", "Cocodrilo", "Gallina", "Tortuga"], correct: 0 }, { question: "¿Qué animal pone huevos?", options: ["Gallina", "Vaca", "Perro", "Gato"], correct: 0 }, { question: "¿Qué animal es un reptil?", options: ["Serpiente", "Delfín", "Pato", "León"], correct: 0 }, { question: "¿Qué animal vuela?", options: ["Águila", "Elefante", "Tiburón", "Rana"], correct: 0 }, { question: "¿Qué animal tiene aletas?", options: ["Tiburón", "Águila", "León", "Caballo"], correct: 0 }, { question: "¿Qué animal es un insecto?", options: ["Mariposa", "Ratón", "Tortuga", "Pato"], correct: 0 }, { question: "¿Qué animal vive en el agua?", options: ["Pez", "Perro", "Ave", "Gato"], correct: 0 }, { question: "¿Qué animal es ovíparo?", options: ["Gallina", "Gato", "Perro", "Humano"], correct: 0 }, { question: "¿Qué animal es herbívoro?", options: ["Vaca", "León", "Tiburón", "Serpiente"], correct: 0 }, { question: "¿Qué animal es carnívoro?", options: ["León", "Vaca", "Caballo", "Conejo"], correct: 0 }],
    universo: [{ question: "¿Cuál es el planeta más cercano al Sol?", options: ["Mercurio", "Venus", "Tierra", "Marte"], correct: 0 }, { question: "¿Qué estrella está más cerca de la Tierra?", options: ["El Sol", "Sirio", "Proxima Centauri", "Betelgeuse"], correct: 0 }, { question: "¿Cuántos planetas hay en el sistema solar?", options: ["8", "7", "9", "10"], correct: 0 }, { question: "¿Qué planeta es conocido como el planeta rojo?", options: ["Marte", "Venus", "Júpiter", "Saturno"], correct: 0 }, { question: "¿Cómo se llama la galaxia donde vivimos?", options: ["Vía Láctea", "Andrómeda", "Magallanes", "Centauro"], correct: 0 }, { question: "¿Qué planeta tiene anillos visibles?", options: ["Saturno", "Tierra", "Marte", "Venus"], correct: 0 }, { question: "¿Cuál es el satélite natural de la Tierra?", options: ["La Luna", "El Sol", "Marte", "Júpiter"], correct: 0 }, { question: "¿Qué astro da luz y calor a la Tierra?", options: ["El Sol", "La Luna", "Marte", "Venus"], correct: 0 }, { question: "¿Cuánto tarda la Tierra en dar la vuelta al Sol?", options: ["1 año", "1 mes", "1 semana", "1 día"], correct: 0 }, { question: "¿Qué planeta es el más grande?", options: ["Júpiter", "Tierra", "Venus", "Saturno"], correct: 0 }],
    materia: [{ question: "¿En cuántos estados se presenta la materia?", options: ["3", "2", "4", "5"], correct: 0 }, { question: "¿Cuál NO es un estado de la materia?", options: ["Plástico", "Sólido", "Líquido", "Gaseoso"], correct: 0 }, { question: "¿Qué estado tiene forma y volumen definidos?", options: ["Sólido", "Líquido", "Gas", "Plasma"], correct: 0 }, { question: "¿Qué cambio ocurre al derretir hielo?", options: ["Fusión", "Evaporación", "Sublimación", "Condensación"], correct: 0 }, { question: "¿Qué es una mezcla?", options: ["Combinación de sustancias", "Elemento puro", "Gas", "Átomo"], correct: 0 }, { question: "¿Qué es un átomo?", options: ["Partícula mínima", "Molécula", "Elemento", "Mezcla"], correct: 0 }, { question: "¿Qué es un compuesto?", options: ["Dos o más elementos", "Un solo elemento", "Gas", "Sólido"], correct: 0 }, { question: "¿Qué es evaporación?", options: ["Líquido a gas", "Sólido a gas", "Gas a líquido", "Sólido a líquido"], correct: 0 }, { question: "¿Qué es condensación?", options: ["Gas a líquido", "Líquido a gas", "Sólido a líquido", "Líquido a sólido"], correct: 0 }, { question: "¿Qué es una solución?", options: ["Mezcla homogénea", "Mezcla heterogénea", "Elemento", "Compuesto"], correct: 0 }],
    tecnologia: [{ question: "¿Qué invento permite hablar a distancia?", options: ["Teléfono", "Televisor", "Radio", "Computadora"], correct: 0 }, { question: "¿Qué aparato sirve para calcular?", options: ["Calculadora", "Lámpara", "Ratón", "Reloj"], correct: 0 }, { question: "¿Qué aparato proyecta imágenes?", options: ["Proyector", "Ventilador", "Balanza", "Licuadora"], correct: 0 }, { question: "¿Qué invento revolucionó la escritura?", options: ["Imprenta", "Lámpara", "Bicicleta", "Reloj"], correct: 0 }, { question: "¿Qué aparato graba sonidos?", options: ["Grabadora", "Televisor", "Termómetro", "Bicicleta"], correct: 0 }, { question: "¿Qué aparato mide la temperatura?", options: ["Termómetro", "Barómetro", "Microscopio", "Lupa"], correct: 0 }, { question: "¿Qué aparato permite ver cosas pequeñas?", options: ["Microscopio", "Televisor", "Reloj", "Imán"], correct: 0 }, { question: "¿Qué aparato sirve para escribir en la computadora?", options: ["Teclado", "Pantalla", "Bocina", "Mouse"], correct: 0 }, { question: "¿Qué invento permitió volar?", options: ["Avión", "Auto", "Bicicleta", "Tren"], correct: 0 }, { question: "¿Qué invento sirve para iluminar de noche?", options: ["Lámpara", "Teléfono", "Reloj", "Rueda"], correct: 0 }],
    capasTierra: [{ question: "¿Cuál es la capa más externa de la Tierra?", options: ["Corteza", "Manto", "Núcleo", "Atmósfera"], correct: 0 }, { question: "¿Qué capa de la Tierra es líquida y está hecha principalmente de hierro y níquel?", options: ["Núcleo externo", "Núcleo interno", "Manto", "Corteza"], correct: 0 }, { question: "¿Cómo se llama la capa intermedia entre la corteza y el núcleo?", options: ["Manto", "Litosfera", "Astenosfera", "Mesosfera"], correct: 0 }, { question: "La corteza terrestre se divide en dos tipos: continental y...", options: ["Oceánica", "Volcánica", "Sedimentaria", "Ígnea"], correct: 0 }, { question: "¿Cuál es la capa más caliente de la Tierra?", options: ["Núcleo interno", "Núcleo externo", "Manto", "Corteza"], correct: 0 }, { question: "¿Sobre qué capa 'flotan' las placas tectónicas?", options: ["Astenosfera", "Litosfera", "Corteza", "Núcleo"], correct: 0 }, { question: "¿Qué capa forma el campo magnético de la Tierra?", options: ["Núcleo externo", "Corteza", "Manto superior", "Atmósfera"], correct: 1 }, { question: "El núcleo interno de la Tierra es...", options: ["Sólido", "Líquido", "Gaseoso", "Plasma"], correct: 0 }, { question: "La litosfera está compuesta por la corteza y la parte superior del...", options: ["Manto", "Núcleo", "Río", "Océano"], correct: 0 }, { question: "La mayor parte del volumen de la Tierra corresponde al...", options: ["Manto", "Núcleo", "Corteza", "Océanos"], correct: 0 }],
    volcanes: [{ question: "¿Qué es el magma?", options: ["Roca fundida bajo la superficie", "Roca fundida en la superficie", "Ceniza volcánica", "Vapor de agua"], correct: 0 }, { question: "Cuando el magma sale a la superficie, se llama...", options: ["Lava", "Roca", "Piedra", "Mineral"], correct: 0 }, { question: "¿Qué teoría explica el movimiento de las grandes piezas de la corteza terrestre?", options: ["Tectónica de placas", "Relatividad", "Evolución", "Gravitación universal"], correct: 0 }, { question: "Un terremoto es causado por la liberación de energía en la...", options: ["Corteza terrestre", "Atmósfera", "Superficie del sol", "Luna"], correct: 0 }, { question: "¿Cómo se llama el punto en la superficie directamente sobre el foco de un terremoto?", options: ["Epicentro", "Hipocentro", "Falla", "Cráter"], correct: 0 }, { question: "¿Cuál de estos es un tipo de volcán conocido por sus erupciones explosivas?", options: ["Estratovolcán", "En escudo", "Cono de ceniza", "Caldera"], correct: 0 }, { question: "La escala de Richter mide la... de un terremoto.", options: ["Magnitud", "Intensidad", "Profundidad", "Duración"], correct: 0 }, { question: "¿Qué es un tsunami?", options: ["Una ola gigante causada por un terremoto submarino", "Un tipo de tornado", "Una tormenta de arena", "Una erupción volcánica"], correct: 0 }, { question: "El 'Cinturón de Fuego' del Pacífico es una zona con mucha actividad...", options: ["Sísmica y volcánica", "De tornados", "De auroras boreales", "Comercial"], correct: 0 }, { question: "¿Qué sale de un volcán además de lava?", options: ["Cenizas y gases", "Solo agua", "Plantas", "Animales"], correct: 0 }],
    rocasMinerales: [{ question: "¿Cuál de estas es una roca ígnea?", options: ["Granito", "Arenisca", "Mármol", "Caliza"], correct: 0 }, { question: "Las rocas formadas por la acumulación de sedimentos se llaman...", options: ["Sedimentarias", "Ígneas", "Metamórficas", "Preciosas"], correct: 1 }, { question: "El mármol es una roca metamórfica que proviene de la...", options: ["Caliza", "Arenisca", "Granito", "Pizarra"], correct: 0 }, { question: "¿Cuál es el mineral más duro según la escala de Mohs?", options: ["Diamante", "Talco", "Cuarzo", "Oro"], correct: 0 }, { question: "Las rocas que se forman por el enfriamiento del magma o lava son las...", options: ["Ígneas", "Sedimentarias", "Metamórficas", "Fósiles"], correct: 0 }, { question: "La sal común (halita) es un tipo de...", options: ["Mineral", "Roca ígnea", "Roca metamórfica", "Metal"], correct: 0 }, { question: "¿Qué tipo de roca es la arenisca?", options: ["Sedimentaria", "Ígnea", "Metamórfica", "Volcánica"], correct: 0 }, { question: "El proceso que transforma una roca en otra por calor y presión se llama...", options: ["Metamorfismo", "Erosión", "Sedimentación", "Fusión"], correct: 0 }, { question: "El cuarzo es un mineral muy común que se encuentra en...", options: ["La arena de la playa", "Las hojas de los árboles", "El agua del mar", "El aire"], correct: 0 }, { question: "¿Qué es la obsidiana?", options: ["Un vidrio volcánico", "Un tipo de metal", "Un fósil", "Una roca sedimentaria"], correct: 0 }],
    fosiles: [{ question: "¿Qué es un fósil?", options: ["Restos o rastros de organismos pasados", "Un tipo de roca brillante", "Una planta viva muy antigua", "Un animal prehistórico vivo"], correct: 0 }, { question: "La mayoría de los fósiles se encuentran en rocas...", options: ["Sedimentarias", "Ígneas", "Metamórficas", "Volcánicas"], correct: 0 }, { question: "¿Cómo se llama el científico que estudia los fósiles?", options: ["Paleontólogo", "Geólogo", "Biólogo", "Arqueólogo"], correct: 0 }, { question: "¿Qué tipo de fósil es una huella de dinosaurio?", options: ["Icnofósil (fósil traza)", "Fósil corporal", "Fósil químico", "Microfósil"], correct: 0 }, { question: "El ámbar es resina de árbol fosilizada que a veces contiene...", options: ["Insectos atrapados", "Oro", "Agua", "Huesos de dinosaurio"], correct: 0 }, { question: "¿Qué nos enseñan los fósiles?", options: ["Sobre la vida en el pasado", "Cómo predecir el futuro", "Sobre los planetas", "La composición del aire"], correct: 0 }, { question: "La fosilización es un proceso que ocurre...", options: ["Muy raramente", "Todos los días", "Solo en los océanos", "Solo en las montañas"], correct: 0 }, { question: "¿Qué parte de un animal tiene más probabilidades de fosilizarse?", options: ["Los huesos", "La piel", "Los músculos", "El cerebro"], correct: 0 }, { question: "¿Cuál es uno de los fósiles más famosos?", options: ["El Tiranosaurio Rex", "La lombriz de tierra", "El mosquito común", "El helecho"], correct: 0 }, { question: "El proceso de convertir materia orgánica en piedra se llama...", options: ["Petrificación", "Evaporación", "Condensación", "Erosión"], correct: 0 }],
    reyLeon: [
        { question: "En 'El Círculo de la Vida', la presentación de Simba recién nacido celebra principalmente...", options: ["El ciclo de la vida (nacimiento y crecimiento)", "La capacidad de todos los animales para volar", "La construcción de nidos", "La lucha por el territorio"], correct: 0 },
        { question: "Cuando Timón y Pumba le enseñan a Simba a comer insectos, lo introducen en una nueva...", options: ["Cadena alimenticia", "Simbiosis", "Metamorfosis", "Hibernación"], correct: 0 },
        { question: "El cementerio de elefantes, con sus géiseres y falta de vegetación, representa un...", options: ["Ecosistema extremo", "Bosque tropical", "Arrecife de coral", "Pradera templada"], correct: 0 },
        { question: "¿Qué tipo de consumidores son las hienas cuando comen los restos que dejan otros?", options: ["Carroñeros", "Productores", "Herbívoros", "Descomponedores"], correct: 0 },
        { question: "La estampida de los ñus, donde todos corren juntos por pánico, es un ejemplo de comportamiento...", options: ["Colectivo o de manada", "Territorial", "De cortejo", "Depredador"], correct: 1 },
        { question: "La sequía que sufre el reino durante el mandato de Scar demuestra la importancia vital del...", options: ["Agua en un ecosistema", "Fuego para la renovación", "Viento para la polinización", "Sol como fuente de energía"], correct: 0 },
        { question: "La relación donde Zazú sirve de vigía para Mufasa a cambio de protección es un ejemplo de...", options: ["Simbiosis (mutualismo)", "Parasitismo", "Competencia", "Depredación"], correct: 0 },
        { question: "El crecimiento de la melena de Simba al convertirse en adulto es un claro ejemplo de...", options: ["Desarrollo y crecimiento", "Camuflaje", "Regeneración", "Mimetismo"], correct: 0 },
        { question: "Rafiki, al vivir en un árbol baobab y usar sus frutos, muestra cómo un organismo...", options: ["Se adapta a su hábitat", "Migra a otros continentes", "Cambia de color", "Construye presas"], correct: 0 },
        { question: "La aparición del fantasma de Mufasa que impulsa a Simba a volver es un ejemplo de cómo los seres vivos...", options: ["Responden a estímulos", "Realizan la fotosíntesis", "Se reproducen asexualmente", "Mantienen la homeostasis"], correct: 0 }
    ]
};

const memoryCards = [
    { id: 1, name: 'León', type: 'Mamífero', emoji: '🦁' }, { id: 2, name: 'Águila', type: 'Ave', emoji: '🦅' },
    { id: 3, name: 'Serpiente', type: 'Reptil', emoji: '🐍' }, { id: 4, name: 'Rana', type: 'Anfibio', emoji: '🐸' },
    { id: 5, name: 'Tiburón', type: 'Pez', emoji: '🦈' }, { id: 6, name: 'Araña', type: 'Arácnido', emoji: '🕷️' }
];

const crucigramaData = [
    {
        title: 'Conceptos de Biología',
        words: [
            { id: 'word1', word: 'CELULA', clue: 'Unidad básica de la vida (6 letras)' },
            { id: 'word2', word: 'ECOSISTEMA', clue: 'Comunidad de seres vivos y su ambiente (10 letras)' },
            { id: 'word3', word: 'VERTEBRADO', clue: 'Animal con columna vertebral (10 letras)' },
            { id: 'word4', word: 'BIOSFERA', clue: 'Conjunto de todos los seres vivos (8 letras)' }
        ]
    },
    {
        title: 'El Cuerpo Humano',
        words: [
            { id: 'word1', word: 'CORAZON', clue: 'Órgano que bombea la sangre (7 letras)' },
            { id: 'word2', word: 'PULMONES', clue: 'Permiten la respiración (8 letras)' },
            { id: 'word3', word: 'CEREBRO', clue: 'Controla el sistema nervioso (7 letras)' },
            { id: 'word4', word: 'ESQUELETO', clue: 'Conjunto de huesos del cuerpo (9 letras)' }
        ]
    },
    {
        title: 'El Reino Vegetal',
        words: [
            { id: 'word1', word: 'RAIZ', clue: 'Absorbe agua y nutrientes del suelo (4 letras)' },
            { id: 'word2', word: 'FOTOSINTESIS', clue: 'Proceso que convierte luz en energía (12 letras)' },
            { id: 'word3', word: 'CLOROFILA', clue: 'Pigmento verde de las plantas (10 letras)' },
            { id: 'word4', word: 'SEMILLA', clue: 'Da origen a una nueva planta (7 letras)' }
        ]
    },
    {
        title: 'Astronomía',
        words: [
            { id: 'word1', word: 'GALAXIA', clue: 'Conjunto de estrellas, polvo y gas (7 letras)' },
            { id: 'word2', word: 'PLANETA', clue: 'Cuerpo celeste que gira alrededor de una estrella (7 letras)' },
            { id: 'word3', word: 'ORBITA', clue: 'Trayectoria de un astro alrededor de otro (6 letras)' },
            { id: 'word4', word: 'COMETA', clue: 'Cuerpo de hielo y roca con una cola brillante (6 letras)' }
        ]
    },
    {
        title: 'Estados de la Materia',
        words: [
            { id: 'word1', word: 'SOLIDO', clue: 'Estado con forma y volumen definidos (6 letras)' },
            { id: 'word2', word: 'LIQUIDO', clue: 'Se adapta a la forma de su recipiente (7 letras)' },
            { id: 'word3', word: 'GASEOSO', clue: 'No tiene forma ni volumen fijos (7 letras)' },
            { id: 'word4', word: 'FUSION', clue: 'Paso de sólido a líquido (6 letras)' }
        ]
    },
    {
        title: 'Fenómenos Meteorológicos',
        words: [
            { id: 'word1', word: 'LLUVIA', clue: 'Precipitación de agua (6 letras)' },
            { id: 'word2', word: 'VIENTO', clue: 'Movimiento del aire (6 letras)' },
            { id: 'word3', word: 'NUBE', clue: 'Masa de vapor de agua en el cielo (4 letras)' },
            { id: 'word4', word: 'TORNADO', clue: 'Viento que gira a gran velocidad (7 letras)' }
        ]
    }
];

const clasificacionAnimals = [
    { name: 'León', group: 'Mamíferos', emoji: '🦁' }, { name: 'Águila', group: 'Aves', emoji: '🦅' },
    { name: 'Serpiente', group: 'Reptiles', emoji: '🐍' }, { name: 'Rana', group: 'Anfibios', emoji: '🐸' },
    { name: 'Tiburón', group: 'Peces', emoji: '🦈' }, { name: 'Araña', group: 'Arácnidos', emoji: '🕷️' }
];


// --- 3. LÓGICA DE LA APLICACIÓN ---

// --- CONSTANTES Y ESTADO GLOBAL ---
const USERS = {
    "fila 1": "fila", "fila 2": "fila", "fila 3": "fila", "fila 4": "fila",
    "profesoranatu": "2025naturales2025juegos"
};
const FILAS_VALIDAS = ["fila 1", "fila 2", "fila 3", "fila 4"];
const PROFESORA = "profesoranatu";

let appState = {
    currentUser: null,
    currentGameId: null,
    gameData: {},
    unsubscribeSnapshot: null,
    unsubscribeNotifications: null,
    penaltyUntil: 0,
    shownNotificationIds: new Set(),
};

// --- ELEMENTOS DEL DOM ---
const DOMElements = {
    loadingScreen: document.getElementById('loadingScreen'),
    loginScreen: document.getElementById('loginScreen'),
    studentScreen: document.getElementById('studentScreen'),
    teacherScreen: document.getElementById('teacherScreen'),
    usernameInput: document.getElementById('username'),
    passwordInput: document.getElementById('password'),
    loginBtn: document.getElementById('loginBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    currentUserName: document.getElementById('currentUserName'),
    filaBadge: document.getElementById('filaBadge'),
    userCoins: document.getElementById('userCoins'),
    gamesContainer: document.getElementById('gamesContainer'),
    gameModal: document.getElementById('gameModal'),
    gameContent: document.getElementById('gameContent'),
    closeGameBtn: document.getElementById('closeGameBtn'),
    teacherPanel: document.getElementById('teacherPanel'),
    warningModal: document.getElementById('warningModal'),
    closeWarningBtn: document.getElementById('closeWarningBtn'),
    cheatPenaltyScreen: document.getElementById('cheatPenaltyScreen'),
    penaltyTimer: document.getElementById('penaltyTimer'),
    lockedGameModal: document.getElementById('lockedGameModal'),
    closeLockedGameBtn: document.getElementById('closeLockedGameBtn'),
    leaderboardBtns: document.querySelectorAll('#leaderboardBtn'),
    staffBtns: document.querySelectorAll('#staffBtn'),
    leaderboardModal: document.getElementById('leaderboardModal'),
    staffModal: document.getElementById('staffModal'),
    closeLeaderboardBtn: document.getElementById('closeLeaderboardBtn'),
    closeStaffBtn: document.getElementById('closeStaffBtn'),
    leaderboardContent: document.getElementById('leaderboardContent'),
    notificationContainer: document.getElementById('notification-container'),
};

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    renderAllGameCards();
    checkSession();
});

// --- FUNCIÓN DE EVENT LISTENERS ---
function setupEventListeners() {
    DOMElements.loginBtn.addEventListener('click', handleLogin);
    DOMElements.logoutBtn.addEventListener('click', handleLogout);
    DOMElements.closeGameBtn.addEventListener('click', closeGame);
    
    DOMElements.leaderboardBtns.forEach(btn => btn.addEventListener('click', showLeaderboard));
    DOMElements.staffBtns.forEach(btn => btn.addEventListener('click', () => {
        DOMElements.staffModal.style.display = 'block';
    }));

    if (DOMElements.closeLeaderboardBtn) {
        DOMElements.closeLeaderboardBtn.addEventListener('click', () => {
            DOMElements.leaderboardModal.style.display = 'none';
        });
    }
    if (DOMElements.closeStaffBtn) {
        DOMElements.closeStaffBtn.addEventListener('click', () => {
            DOMElements.staffModal.style.display = 'none';
        });
    }
    if (DOMElements.closeWarningBtn) {
        DOMElements.closeWarningBtn.addEventListener('click', () => {
            DOMElements.warningModal.style.display = 'none';
        });
    }
    if (DOMElements.closeLockedGameBtn) {
        DOMElements.closeLockedGameBtn.addEventListener('click', () => {
            DOMElements.lockedGameModal.style.display = 'none';
        });
    }
    
    const handleCheating = () => {
        if (appState.currentGameId && (!appState.penaltyUntil || appState.penaltyUntil < Date.now())) {
            triggerCheatPenalty();
        }
    };
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) handleCheating();
    });
    document.addEventListener('copy', handleCheating);

    DOMElements.gamesContainer.addEventListener('click', (e) => {
        const card = e.target.closest('.game-card');
        if (card && card.dataset.gameId) openGame(card.dataset.gameId);
    });

    DOMElements.teacherPanel.addEventListener('click', handleTeacherPanelClick);

    document.addEventListener('click', e => {
        if (e.target.matches('.btn-restart')) {
            const gameId = appState.currentGameId;
            if (gameId) {
                if (gameQuestions[gameId]) startQuizGame(gameId);
                else if (gameId === 'memoria') startMemoryGame();
                else if (gameId === 'crucigrama') startCrucigramaGame();
                else if (gameId === 'clasificacion') startClasificacionGame();
            }
        }
        if (e.target.matches('.btn-close-results')) {
            closeGame();
        }
    });
}

// --- LÓGICA DE NOTIFICACIONES ---

/**
 * Muestra una notificación en pantalla.
 * @param {string} message - El mensaje a mostrar.
 * @param {string} type - 'info', 'success', o 'danger'.
 */
function showNotification(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `notification-toast toast-${type}`;
    
    toast.innerHTML = `
        <div class="toast-title">Aviso del Administrador</div>
        <div class="toast-message">${message}</div>
    `;

    DOMElements.notificationContainer.appendChild(toast);

    // Muestra la notificación
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    // Oculta y elimina la notificación después de 5 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        toast.addEventListener('transitionend', () => toast.remove());
    }, 5000);
}

/**
 * Envía una notificación a la base de datos de Firestore.
 * @param {string} targetFila - La fila de destino o 'global'.
 * @param {string} message - El mensaje de la notificación.
 * @param {string} type - El tipo de notificación ('info', 'success', 'danger').
 */
async function sendNotification(targetFila, message, type) {
    try {
        await addDoc(collection(db, 'notifications'), {
            targetFila,
            message,
            type,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("Error al enviar notificación: ", error);
    }
}

// --- FIN LÓGICA DE NOTIFICACIONES ---

function startPenaltyCountdown(penaltyEndTime) {
    DOMElements.cheatPenaltyScreen.style.display = 'block';
    
    const timerInterval = setInterval(() => {
        const now = Date.now();
        const timeLeft = Math.round((penaltyEndTime - now) / 1000);

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            DOMElements.cheatPenaltyScreen.style.display = 'none';
            if(appState.currentUser) {
                const userDocRef = doc(db, "filas", appState.currentUser);
                updateDoc(userDocRef, { penaltyUntil: deleteField() });
            }
            return;
        }

        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        DOMElements.penaltyTimer.textContent = `${minutes}m ${seconds}s`;
    }, 1000);
}

async function triggerCheatPenalty() {
    if (appState.penaltyUntil > Date.now() || !appState.currentUser) return;
    
    closeGame();

    const penaltyDuration = 70 * 1000;
    const penaltyEndTime = Date.now() + penaltyDuration;

    const userDocRef = doc(db, "filas", appState.currentUser);
    await updateDoc(userDocRef, { penaltyUntil: penaltyEndTime });
}

// --- SESIÓN Y AUTENTICACIÓN ---
async function handleLogin() {
    const username = DOMElements.usernameInput.value.toLowerCase().trim();
    const password = DOMElements.passwordInput.value;

    if (USERS[username] !== password) {
        alert('Usuario o contraseña incorrectos.');
        return;
    }

    appState.currentUser = username;
    localStorage.setItem('user', username);
    
    updateUIVisibility();

    if (username === PROFESORA) {
        await loadTeacherPanel();
    } else {
        listenToUserData(username);
        // NUEVA LLAMADA PARA CARGAR JUEGOS DINÁMICAMENTE
        listenAndRenderAvailableGames();
    }
}

function handleLogout() {
    if (appState.unsubscribeSnapshot) appState.unsubscribeSnapshot();
    if (appState.unsubscribeNotifications) appState.unsubscribeNotifications();
    if (appState.unsubscribeGames) appState.unsubscribeGames();
    
    appState = {
        currentUser: null,
        currentGameId: null,
        gameData: {},
        unsubscribeSnapshot: null,
        unsubscribeNotifications: null,
        penaltyUntil: 0,
        shownNotificationIds: new Set(),
    };
    
    localStorage.clear();
    sessionStorage.clear();
    
    DOMElements.usernameInput.value = '';
    DOMElements.passwordInput.value = '';
    
    updateUIVisibility();
    
    closeGame();
    
    window.location.href = '/index.html'; 
}

function checkSession() {
    const user = localStorage.getItem('user');
    if (user && USERS[user]) {
        appState.currentUser = user;
        updateUIVisibility();
        if (user === PROFESORA) {
            loadTeacherPanel();
        } else {
            listenToUserData(user);
            // NUEVA LLAMADA PARA CARGAR JUEGOS DINÁMICAMENTE
            listenAndRenderAvailableGames();
        }
    } else {
        DOMElements.loadingScreen.style.display = 'none';
    }
}

function updateUIVisibility() {
    const user = appState.currentUser;
    
    DOMElements.loginScreen.classList.toggle('hidden', !!user);
    DOMElements.logoutBtn.classList.toggle('hidden', !user);
    DOMElements.studentScreen.classList.toggle('hidden', !user || user === PROFESORA);
    DOMElements.teacherScreen.classList.toggle('hidden', user !== PROFESORA);

    if (user && user !== PROFESORA) {
        DOMElements.currentUserName.textContent = user.toUpperCase();
        DOMElements.filaBadge.textContent = user.toUpperCase();
        DOMElements.userCoins.textContent = '0';
        
        setTimeout(() => {
            const userInfoBar = document.getElementById('userInfoBar');
            const gamesContainer = document.getElementById('gamesContainer');
            const minecoinsBar = document.getElementById('minecoinsBar');
            
            if (userInfoBar) userInfoBar.classList.add('fadein-show');
            if (gamesContainer) gamesContainer.classList.add('fadein-show');
            if (minecoinsBar) minecoinsBar.classList.add('fadein-show');
        }, 100);
    }
}

// --- RENDERIZADO DINÁMICO ---
function renderAllGameCards() {
    const createSection = (title, icon, games, isSpecial = false) => `
        <div class="section-title-bar ${isSpecial ? 'special' : ''}">
            <span class="section-title-icon">${icon}</span>
            <span class="section-title-text">${title}</span>
        </div>
        <div class="games-grid">${games.map(createGameCardHTML).join('')}</div>`;
    
    const quizHTML = createSection('Quizzes de Ciencias Naturales', '📝', GAME_LIST.quizzes);
    const geologiaHTML = createSection('Quizzes de Geología', '🌋', GAME_LIST.geologia);
    const specialHTML = createSection('Juegos Especiales', '⭐', GAME_LIST.special, true);
    
    DOMElements.gamesContainer.innerHTML = quizHTML + geologiaHTML + specialHTML;
}


function createGameCardHTML(game) {
    return `
        <div class="game-card" data-game-id="${game.id}">
            <div class="game-icon">${game.icon}</div>
            <div class="game-title">${game.title}</div>
            <div class="game-description">${game.desc}</div>
            <div class="game-reward">Recompensa: ${game.reward} Minecoins</div>
        </div>`;
}

// --- LÓGICA DE JUEGOS ---
async function openGame(gameId) {
    if (appState.penaltyUntil > Date.now()) {
        alert('Estás penalizado. Espera a que termine el contador.');
        return;
    }

    if (appState.currentUser === PROFESORA) return alert('Los juegos son solo para estudiantes.');

    const userDocRef = doc(db, "filas", appState.currentUser);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists() && userDoc.data().completedGames?.[gameId]) {
        DOMElements.lockedGameModal.style.display = 'block';
        return;
    }

    appState.currentGameId = gameId;
    appState.gameData = { isCompleted: false };
    DOMElements.gameModal.style.display = 'block';

    if (gameQuestions[gameId]) startQuizGame(gameId);
    else if (gameId === 'memoria') startMemoryGame();
    else if (gameId === 'crucigrama') startCrucigramaGame();
    else if (gameId === 'clasificacion') startClasificacionGame();
    else DOMElements.gameContent.innerHTML = '<h3>Juego no encontrado</h3>';
}

function closeGame() {
    DOMElements.gameModal.style.display = 'none';
    appState.currentGameId = null;
    appState.gameData = {};
}

// --- Quiz ---
function startQuizGame(gameId) {
    const questions = shuffleArray([...gameQuestions[gameId]]).slice(0, 10);
    appState.gameData = { questions, currentQ: 0, score: 0 };
    showQuizQuestion();
}

function showQuizQuestion() {
    const { questions, currentQ } = appState.gameData;
    const question = questions[currentQ];
    const progress = ((currentQ + 1) / questions.length) * 100;
    
    let options = question.options.map((option, index) => ({ text: option, originalIndex: index }));
    shuffleArray(options);
    const correctNewIndex = options.findIndex(opt => opt.originalIndex === question.correct);

    DOMElements.gameContent.innerHTML = `
        <h2>Quiz: ${appState.currentGameId.charAt(0).toUpperCase() + appState.currentGameId.slice(1)}</h2>
        <div class="game-progress">
            <div>Pregunta ${currentQ + 1} de ${questions.length}</div>
            <div class="progress-bar"><div class="progress-fill" style="width: ${progress}%"></div></div>
        </div>
        <h3>${question.question}</h3>
        <div class="options">${options.map((opt, i) => `<div class="option" data-index="${i}">${opt.text}</div>`).join('')}</div>
    `;
    
    document.querySelectorAll('.option').forEach((opt, i) => {
        opt.addEventListener('click', () => selectAnswer(i, correctNewIndex));
    });
}

async function selectAnswer(selectedIndex, correctIndex) {
    const options = document.querySelectorAll('.option');
    options.forEach(opt => opt.style.pointerEvents = 'none');
    
    if (selectedIndex === correctIndex) {
        appState.gameData.score++;
        options[selectedIndex].classList.add('correct');
    } else {
        options[selectedIndex].classList.add('incorrect');
        options[correctIndex].classList.add('correct');
    }

    setTimeout(() => {
        appState.gameData.currentQ++;
        if (appState.gameData.currentQ < appState.gameData.questions.length) {
            showQuizQuestion();
        } else {
            showQuizResults();
        }
    }, 1500);
}

async function showQuizResults() {
    const { score, questions } = appState.gameData;
    const percentage = (score / questions.length) * 100;
    const gameId = appState.currentGameId;
    const gameInfo = GAME_LIST.quizzes.find(g => g.id === gameId) || GAME_LIST.geologia.find(g => g.id === gameId);
    const baseReward = gameInfo ? gameInfo.reward : 10;
    const reward = Math.floor(percentage / 100 * baseReward);

    if (percentage >= 70) {
        await markGameAsCompleted(gameId);
    }
    if (reward > 0) {
        await updateUserCoins(reward);
    }
    
    DOMElements.gameContent.innerHTML = createResultsHTML(
        '¡Quiz Completado!',
        `Respuestas correctas: ${score}/${questions.length}<br>Porcentaje: ${percentage.toFixed(0)}%`,
        reward,
        percentage < 70
    );
}

// --- Memory Game ---
function startMemoryGame() {
    const cards = shuffleArray([...memoryCards, ...memoryCards]);
    appState.gameData = { cards, flipped: [], matched: 0, moves: 0 };
    
    DOMElements.gameContent.innerHTML = `
        <h2>Juego de Memoria</h2>
        <div class="game-progress">
            <div>Movimientos: <span id="moves">0</span></div>
            <div>Parejas: <span id="pairs">0</span>/${memoryCards.length}</div>
        </div>
        <div class="memory-grid">
            ${cards.map((card, i) => `
                <div class="memory-card" data-index="${i}" data-id="${card.id}">
                    <div class="card-face card-front">?</div>
                    <div class="card-face card-back">${card.emoji}</div>
                </div>`).join('')}
        </div>`;
        
    document.querySelectorAll('.memory-card').forEach(card => card.addEventListener('click', flipCard));
}

function flipCard(e) {
    const card = e.currentTarget;
    const { flipped } = appState.gameData;
    if (card.classList.contains('flipped') || card.classList.contains('matched') || flipped.length === 2) {
        return;
    }

    card.classList.add('flipped');
    flipped.push(card);

    if (flipped.length === 2) {
        appState.gameData.moves++;
        document.getElementById('moves').textContent = appState.gameData.moves;
        setTimeout(checkMemoryMatch, 1000);
    }
}

async function checkMemoryMatch() {
    const { flipped } = appState.gameData;
    const [card1, card2] = flipped;

    if (card1.dataset.id === card2.dataset.id) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        appState.gameData.matched++;
        document.getElementById('pairs').textContent = appState.gameData.matched;
        if (appState.gameData.matched === memoryCards.length) {
            await markGameAsCompleted('memoria');
            showMemoryResults();
        }
    } else {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
    }
    appState.gameData.flipped = [];
}

async function showMemoryResults() {
    const { moves } = appState.gameData;
    let reward = 12;
    if (moves <= 15) reward = 15;
    else if (moves > 25) reward = 8;
    
    await updateUserCoins(reward);
    
    DOMElements.gameContent.innerHTML = createResultsHTML(
        '¡Memoria Completada!',
        `Completado en ${moves} movimientos.`,
        reward
    );
}

// --- Crucigrama ---
function startCrucigramaGame() {
    const chosenCrucigrama = crucigramaData[Math.floor(Math.random() * crucigramaData.length)];
    appState.gameData = { crucigrama: chosenCrucigrama, words: chosenCrucigrama.words };

    DOMElements.gameContent.innerHTML = `
        <h2>Crucigrama: ${chosenCrucigrama.title}</h2>
        <div class="crucigrama-container">
            <div class="clues">
                <h4>Pistas:</h4>
                <ol>${chosenCrucigrama.words.map(w => `<li>${w.clue}</li>`).join('')}</ol>
            </div>
            <div class="crucigrama-inputs">
                ${chosenCrucigrama.words.map((w, index) => `
                    <div class="word-input">
                        <label>${index + 1}. </label>
                        <input type="text" id="${w.id}" maxlength="${w.word.length}" size="${w.word.length}">
                    </div>`).join('')}
            </div>
        </div>
        <button class="btn" id="checkCrucigramaBtn" style="display: block; margin: 20px auto;">Verificar</button>`;
    document.getElementById('checkCrucigramaBtn').addEventListener('click', checkCrucigrama);
}

async function checkCrucigrama() {
    let correctCount = 0;
    const { words } = appState.gameData.crucigrama;

    words.forEach(wordData => {
        const input = document.getElementById(wordData.id);
        if (input && input.value.toUpperCase() === wordData.word) {
            correctCount++;
            input.style.backgroundColor = 'var(--color-success-glow)';
            input.style.color = 'black';
        } else if (input) {
            input.style.backgroundColor = 'var(--color-danger-glow)';
        }
    });

    const reward = Math.floor((correctCount / words.length) * 20);
    if (correctCount === words.length) {
        await markGameAsCompleted('crucigrama');
    }
    if (reward > 0) {
        await updateUserCoins(reward);
    }

    DOMElements.gameContent.innerHTML = createResultsHTML(
        'Crucigrama Verificado',
        `Respuestas correctas: ${correctCount}/${words.length}`,
        reward,
        correctCount !== words.length
    );
}

// --- Clasificación ---
function startClasificacionGame() {
    const animals = shuffleArray([...clasificacionAnimals]);
    const groups = [...new Set(animals.map(a => a.group))].sort();
    
    DOMElements.gameContent.innerHTML = `
        <h2>Clasificación de Animales</h2>
        <p>Arrastra cada animal a su grupo:</p>
        <div id="animalsToClassify" class="animals-to-classify">
            ${animals.map(a => `<div class="draggable-animal" draggable="true" data-name="${a.name}">${a.emoji} ${a.name}</div>`).join('')}
        </div>
        <div class="classification-groups">
            ${groups.map(g => `<div class="drop-zone" data-group="${g}"><h4>${g}</h4></div>`).join('')}
        </div>
        <button class="btn" id="checkClasificacionBtn" style="display: block; margin: 20px auto;">Verificar</button>`;
        
    setupDragAndDrop();
    document.getElementById('checkClasificacionBtn').addEventListener('click', checkClasificacion);
}

function setupDragAndDrop() {
    const draggables = document.querySelectorAll('.draggable-animal');
    const dropZones = document.querySelectorAll('.drop-zone');

    draggables.forEach(d => {
        d.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', e.target.dataset.name);
            setTimeout(() => e.target.classList.add('dragging'), 0);
        });
        d.addEventListener('dragend', e => e.target.classList.remove('dragging'));
    });

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', e => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });
        zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
        zone.addEventListener('drop', e => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            const animalName = e.dataTransfer.getData('text/plain');
            const draggedEl = document.querySelector(`.draggable-animal[data-name="${animalName}"]`);
            if (draggedEl) zone.appendChild(draggedEl);
        });
    });
}

async function checkClasificacion() {
    let correctCount = 0;
    const total = clasificacionAnimals.length;
    
    document.querySelectorAll('.drop-zone').forEach(zone => {
        const group = zone.dataset.group;
        zone.querySelectorAll('.draggable-animal').forEach(animalEl => {
            const animal = clasificacionAnimals.find(a => a.name === animalEl.dataset.name);
            if (animal && animal.group === group) {
                correctCount++;
                animalEl.style.backgroundColor = 'var(--color-success-glow)';
                animalEl.style.color = 'black';
            } else {
                animalEl.style.backgroundColor = 'var(--color-danger-glow)';
            }
        });
    });

    const reward = Math.floor((correctCount / total) * 18);
    if (correctCount === total) {
        await markGameAsCompleted('clasificacion');
    }
    if (reward > 0) {
        await updateUserCoins(reward);
    }

    DOMElements.gameContent.innerHTML = createResultsHTML(
        'Clasificación Verificada',
        `Clasificaciones correctas: ${correctCount}/${total}`,
        reward,
        correctCount !== total
    );
}


async function markGameAsCompleted(gameId) {
    const user = appState.currentUser;
    if (!user || (appState.gameData && appState.gameData.isCompleted)) return;

    if(appState.gameData) appState.gameData.isCompleted = true;
    
    const userDocRef = doc(db, "filas", user);
    try {
        await updateDoc(userDocRef, {
            [`completedGames.${gameId}`]: true
        });
    } catch (e) {
        await setDoc(userDocRef, { completedGames: { [gameId]: true } }, { merge: true });
    }
}


// --- PANEL DE PROFESORA ---
async function handleTeacherPanelClick(e) {
    const target = e.target;
    const fila = target.dataset.fila;

    if (!fila && !target.matches('#addCoinsToAllBtn, #removeCoinsFromAllBtn, .btn-reset-game, .btn-penalize, .btn-remove-penalty')) return;

    const userDocRef = fila ? doc(db, "filas", fila) : null;

    if (target.matches('.btn-add, .btn-remove')) {
        const amountInput = document.getElementById(`coins-${fila}`);
        const amount = parseInt(amountInput.value);
        if (!amount || amount <= 0) return alert('Ingresa una cantidad válida.');
        
        const operation = target.matches('.btn-add') ? amount : -amount;
        await updateUserCoins(operation, fila);
        
        const notifMsg = `Te han ${operation > 0 ? 'agregado' : 'quitado'} <strong>${Math.abs(operation)}</strong> minecoins.`;
        const notifType = operation > 0 ? 'success' : 'danger';
        await sendNotification(fila, notifMsg, notifType);

        amountInput.value = '';

    } else if (target.matches('#addCoinsToAllBtn, #removeCoinsFromAllBtn')) {
        const amountInput = document.getElementById('globalCoins');
        const amount = parseInt(amountInput.value);
        if (!amount || amount <= 0) return alert('Ingresa una cantidad válida.');
        
        const operation = target.id === 'addCoinsToAllBtn' ? amount : -amount;
        const promises = FILAS_VALIDAS.map(f => updateUserCoins(operation, f));
        await Promise.all(promises);
        
        const notifMsg = `Se han ${operation > 0 ? 'otorgado' : 'quitado'} globalmente <strong>${Math.abs(operation)}</strong> minecoins.`;
        await sendNotification('global', notifMsg, 'info');

        amountInput.value = '';

    } else if (target.matches('.btn-reset-game')) {
        const gameId = target.dataset.gameId;
        const allGames = [...GAME_LIST.quizzes, ...GAME_LIST.geologia, ...GAME_LIST.special];
        const gameInfo = allGames.find(g => g.id === gameId);
        const gameTitle = gameInfo ? gameInfo.title : gameId;
        
        if (userDocRef && gameId) {
            await updateDoc(userDocRef, { [`completedGames.${gameId}`]: deleteField() });
            await sendNotification(fila, `Ya puedes volver a jugar a <strong>${gameTitle}</strong>.`, 'info');
        }

    } else if (target.matches('.btn-penalize')) {
        const penaltyEndTime = Date.now() + 70 * 1000;
        if (userDocRef) {
            await updateDoc(userDocRef, { penaltyUntil: penaltyEndTime });
            await sendNotification(fila, 'Has sido penalizado. Habla con el staff para más detalles.', 'danger');
        }

    } else if (target.matches('.btn-remove-penalty')) {
        if (userDocRef) {
            await updateDoc(userDocRef, { penaltyUntil: deleteField() });
            await sendNotification(fila, 'Se ha levantado tu penalización. ¡Vuelves a estar en juego!', 'success');
        }
    }

    loadTeacherPanel();
}

async function loadTeacherPanel() {
    const filasRef = collection(db, "filas");
    const snapshot = await getDocs(filasRef);
    let filasData = {};
    snapshot.forEach(doc => filasData[doc.id] = doc.data());

    const managementDiv = document.getElementById('filasManagement');
    if (!managementDiv) return;

    managementDiv.innerHTML = FILAS_VALIDAS.map(fila => {
        const data = filasData[fila] || {};
        const coins = data.coins || 0;
        const completedGames = data.completedGames || {};
        const penaltyEndTime = data.penaltyUntil || 0;
        const isPenaltyActive = penaltyEndTime > Date.now();

        const allGames = [...GAME_LIST.quizzes, ...GAME_LIST.geologia, ...GAME_LIST.special];
        const completedGamesHTML = Object.entries(completedGames)
            .filter(([_, isCompleted]) => isCompleted)
            .map(([gameId]) => {
                const gameInfo = allGames.find(g => g.id === gameId);
                const gameTitle = gameInfo ? gameInfo.title : gameId;
                return `
                <div class="completed-game-item" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <span>${gameTitle}</span>
                    <button class="btn-teacher btn-reset-game" data-fila="${fila}" data-game-id="${gameId}">Reset</button>
                </div>`;
            }).join('');

        const penaltyControlHTML = isPenaltyActive
            ? `<button class="btn-teacher btn-remove-penalty" data-fila="${fila}">Quitar Castigo</button>`
            : `<button class="btn-teacher btn-penalize" data-fila="${fila}">Penalizar</button>`;

        return `
            <div class="fila-row">
                <div class="fila-info">
                    <h4>${fila.toUpperCase()}</h4>
                    <div class="fila-coins">💰 ${coins} Minecoins</div>
                </div>
                <div class="fila-controls">
                    <input type="number" id="coins-${fila}" placeholder="Cant." min="1">
                    <button class="btn btn-success btn-add" data-fila="${fila}">+ Dar</button>
                    <button class="btn btn-danger btn-remove" data-fila="${fila}">- Quitar</button>
                </div>
                <div class="teacher-actions-grid">
                    <div class="completed-games-list">
                        <h5>Juegos Completados:</h5>
                        ${completedGamesHTML || '<small>Ninguno</small>'}
                    </div>
                    <div class="penalty-controls">
                        <h5>Gestión de Penalización:</h5>
                        ${penaltyControlHTML}
                        ${isPenaltyActive ? `<small style="display: block; margin-top: 5px;">Activo hasta: ${new Date(penaltyEndTime).toLocaleTimeString()}</small>` : ''}
                    </div>
                </div>
            </div>`;
    }).join('');
    await renderGameAvailabilityPanel();
}

// --- NUEVA FUNCIÓN AÑADIDA AL SCRIPT ---
async function renderGameAvailabilityPanel() {
    const container = document.getElementById('gameAvailabilityManagement');
    if (!container) return;

    const gameAvailabilityRef = doc(db, "settings", "gameAvailability");
    const docSnap = await getDoc(gameAvailabilityRef);
    const availabilityData = docSnap.exists() ? docSnap.data() : {};

    // Unir todos los juegos en una sola lista para facilitar la iteración
    const allGames = [...GAME_LIST.quizzes, ...GAME_LIST.geologia, ...GAME_LIST.special];

    container.innerHTML = allGames.map(game => {
        const isEnabled = availabilityData[game.id] !== false; // Un juego está habilitado por defecto
        return `
            <div class="game-availability-row">
                <span>${game.icon} ${game.title}</span>
                <label class="switch">
                    <input type="checkbox" data-game-id="${game.id}" ${isEnabled ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
            </div>
        `;
    }).join('');

    // Añadir event listeners a los switches
    container.querySelectorAll('.switch input').forEach(toggle => {
        toggle.addEventListener('change', async (e) => {
            const gameId = e.target.dataset.gameId;
            const isEnabled = e.target.checked;
            
            try {
                await setDoc(gameAvailabilityRef, { [gameId]: isEnabled }, { merge: true });
                // Notificación opcional para la profesora
                showNotification(`'${gameId}' ha sido ${isEnabled ? 'habilitado' : 'deshabilitado'}.`, 'info');
            } catch (error) {
                console.error("Error al actualizar la disponibilidad del juego:", error);
                showNotification('Error al guardar el cambio.', 'danger');
            }
        });
    });
}

// --- FUNCIONES DE UTILIDAD ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createResultsHTML(title, scoreText, reward, allowRestart = true) {
    return `
        <div class="game-completed">
            <h3>${title}</h3>
            <div class="score-display">${scoreText}</div>
            ${reward > 0 ? `
                <div class="coins-earned" style="font-size: 1.5em; color: var(--color-warning-glow); margin: 20px 0;">
                    <div class="coin-icon" style="display: inline-block;">₿</div>
                    ¡Ganaste ${reward} Minecoins!
                </div>` : '<p>¡Sigue intentando para ganar monedas!</p>'
            }
            <div class="results-buttons">
                ${allowRestart ? '<button class="btn btn-restart">Jugar de Nuevo</button>' : ''}
                <button class="btn btn-close-results">Cerrar</button>
            </div>
        </div>`;
}

// --- INTERACCIÓN CON FIREBASE ---
async function getUserCoins(fila) {
    const ref = doc(db, "filas", fila);
    const snap = await getDoc(ref);
    if (snap.exists() && typeof snap.data().coins !== 'undefined') {
        return Number(snap.data().coins);
    }
    await setDoc(ref, { coins: 0 }, { merge: true });
    return 0;
}

async function updateUserCoins(amount, fila = null) {
    const targetFila = fila || appState.currentUser;
    if (!targetFila) return;
    const currentCoins = await getUserCoins(targetFila);
    const newCoins = Math.max(0, currentCoins + amount);
    const ref = doc(db, "filas", targetFila);
    await setDoc(ref, { coins: newCoins }, { merge: true });
}

function listenToUserData(fila) {
    if (appState.unsubscribeSnapshot) appState.unsubscribeSnapshot();
    const userDocRef = doc(db, "filas", fila);
    appState.unsubscribeSnapshot = onSnapshot(userDocRef, (snap) => {
        if (!snap.exists()) { 
            setDoc(userDocRef, { coins: 0, completedGames: {} });
            return;
        }
        const data = snap.data();
        
        DOMElements.userCoins.textContent = data.coins ? Number(data.coins) : 0;

        const completedGames = data.completedGames || {};
        document.querySelectorAll('.game-card').forEach(card => {
            const gameId = card.dataset.gameId;
            const isCompleted = completedGames[gameId] === true;
            card.classList.toggle('completed', isCompleted);
            const rewardEl = card.querySelector('.game-reward');
            if (isCompleted && rewardEl) {
                rewardEl.textContent = "COMPLETADO";
            }
        });
        
        const penaltyEndTime = data.penaltyUntil || 0;
        appState.penaltyUntil = penaltyEndTime;

        if (penaltyEndTime > Date.now()) {
            startPenaltyCountdown(penaltyEndTime);
        } else {
            DOMElements.cheatPenaltyScreen.style.display = 'none';
        }
    });

    // --- LÓGICA DE NOTIFICACIONES EN TIEMPO REAL ---
    if (appState.unsubscribeNotifications) appState.unsubscribeNotifications();

    const q = query(
        collection(db, "notifications"),
        where("targetFila", "in", [appState.currentUser, "global"]),
        orderBy("timestamp", "desc"),
        limit(10)
    );

appState.unsubscribeNotifications = onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
        // Solo reaccionar a notificaciones nuevas que no hayamos mostrado ya
        if (change.type === "added" && !appState.shownNotificationIds.has(change.doc.id)) {
            const notification = change.doc.data();
            
            // SE HA ELIMINADO LA CONDICIÓN DE TIEMPO DE 60 SEGUNDOS
            // para que cualquier notificación nueva desde que se inició la escucha, aparezca.
            showNotification(notification.message, notification.type);
            
            appState.shownNotificationIds.add(change.doc.id);
        }
    });
});
}


async function showLeaderboard() {
    const leaderboardContent = document.getElementById('leaderboardContent');
    if (!leaderboardContent) return;
    
    leaderboardContent.innerHTML = '<p style="text-align:center;">Cargando puntajes...</p>';
    DOMElements.leaderboardModal.style.display = 'block';

    try {
        const filasRef = collection(db, "filas");
        const q = query(filasRef, where("coins", ">", -1)); // Filtro para asegurar que el campo exista
        const snapshot = await getDocs(q);
        let filasData = [];

        snapshot.forEach(doc => {
            if (FILAS_VALIDAS.includes(doc.id)) {
                filasData.push({
                    name: doc.id.toUpperCase(),
                    coins: doc.data().coins || 0
                });
            }
        });

        filasData.sort((a, b) => b.coins - a.coins);

        const medals = ['🥇', '🥈', '🥉'];
        const listHTML = filasData.map((fila, index) => `
            <li>
                <span class="rank">${medals[index] || `<strong>#${index + 1}</strong>`}</span>
                <span class="name">${fila.name}</span>
                <span class="coins">₿ ${fila.coins}</span>
            </li>
        `).join('');

        if (filasData.length > 0) {
            leaderboardContent.innerHTML = `<ol>${listHTML}</ol>`;
        } else {
            leaderboardContent.innerHTML = '<p style="text-align:center;">Aún no hay puntajes para mostrar.</p>';
        }
    } catch (error) {
        console.error("Error al cargar el leaderboard: ", error);
        leaderboardContent.innerHTML = '<p style="text-align:center; color: var(--color-danger-glow);">No se pudieron cargar los puntajes.</p>';
    }
}
// --- NUEVA FUNCIÓN AÑADIDA AL SCRIPT ---

// Almacena el listener para poder cerrarlo al hacer logout
appState.unsubscribeGames = null;

async function listenAndRenderAvailableGames() {
    const gameAvailabilityRef = doc(db, "settings", "gameAvailability");

    // Si ya hay un listener, lo cerramos para evitar duplicados
    if (appState.unsubscribeGames) {
        appState.unsubscribeGames();
    }

    appState.unsubscribeGames = onSnapshot(gameAvailabilityRef, (docSnap) => {
        const availableGames = docSnap.exists() ? docSnap.data() : {};

        // Filtrar cada categoría de juegos
        const filteredQuizzes = GAME_LIST.quizzes.filter(game => availableGames[game.id] !== false); // true o undefined
        const filteredGeologia = GAME_LIST.geologia.filter(game => availableGames[game.id] !== false);
        const filteredSpecial = GAME_LIST.special.filter(game => availableGames[game.id] !== false);

        // Renderizar solo los juegos filtrados
        const quizHTML = filteredQuizzes.length > 0 ? createSection('Quizzes de Ciencias Naturales', '📝', filteredQuizzes) : '';
        const geologiaHTML = filteredGeologia.length > 0 ? createSection('Quizzes de Geología', '🌋', filteredGeologia) : '';
        const specialHTML = filteredSpecial.length > 0 ? createSection('Juegos Especiales', '⭐', filteredSpecial, true) : '';

        DOMElements.gamesContainer.innerHTML = quizHTML + geologiaHTML + specialHTML;
    });
}

// Helper function para crear las secciones de juegos (ya existía una parecida, la refactorizamos)
function createSection(title, icon, games, isSpecial = false) {
    return `
        <div class="section-title-bar ${isSpecial ? 'special' : ''}">
            <span class="section-title-icon">${icon}</span>
            <span class="section-title-text">${title}</span>
        </div>
        <div class="games-grid">${games.map(createGameCardHTML).join('')}</div>`;
}

// No es necesario modificar renderAllGameCards, ya que ahora usamos listenAndRenderAvailableGames