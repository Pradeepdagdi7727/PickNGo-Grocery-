require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");

const connectDB = require("./config/db");

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 🔌 DB connect
connectDB();

// routes (same as yours)
app.use("/", require("./Routers/auth/login"));
app.use("/", require("./Routers/auth/singup"));
app.use("/", require("./Routers/auth/forgotpassword"));

app.use("/admin", require("./Routers/Admin_router/addproduct"));
app.use("/admin", require("./Routers/Admin_router/dashboard"));
app.use("/admin", require("./Routers/Admin_router/delete"));
app.use("/admin", require("./Routers/Admin_router/orders"));
app.use("/admin", require("./Routers/Admin_router/products"));
app.use("/admin", require("./Routers/Admin_router/status"));
app.use("/admin", require("./Routers/Admin_router/update"));
app.use("/admin", require("./Routers/Admin_router/profile"));

app.use("/customer", require("./Routers/customer_router/add"));
app.use("/customer", require("./Routers/customer_router/deleteCart"));
app.use("/customer", require("./Routers/customer_router/order"));
app.use("/customer", require("./Routers/customer_router/orderHistory"));
app.use("/customer", require("./Routers/customer_router/productByid"));
app.use("/customer", require("./Routers/customer_router/products"));
app.use("/customer", require("./Routers/customer_router/updateCart"));
app.use("/customer", require("./Routers/customer_router/view"));
app.use("/customer", require("./Routers/customer_router/profile"));

app.get("/", (req, res) => {
  res.send("PICKNGO API running 🚀");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});