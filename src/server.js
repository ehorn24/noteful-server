const knex = require("knex");
const cors = require("cors");
const app = require("./app");
const { PORT, DATABASE_URL } = require("./config");

const DATABASE_URL = process.env.DATABASE_URL;

const db = knex({
  client: "pg",
  connection: DATABASE_URL
});

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

app.set("db", db);

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
