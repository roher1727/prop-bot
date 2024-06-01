const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const csv = require('csv-parser');
const process = require('process');

// Crear una nueva instancia del cliente
const client = new Client({
    puppeteer: {
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        headless: true, // Ejecutar en modo no headless para depurar visualmente
        args: ['--no-sandbox', '--disable-setuid-sandbox'], // Agregar opciones para mayor compatibilidad
        timeout: 60000 // Aumentar el tiempo de espera a 60 segundos
    }
});

// Leer contactos desde el archivo CSV
const readContacts = async (filePath) => {
    const contacts = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                contacts.push(row);
            })
            .on('end', () => {
                resolve(contacts);
            })
            .on('error', reject);
    });
};

// Crear grupo y añadir todos los contactos
const createGroupAndAddContacts = async (groupName, contacts) => {
    const chatIds = contacts.map(contact => `${contact.number}@c.us`);
    console.log(chatIds);

    const retryOptions = {
        retries: 3,
        delay: 2000 // Esperar 2 segundos entre reintentos
    };

    for (let attempt = 1; attempt <= retryOptions.retries; attempt++) {
        try {
            console.log("Creando grupo");
            const group = await client.createGroup(groupName, chatIds);
            console.log(`Grupo creado: ${groupName}`);
            console.log(`Participantes añadidos: ${chatIds.length}`);
            return group.gid._serialized; // Retornar el ID del grupo
        } catch (error) {
            if (attempt < retryOptions.retries) {
                console.error(`Error al crear el grupo (Intento ${attempt}): ${error.message}. Reintentando...`);
                await new Promise(resolve => setTimeout(resolve, retryOptions.delay));
            } else {
                console.error('Error al crear el grupo:', error);
                throw error;
            }
        }
    }
};

// Enviar video al grupo
const sendVideoToGroup = async (groupId, videoPath) => {
    const media = MessageMedia.fromFilePath(videoPath);
    try {
        await client.sendMessage(groupId, media);
        console.log('Video enviado al grupo con éxito');
    } catch (error) {
        console.error('Error al enviar el video:', error);
        throw error;
    }
};

// Cuando el cliente esté listo, ejecutar este código (solo una vez)
client.once('ready', async () => {
    console.log('Client is ready!');

    // Leer contactos desde el archivo CSV
    const contacts = await readContacts(process.argv[2]);
    console.log('Todos los contactos han sido leídos');

    // Crear el grupo y añadir contactos
    const groupName = 'Esperanza de Mexico'; // Reemplaza con el nombre del grupo deseado
    const groupId = await createGroupAndAddContacts(groupName, contacts);

    const videoPath = path.join(__dirname, 'videos', process.argv[3]); // Reemplaza 'video_demo.mp4' con el nombre del archivo de video

    await sendVideoToGroup(groupId, videoPath);

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
