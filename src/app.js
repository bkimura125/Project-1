const express = require("express");
const accountRouter = require("./controller/AccountRouter");
const requestRouter = require("./controller/RequestRouter");
const logger = require("./util/Logger");
const app = express();
const PORT = 3000;

app.use("/account", accountRouter);
app.use("/request", requestRouter);

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});