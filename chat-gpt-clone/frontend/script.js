

const input = document.querySelector('#input');
const askbtn = document.querySelector("#askbtn")
const chatContainer = document.querySelector("#chat-container")
input.addEventListener('keyup', handleEnter)
askbtn.addEventListener('click', handleAsk)
const max_retires = 5 ;
let count = 0;
const loadding = document.createElement("div");
loadding.className = 'my-6 animate-pulse resize-none outline-0 p-3'
loadding.textContent = 'Thinking............'

async function handleEnter(e) {
    if (e.key == "Enter") {
        const text = input.value.trim();
        if (!text) {
            return
        }
        await Generate(text)
    }
}

async function callserver(inputText) {
    debugger;
    count = count + 1 ;

    while(count > max_retires){

        return {Response : "Please try after sometime...."} ;
    }
   const threadId =  Date.now().toString(36) + Math.random().toString(36).substring(2,8);

     try {
    const response = await fetch('http://localhost:3000/Chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: inputText, threadId })
    });
    const data = await response.json();
    console.log('Server Response:', data);

    return data; 
  } catch (error) {
    console.error('Error calling server:', error);
    return { Response: 'Error connecting to server.' };
  }
}
async function handleAsk(e) {
    const text = input.value.trim();
    if (!text) {
        return
    }
    await Generate(text)
}

async function Generate(text) {
    const msg = document.createElement('div');
    msg.className = `my-6 bg-neutral-800 p-3 rounded-xl ml-auto max-w-fit`;
    msg.textContent = text;
    chatContainer.appendChild(msg);
    input.value = "";

    chatContainer.appendChild(loadding);

    const assistancemessege = await callserver(text);
    console.log('assistancemessege', assistancemessege.Response);


    const Assistantmsg = document.createElement('div');
    Assistantmsg.className = `max-w-fit`;
    Assistantmsg.textContent = assistancemessege.Response;

    loadding.remove();
    chatContainer.appendChild(Assistantmsg);
}