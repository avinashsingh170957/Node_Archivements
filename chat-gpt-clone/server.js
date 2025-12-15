import express from "express";
import { chatboat } from "./chatboat.js";

const app = express();
const PORT = 3000;

// ✅ REQUIRED
app.set("view engine", "ejs");

// ✅ Correct folders
app.set("views", "./views");
app.use(express.static("public"));

app.use(express.json());

// ✅ Home
app.get("/", (req, res) => {
  res.render("index", {
    title: "Home Page",
    message: "Welcome to EJS in Node.js!",
  });
});

// ✅ Chat API
app.post("/Chat", async (req, res) => {
  try {
    const { message, threadId } = req.body;

    if (!message || !threadId) {
      return res.status(400).json({ message: "all fields are required!" });
    }

    const Response = await chatboat(message, threadId);
    res.json({ Response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server Started On Port ${PORT}`);
});
