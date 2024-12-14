import pg from "pg";
import express from "express";
import morgan from "morgan";

const port = process.env.PORT || 3000;

const app = express();

const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/icecream_flavors_db"
);

async function init() {
  await client.connect();
  console.log("connected to database");
  let SQL = `DROP TABLE IF EXISTS flavors;
        CREATE TABLE flavors(id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        name VARCHAR(50),
        is_favorite BOOLEAN DEFAULT FALSE);
        INSERT INTO flavors(name, is_favorite) VALUES('Vanilla', true);
        INSERT INTO flavors(name, is_favorite) VALUES('Chocolate', false);
        INSERT INTO flavors(name, is_favorite) VALUES('Strawberry', false)`;
  await client.query(SQL);
  console.log("table created");
  SQL = ``;
  await client.query(SQL);
  console.log("data seeded");
  app.listen(port, () => console.log(`listening of port ${port}`));
}
init();

app.use(express.json());

app.get("/api/flavors", async (req, res, next) => {
  try {
    const SQL = `SELECT name, is_favorite FROM flavors`;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});
app.get("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = `SELECT name FROM flavors where id = $1`;
    const response = await client.query(SQL, [req.params.id]);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});
app.post("/api/flavors", async (req, res, next) => {
  try {
    const SQL = `INSERT INTO flavors(name)
    VALUES($1)
    RETURNING *`;
    const response = await client.query(SQL, [req.body.name]);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});
app.delete("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = `DELETE from flavors
    WHERE id=$1`;
    await client.query(SQL, [req.params.id]);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});
app.put("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = `UPDATE flavors
    
    SET name=$1, is_favorite=$2, updated_at= now()
    WHERE id=$3 RETURNING *`;
    const response = await client.query(SQL, [
      req.body.name,
      req.body.is_favorite,
      req.params.id,
    ]);
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});
