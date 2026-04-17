'use client'

import { useState, useEffect } from 'react'

import { useSearchParams, useRouter } from 'next/navigation'

import { pickRandom } from '../utils'

import { endMessages } from '../constants/endMessages'

import { useSpeech } from 'react-use'

// import Voice from '../components/Speak'

import useWindowSize from 'react-use/lib/useWindowSize'
import Confetti from 'react-confetti'

import { gifs } from '../constants/gifs'

const EndScreen = () => {
    // const voices = window.speechSynthesis.getVoices()
    // console.log(voices)

    const router = useRouter()
    const params = useSearchParams()

    const score = Number(params.get('score'))
    const correct = Number(params.get('correct'))
    const wrong = Number(params.get('wrong'))
    const attempted = Number(params.get('attempted'))
    const notAttempted = Number(params.get('notAttempted'))
    const timeOver = params.get('timeOver') === 'true'

    const [message, setMessage] = useState('')
    const [gif, setGif] = useState('')
    const [quizData, setQuizData] = useState(null)
    const [weakAreas, setWeakAreas] = useState([])

    // const state = useSpeech(message, {
    //     rate: 0.8,
    //     pitch: 0.5,
    //     voice: voices[1],
    // })

    const { width, height } = useWindowSize()

    const handlePlayAgain = () => {
        router.push('/')
    }

    useEffect(() => {
        // Retrieve quiz results from sessionStorage
        const storedResults = sessionStorage.getItem('quizResults')
        if (storedResults) {
            const results = JSON.parse(storedResults)
            setQuizData(results)
            
            // Find weak areas (questions answered incorrectly)
            const weak = results.quiz
                .map((q, idx) => {
                    const result = results.questionResults.find(r => r.questionId === idx)
                    return {
                        index: idx,
                        question: q.query,
                        userAnswer: q.choices[result?.selectedIndex],
                        correctAnswer: q.choices[Number(q.answer)],
                        explanation: q.explanation,
                        isCorrect: result?.isCorrect || false,
                    }
                })
                .filter(q => !q.isCorrect) // Only questions answered incorrectly
            
            setWeakAreas(weak)
        }
    }, [])

    useEffect(() => {
        let grade = ''
        if (score === 1) {
            grade = 'perfect'
        } else if (score >= 0.7) {
            grade = 'good'
        } else {
            grade = 'bad'
        }

        let randomMessage = pickRandom(endMessages[grade])
        setMessage(randomMessage)


        let randomGif = pickRandom(gifs[grade])
        setGif(randomGif)
    }, [])

    // useSpeech('Hello world!', { rate: 0.8, pitch: 0.5, voice: voices[0] })
    // useSpeech(message, { rate: 0.8, pitch: 0.5, voice: voices[0] })

    return (
        <div className='min-h-screen'>
            {/* <Voice message={message} /> */}
            {/* <pre>{JSON.stringify(state, null, 2)}</pre> */}


            {score >= 0.8 && <Confetti width={width} height={height} className='overflow-hidden'/>}

            <div className='max-w-3xl flex flex-col items-center mx-auto z-10 py-8'>
                <h2 className='text-7xl mb-4'>Score: {score * 100}%</h2>
                <div className='grid grid-cols-2 gap-4 text-xl mb-6'>
                    <div className='bg-cyan-900/30 rounded-lg px-6 py-3 text-cyan-200 font-semibold'>Correct: {correct}</div>
                    <div className='bg-red-900/30 rounded-lg px-6 py-3 text-red-300 font-semibold'>Wrong: {wrong}</div>
                    <div className='bg-blue-900/30 rounded-lg px-6 py-3 text-blue-200 font-semibold'>Attempted: {attempted}</div>
                    <div className='bg-gray-700/30 rounded-lg px-6 py-3 text-gray-300 font-semibold'>Not Attempted: {notAttempted}</div>
                </div>
                <iframe
                    src={gif}
                    width='480'
                    height='269'
                    // frameBorder='0'
                    className='giphy-embed mt-8'
                    allowFullScreen
                ></iframe>

                <p className='text-3xl mt-12 text-center'>{message}</p>

                {timeOver && (
                    <div className='mt-6 text-center text-red-400 text-lg font-semibold'>
                        ⏰ Time limit exceeded - Quiz auto-submitted!
                    </div>
                )}

                {/* Weak Areas Section */}
                {weakAreas.length > 0 && (
                    <div className='w-full mt-12 px-4'>
                        <h3 className='text-2xl font-semibold text-red-400 mb-6'>Areas for Improvement</h3>
                        <div className='space-y-4'>
                            {weakAreas.map((area, idx) => (
                                <div key={idx} className='border border-red-500/30 rounded-lg p-4 bg-red-900/10'>
                                    <h4 className='text-lg font-semibold text-white mb-3'>Question {area.index + 1}</h4>
                                    <p className='text-base mb-3 text-gray-200'>{area.question}</p>
                                    <div className='grid grid-cols-2 gap-3 mb-3'>
                                        <div className='bg-red-900/30 rounded p-3'>
                                            <p className='text-xs text-red-300 font-semibold mb-1'>Your Answer</p>
                                            <p className='text-sm text-white'>{area.userAnswer || 'Not answered'}</p>
                                        </div>
                                        <div className='bg-cyan-900/30 rounded p-3'>
                                            <p className='text-xs text-cyan-300 font-semibold mb-1'>Correct Answer</p>
                                            <p className='text-sm text-white'>{area.correctAnswer}</p>
                                        </div>
                                    </div>
                                    <div className='bg-blue-900/20 border border-blue-500/20 rounded p-3'>
                                        <p className='text-xs text-blue-300 font-semibold mb-2'>Explanation</p>
                                        <p className='text-sm text-gray-300'>{area.explanation}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className='flex gap-4 mt-12'>
                    <button
                        className='inline-block border-2 border-cyan-400 rounded text-cyan-400 text-center uppercase text-lg font-semibold px-6 py-2 hover:bg-cyan-400/40 hover:border-cyan-300 hover:text-white duration-75 active:bg-blue-600'
                        onClick={handlePlayAgain}
                    >
                        Play again
                    </button>
                    <button
                        className='inline-block border-2 border-blue-500 rounded text-blue-400 text-center uppercase text-lg font-semibold px-6 py-2 hover:bg-blue-500/40 hover:border-blue-400 hover:text-white duration-75 active:bg-blue-700'
                        onClick={() => router.push('/dashboard')}
                    >
                        Dashboard
                    </button>
                </div>
            </div>
        </div>
    )
}
export default EndScreen


