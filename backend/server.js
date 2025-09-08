import express from 'express';
import cors from 'cors';
import pool, { setupDatabase } from './database.js';

const app = express();
const port = process.env.PORT || 5000;

// --- YENİ VE PROFESYONEL CORS AYARI ---
// Güvendiğimiz adreslerin bir listesini oluşturuyoruz
const allowedOrigins = [
  'https://instagram-crm-projesi.vercel.app', // Temiz, ana adres
  'https://instagram-crm-projesi-git-main-hocas-projects.vercel.app' // Vercel'in oluşturduğu önizleme adresi
];

app.use(cors({
  origin: function (origin, callback) {
    // Eğer gelen istek bu adreslerden biriyse veya tanımsızsa (örn: mobil uygulama gibi durumlar için) izin ver
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Bu sitenin erisimi engellendi (CORS).'));
    }
  }
}));

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

app.get('/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Siparişler alınırken bir hata oluştu.' });
  }
});

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

app.post('/orders/:id/send-dm', (req, res) => {
    const { id } = req.params;
    const { message } = req.body;
    console.log(`Sipariş ID ${id} için DM gönderiliyor: "${message}"`);
    res.json({ success: true, message: `DM, sipariş ${id} için başarıyla gönderildi (simülasyon).` });
});

app.listen(port, () => {
  console.log(`Sunucu ${port} portunda çalışıyor`);
});