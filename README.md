# 🎯 Simulador API WebSocket

Un servidor unificado que simula APIs y WebSockets para transcripción, resúmenes, chat y preguntas de audiencias judiciales.

## 📋 Características

- **4 APIs REST** unificadas en un solo servidor
- **4 tipos de WebSocket** con gestión de sesiones por hash
- **Consola interactiva** para simular envío de datos
- **Datos de ejemplo** realistas de audiencias judiciales
- **Puerto único** (6000) para todas las funcionalidades

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/FragassiD/simulador-api-websocket.git
cd simulador-api-websocket

# Instalar dependencias
npm install

# Ejecutar el servidor unificado
node unifiedApiSocket.js
```

## 📡 APIs REST Disponibles

### 1. Chat API
```http
POST http://localhost:6000/api/chat
Content-Type: application/json

{
  "text": "Hola, ¿cómo estás?",
  "hash": "abc123"
}
```

**Respuesta:**
```json
{
  "reply": "Echo desde API [abc123]: Hola, ¿cómo estás?"
}
```

### 2. Transcripción API
```http
POST http://localhost:6000/api/transcription
Content-Type: application/json

{
  "hash": "abc123"
}
```

**Respuesta:**
```json
{
  "segments": [
    {
      "id": 1,
      "start": "00:00:00,000",
      "end": "00:00:03,500",
      "speaker": "Juan Pérez",
      "text": "Buenos días, mi nombre es Juan Pérez y soy el fiscal del caso."
    }
    // ... más segmentos
  ]
}
```

### 3. Resumen API
```http
POST http://localhost:6000/api/summarize
Content-Type: application/json

{
  "hash": "abc123"
}
```

**Respuesta:**
```json
{
  "summary": "### Resumen Final de la Audiencia Judicial...",
  "cached": false,
  "audio_hash": "656265cbe0d81f3a7ee2a483c42c45b2d4e3de31c5c049640a5c2c24cd532c88"
}
```

### 4. Preguntas API
```http
POST http://localhost:6000/api/questions
Content-Type: application/json

{
  "hash": "abc123"
}
```

**Respuesta:**
```json
{
  "questions": [
    {
      "question": "¿Podría explicar la razón detrás del desistimiento de las querellas?",
      "reasoning": "Esta pregunta busca entender el cambio estratégico..."
    }
    // ... más preguntas
  ],
  "cached": false,
  "audio_hash": "656265cbe0d81f3a7ee2a483c42c45b2d4e3de31c5c049640a5c2c24cd532c88"
}
```

## 🔌 WebSockets Disponibles

### Conexión WebSocket
Conectar a diferentes tipos de WebSocket usando el patrón:
```
ws://localhost:6000/{tipo}/{hash}
```

**Tipos disponibles:**
- `/chat/{hash}` - Para mensajes de chat
- `/transcription/{hash}` - Para segmentos de transcripción  
- `/summary/{hash}` - Para resúmenes
- `/questions/{hash}` - Para preguntas

### Ejemplo de conexión (JavaScript)
```javascript
// Chat WebSocket
const chatWS = new WebSocket('ws://localhost:6000/chat/abc123');

// Transcripción WebSocket
const transcriptionWS = new WebSocket('ws://localhost:6000/transcription/abc123');

// Resumen WebSocket
const summaryWS = new WebSocket('ws://localhost:6000/summary/abc123');

// Preguntas WebSocket
const questionsWS = new WebSocket('ws://localhost:6000/questions/abc123');
```

### Mensajes WebSocket

**Chat - Enviar mensaje:**
```javascript
chatWS.send(JSON.stringify({
  type: 'message',
  text: 'Hola desde el cliente',
  timestamp: new Date().toISOString()
}));
```

**Auth (cualquier tipo):**
```javascript
ws.send(JSON.stringify({
  type: 'auth',
  hash: 'abc123'
}));
```

## 🎮 Comandos de Consola

Cuando ejecutes el servidor, tendrás acceso a estos comandos en la consola:

### Chat
```bash
/chat <hash> <mensaje>
# Ejemplo: /chat abc123 Hola, ¿cómo estás?
```

### Transcripción
```bash
/trans-send <hash>     # Envía 1 segmento
/trans-lot <hash>      # Envía todos los segmentos
# Ejemplo: /trans-send abc123
```

### Resumen
```bash
/summary-send <hash>   # Envía resumen completo
/summary-chunk <hash>  # Envía resumen por chunks (con delay)
# Ejemplo: /summary-send abc123
```

### Preguntas
```bash
/questions <hash>      # Envía todas las preguntas
# Ejemplo: /questions abc123
```

### General
```bash
exit                   # Detener el servidor
```

## 📊 Estructura de Respuestas WebSocket

### Chat
```json
{
  "type": "message",
  "text": "Mensaje del servidor",
  "timestamp": "2025-08-12T10:30:00.000Z"
}
```

### Transcripción - Un segmento
```json
{
  "type": "segment",
  "data": {
    "id": 1,
    "start": "00:00:00,000",
    "end": "00:00:03,500",
    "speaker": "Juan Pérez",
    "text": "Buenos días..."
  },
  "timestamp": "2025-08-12T10:30:00.000Z"
}
```

### Transcripción - Todos los segmentos
```json
{
  "type": "segments",
  "data": [
    { "id": 1, "start": "00:00:00,000", "end": "00:00:03,500", "speaker": "Juan Pérez", "text": "..." },
    { "id": 2, "start": "00:00:03,500", "end": "00:00:07,200", "speaker": "María González", "text": "..." }
  ],
  "timestamp": "2025-08-12T10:30:00.000Z"
}
```

### Resumen - Completo
```json
{
  "type": "summary",
  "data": {
    "summary": "### Resumen Final...",
    "cached": false,
    "audio_hash": "656265cbe..."
  },
  "timestamp": "2025-08-12T10:30:00.000Z"
}
```

### Resumen - Por chunks
```json
{
  "type": "summary_chunk",
  "data": {
    "chunk": "#### Fases Principales de la Audiencia...",
    "index": 1,
    "total": 5,
    "isLast": false,
    "cached": false,
    "audio_hash": "656265cbe..."
  },
  "timestamp": "2025-08-12T10:30:00.000Z"
}
```

### Preguntas
```json
{
  "type": "questions",
  "data": {
    "questions": [
      {
        "question": "¿Podría explicar...?",
        "reasoning": "Esta pregunta busca..."
      }
    ],
    "cached": false,
    "audio_hash": "656265cbe..."
  },
  "timestamp": "2025-08-12T10:30:00.000Z"
}
```

## 🛠️ Desarrollo

### Estructura del proyecto
```
simulador-api-websocket/
├── unifiedApiSocket.js     # Servidor principal unificado
├── package.json           # Dependencias
└── README.md             # Este archivo
```

### Dependencias
```json
{
  "express": "^4.18.0",
  "cors": "^2.8.5",
  "ws": "^8.13.0"
}
```

### Ejemplo de uso con curl

```bash
# Test Chat API
curl -X POST http://localhost:6000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"text": "Hola mundo", "hash": "test123"}'

# Test Transcripción API
curl -X POST http://localhost:6000/api/transcription \
  -H "Content-Type: application/json" \
  -d '{"hash": "test123"}'

# Test Resumen API
curl -X POST http://localhost:6000/api/summarize \
  -H "Content-Type: application/json" \
  -d '{"hash": "test123"}'

# Test Preguntas API
curl -X POST http://localhost:6000/api/questions \
  -H "Content-Type: application/json" \
  -d '{"hash": "test123"}'
```

## 📝 Datos de Ejemplo

El servidor incluye datos realistas de una audiencia judicial que incluye:

- **16 segmentos de transcripción** con timestamps, speakers y texto
- **Resumen completo** de audiencia judicial con secciones organizadas
- **70+ preguntas** contextuales con razonamiento
- **Metadatos** como hash de audio y estado de caché

## 🎯 Casos de Uso

- **Desarrollo frontend** para aplicaciones de transcripción
- **Testing de WebSockets** en tiempo real
- **Simulación de APIs** de procesamiento de audio
- **Prototipado rápido** de interfaces de chat y transcripción
- **Demos** de aplicaciones judiciales o de transcripción

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## ✨ Autor

**FragassiD** - [GitHub](https://github.com/FragassiD)
* Un **endpoint WebSocket**
* Una interfaz de consola para enviar mensajes manualmente

---

## Prerrequisitos

* [Node.js](https://nodejs.org/) v14 o superior
* NPM (incluido con Node.js)

---

## Instalación

1. Clona este repositorio:

   ```bash
   git clone <url-de-tu-repo>
   cd <directorio-del-repo>
   ```

2. Instala dependencias:

   ```bash
   npm install express cors ws readline
   ```

---
