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
    const [numWrong, setNumWrong] = useState(0)
    const [numAttempted, setNumAttempted] = useState(0)

    const [progress, setProgress] = useState(0)

    const [responseStream, setResponseStream] = useState('')
    
    const [questionResults, setQuestionResults] = useState([]) // Track which questions were correct/wrong

    const [forceSubmit, setForceSubmit] = useState(false) // Trigger submission for all questions

    // Overall timer: 1 minute per question
    const [timeLeft, setTimeLeft] = useState(numQuestions * 60)
    const [timeUp, setTimeUp] = useState(false)
    const timerRef = useRef(null)

    const scaleX = useSpring(progress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.002,
    })

    const hasSubmittedRef = useRef(false)

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
    }, [numSubmitted, numQuestions])

    // Handle redirect when all questions are submitted
    useEffect(() => {
        if (numSubmitted === numQuestions && numQuestions !== 0) {
            const attempted = numAttempted
            const notAttempted = numQuestions - attempted
            const wrong = numWrong
            const score = numCorrect / numSubmitted
            
            // Save quiz activity to history
            saveQuizActivity({
                topic,
                difficulty,
                numQuestions,
                score,
                questions: quiz,
            })
            
            // Store results in sessionStorage for end screen
            const resultsData = {
                quiz,
                questionResults,
                score,
                correct: numCorrect,
                wrong,
                attempted,
                notAttempted,
                timeOver: timeUp,
            };
            sessionStorage.setItem('quizResults', JSON.stringify(resultsData))
            
            const timeOverParam = timeUp ? '&timeOver=true' : ''
            router.push(`/end-screen?score=${score}&correct=${numCorrect}&wrong=${wrong}&attempted=${attempted}&notAttempted=${notAttempted}${timeOverParam}`)
        }
    }, [numSubmitted, numQuestions, numCorrect, numWrong, numAttempted, questionResults, quiz, router, topic, difficulty, timeUp])

    useEffect(() => {
        // update progress bar
        scaleX.set(progress)
    }, [progress])


    // Handler for Submit All button - triggers submission for all questions
    const handleSubmitAll = () => {
        setForceSubmit(true)
    };

    const handleQuestionAnswered = (questionId, isCorrect, selectedIndex) => {
        setQuestionResults((prev) => [
            ...prev,
            {
                questionId,
                isCorrect,
                selectedIndex,
            }
        ])
    };

    // Auto-submit when time runs up
    useEffect(() => {
        if (timeUp && numSubmitted < numQuestions) {
            setForceSubmit(true)
        }
    }, [timeUp, numSubmitted, numQuestions])


   return (
    <div>
        <motion.div className='progress-bar' style={{ scaleX }} />

        {!isLoading && !errorMessage && quiz.length > 0 && (
            <div className='fixed top-12 right-4 z-20 bg-[#0a0e1a]/90 border border-blue-500/30 rounded-lg px-4 py-2'>
                <span className={`text-lg font-mono font-bold ${timerColor()}`}>
                    {Math.floor(timeLeft / 60)}:
                    {String(timeLeft % 60).padStart(2, '0')}
                </span>
            </div>
        )}

        {isLoading ? (
            <LoadingScreen responseStream={responseStream} />
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
                {quiz?.map((question, index) => (
                    <div className='mb-12' key={index}>
                        <Question
                            question={question}
                            id={index}
                            setNumSubmitted={setNumSubmitted}
                            setNumCorrect={setNumCorrect}
                            setNumAttempted={setNumAttempted}
                            setNumWrong={setNumWrong}
                            timeUp={timeUp}
                            onQuestionAnswered={handleQuestionAnswered}
                            forceSubmit={forceSubmit}
                        />
                    </div>
                ))}

                <div className='flex flex-col items-center gap-4 mt-8'>
                    {timeUp && (
                        <div className='text-center text-red-400 text-lg font-bold'>
                            ⏰ Time Over! Auto-submitting...
                        </div>
                    )}
                    <button
                        type='button'
                        className='q-button bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md'
                        onClick={handleSubmitAll}
                        disabled={timeUp || forceSubmit}
                    >
                        Submit All
                    </button>
                </div>
            </div>
        )}
    </div>
)
}
export default QuizPage
