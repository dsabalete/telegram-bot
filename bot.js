const TelegramBot = require('node-telegram-bot-api');
const Transmission = require('transmission');
const os = require('os');
const { exec } = require('child_process');

const token = process.env.TG_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const transmission = new Transmission({
  host: process.env.TRANSMISSION_HOST || 'localhost',
  port: parseInt(process.env.TRANSMISSION_PORT) || 9091
});

const AUTHORIZED_CHAT_ID = parseInt(process.env.AUTHORIZED_CHAT_ID) || 937938391;
const notifiedTorrents = {}; // {id: true}

bot.onText(/\/start/, (msg) => {
  if (msg.chat.id !== AUTHORIZED_CHAT_ID) {
    bot.sendMessage(msg.chat.id, '⛔ Acceso no autorizado');
    return;
  }

  bot.sendMessage(
    msg.chat.id,
    '🤖 Hola! Soy tu bot de la Raspberry.\nUsa /help para ver comandos.'
  );
});

bot.onText(/\/help/, (msg) => {
  if (msg.chat.id !== AUTHORIZED_CHAT_ID) return;

  bot.sendMessage(
    msg.chat.id,
    `
📋 Comandos disponibles:
/torrents - Listado de torrents activos, descargando o pausados
/pause <id> - Pausar torrent <id>
/resume <id> - Reanudar torrent <id>
/add <magnet url> - Añade un torrent con URL <magnet url>
/status - Estado básico del sistema
/ping - Comprobar que estoy vivo
`.trim()
  );
});

bot.onText(/\/ping/, (msg) => {
  if (msg.chat.id !== AUTHORIZED_CHAT_ID) return;

  bot.sendMessage(msg.chat.id, '🏓 Pong!');
});

bot.onText(/\/status/, (msg) => {
  if (msg.chat.id !== AUTHORIZED_CHAT_ID) return;

  exec('uptime && df -h / | tail -1', (err, stdout) => {
    if (err) {
      bot.sendMessage(msg.chat.id, '❌ Error obteniendo estado');
      return;
    }

    const load = os.loadavg()[0].toFixed(2);
    const memUsed = ((os.totalmem() - os.freemem()) / 1024 / 1024).toFixed(0);
    const memTotal = (os.totalmem() / 1024 / 1024).toFixed(0);

    bot.sendMessage(
      msg.chat.id,
      `
📊 Estado de la Raspberry
🧠 Load: ${load}
💾 RAM: ${memUsed} / ${memTotal} MB

${stdout}
`.trim()
    );
  });
});

bot.onText(/\/torrents/i, (msg) => {
  console.log('Comando /torrents recibido de chat:', msg.chat.id);
  if (msg.chat.id !== AUTHORIZED_CHAT_ID) {
    console.log('Chat no autorizado:', msg.chat.id);
    return;
  }

  transmission.get((err, result) => {
    if (err) {
      console.error('Error conectando con Transmission:', err);
      bot.sendMessage(msg.chat.id, '❌ Error conectando con Transmission');
      return;
    }

    console.log('Resultado de Transmission:', result.torrents.length);

    if (!result.torrents.length) {
      bot.sendMessage(msg.chat.id, '📭 No hay torrents activos');
      return;
    }

    const text = result.torrents
      .slice(0, 10) // no saturar Telegram
      .map(t => {
        const progress = (t.percentDone * 100).toFixed(1);
        const status =
          t.status === 4 ? '⬇ descargando' :
          t.status === 6 ? '⏸ pausado' :
          '📦 activo';

        return `🧲 ${t.id}. ${t.name}\n${status} – ${progress}%`;
      })
      .join('\n\n');

    bot.sendMessage(msg.chat.id, text);
  });
});

bot.onText(/\/pause (\d+)/, (msg, match) => {
  if (msg.chat.id !== AUTHORIZED_CHAT_ID) return;

  const id = Number(match[1]);

  transmission.stop(id, (err) => {
    if (err) {
      bot.sendMessage(msg.chat.id, '❌ Error pausando torrent');
      return;
    }
    bot.sendMessage(msg.chat.id, `⏸ Torrent ${id} pausado`);
  });
});

bot.onText(/\/resume (\d+)/, (msg, match) => {
  if (msg.chat.id !== AUTHORIZED_CHAT_ID) return;

  const id = Number(match[1]);

  transmission.start(id, (err) => {
    if (err) {
      bot.sendMessage(msg.chat.id, '❌ Error reanudando torrent');
      return;
    }
    bot.sendMessage(msg.chat.id, `▶ Torrent ${id} reanudado`);
  });
});

bot.onText(/\/add (.+)/i, (msg, match) => {
  // Solo permitir tu chat
  if (msg.chat.id !== AUTHORIZED_CHAT_ID) return;

  const magnetLink = match[1].trim();

  if (!magnetLink.startsWith('magnet:')) {
    bot.sendMessage(msg.chat.id, '❌ Por favor, envía un enlace magnet válido');
    return;
  }

  transmission.addUrl(magnetLink, (err, result) => {
    if (err) {
      console.error('Error añadiendo torrent:', err);
      bot.sendMessage(msg.chat.id, '❌ Error al añadir el torrent');
      return;
    }

    bot.sendMessage(msg.chat.id, `✅ Torrent añadido:\n${result.name}\nID: ${result.id}`);
  });
});



/* Funcion para generar rutas HTTP seguras */
function buildHttpLink(baseUrl, fullPath, baseDir) {
  // baseDir = /mnt/sda1/shared/Pelis
  // fullPath = /mnt/sda1/shared/Pelis/Carpeta Larga/Archivo Con Ñ.mkv
  const relativePath = fullPath.replace(baseDir + '/', '');
  const segments = relativePath.split('/');  // separar carpetas y archivo
  const encodedSegments = segments.map(encodeURIComponent); // codificar cada segmento
  return `${baseUrl}/${encodedSegments.join('/')}`;
}



const BASE_URL = process.env.BASE_URL || 'http://192.168.0.25:8080';
const BASE_DIR = process.env.BASE_DIR || '/downloads';

function checkFinishedTorrents() {
  transmission.get((err, result) => {
    if (err) {
      console.error('Error al obtener torrents para notificación:', err);
      return;
    }

    result.torrents.forEach(t => {
      const finished = t.percentDone === 1;
      if (finished && !notifiedTorrents[t.id]) {

/*
	const links = t.files.map(f => {
    	  const fullPath = `${t.downloadDir}/${f.name}`;
      	  return buildHttpLink(BASE_URL, fullPath, BASE_DIR);
    	}).join('\n');
*/

//    	const message = `✅ Torrent terminado:\n${t.name}\nID: ${t.id}\nArchivos:\n${links}`;
    	const message = `✅ Torrent terminado:\n${t.name}\nID: ${t.id}`;
        bot.sendMessage(AUTHORIZED_CHAT_ID, message);
        notifiedTorrents[t.id] = true;
      }
    });
  });
}

// Ejecutar cada 30 segundos
setInterval(checkFinishedTorrents, 30 * 1000);
