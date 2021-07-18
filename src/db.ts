import { open } from 'sqlite';
import sqlite3 from 'sqlite3'

export default async function getDatabase(path: string) {

  const db = await open<sqlite3.Database, sqlite3.Statement>({
    filename: `${path}/database.db`,
    driver: sqlite3.Database
  })

  await db.migrate({
    migrationsPath: 'migrate'
  })

  return db
}