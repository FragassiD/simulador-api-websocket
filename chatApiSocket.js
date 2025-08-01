// server.js
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const readline = require('readline');

const app = express();
const PORT = 4000;

// ——— Middleware ———
app.use(cors());
app.use(express.json());

// ——— Endpoint REST ———
app.post('/api/chat', (req, res) => {
  const { text, hash } = req.body;
  console.log(`\n[API] (${hash}) recibió: "${text}"`);
  // Respuesta automática tipo echo
  res.json({ reply: `Echo desde API [${hash}]: ${text}` });
});

// ——— Servidor HTTP + WebSocket ———
const server = http.createServer(app);

// Usamos noServer + upgrade para enrutar por path
const wss = new WebSocket.Server({ noServer: true });

// Guarda conexiones por hash de sesión
const sessions = new Map();

// Manejo de conexiones WS
wss.on('connection', (ws, request) => {
  // Extraer el hash de la URL: /chat/:hash
  const hash = request.url.split('/').pop();
  console.log(`[WS] cliente conectado con hash "${hash}"`);
  sessions.set(hash, ws);

  ws.on('message', (msg) => {
    let data;
    try {
      data = JSON.parse(msg.toString());
    } catch {
      console.warn('[WS] Mensaje no JSON:', msg);
      return;
    }
    console.log(`\n[WS] (${hash}) dice: "${data.text}"`);
    console.log(`> para responder: /send ${hash} Tu mensaje aquí`);
  });

  ws.on('close', () => {
    console.log(`[WS] cliente "${hash}" desconectado`);
    sessions.delete(hash);
  });
});

// Upgrade HTTP -> WS cuando la ruta comience por /chat/
server.on('upgrade', (request, socket, head) => {
  if (request.url.startsWith('/chat/')) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// Arranca HTTP & WS
server.listen(PORT, () => {
  console.log(`\n🚀 Servidor escuchando en http://localhost:${PORT}`);
  console.log(`   • REST POST /api/chat`);
  console.log(`   • WS  ws://localhost:${PORT}/chat/:hash\n`);
});

// ——— Consola para enviar mensajes ———
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> '
});

console.log('Escribe en consola para enviar mensajes:');
console.log('  /send <hash> <mensaje>     → envía al WS de esa sesión');
console.log('  exit                       → cierra todo');
rl.prompt();

rl.on('line', (line) => {
  const input = line.trim();
  if (input === 'exit') {
    console.log('❌ Cerrando servidor...');
    process.exit(0);
  }

  const sendMatch = input.match(/^\/send\s+(\S+)\s+(.+)/);
  if (sendMatch) {
    const [, hash, message] = sendMatch;
    const ws = sessions.get(hash);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ reply: message }));
      console.log(`✅ [WS] Enviado a (${hash}): "${message}"`);
    } else {
      console.warn(`⚠️  No hay conexión WS abierta para hash "${hash}"`);
    }
  } else if (input.length > 0) {
    // Modo broadcast genérico
    sessions.forEach((ws, hash) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ reply: input }));
      }
    });
    console.log(`⚡ Broadcast a ${sessions.size} sesión(es): "${input}"`);
  }

  rl.prompt();
});
