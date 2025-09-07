import express from 'express';
import cors from 'cors';
import { setupDatabase } from './database.js';

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

let db;

setupDatabase().then(database => {
  db = database;
  console.log('Veritabanı bağlantısı başarılı ve yeni alanlar hazır.');
}).catch(console.error);

// --- API ENDPOINTS ---

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === '12345') {
        res.json({ success: true, message: 'Giriş başarılı.' });
    } else {
        res.status(401).json({ success: false, message: 'Kullanıcı adı veya parola hatalı.' });
    }
});

app.get('/orders', async (req, res) => {
  const orders = await db.all('SELECT * FROM orders ORDER BY id DESC');
  res.json(orders);
});

app.post('/orders', async (req, res) => {
  const { customer, item } = req.body;
  if (!customer || !item) {
    return res.status(400).json({ message: 'Müşteri ve ürün bilgisi zorunludur.' });
  }
  const newStatus = 'Alındı';
  const result = await db.run(
    'INSERT INTO orders (customer, item, status) VALUES (?, ?, ?)',
    [customer, item, newStatus]
  );
  const newOrder = { id: result.lastID, customer, item, status: newStatus };
  res.status(201).json(newOrder);
});

// GÜNCELLENDİ: Bu endpoint artık status dışında phone, address, notes gibi alanları da güncelleyebilir.
app.patch('/orders/:id', async (req, res) => {
    const { id } = req.params;
    const fields = req.body; // { status: 'Yolda', phone: '555...' } gibi

    const validFields = ['customer', 'item', 'status', 'phone', 'address', 'notes'];
    const fieldEntries = Object.entries(fields).filter(([key]) => validFields.includes(key));

    if (fieldEntries.length === 0) {
        return res.status(400).json({ message: 'Güncellenecek alan bulunamadı.' });
    }

    const setClauses = fieldEntries.map(([key]) => `${key} = ?`).join(', ');
    const values = fieldEntries.map(([, value]) => value);

    await db.run(`UPDATE orders SET ${setClauses} WHERE id = ?`, [...values, id]);
    res.json({ message: 'Sipariş detayları güncellendi.' });
});

app.post('/orders/:id/send-dm', (req, res) => {
    const { id } = req.params;
    const { message } = req.body;
    console.log(`Sipariş ID ${id} için DM gönderiliyor: "${message}"`);
    res.json({ success: true, message: `DM, sipariş ${id} için başarıyla gönderildi (simülasyon).` });
});

app.listen(port, () => {
  console.log(`Backend sunucusu http://localhost:${port} adresinde çalışıyor`);
});