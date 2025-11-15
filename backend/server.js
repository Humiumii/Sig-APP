const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/services", (req, res) => {
  const data = JSON.parse(fs.readFileSync("./data/services.json"));
  res.json(data);
});

app.listen(3001, () => console.log("Backend corriendo en http://localhost:3001"));
