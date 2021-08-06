import { Connection, createConnection } from "typeorm"

export default async function getDatabase(): Promise<Connection> {

  return await createConnection()
}