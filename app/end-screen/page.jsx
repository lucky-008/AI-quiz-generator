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

    const [message, setMessage] = useState('')
    const [gif, setGif] = useState('')

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
        <div className='min-h-screen grid place-items-center '>
            {/* <Voice message={message} /> */}
            {/* <pre>{JSON.stringify(state, null, 2)}</pre> */}


            {score >= 0.8 && <Confetti width={width} height={height} className='overflow-hidden'/>}

            <div className='max-w-3xl flex flex-col items-center z-10'>
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

                <button
                    className='inline-block border-2 border-cyan-400 rounded text-cyan-400 text-center uppercase text-lg font-semibold mx-auto mt-8 px-6 py-2 hover:bg-cyan-400/40 hover:border-cyan-300 hover:text-white duration-75 active:bg-blue-600'
                    onClick={handlePlayAgain}
                >
                    Play again
                </button>
                <button
                    className='inline-block border-2 border-blue-500 rounded text-blue-400 text-center uppercase text-lg font-semibold mx-auto mt-4 px-6 py-2 hover:bg-blue-500/40 hover:border-blue-400 hover:text-white duration-75 active:bg-blue-700'
                    onClick={() => router.push('/dashboard')}
                >
                    Dashboard
                </button>
            </div>
        </div>
    )
}
export default EndScreen


