'use client'

import { useEffect, useState, useRef } from 'react'

import { useSearchParams, useRouter } from 'next/navigation'

import { motion, useSpring } from 'framer-motion'

import LoadingScreen from '../components/LoadingScreen'
import Question from '../components/Question'

import { testQuiz } from '../constants/testQuiz'

import { saveQuizActivity } from '../utils/activityTracker'

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

    // Overall timer: 1 minute per question
    const [timeLeft, setTimeLeft] = useState(numQuestions * 60)
    const [timeUp, setTimeUp] = useState(false)
    const timerRef = useRef(null)

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

    // Start timer once quiz is loaded
    useEffect(() => {
        if (quiz.length === 0) return
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current)
                    setTimeUp(true)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(timerRef.current)
    }, [quiz])

    // Stop timer when all questions submitted
    useEffect(() => {
        if (numSubmitted === numQuestions && numQuestions !== 0) {
            clearInterval(timerRef.current)
        }
    }, [numSubmitted, numQuestions])

    const timerColor = () => {
        if (timeLeft <= 30) return 'text-red-400'
        if (timeLeft <= numQuestions * 20) return 'text-yellow-400'
        return 'text-cyan-300'
    }

    useEffect(() => {
        hljs.highlightAll()
    }, [quiz])

    useEffect(() => {
        // set progress 0 - 1
        setProgress(numQuestions ? numSubmitted / numQuestions : 0)

        // if all questions submitted
        if (numSubmitted === numQuestions && numQuestions !== 0) {
            const score = numCorrect / numSubmitted
            saveQuizActivity({
                topic,
                difficulty,
                numQuestions,
                score,
                questions: quiz,
            })
            router.push(`/end-screen?score=${score}`)
        }
    }, [numSubmitted, numQuestions, numCorrect, router])

    useEffect(() => {
        // update progress bar
        scaleX.set(progress)
    }, [progress])

<<<<<<< HEAD
<<<<<<< HEAD
=======
    // Handler for overall submission
    const handleSubmitAll = () => {
        // If already submitted all, do nothing
        if (numSubmitted === numQuestions) return;
        // Calculate score based on current numCorrect and numSubmitted
        const score = numCorrect / (numSubmitted === 0 ? 1 : numSubmitted);
        setNumSubmitted(numQuestions);
        saveQuizActivity({
            topic,
            difficulty,
            numQuestions,
            score,
            questions: quiz,
        });
        router.push(`/end-screen?score=${score}`);
    };

>>>>>>> 42f5ae2 (Add quiz submit all button and topic table pagination)
=======
>>>>>>> 57b911d (Push latest changes)
    return (
        <div>
            {/* <div className='fixed right-0 p-4'>
                <div>Submitted: {numSubmitted}</div>
                <div>Correct: {numCorrect}</div>
            </div> */}

            <motion.div className='progress-bar' style={{ scaleX }} />

            {/* Overall timer */}
            {!isLoading && !errorMessage && quiz.length > 0 && (
                <div className='fixed top-12 right-4 z-20 bg-[#0a0e1a]/90 border border-blue-500/30 rounded-lg px-4 py-2'>
                    <span className={`text-lg font-mono font-bold ${timerColor()}`}>
                        {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                    </span>
                </div>
            )}

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
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 57b911d (Push latest changes)
                    {/* <button onClick={() => console.log(JSON.parse(stuff.replace(/\n/g, ''))) }>Show stuff</button>
                    <button onClick={() => console.log('asdf') }>Show asdf</button> */}
                    {quiz?.map((question, index) => (
                        // <div>{question.query}</div>
<<<<<<< HEAD
=======
                    {quiz?.map((question, index) => (
>>>>>>> 42f5ae2 (Add quiz submit all button and topic table pagination)
=======
>>>>>>> 57b911d (Push latest changes)
                        <div className='mb-12' key={index}>
                            <Question
                                question={question}
                                id={index}
                                key={index}
                                setNumSubmitted={setNumSubmitted}
                                setNumCorrect={setNumCorrect}
                                timeUp={timeUp}
                            />
                        </div>
                    ))}
<<<<<<< HEAD
<<<<<<< HEAD
=======
                    {/* Overall Submit Button */}
                    <div className='flex justify-center mt-8'>
                        <button
                            type='button'
                            className='q-button bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md'
                            onClick={handleSubmitAll}
                            disabled={numSubmitted === numQuestions}
                        >
                            Submit All
                        </button>
                    </div>
>>>>>>> 42f5ae2 (Add quiz submit all button and topic table pagination)
=======
>>>>>>> 57b911d (Push latest changes)
                </div>
            )}
        </div>
    )
}
export default QuizPage
