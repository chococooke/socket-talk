const express = require("express");
const app = express();

const groupRoutes = require("./routes/group.routes");
const messageRoutes = require("./routes/message.routes");

app.use(express.json());
app.use("/", groupRoutes);
app.use("/", messageRoutes);

app.listen(5000, () => {
  console.log("Server is running on port 3000");
});
