import express from "express";
import { chatboat } from "./chatboat.js";
import cors from 'cors'
const app = express();
const PORT = 3000;

app.use(cors());
const allowedOrigins = ["https://node-archivements.vercel.app"];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true // if you need cookies/auth
}));
//app.use(express.json())
app.get("/", (req, res) => {

    res.send('Hello World !')
})

app.post("/Chat", async (req,res)=>{
    const {message,threadId} = req.body
    if (!message || !threadId) {
        res.status(400).json({messege : 'all fields are required !'});
        return;
    }
    const Response = await chatboat(message,threadId)
    res.json({Response  : Response})
})

app.listen(PORT, () => {
    console.log(`Server Started On Port No ${PORT}`);

})

