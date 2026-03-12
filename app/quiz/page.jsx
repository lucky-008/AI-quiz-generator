'use client'

import { useEffect, useState } from 'react'

import { useSearchParams, useRouter } from 'next/navigation'

import { motion, useSpring } from 'framer-motion'

import LoadingScreen from '../components/LoadingScreen'
import Question from '../components/Question'

import { testQuiz } from '../constants/testQuiz'

import 'highlight.js/styles/atom-one-dark.css'
import hljs from 'highlight.js'

const QuizPage = () => {
    const params = useSearchParams()
    const router = useRouter()

    const difficulty = params.get('difficulty') || 'easy'
    const topic = params.get('topic') || ''
    const requestedQuestionCount = Number(params.get('numQuestions')) || 5
    const numQuestions = Math.min(Math.max(requestedQuestionCount, 1), 100)

    const [quiz, setQuiz] = useState([]) // array of questions
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const [numSubmitted, setNumSubmitted] = useState(0)
    const [numCorrect, setNumCorrect] = useState(0)

    const [progress, setProgress] = useState(0)

    const [responseStream, setResponseStream] = useState('')

    const scaleX = useSpring(progress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.002,
    })

    useEffect(() => {
        const generateQuestions = async () => {
            setIsLoading(true)
            setErrorMessage('')

            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        difficulty,
                        topic,
                        numQuestions,
                    }),
                })

                if (!response.ok) {
                    const errorData = await response.json().catch(() => null)
                    throw new Error(errorData?.error || 'Failed to fetch data')
                }

                const data = await response.json()

                setQuiz(Array.isArray(data?.questions) ? data.questions : [])
                setResponseStream(JSON.stringify(data))
            } catch (err) {
                setErrorMessage(
                    err instanceof Error
                        ? err.message
                        : 'Something went wrong while generating the quiz.'
                )
            } finally {
                setIsLoading(false)
            }
        }
        generateQuestions()
    }, [difficulty, topic, numQuestions])

    useEffect(() => {
        hljs.highlightAll()
    }, [quiz])

    useEffect(() => {
        // set progress 0 - 1
        setProgress(numQuestions ? numSubmitted / numQuestions : 0)

        // if all questions submitted
        if (numSubmitted === numQuestions && numQuestions !== 0) {
            const score = numCorrect / numSubmitted
            router.push(`/end-screen?score=${score}`)
        }
    }, [numSubmitted, numQuestions, numCorrect, router])

    useEffect(() => {
        // update progress bar
        scaleX.set(progress)
    }, [progress])

    return (
        <div>
            {/* <div className='fixed right-0 p-4'>
                <div>Submitted: {numSubmitted}</div>
                <div>Correct: {numCorrect}</div>
            </div> */}

            <motion.div className='progress-bar' style={{ scaleX }} />

            {/* <h1 className='pt-12 text-3xl font-semibold text-center'>
                Quiz Page
            </h1> */}
            {isLoading ? (
                <>
                    <LoadingScreen responseStream={responseStream} />
                </>
            ) : errorMessage ? (
                <div className='min-h-screen grid place-items-center px-6'>
                    <div className='max-w-xl text-center'>
                        <h1 className='text-2xl font-semibold text-red-300'>
                            Quiz generation failed
                        </h1>
                        <p className='mt-4 text-white/70'>{errorMessage}</p>
                        <button
                            type='button'
                            className='q-button mt-8'
                            onClick={() => router.push('/')}
                        >
                            Back to home
                        </button>
                    </div>
                </div>
            ) : (
                <div className='pt-12'>
                    {/* <button onClick={() => console.log(JSON.parse(stuff.replace(/\n/g, ''))) }>Show stuff</button>
                    <button onClick={() => console.log('asdf') }>Show asdf</button> */}
                    {quiz?.map((question, index) => (
                        // <div>{question.query}</div>
                        <div className='mb-12' key={index}>
                            <Question
                                question={question}
                                id={index}
                                key={index}
                                setNumSubmitted={setNumSubmitted}
                                setNumCorrect={setNumCorrect}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
export default QuizPage
