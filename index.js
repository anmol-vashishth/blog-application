const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/user");
const blogRoutes = require("./routes/blog");
const logger = require("./middlewares/logger");
const auth = require("./middlewares/auth");
require('dotenv').config();


const app = express();
app.use(express.json());
const PORT = process.env.PORT || 7002;
console.log(`This is the port, ${PORT}`)

mongoose
  .connect(process.env.DB_URI)
  .then(() => console.log("MongoDB connected successfully"));

app.use(logger);
app.use("/auth", userRoutes);
app.use("/blog", auth, blogRoutes);

app.get("/", (req, res, next) => {
  const responseText = `<b>Request time : ${req.requestTime}<b>`;
  res.send(responseText);
  next();
});
app.listen(PORT, () => console.log(`Server reunning on port ${PORT}`));
