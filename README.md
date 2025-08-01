# Servidores Mock: Chat y Transcripción

Este repositorio contiene dos mocks de servidor en Node.js:

1. **Servidor de Chat** (`chatApiSocket.js`)
2. **Servidor de Transcripción** (`transcriptionApiSocket.js`)

Ambos servidores exponen:

* Una **API REST**
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

## 1. Servidor de Chat (`server.js`)

### Iniciar

```bash
node server.js
```

### API REST

**Endpoint**: `POST http://localhost:4000/api/chat`

**Headers**:

```
Content-Type: application/json
X-Session-Hash: <hash>
```

**Cuerpo de la petición**:

```json
{ "text": "Hola mundo", "hash": "donadonadonadona" }
```

**Respuesta**:

```json
{ "reply": "Echo desde API [<hash>]: Hola mundo" }
```

### WebSocket

**URL**: `ws://localhost:4000/chat/<hash>`


### Comandos en consola

En la terminal donde corre el servidor, podes:

* `/send <hash> <mensaje>` → Enviar `<mensaje>` como respuesta JSON a ese cliente WebSocket.
* Cualquier texto sin `/send` → Difundir (broadcast) a todos los clientes.
* `exit` → Detener el servidor.

---

## 2. Servidor de Transcripción (`server-transcription.js`)

### Iniciar

```bash
node server-transcription.js
```

### API REST

**Endpoint**: `POST http://localhost:5000/api/transcription`

**Headers**:

```
Content-Type: application/json
X-Session-Hash: <hash>
```

**Cuerpo de la petición**:

```json
{ "hash": "donadonadonadona" }
```

**Respuesta**:

```json
{
  "segments": [
    { /* 16 objetos de segmento */ }
  ],
  "final_transcription_path": "/transcriptions/caso_2024-001_final.srt",
  "cached": false,
  "audio_hash": "a1b2c3d4e5f6..."
} 

{
    "segments": [
      {
        "id": 1,
        "start": "00:00:00,000",
        "end": "00:00:03,500",
        "speaker": "Juan Pérez",
        "text": "Buenos días, mi nombre es Juan Pérez y soy el fiscal del caso."
      },
      {
        "id": 2,
        "start": "00:00:03,500",
        "end": "00:00:07,200",
        "speaker": "María González",
        "text": "Muchas gracias, fiscal. Soy María González, defensora pública."
      },
      {
        "id": 3,
        "start": "00:00:07,200",
        "end": "00:00:12,800",
        "speaker": "Juan Pérez",
        "text": "Procederemos con la presentación de las evidencias del caso número 2024-001."
      }
     
    ],
    "final_transcription_path": "/transcriptions/caso_2024-001_final.srt",
    "cached": false,
    "audio_hash": "a1"
}
```

### WebSocket

**URL**: `ws://localhost:5000/transcription/<hash>`


### Comandos en consola

En la terminal donde corre el servidor, puedes:

* `/send <hash>` → Envía **un solo** segmento (el primero de la lista estática).
* `/lot <hash>`  → Envía **todos** los segmentos (16) como `type: 'segments'` (hardcodeados).
* `exit`        → Detener el servidor.

---

