// unified-api-server.js
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const readline = require('readline');

const app = express();
const PORT = 4000;

// ——— Respuestas de datos ———

// Respuesta de transcripción
const transcriptionResponse = {
  segments: [
    { id: 1, start: "00:00:00,000", end: "00:00:03,500", speaker: "Juan Pérez", text: "Buenos días, mi nombre es Juan Pérez y soy el fiscal del caso." },
    { id: 2, start: "00:00:03,500", end: "00:00:07,200", speaker: "María González", text: "Muchas gracias, fiscal. Soy María González, defensora pública." },
    { id: 3, start: "00:00:07,200", end: "00:00:12,800", speaker: "Juan Pérez", text: "Procederemos con la presentación de las evidencias del caso número 2024-001." },
    { id: 4, start: "00:00:12,800", end: "00:00:16,500", speaker: "María González", text: "Entendido, fiscal. La defensa está lista para proceder." },
    { id: 5, start: "00:00:16,500", end: "00:00:22,300", speaker: "Juez Martinez", text: "Muy bien. Procedamos con la primera evidencia. Fiscal Pérez, tiene la palabra." },
    { id: 6, start: "00:00:22,300", end: "00:00:28,100", speaker: "Juan Pérez", text: "Gracias, su señoría. Presentamos como evidencia A el documento encontrado en la escena." },
    { id: 7, start: "00:00:28,100", end: "00:00:33,800", speaker: "María González", text: "Objección, su señoría. No se ha establecido la cadena de custodia de dicho documento." },
    { id: 8, start: "00:00:33,800", end: "00:00:37,500", speaker: "Juez Martinez", text: "Objección sostenida. Fiscal, debe establecer la cadena de custodia." },
    { id: 9, start: "00:00:37,500", end: "00:00:43,200", speaker: "Juan Pérez", text: "Por supuesto, su señoría. Llamamos al detective Rodriguez como testigo." },
    { id: 10, start: "00:00:43,200", end: "00:00:48,900", speaker: "Detective Rodriguez", text: "Buenos días. Soy el detective Rodriguez, badge número 1247." },
    { id: 11, start: "00:00:48,900", end: "00:00:55,600", speaker: "Juan Pérez", text: "Detective, ¿puede describir cómo encontró y procesó el documento en cuestión?" },
    { id: 12, start: "00:00:55,600", end: "00:01:02,300", speaker: "Detective Rodriguez", text: "El documento fue encontrado a las 14:30 horas del 15 de marzo, en la mesa del despacho." },
    { id: 13, start: "00:01:02,300", end: "00:01:08,100", speaker: "María González", text: "Detective, ¿había otras personas presentes cuando encontró el documento?" },
    { id: 14, start: "00:01:08,100", end: "00:01:14,800", speaker: "Detective Rodriguez", text: "Sí, mi compañero detective Smith y el fotógrafo forense estaban presentes." },
    { id: 15, start: "00:01:14,800", end: "00:01:20,500", speaker: "Juez Martinez", text: "¿El documento fue fotografiado in situ antes de ser removido?" },
    { id: 16, start: "00:01:20,500", end: "00:01:26,200", speaker: "Detective Rodriguez", text: "Correcto, su señoría. Tenemos fotografías completas de la escena." }
  ]
};

// Respuesta de resumen
const summarizeResponse = {
  summary: "### Resumen Final de la Audiencia Judicial\n\nLa sesión del tribunal se centró en actualizaciones procedimentales y gestión de testigos para un juicio en curso que involucra a Brenda Elizabeth Uliarte. La audiencia abordó varios aspectos clave:\n\n#### Fases Principales de la Audiencia\n1. **Gestión de Testigos**: Se desistió de 106 testigos el 26 de diciembre de 2024 y otros 62 el 27 de diciembre de 2024. Queda pendiente una decisión sobre la incorporación por lectura de declaraciones de 28 testigos solicitados por la fiscalía.\n\n2. **Actualizaciones del Peritaje**: El peritaje para un teléfono (identificado como \"teléfono 01\") se pospuso del 4 de febrero al 13 de marzo de 2025 debido a una falla eléctrica en las instalaciones de la Gendarmería Nacional Argentina.\n\n3. **Evaluación Médica**: Se programó una evaluación psicológica y psiquiátrica para Uliarte el 24 de febrero de 2025, con posibilidad de que las partes designen expertos adicionales si es necesario.\n\n4. **Procedimientos Futuros**: La próxima sesión está prevista para el 12 de marzo de 2025, donde se abordarán testimonios pendientes y decisiones sobre su incorporación por lectura. Dr. Chitaro indicó que reevaluaría su postura respecto a ocho testigos.\n\n#### Argumentos Centrales\n- **Dr. Chitaro**: Expresó preocupaciones sobre la desistencia de los testigos, enfatizando la necesidad de un análisis exhaustivo de todas las pruebas antes de sacar conclusiones. Reservó el derecho a presentar futuros desafíos legales o recusaciones tras una revisión completa del caso.\n  \n- **Fiscalía**: Sugirió cambiar algunos testigos para evitar retrasos innecesarios y proteger los derechos de defensa, aunque el Presidente decidió proceder con los ya admitidos.\n\n#### Pruebas o Testimonios Influyentes\n- **Francisco Manuel Fernández Sosa**: Testificó sobre la entrega voluntaria de un teléfono por parte de Carrizo sin presión aparente. Su testimonio fue crucial para aclarar eventos relacionados con una investigación de alto perfil.\n\n- **Patricia Verónica Huaglianone**: Confirmó su participación en el aseguramiento de dispositivos móviles tras un ataque, destacando la importancia del protocolo de cadena de custodia.\n\n#### Decisiones o Resoluciones Clave\n- El Presidente reconoció las preocupaciones de Dr. Chitaro pero afirmó que el juicio ha procedido regularmente con la participación de todas las partes.\n  \n- Se decidió incluir a Niamandú y Nadia Acelén Mir como testigos en futuras audiencias debido a su relevancia en el contexto del ataque.\n\n#### Resultado o Estado Actual\nLa sesión concluyó con recordatorios sobre próximas audiencias y requisitos procedimentales. Se planificaron evaluaciones de archivos reservados, actualizaciones de testimonios y confirmación de citaciones para la próxima sesión. La situación de Dr. Marano respecto a Tesanos Pintos se considerará en función del interés de las partes.\n\nLa audiencia reflejó la complejidad del caso, subrayando la necesidad de un examen detallado de los testimonios dentro de su contexto social más amplio.",
  cached: false,
  audio_hash: "656265cbe0d81f3a7ee2a483c42c45b2d4e3de31c5c049640a5c2c24cd532c88"
};

const chatResponse = {
  reply: "Fernando Sabag Montiel es el hombre que intentó asesinar a la entonces vicepresidenta Cristina Fernández de Kirchner el 1° de septiembre de 2022 en Recoleta, cuando gatilló un arma Bersa a pocos centímetros de su cabeza, pero el disparo no salió. Fue acusado como autor material de homicidio doblemente calificado en grado de tentativa, agravado por el uso de arma de fuego, además de portación y receptación de arma de guerra ilegal. El juicio oral comenzó el 26 de junio de 2024 y en su declaración reconoció que quería matarla, alegando que su motivo era personal y no político. Durante los allanamientos posteriores se encontró en una tarjeta de memoria 17 fotos y 102 videos de explotación sexual infantil, así como evidencia de que había enviado material por redes sociales. Esto derivó en una causa paralela en la que, mediante juicio abreviado, fue condenado el 13 de mayo de 2025 a cuatro años y tres meses de prisión efectiva, unificando esa pena con una anterior de un año en suspenso por tenencia de DNI ajeno. La investigación del atentado tuvo un revés cuando falló el peritaje de su celular, que se formateó durante los intentos de extracción de datos, imposibilitando acceder a información que podría haber ampliado las pruebas.",
};
// Respuesta de preguntas
const questionsResponse = {
  questions: [
    {
      question: "¿Podría explicar la razón detrás del desistimiento de las querellas respecto a dos testigos y cómo esto impacta el enfoque de la defensa?",
      reasoning: "Esta pregunta busca entender el cambio estratégico que puede haber ocurrido entre las partes, así como su posible influencia en el desarrollo del juicio."
    },
    {
      question: "¿Qué aspectos específicos del testimonio de los testigos convocados para hoy considera que podrían ser cruciales para el caso de la imputada Brenda Elizabeth Uliarte?",
      reasoning: "Al buscar detalles sobre la importancia de los testimonios, se busca identificar elementos clave que puedan influir en el veredicto."
    },
    {
      question: "Dado el cambio en el cronograma para incluir testigos no directamente vinculados con la imputada, ¿cuál es su perspectiva sobre cómo esto afectará la estrategia de defensa?",
      reasoning: "Esta pregunta está dirigida a explorar las implicaciones del ajuste en el calendario y su posible efecto en la táctica legal."
    },
    {
      question: "¿Qué medidas se están tomando para asegurar que el peritaje sobre el teléfono celular 01 pueda realizarse sin más interrupciones?",
      reasoning: "Se busca comprender los pasos concretos que se están implementando para evitar futuras complicaciones técnicas durante el peritaje."
    },
    {
      question: "¿Cómo considera la defensa que el nuevo cronograma de audiencias, incluyendo el cuarto intermedio hasta el 12 de marzo, influirá en su preparación y presentación?",
      reasoning: "Esta pregunta busca identificar cómo las partes están adaptándose a los cambios temporales recientes."
    }
  ],
  cached: false,
  audio_hash: "656265cbe0d81f3a7ee2a483c42c45b2d4e3de31c5c049640a5c2c24cd532c88"
};

// ——— Middleware ———
app.use(cors());
app.use(express.json());

// ——— REST APIs ———

// API de Chat
app.post('/api/chat', (req, res) => {
  const { text, hash } = req.body;
  console.log(`[API] Chat (${hash}) recibió: "${text}"`);
  res.json(chatResponse);
});

// API de Transcripción
app.post('/api/transcription', (req, res) => {
  const { hash } = req.body;
  console.log(`[API] POST transcription for hash="${hash}"`);
  res.json(transcriptionResponse);
});

// API de Resumen
app.post('/api/summary', (req, res) => {
  const { hash } = req.body;
  console.log(`[API] POST summary for hash="${hash}"`);
  res.json(summarizeResponse);
});

// API de Preguntas
app.post('/api/suggestions', (req, res) => {
  const { hash } = req.body;
  console.log(`[API] POST questions for hash="${hash}"`);
  res.json(questionsResponse);
});

// ——— HTTP + WebSocket Server ———
const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });
const sessions = new Map();

wss.on('connection', (ws, request) => {
  // Extraer el tipo y hash de la ruta: /{type}/${hash}
  const pathParts = request.url.split('/');
  const type = pathParts[1]; // chat, transcription, summary, questions
  const hash = pathParts[2];
  
  console.log(`[WS] Connected to ${type}: ${hash}`);
  sessions.set(`${type}_${hash}`, { ws, type, hash });

  ws.on('message', msg => {
    let data;
    try { data = JSON.parse(msg); } catch { return; }
    
    if (data.type === 'auth') {
      console.log(`[WS] Auth for ${type}/${data.hash}`);
    } else if (type === 'chat' && data.text) {
      console.log(`[WS] Chat (${hash}) dice: "${data.text}"`);
      console.log(`> para responder: /chat ${hash} Tu mensaje aquí`);
    }
  });

  ws.on('close', () => sessions.delete(`${type}_${hash}`));
});

server.on('upgrade', (req, socket, head) => {
  // Permitir rutas del tipo /{type}/${hash}
  const pathParts = req.url.split('/');
  const validTypes = ['chat', 'transcription', 'summary', 'questions'];
  
  if (pathParts.length >= 3 && validTypes.includes(pathParts[1])) {
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req));
  } else {
    socket.destroy();
  }
});

server.listen(PORT, () => {
  console.log(`Unified API Server listening http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  POST /api/chat');
  console.log('  POST /api/transcription'); 
  console.log('  POST /api/summarize');
  console.log('  POST /api/questions');
  console.log('WebSocket routes:');
  console.log('  /chat/{hash}');
  console.log('  /transcription/{hash}');
  console.log('  /summary/{hash}');
  console.log('  /questions/{hash}');
});

// ——— Consola interactiva ———
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: '> ' });
console.log('\nCommands:');
console.log('  /chat <hash> <message>        → enviar mensaje de chat');
console.log('  /trans-send <hash>            → 1 segmento transcripción');
console.log('  /trans-lot <hash>             → todos los segmentos');
console.log('  /summary-send <hash>          → resumen completo');
console.log('  /summary-chunk <hash>         → resumen por chunks');
console.log('  /questions <hash>             → todas las preguntas');
console.log('  exit                          → stop');
rl.prompt();

rl.on('line', line => {
  const input = line.trim();
  if (input === 'exit') return process.exit(0);

  // /chat
  let m = input.match(/^\/chat\s+(\S+)\s+(.+)$/);
  if (m) {
    const session = sessions.get(`chat_${m[1]}`);
    if (session?.ws?.readyState === WebSocket.OPEN) {
      session.ws.send(JSON.stringify({ 
        type: 'message', 
        text: m[2], 
        timestamp: new Date().toISOString() 
      }));
      console.log(`→ Sent chat message to ${m[1]}`);
    }
    return rl.prompt();
  }

  // /trans-send
  m = input.match(/^\/trans-send\s+(\S+)$/);
  if (m) {
    const session = sessions.get(`transcription_${m[1]}`);
    if (session?.ws?.readyState === WebSocket.OPEN) {
      const seg = transcriptionResponse.segments[0];
      session.ws.send(JSON.stringify({ 
        type: 'segment', 
        data: seg, 
        timestamp: new Date().toISOString() 
      }));
      console.log('→ Sent 1 segment');
    }
    return rl.prompt();
  }

  // /trans-lot
  m = input.match(/^\/trans-lot\s+(\S+)$/);
  if (m) {
    const session = sessions.get(`transcription_${m[1]}`);
    if (session?.ws?.readyState === WebSocket.OPEN) {
      session.ws.send(JSON.stringify({ 
        type: 'segments', 
        data: transcriptionResponse.segments, 
        timestamp: new Date().toISOString() 
      }));
      console.log(`→ Sent ${transcriptionResponse.segments.length} segments`);
    }
    return rl.prompt();
  }

  // /summary-send
  m = input.match(/^\/summary-send\s+(\S+)$/);
  if (m) {
    const session = sessions.get(`summary_${m[1]}`);
    if (session?.ws?.readyState === WebSocket.OPEN) {
      session.ws.send(JSON.stringify({ 
        type: 'summary', 
        data: summarizeResponse, 
        timestamp: new Date().toISOString() 
      }));
      console.log('→ Sent complete summary');
    }
    return rl.prompt();
  }

  // /summary-chunk
  m = input.match(/^\/summary-chunk\s+(\S+)$/);
  if (m) {
    const session = sessions.get(`summary_${m[1]}`);
    if (session?.ws?.readyState === WebSocket.OPEN) {
      const summaryText = summarizeResponse.summary;
      const sections = summaryText.split(/(?=####)/);
      
      sections.forEach((section, index) => {
        if (section.trim()) {
          setTimeout(() => {
            if (session.ws.readyState === WebSocket.OPEN) {
              session.ws.send(JSON.stringify({ 
                type: 'summary_chunk', 
                data: {
                  chunk: section.trim(),
                  index: index,
                  total: sections.length - 1,
                  isLast: index === sections.length - 1,
                  cached: summarizeResponse.cached,
                  audio_hash: summarizeResponse.audio_hash
                }, 
                timestamp: new Date().toISOString() 
              }));
            }
          }, index * 1000);
        }
      });
      
      console.log(`→ Sending summary in ${sections.length} chunks`);
    }
    return rl.prompt();
  }

  // /questions
  m = input.match(/^\/questions\s+(\S+)$/);
  if (m) {
    const session = sessions.get(`questions_${m[1]}`);
    if (session?.ws?.readyState === WebSocket.OPEN) {
      session.ws.send(JSON.stringify({ 
        type: 'questions', 
        data: questionsResponse, 
        timestamp: new Date().toISOString() 
      }));
      console.log(`→ Sent ${questionsResponse.questions.length} questions`);
    }
    return rl.prompt();
  }

  rl.prompt();
});
