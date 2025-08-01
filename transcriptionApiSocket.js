// server-transcription.js
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const readline = require('readline');

const app = express();
const PORT = 5000;

// ——— Tu respuesta completa de transcripción ———
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
  ],
  final_transcription_path: "/transcriptions/caso_2024-001_final.srt",
  cached: false,
  audio_hash: "a1b2c3d4e5f6..."
};

// ——— Middleware ———
app.use(cors());
app.use(express.json());

// ——— REST API de Transcripción ———
app.post('/api/transcription', (req, res) => {
  const { hash } = req.body;
  console.log(`[API] POST transcription for hash="${hash}"`);
  res.json(transcriptionResponse);
});

// ——— HTTP + WebSocket Server ———
const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });
const sessions = new Map();

wss.on('connection', (ws, request) => {
  // Extraer el hash de la ruta: /transcription/${hash}
  const match = request.url.match(/^\/transcription\/(.+)$/);
  const hash = match ? match[1] : 'unknown';
  console.log(`[WS] Connected: ${hash}`);
  sessions.set(hash, ws);

  ws.on('message', msg => {
    let data;
    try { data = JSON.parse(msg); } catch { return; }
    if (data.type === 'auth') {
      console.log(`[WS] Auth for ${data.hash}`);
    }
  });

  ws.on('close', () => sessions.delete(hash));
});

server.on('upgrade', (req, socket, head) => {
  // Permitir rutas del tipo /transcription/${hash}
  const match = req.url.match(/^\/transcription\/(.+)$/);
  if (match) {
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req));
  } else {
    socket.destroy();
  }
});

server.listen(PORT, () => {
  console.log(`Server listening http://localhost:${PORT}`);
});

// ——— Consola interactiva ———
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: '> ' });
console.log('Commands:');
console.log('  /send <hash>   → 1 segmento');
console.log('  /lot  <hash>   → todos los segmentos');
console.log('  exit           → stop');
rl.prompt();

rl.on('line', line => {
  const input = line.trim();
  if (input === 'exit') return process.exit(0);

  // /send
  let m = input.match(/^\/send\s+(\S+)$/);
  if (m) {
    const ws = sessions.get(m[1]);
    if (ws?.readyState === WebSocket.OPEN) {
      const seg = transcriptionResponse.segments[0];
      ws.send(JSON.stringify({ type: 'segment', data: seg, timestamp: new Date().toISOString() }));
      console.log('→ Sent 1 segment');
    }
    return rl.prompt();
  }

  // /lot
  m = input.match(/^\/lot\s+(\S+)$/);
  if (m) {
    const ws = sessions.get(m[1]);
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'segments', data: transcriptionResponse.segments, timestamp: new Date().toISOString() }));
      console.log(`→ Sent ${transcriptionResponse.segments.length} segments`);
    }
    return rl.prompt();
  }

  rl.prompt();
});
