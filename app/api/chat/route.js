function buildPrompt({ topic, difficulty, numQuestions }) {
    const resolvedTopic = topic?.trim() || 'a random topic'

    return `You are an expert quiz master who creates challenging, thought-provoking questions that truly test understanding — not just surface-level recall.

Generate ${numQuestions} multiple choice questions about ${resolvedTopic} at a ${difficulty} difficulty level.

Requirements for HIGH-QUALITY questions:
- Focus on conceptual understanding, application, and critical thinking — NOT trivial definitions or obvious facts.
- Include tricky but fair distractors (wrong choices) that sound plausible and target common misconceptions.
- Each question should require the test-taker to actually THINK, not just recognize a keyword.
- Vary question types: "what happens when…", "which of the following is TRUE/FALSE", "what is the best approach for…", "why does X behave this way", scenario-based questions, code output questions (if technical), edge cases, and comparisons.
- For ${difficulty === 'easy' ? 'easy: questions should still be meaningful — test core concepts clearly but avoid being trivially obvious' : difficulty === 'medium' ? 'medium: questions should require solid understanding, include some nuance, and test ability to distinguish similar concepts' : 'hard: questions should cover edge cases, subtle distinctions, advanced scenarios, and require deep expertise'}.
- Explanations should teach — briefly explain WHY the correct answer is right AND why the most tempting wrong answer is wrong.

Return your answer entirely in the form of a JSON object. The JSON object should have a key named "questions" which is an array of the questions. Don't include anything other than the JSON. The JSON properties of each question should be "query", "choices", "answer", and "explanation". The choices should not have any ordinal value like A, B, C, D or a number like 1, 2, 3, 4. The answer should be the 0-indexed number of the correct choice. Each question must have exactly 4 choices.`
}

function normalizeQuizResponse(payload, fallbackCount) {
    const questions = Array.isArray(payload?.questions) ? payload.questions : []

    return {
        questions: questions.slice(0, fallbackCount).map((question) => ({
            query: String(question?.query ?? '').trim(),
            choices: Array.isArray(question?.choices)
                ? question.choices.map((choice) => String(choice))
                : [],
            answer: Number(question?.answer ?? -1),
            explanation: String(question?.explanation ?? '').trim(),
        })),
    }
}

function ensureQuestionCount(quiz, topic, difficulty, numQuestions) {
    const normalizedQuestions = Array.isArray(quiz?.questions)
        ? quiz.questions.filter(
              (question) =>
                  question?.query &&
                  Array.isArray(question?.choices) &&
                  question.choices.length > 0 &&
                  Number.isInteger(Number(question?.answer))
          )
        : []

    if (normalizedQuestions.length >= numQuestions) {
        return {
            questions: normalizedQuestions.slice(0, numQuestions),
        }
    }

    const fallbackQuestions = createFallbackQuiz(
        topic,
        difficulty,
        numQuestions
    ).questions

    return {
        questions: [...normalizedQuestions, ...fallbackQuestions].slice(
            0,
            numQuestions
        ),
    }
}

function createFallbackQuiz(topic, difficulty, numQuestions) {
    const subject = topic?.trim() || 'this topic'
    const level = difficulty || 'beginner'

    const promptVariants = [
        () => ({
            query: `Which sentence best describes ${subject}?`,
            choices: [
                `${subject} is a topic or skill someone can learn and practice.`,
                `${subject} is always a physical object.`,
                `${subject} only exists in mathematics.`,
                `${subject} cannot be explained to beginners.`,
            ],
            answer: 0,
            explanation: `${subject} can be introduced as a concept, subject, or skill. The other options are unnecessarily absolute and usually incorrect.`,
        }),
        () => ({
            query: `What is a good first step when learning ${subject} at a ${level} level?`,
            choices: [
                `Start with the basic ideas and simple examples.`,
                `Memorize advanced terms without context.`,
                `Skip practice and only read summaries.`,
                `Avoid asking beginner questions.`,
            ],
            answer: 0,
            explanation: `Beginners learn fastest by starting with fundamentals and applying them to small examples before moving to harder material.`,
        }),
        () => ({
            query: `Why do examples help when studying ${subject}?`,
            choices: [
                `They show how the main idea works in practice.`,
                `They remove the need to understand the topic.`,
                `They guarantee mastery after one try.`,
                `They make definitions unnecessary.`,
            ],
            answer: 0,
            explanation: `Examples connect theory to practice, which makes a new topic easier to understand and remember.`,
        }),
        () => ({
            query: `Which habit is most useful for improving in ${subject}?`,
            choices: [
                `Regular practice and review.`,
                `Ignoring mistakes.`,
                `Changing topics every few minutes.`,
                `Only focusing on the hardest material first.`,
            ],
            answer: 0,
            explanation: `Consistent practice and review build understanding over time and make it easier to spot weak areas.`,
        }),
        () => ({
            query: `What does a beginner usually gain first from studying ${subject}?`,
            choices: [
                `A basic understanding of key ideas and terms.`,
                `Instant expert-level knowledge.`,
                `A complete replacement for practice.`,
                `A guarantee that no confusion will happen.`,
            ],
            answer: 0,
            explanation: `The first milestone is usually understanding the main ideas and vocabulary well enough to continue learning.`,
        }),
        () => ({
            query: `If something about ${subject} is confusing, what is the best response?`,
            choices: [
                `Break it into smaller parts and review the basics.`,
                `Assume the topic cannot be learned.`,
                `Skip all explanations.`,
                `Avoid the topic permanently.`,
            ],
            answer: 0,
            explanation: `Breaking a topic into smaller parts makes it easier to understand and helps you find the exact point of confusion.`,
        }),
        (index) => ({
            query: `Question ${index + 1}: Which learning method is most effective for building confidence in ${subject}?`,
            choices: [
                `Practice regularly with progressively harder examples.`,
                `Wait until everything feels easy before starting.`,
                `Avoid reviewing mistakes.`,
                `Change the topic every time it becomes challenging.`,
            ],
            answer: 0,
            explanation: `Confidence usually comes from repeated practice and gradual progress, not from avoiding difficult parts.`,
        }),
        (index) => ({
            query: `Question ${index + 1}: What is the main benefit of reviewing mistakes while learning ${subject}?`,
            choices: [
                `It helps identify weak spots and improve faster.`,
                `It makes practice unnecessary.`,
                `It guarantees instant mastery.`,
                `It only matters for advanced learners.`,
            ],
            answer: 0,
            explanation: `Reviewing mistakes shows where understanding is incomplete, which is one of the fastest ways to improve.`,
        }),
        (index) => ({
            query: `Question ${index + 1}: Why is consistent study useful for ${subject}?`,
            choices: [
                `It helps ideas build on each other over time.`,
                `It removes the need for practice.`,
                `It means explanations are no longer needed.`,
                `It only helps if the topic never changes.`,
            ],
            answer: 0,
            explanation: `Steady study improves retention and makes it easier to connect new concepts with earlier ones.`,
        }),
        (index) => ({
            query: `Question ${index + 1}: What should you focus on first when a topic in ${subject} feels difficult?`,
            choices: [
                `The core idea behind the concept.`,
                `Only the most advanced edge cases.`,
                `Memorizing every detail immediately.`,
                `Skipping the topic completely.`,
            ],
            answer: 0,
            explanation: `Understanding the core idea first gives you a foundation for the details that come later.`,
        }),
    ]

    const questions = Array.from({ length: numQuestions }, (_, index) => {
        const template = promptVariants[index % promptVariants.length]
        return template(index)
    })

    return {
        questions,
    }
}

async function generateWithGroq(prompt) {
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'test') {
        console.log('[Quiz] No valid GROQ_API_KEY set')
        return null
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: 'You are an expert quiz creator. Generate challenging, thoughtful questions with plausible distractors. Never create trivially easy or obvious questions. Respond ONLY with valid JSON.' },
                { role: 'user', content: prompt },
            ],
            temperature: 0.9,
            max_tokens: 4096,
            response_format: { type: 'json_object' },
        }),
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(
            data?.error?.message || 'Groq quiz generation failed.'
        )
    }

    return data?.choices?.[0]?.message?.content || null
}

async function generateWithGoogle(prompt) {
    if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY === 'test') {
        console.log('[Quiz] No valid GOOGLE_API_KEY set')
        return null
    }

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: prompt }],
                    },
                ],
                generationConfig: {
                    temperature: 0.9,
                    responseMimeType: 'application/json',
                },
            }),
        }
    )

    const data = await response.json()

    if (!response.ok) {
        throw new Error(
            data?.error?.message || 'Google quiz generation failed.'
        )
    }

    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null
}

async function generateWithOpenAI(prompt) {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'test') {
        console.log('[Quiz] No valid OPENAI_API_KEY set')
        return null
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are an expert quiz creator. Generate challenging, thoughtful questions with plausible distractors. Never create trivially easy or obvious questions.' },
                { role: 'user', content: prompt },
            ],
            temperature: 0.9,
            max_tokens: 4096,
            response_format: { type: 'json_object' },
        }),
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(
            data?.error?.message || 'OpenAI quiz generation failed.'
        )
    }

    return data?.choices?.[0]?.message?.content || null
}

export async function POST(request) {
    try {
        const body = await request.json()
        const difficulty = body?.difficulty?.trim?.() || 'easy'
        const topic = body?.topic?.trim?.()
        const parsedCount = Number(body?.numQuestions)
        const numQuestions =
            Number.isFinite(parsedCount) && parsedCount > 0
                ? Math.min(parsedCount, 100)
                : 5

        const prompt = buildPrompt({
            topic,
            difficulty,
            numQuestions,
        })

        let content = null
        const providerErrors = []

        console.log('[Quiz] Attempting Groq (free)...')
        try {
            content = await generateWithGroq(prompt)
            if (content) console.log('[Quiz] Groq succeeded!')
        } catch (groqError) {
            console.error('[Quiz] Groq failed:', groqError?.message || groqError)
            providerErrors.push(
                groqError instanceof Error
                    ? groqError.message
                    : 'Groq quiz generation failed.'
            )
        }

        if (!content) {
            console.log('[Quiz] Attempting Google Gemini...')
            try {
                content = await generateWithGoogle(prompt)
                if (content) console.log('[Quiz] Google Gemini succeeded!')
            } catch (googleError) {
                console.error('[Quiz] Google failed:', googleError?.message || googleError)
                providerErrors.push(
                    googleError instanceof Error
                        ? googleError.message
                        : 'Google quiz generation failed.'
                )
            }
        }

        if (!content) {
            console.log('[Quiz] Attempting OpenAI...')
            try {
                content = await generateWithOpenAI(prompt)
                if (content) console.log('[Quiz] OpenAI succeeded!')
            } catch (openAIError) {
                console.error('[Quiz] OpenAI failed:', openAIError?.message || openAIError)
                providerErrors.push(
                    openAIError instanceof Error
                        ? openAIError.message
                        : 'OpenAI quiz generation failed.'
                )
            }
        }

        if (!content) {
            console.warn('[Quiz] All providers failed, using fallback. Errors:', providerErrors)
            return Response.json(createFallbackQuiz(topic, difficulty, numQuestions), {
                headers: {
                    'X-Quiz-Source': 'fallback',
                },
            })
        }

        const normalizedQuiz = normalizeQuizResponse(
            JSON.parse(content),
            numQuestions
        )

        return Response.json(
            ensureQuestionCount(
                normalizedQuiz,
                topic,
                difficulty,
                numQuestions
            )
        )
    } catch (error) {
        return Response.json(createFallbackQuiz('', 'beginner', 5), {
            headers: {
                'X-Quiz-Source': 'fallback',
                'X-Quiz-Error': error instanceof Error ? error.message : 'Unknown error',
            },
        })
    }
}
