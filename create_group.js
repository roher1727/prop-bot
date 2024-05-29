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
    try {
        // Asegurarse de que la página esté completamente cargada
        // await client.pupPage.waitForSelector('canvas', { timeout: 60000 });

        // Crear el grupo
        console.log("Creando grupo");
        const group = await client.createGroup(groupName, chatIds);
        console.log(`Grupo creado: ${groupName}`);
        console.log(`Participantes añadidos: ${chatIds.length}`);
        return group.gid._serialized; // Retornar el ID del grupo
    } catch (error) {
        console.error('Error al crear el grupo:', error);
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
    const groupName = 'Nombre del Grupo'; // Reemplaza con el nombre del grupo deseado
    await createGroupAndAddContacts(groupName, contacts);
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