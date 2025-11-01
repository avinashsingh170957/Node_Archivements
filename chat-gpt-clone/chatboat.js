import Groq from "groq-sdk";
import dotenv from "dotenv";
import { tavily } from "@tavily/core";
import NodeCache from "node-cache";
dotenv.config();

const groq = new Groq({ apiKey: process.env.grokkey });
const myCache = new NodeCache({stdTTL : 60 * 60 * 24}); // 24 hours
const basemessege = [
        {
            role: "system",
            content: `
                you are smart personal assistant
                If you know answer to the question, answer it directly in plain English.
                If the answer require real-time,local or up-do-date information, or if you dont't know the answer, use the available tools to find it. you have access to the following tool:
                web_search(query:string):use this to search the internet for current or unknown information.
                Do not mention the tool unless needed.

                Example:
                Q : What is capital of France.
                A : The capital of france is paris.

                Q : What's the weather in mumbai right now ?
                A : (use the search tool to find the latest weather)

                Q : Tell me latest IT news.
                A : (use the search tool to get the latest news) 

                current date and time : ${new Date().toUTCString()}
          `
        }
    ];
export async function chatboat(userMessege,threadId) {

    if (userMessege.toLowerCase() === "bye") {
        console.log("Goodbye!");
        return "Goodbye!";
    }    
    const msg = myCache.get(threadId) ?? basemessege;
    msg.push({
            role: "user",
            content: userMessege,
    })
    const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0,
        messages: msg,
        tools: [
            {
                type: "function",
                function: {
                    name: "web_search",
                    description: "Search the latest information on the internet",
                    parameters: {
                        type: "object",
                        properties: {
                            query: {
                                type: "string",
                                description: "The search query to perform search on.",
                            },
                        },
                        required: ["query"],
                    },
                },
            },
        ],
        tool_choice: "auto",
    });

    const message = completion.choices[0].message;
    msg.push(message);
    
    const toolCalls = completion.choices[0].message.tool_calls;
    if (!toolCalls) 
    {
        myCache.set(threadId,message);
       // console.log("myCache",myCache);        
        return completion.choices[0].message.content
    }
    for (const tool of toolCalls) {
        console.log("🔍 Using Tool:", tool.function.name);
        const functionName = tool.function.name;
        const functionParams = JSON.parse(tool.function.arguments);

        if (functionName === "web_search") {
            const toolResult = await web_search(functionParams);
            msg.push(message);
            msg.push({
                role: "tool",
                tool_call_id: tool.id,
                name: functionName,
                content: toolResult,
            });
        }
    }
    const finalCompletion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0,
        messages: msg,
    });
    return finalCompletion.choices[0].message.content;
}

async function web_search({ query }) {
    const tvly = tavily({ apiKey: process.env.twelyapi });
    const response = await tvly.search(query, { maxResults: 1 });
    const finalresult = response.results.map((r) => r.content).join("\n\n");
    return finalresult;
}
