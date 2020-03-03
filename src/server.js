const knex = require("knex");
const cors = require("cors");
const app = require("./app");
const { CLIENT_ORIGIN } = require("./config");

const PORT = process.env.PORT || 2000;
const DB_URL = process.env.DB_URL;

const db = knex({
  client: "pg",
  connection: DB_URL
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
