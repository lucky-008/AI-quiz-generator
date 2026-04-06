async function chatWithGroq(messages) {
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'test') return null

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages,
            temperature: 0.7,
            max_tokens: 1024,
        }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data?.error?.message || 'Groq failed')
    return data?.choices?.[0]?.message?.content || null
}

async function chatWithGoogle(messages) {
    if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY === 'test') return null

    const contents = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
        }))

    const systemInstruction = messages.find((m) => m.role === 'system')

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents,
                systemInstruction: systemInstruction
                    ? { parts: [{ text: systemInstruction.content }] }
                    : undefined,
                generationConfig: { temperature: 0.7 },
            }),
        }
    )

    const data = await response.json()
    if (!response.ok) throw new Error(data?.error?.message || 'Google failed')
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null
}

async function chatWithOpenAI(messages) {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'test') return null

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages,
            temperature: 0.7,
            max_tokens: 1024,
        }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data?.error?.message || 'OpenAI failed')
    return data?.choices?.[0]?.message?.content || null
}

export async function POST(request) {
    try {
        const body = await request.json()
        const { question, userAnswer, correctAnswer, explanation, chatHistory } = body

        if (!question || !Array.isArray(chatHistory)) {
            return Response.json({ error: 'Invalid request' }, { status: 400 })
        }

        const systemMessage = {
            role: 'system',
            content: `You are a helpful tutor explaining quiz questions. Be concise, clear, and encouraging. Use simple language.

Context for this conversation:
- Question: ${question}
- User's answer: ${userAnswer}
- Correct answer: ${correctAnswer}
- Original explanation: ${explanation}

Help the user understand why their answer was wrong and why the correct answer is right. Answer any follow-up questions they have about this topic. Keep responses under 150 words.`,
        }

        const messages = [
            systemMessage,
            ...chatHistory.slice(-10).map((m) => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: String(m.content).slice(0, 500),
            })),
        ]

        let reply = null

        try { reply = await chatWithGroq(messages) } catch {}
        if (!reply) try { reply = await chatWithGoogle(messages) } catch {}
        if (!reply) try { reply = await chatWithOpenAI(messages) } catch {}

        if (!reply) {
            return Response.json(
                { reply: "I'm sorry, I couldn't generate a response right now. Please review the explanation provided with the question." },
                { status: 200 }
            )
        }

        return Response.json({ reply })
    } catch (error) {
        return Response.json(
            { error: 'Something went wrong' },
            { status: 500 }
        )
    }
}
