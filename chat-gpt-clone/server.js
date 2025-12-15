import express from "express";
import { chatboat } from "./chatboat.js";
import cors from 'cors'
const app = express();
const PORT = 3000;
const options = {
    origin: 'https://node-archivements.vercel.app'
}
app.use(cors(
options
));
app.use(express.json())
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

