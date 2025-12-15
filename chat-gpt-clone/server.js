import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { chatboat } from "./chatboat.js";

const app = express();
const PORT = 3000;

// ✅ Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ MUST be absolute paths
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());

// Home
app.get("/", (req, res) => {
  res.render("index");
});

// Chat API
app.post("/Chat", async (req, res) => {
  try {
    const { message, threadId } = req.body;

    if (!message || !threadId) {
      return res.status(400).json({ message: "all fields are required!" });
    }

    const Response = await chatboat(message, threadId);
    res.json({ Response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
