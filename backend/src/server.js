const app = require("./app");
const connectDB = require("./config/db");
const { PORT } = require("./config/env");

connectDB();

app.listen(PORT,'0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});