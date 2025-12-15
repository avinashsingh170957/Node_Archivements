import express from "express";
import { chatboat } from "./chatboat.js";
import cors from 'cors'
const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(express.json())
app.get("/", (req, res) => {

    res.render('index', { 
    title: 'Home Page',
    message: 'Welcome to EJS in Node.js!' 
  })
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

