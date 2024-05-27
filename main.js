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

// Cuando el cliente esté listo, ejecutar este código (solo una vez)
client.once('ready', async () => {
    console.log('Client is ready!');
    const contacts = [];
    // const video_names = ['video_1.mp4','video_2.mp4','video_3.mp4'];
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
                const message = `¡Hola! Tenemos un mensaje importante para ti.`;

                try {
                    // Enviar mensaje de texto
                    const response = await client.sendMessage(chatId, message);
                    if (response.id.fromMe) {
                        console.log(`Mensaje enviado con éxito a ${row.number}`);
                    }
                    
                    // Ruta del video a enviar
                    const videoPath = path.join(__dirname, 'videos', video_name); // Reemplaza 'video_demo.mp4' con el nombre del archivo de video

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
                        console.log(`Video enviado con éxito a ${row.number}`);
                    } else {
                        console.log(`El video es demasiado grande para enviar a ${row.number}`);
                    }
                    

                } catch (err) {
                    console.error(`Error al enviar el mensaje o video a ${row.number}:`, err);
                }

                // Agregar un retraso de 2 segundos entre mensajes
                await delay(2000);
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