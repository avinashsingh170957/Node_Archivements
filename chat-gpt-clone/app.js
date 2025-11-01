import Groq from "groq-sdk";
import dotenv from "dotenv";
import { tavily } from "@tavily/core";
import readline from "readline/promises";
import { stdin, stdout } from "process";

dotenv.config();

const groq = new Groq({ apiKey: process.env.grokkey });

async function main() {
    const RL = readline.createInterface({
        input: stdin,
        output: stdout,
    });

    while (true) {
        const question = await RL.question("Enter Your Question (or type 'bye' to exit): ");

        if (question.toLowerCase() === "bye") {
            console.log("Goodbye!");
            break;
        }

        const msg = [
            {
                role: "system",
                content: `you have access to the following tool:
          1. web_search({query}:{query:string}) // search the latest information on the internet.`,
            },
            {
                role: "user",
                content: question,
            },
        ];
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
        const toolCalls = message.tool_calls;

        if (!toolCalls) {
            console.log("Assistant:", message.content);
            continue;
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

        console.log("Assistant:", finalCompletion.choices[0].message.content);
    }

    RL.close();
}

main();

async function web_search({ query }) {
    const tvly = tavily({ apiKey: process.env.twelyapi });
    const response = await tvly.search(query, { maxResults: 1 });
    const finalresult = response.results.map((r) => r.content).join("\n\n");
    return finalresult;
}
