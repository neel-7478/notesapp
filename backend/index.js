const express = require("express");
const cors = require('cors')
const connectToMongo = require("./db");

connectToMongo();
const app = express()
app.use(cors())
 
app.use(express.json());
const port = process.env.PORT || 5000;

// Available Routes
app.use("/api/auth",require("./routes/auth"));
app.use("/api/notes",require("./routes/notes"));

app.listen(port, () => {
  console.log(`cloud based note app listening on port ${port}`)
})