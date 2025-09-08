import express from 'express';
import cors from 'cors';
import pool, { setupDatabase } from './database.js';

const app = express();
const port = process.env.PORT || 5000;

// CORS ayarı (Daha sonra frontend adresinizi buraya yazacaksınız)
app.use(cors());
app.use(express.json());

// Sunucu başlarken veritabanı tablosunu kontrol et/oluştur
setupDatabase();

// --- API ENDPOINTS ---

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === '12345') {
        res.json({ success: true, message: 'Giriş başarılı.' });
    } else {
        res.status(401).json({ success: false, message: 'Kullanıcı adı veya parola hatalı.' });
    }
});

// GET /orders: Tüm siparişleri çek
app.get('/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Siparişler alınırken bir hata oluştu.' });
  }
});

// POST /orders: Yeni sipariş ekle
app.post('/orders', async (req, res) => {
  const { customer, item } = req.body;
  if (!customer || !item) {
    return res.status(400).json({ message: 'Müşteri ve ürün bilgisi zorunludur.' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO orders (customer, item, status) VALUES ($1, $2, $3) RETURNING *',
      [customer, item, 'Alındı']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sipariş eklenirken bir hata oluştu.' });
  }
});

// PATCH /orders/:id: Sipariş güncelle
app.patch('/orders/:id', async (req, res) => {
    const { id } = req.params;
    const fields = req.body;
    const validFields = ['customer', 'item', 'status', 'phone', 'address', 'notes'];
    const fieldEntries = Object.entries(fields).filter(([key]) => validFields.includes(key));

    if (fieldEntries.length === 0) {
        return res.status(400).json({ message: 'Güncellenecek alan bulunamadı.' });
    }

    const setClauses = fieldEntries.map(([key], index) => `${key} = $${index + 1}`).join(', ');
    const values = fieldEntries.map(([, value]) => value);

    try {
        await pool.query(`UPDATE orders SET ${setClauses} WHERE id = $${values.length + 1}`, [...values, id]);
        res.json({ message: 'Sipariş detayları güncellendi.' });
    } catch(err) {
        console.error(err);
        res.status(500).json({ message: 'Sipariş güncellenirken bir hata oluştu.' });
    }
});

// ... (Diğer endpoint'ler)

app.listen(port, () => {
  console.log(`Sunucu ${port} portunda çalışıyor`);
});