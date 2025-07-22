import { auth } from "@clerk/nextjs/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await auth();
    const { prompt, content, } = await req.json();

    if (!prompt || !content) {
      return NextResponse.json(
        { message: "Prompt and content are required" },
        { status: 400 }
      );
    }

    const llm = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
      apiKey: process.env.GOOGLE_GEMINI_API_KEY,
      maxOutputTokens: 3072,
      temperature: 0.7,
    });

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.error("Missing Gemini API key");
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    const fullPrompt = `Task: ${prompt}\n\nText: "${content}"\n\nPlease process the text accurately, making only meaningful changes. Ensure the response is concise and direct, with no unnecessary commentary, headers, or surrounding text. Return only the final result without additional explanations.`;

    try {
      const stream = await llm.stream(fullPrompt);
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              if (chunk.content) {
                const content =
                  typeof chunk.content === "string"
                    ? chunk.content
                    : JSON.stringify(chunk.content);
                controller.enqueue(new TextEncoder().encode(content));
              }
            }
            controller.close();
          } catch (error) {
            console.error("Streaming error:", error);
            controller.error(error);
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
    } catch (streamError: any) {
      console.error("Error creating stream:", streamError);
      return NextResponse.json(
        { message: "Error generating AI response", error: streamError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error in Gemini API:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
