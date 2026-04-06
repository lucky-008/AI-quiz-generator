'use client'

import { useState } from 'react'

// import { topics } from './constants/topics'

import { useRouter } from 'next/navigation'

import AudioPlayer from './components/AudioPlayer'

import { FiGithub } from 'react-icons/fi'

const HomePage = () => {
    // const [topicOptions, setTopicOptions] = useState(topics.python.beginner)

    const router = useRouter()

    // const [language, setLanguage] = useState('javascript')
    const [topic, setTopic] = useState('')
    const [difficulty, setDifficulty] = useState('easy')
    const [numQuestions, setNumQuestions] = useState('5')
    const [topicError, setTopicError] = useState('')

    // const handleLanguageSelect = (e) => {
    //     setLanguage(e.target.value)
    // }

    const handleSubmit = (e) => {
        e.preventDefault()

        const trimmedTopic = topic.trim().toLowerCase()

        if (!trimmedTopic) {
            setTopicError('Please enter a topic before generating a quiz.')
            return
        }

        setTopicError('')
        const parsedCount = Number(numQuestions)
        const safeCount = Number.isFinite(parsedCount)
            ? Math.min(Math.max(parsedCount, 1), 100)
            : 5
        const query = new URLSearchParams({
            difficulty,
            numQuestions: String(safeCount),
            topic: trimmedTopic,
        })

        router.push(`/quiz?${query.toString()}`)
    }

    const handleQuestionCountChange = (e) => {
        const nextValue = e.target.value.replace(/\D/g, '')

        if (nextValue === '') {
            setNumQuestions('')
            return
        }

        const clampedValue = Math.min(Number(nextValue), 100)
        setNumQuestions(String(clampedValue))
    }

    // bg-gradient-to-r from-amber-500 via-orange-600 to-yellow-500 bg-clip-text text-transparent

    return (
        <div className='min-h-screen grid place-items-center'>
            <div className='border rounded border-white/0 '>
                <h1 className='text-center text-5xl md:text-7xl font-bold bg-gradient-to-r from-emerald-500 via-pink-400 to-blue-500 bg-clip-text text-transparent q-animate-gradient'>
                    AI Quiz Generator
                </h1>

                {/* <form onSubmit={handleSubmit} className='mt-8 grid grid-cols-[2fr_3fr]'> */}
                <form
                    onSubmit={handleSubmit}
                    className='mt-14 flex flex-col gap-4 w-[80%] max-w-xl mx-auto'
                >
                    <div className='grid gap-5 md:grid-cols-2'>
                        <div className='flex flex-col gap-3 md:col-span-2'>
                            <label htmlFor='topic' className='uppercase text-xs'>
                                Topic
                            </label>
                            <input
                                type='text'
                                id='topic'
                                value={topic}
                                name='topic'
                                placeholder='Enter any topic, for example javascript or system design'
                                className={`quiz-select ${topicError ? 'border-2 border-red-400' : ''}`}
                                onChange={(e) => { setTopic(e.target.value); setTopicError('') }}
                            />
                            {topicError && (
                                <p className='text-red-400 text-xs mt-1'>{topicError}</p>
                            )}
                        </div>

                        <div className='flex flex-col gap-3'>
                            <label htmlFor='difficulty' className='uppercase text-xs'>
                                Level
                            </label>
                            <select
                                id='difficulty'
                                name='difficulty'
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                                className='quiz-select'
                            >
                                <option value='easy'>Easy</option>
                                <option value='moderate'>Moderate</option>
                                <option value='hard'>Hard</option>
                            </select>
                        </div>

                        <div className='flex flex-col gap-3'>
                            <label htmlFor='numQuestions' className='uppercase text-xs'>
                                Number of Questions
                            </label>
                            <input
                                type='number'
                                id='numQuestions'
                                name='numQuestions'
                                value={numQuestions}
                                onChange={handleQuestionCountChange}
                                min='1'
                                max='100'
                                inputMode='numeric'
                                className='quiz-select'
                            />
                        </div>
                    </div>

                    <div className='flex flex-col gap-1'>
                        <p className='text-xs text-white/50'>
                            You can generate up to 100 questions.
                        </p>
                    </div>

                    <div className='mx-auto mt-8 flex gap-4'>
                        <button type='submit' className='q-button'>
                            Generate Quiz
                        </button>
                        <button
                            type='button'
                            className='q-button'
                            onClick={() => router.push('/dashboard')}
                        >
                            Dashboard
                        </button>
                    </div>
                </form>
            </div>

            <a
                className='fixed bottom-0 flex items-center gap-2 pb-2 font-mono text-sm text-white/70 transition hover:text-emerald-300 sm:m-0'
                href='https://github.com/quentin-mckay/ai-quiz-generator'
                target='_blank'
            >
                {/* <FiGithub size={16} className='translate-y-[0px]' /> */}
                <FiGithub size={16} />
                Built with Next.js / Tailwind / OpenAI
            </a>
        </div>
    )
}
export default HomePage
