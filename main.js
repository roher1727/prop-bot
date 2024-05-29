const { Client, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const process = require('process');

// Crear una nueva instancia del cliente
const client = new Client({
    puppeteer: {
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        headless: true, // Ejecutar en modo no headless para depurar visualmente
        args: ['--no-sandbox', '--disable-setuid-sandbox'], // Agregar opciones para mayor compatibilidad
    }
});

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Función para generar un retraso aleatorio entre minDelay y maxDelay milisegundos
const randomDelay = (minDelay, maxDelay) => {
    const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    return new Promise(resolve => setTimeout(resolve, delay));
};

// Función para obtener un nombre de archivo aleatorio de la carpeta "videos"
const getRandomVideo = async (videosFolderPath) => {
    const files = await fs.promises.readdir(videosFolderPath);
    const videoFiles = files.filter(file => file.endsWith('.mp4')); // Filtrar solo archivos de video
    if (videoFiles.length === 0) {
        throw new Error('No hay archivos de video en la carpeta.');
    }
    const randomIndex = Math.floor(Math.random() * videoFiles.length);
    return videoFiles[randomIndex];
};

// Cuando el cliente esté listo, ejecutar este código (solo una vez)
client.once('ready', async () => {
    console.log('Client is ready!');
    let counter = 0;
    const messages = [
        "¡Hola Noticias Nuevas!",
        "¡Hola esta información te podria interesar!",
        "¡Hola dale un vistazo a esto!",
        "¡Hola, quizas esto puede llamar tu atención!",
        "¡Hola, descubre esto!",
        "¡Hola, esto es para ti!",
        "¡Hola, mira esto!",
        "¡Hola, esto te puede gustar!",
        "¡Hola, revisa esto!",
        "¡Hola, echa un ojo a esto!",
        "¡Hola, esto puede ser de tu interés!",
        "¡Hola, encuentra esto interesante!",
        "¡Hola, échale un vistazo!",
        "¡Hola, esto es fascinante!",
        "¡Hola, algo nuevo para ti!",
        "¡Hola, esto puede sorprenderte!",
        "¡Hola, atención a esto!",
        "¡Hola, no te pierdas esto!",
        "¡Hola, revisa esta novedad!",
        "¡Hola, una noticia para ti!",
        "¡Hola, algo especial para ti!",
        "¡Hola, esto te puede interesar!",
        "¡Hola, te va a encantar esto!",
        "¡Hola, esto es increíble!",
        "¡Hola, te podría sorprender!",
        "¡Hola, aquí tienes algo interesante!",
        "¡Hola, echa un vistazo a esto!",
        "¡Hola, esto es para ti!",
        "¡Hola, descubre esta novedad!",
        "¡Hola, esto podría ser útil!",
        "¡Hola, aquí hay algo nuevo!",
        "¡Hola, mira esta información!",
        "¡Hola, esto es emocionante!",
        "¡Hola, dale un vistazo!",
        "¡Hola, revisa esta noticia!",
        "¡Hola, esto te llamará la atención!",
        "¡Hola, chequea esto!",
        "¡Hola, esto es asombroso!",
        "¡Hola, echa un vistazo a esta novedad!",
        "¡Hola, esto es para ti!",
        "¡Hola, no te pierdas esto!",
        "¡Hola, esto podría gustarte!",
        "¡Hola, revisa esta novedad!",
        "¡Hola, esto es interesante!",
        "¡Hola, encuentra esto interesante!",
        "¡Hola, esto es fascinante!",
        "¡Hola, algo nuevo para ti!",
        "¡Hola, esto puede sorprenderte!",
        "¡Hola, atención a esto!",
        "¡Hola, no te pierdas esto!",
        "¡Hola, revisa esta novedad!",
        "¡Hola, una noticia para ti!",
        "¡Hola, algo especial para ti!",
        "¡Hola, esto te puede interesar!",
        "¡Hola, te va a encantar esto!",
        "¡Hola, esto es increíble!",
        "¡Hola, te podría sorprender!",
        "¡Hola, aquí tienes algo interesante!",
        "¡Hola, echa un vistazo a esto!",
        "¡Hola, esto es para ti!",
        "¡Hola, descubre esta novedad!",
        "¡Hola, esto podría ser útil!",
        "¡Hola, aquí hay algo nuevo!",
        "¡Hola, mira esta información!",
        "¡Hola, esto es emocionante!",
        "¡Hola, dale un vistazo!",
        "¡Hola, revisa esta noticia!",
        "¡Hola, esto te llamará la atención!",
        "¡Hola, chequea esto!",
        "¡Hola, esto es asombroso!",
        "¡Hola, echa un vistazo a esta novedad!",
        "¡Hola, esto es para ti!",
        "¡Hola, no te pierdas esto!",
        "¡Hola, esto podría gustarte!",
        "¡Hola, revisa esta novedad!",
        "¡Hola, esto es interesante!",
        "¡Hola, encuentra esto interesante!",
        "¡Hola, esto es fascinante!",
        "¡Hola, algo nuevo para ti!",
        "¡Hola, esto puede sorprenderte!",
        "¡Hola, atención a esto!",
        "¡Hola, no te pierdas esto!",
        "¡Hola, revisa esta novedad!",
        "¡Hola, una noticia para ti!",
        "¡Hola, algo especial para ti!",
        "¡Hola, esto te puede interesar!",
        "¡Hola, te va a encantar esto!",
        "¡Hola, esto es increíble!",
        "¡Hola, te podría sorprender!",
        "¡Hola, aquí tienes algo interesante!",
        "¡Hola, echa un vistazo a esto!",
        "¡Hola, esto es para ti!",
        "¡Hola, descubre esta novedad!",
        "¡Hola, esto podría ser útil!",
        "¡Hola, aquí hay algo nuevo!",
        "¡Hola, mira esta información!",
        "¡Hola, esto es emocionante!",
        "¡Hola, dale un vistazo!",
        "¡Hola, revisa esta noticia!",
        "¡Hola, esto te llamará la atención!"
    ];
    const contacts = [];
    // Leer el archivo CSV y enviar mensajes a cada número
    fs.createReadStream(process.argv[2])
        .pipe(csv())
        .on('data', (row) => {
            contacts.push(row);
        })
        .on('end', async () => {
            console.log('Todos los contactos han sido leídos');
            for (const row of contacts) {
                const chatId = `${row.number}@c.us`; // Asumiendo que la columna se llama 'number'
                //const message = `¡Hola! Tenemos un mensaje importante para ti.`;
                const message = messages[Math.floor(Math.random() * messages.length)];

                try {
                    // Enviar mensaje de texto
                    const response = await client.sendMessage(chatId, message);
                    if (response.id.fromMe) {
                        console.log(`Mensaje enviado con éxito a ${row.number}`);
                    }
                    
                    // Obtener un video aleatorio de la carpeta "videos"
                    const videoName = await getRandomVideo(path.join(__dirname, 'output_videos'));
                    console.log(videoName);
                    const videoPath = path.join(__dirname, 'output_videos', videoName);

                    // Verificar el tamaño del archivo de video
                    const stats = fs.statSync(videoPath);
                    const fileSizeInMegabytes = stats.size / (1024 * 1024);
                    console.log(`Tamaño del video: ${fileSizeInMegabytes.toFixed(2)} MB`);

                    // Asegurarse de que el tamaño del video sea razonable (por ejemplo, menos de 16 MB)
                    if (fileSizeInMegabytes <= 16) {
                        // Leer el video
                        const media = MessageMedia.fromFilePath(videoPath);

                        // Enviar video
                        await client.sendMessage(chatId, media);
                        counter++;
                        console.log(`${counter}: Video enviado con éxito a ${row.number}`);
                    } else {
                        console.log(`El video es demasiado grande para enviar a ${row.number}`);
                    }
                } catch (err) {
                    console.error(`Error al enviar el mensaje o video a ${row.number}:`, err);
                }

                // Agregar un retraso aleatorio entre mensajes
                if (counter % 15 === 0){
                    await randomDelay(10000, 20000);
                }

                await randomDelay(4000, 10000);
            }

            console.log('Todos los mensajes y videos han sido enviados');
        });
});

// Manejar el evento de navegación para evitar la destrucción del contexto de ejecución
client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
    client.initialize();
});

// Cuando el cliente reciba el código QR
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

// Inicializar el cliente
client.initialize();
