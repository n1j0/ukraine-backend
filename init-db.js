const db = require('./config/database')

const initDB = async () => {
  const client = await db.connect()
  await Promise.all([
    client.query('CREATE TABLE IF NOT EXISTS "kilometers" ("id" SERIAL PRIMARY KEY, "name" varchar(255), "kilometers" decimal(65,3), "image" varchar)'),
    client.query('CREATE TABLE IF NOT EXISTS "donations" ("id" SERIAL PRIMARY KEY, "name" varchar(255), "amount" decimal(65,2), "image" varchar)'),
    client.query('CREATE TABLE IF NOT EXISTS "users" ("id" SERIAL PRIMARY KEY, "username" varchar(255), "password" varchar)')
  ])
  await client.query('INSERT INTO "users" (username, password) VALUES (\'admin\', \'$2a$12$tSiOhEZuKdDOgl9DqgrAKuS4Ze4WfUSI.wjM/oEa6lbCxKw4Xdptq\')')
  await client.release()
}

module.exports = {
  initDB
}
