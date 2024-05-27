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
        timeout: 60000 // Aumentar el tiempo de espera a 60 segundos
    }
});

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Función para generar un retraso aleatorio entre minDelay y maxDelay milisegundos
const randomDelay = (minDelay, maxDelay) => {
    const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    return new Promise(resolve => setTimeout(resolve, delay));
};

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

// Crear grupo y añadir contactos
const createGroupAndAddContacts = async (groupName, contacts) => {
    // Máximo 250 contactos por grupo en WhatsApp
    const maxContacts = 250;
    const chatIds = contacts.slice(0, maxContacts).map(contact => `${contact.number}@c.us`);

    // Crear el grupo
    const group = await client.createGroup(groupName, chatIds);
    console.log(`Grupo creado: ${groupName}`);
    console.log(`Participantes añadidos: ${chatIds.length}`);

    return group.gid._serialized; // Retornar el ID del grupo
};

// Enviar video al grupo
const sendVideoToGroup = async (groupId, videoPath) => {
    const media = MessageMedia.fromFilePath(videoPath);
    await client.sendMessage(groupId, media);
    console.log('Video enviado al grupo con éxito');
};

// Crear múltiples grupos y enviar video a cada grupo
const createGroupsAndSendVideos = async (contacts, groupNamePrefix, videoPath) => {
    let groupIndex = 1;
    while (contacts.length > 0) {
        const groupName = `${groupNamePrefix} ${groupIndex}`;
        const groupContacts = contacts.splice(0, 250); // Extraer los primeros 250 contactos

        // Crear el grupo y añadir contactos
        const groupId = await createGroupAndAddContacts(groupName, groupContacts);

        // Enviar video al grupo
        await sendVideoToGroup(groupId, videoPath);

        // Aumentar el índice del grupo
        groupIndex++;

        // Agregar un retraso aleatorio entre la creación de grupos
        await randomDelay(2000, 5000); // Retraso aleatorio entre 2 y 5 segundos
    }
};

// Cuando el cliente esté listo, ejecutar este código (solo una vez)
client.once('ready', async () => {
    console.log('Client is ready!');

    // Leer contactos desde el archivo CSV
    const contacts = await readContacts(process.argv[2]);
    console.log('Todos los contactos han sido leídos');

    // Ruta del video a enviar
    const videoPath = path.join(__dirname, 'videos', process.argv[3]); // Reemplaza 'video_demo.mp4' con el nombre del archivo de video

    // Crear grupos y enviar videos
    await createGroupsAndSendVideos(contacts, 'Esperanza de Mexico ', videoPath);
});

// Cuando el cliente reciba el código QR
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

// Inicializar el cliente
client.initialize();