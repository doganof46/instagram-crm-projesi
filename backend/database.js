import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function setupDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer TEXT NOT NULL,
        item TEXT NOT NULL,
        status TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        notes TEXT
      )
    `);
    console.log('Veritabanı tablosu başarıyla kontrol edildi/oluşturuldu.');
  } catch (err) {
    console.error('Tablo oluşturulurken hata:', err);
  } finally {
    client.release();
  }
}

export default pool;