import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function setupDatabase() {
  const db = await open({
    filename: './database.db',
    driver: sqlite3.Database
  });

  // YENİ ALANLAR EKLENDİ: phone, address, notes
  await db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer TEXT NOT NULL,
      item TEXT NOT NULL,
      status TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      notes TEXT
    )
  `);

  return db;
}