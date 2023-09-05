import express from 'express';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

// Configure lowdb to write data to JSON file
const __dirname = dirname(fileURLToPath(
    import.meta.url));

const file = join(__dirname, 'db/products.json');

const adapter = new JSONFile(file);
const defaultData = {
    products: [],
};
const db = new Low(adapter, defaultData);
// --- Configure lowdb to write data to JSON file

const app = express();
app.use(express.json());

const PORT = 3030;

app.get('/', function (req, res) {
    res.json({
        message: 'Hello from product API.',
    });
});

app.get('/sum', function (req, res) {
    const x = +req.query.x || -9999;
    const y = +req.query.y || -9999;

    const s = x + y;

    res.json({
        message: s,
    });
});

app.get('/api/products', async function (req, res) {
    // Read data from JSON file, this will set db.data content
    // If JSON file doesn't exist, defaultData is used instead
    await db.read();

    res.json(db.data);
});

app.get('/api/products/detail/:id', async function (req, res) {
    await db.read();

    db.data ||= {
        products: []
    }

    const items = db.data.products.filter((p) => p.id === +req.params.id);

    items.length === 0 ? res.status(204).end() : res.json(items[0]);
});

app.post('/api/products', async function (req, res) {
    await db.read();
    db.data ||= {
        products: []
    }
    // Create and query items using plain JavaScript
    db.data.products.push(req.body)
    await db.write();

    res.status(201).json(req.body);
});

app.listen(PORT, function () {
    console.log(`Product api server is listening at http://localhost:${PORT}`);
});