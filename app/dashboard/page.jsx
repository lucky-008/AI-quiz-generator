'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getActivity, clearActivity } from '../utils/activityTracker'

const DashboardPage = () => {
    const router = useRouter()
    const [activity, setActivity] = useState([])
    const [expandedId, setExpandedId] = useState(null)

    useEffect(() => {
        setActivity(getActivity())
    }, [])

    const totalQuizzes = activity.length
    const totalQuestions = activity.reduce((sum, a) => sum + a.numQuestions, 0)
    const avgScore =
        totalQuizzes > 0
            ? (activity.reduce((sum, a) => sum + a.score, 0) / totalQuizzes) * 100
            : 0

    // Group by topic
    const byTopic = activity.reduce((acc, a) => {
        const t = a.topic
        if (!acc[t]) acc[t] = { count: 0, questions: 0 }
        acc[t].count += 1
        acc[t].questions += a.numQuestions
        return acc
    }, {})

    // Group by difficulty
    const byDifficulty = activity.reduce((acc, a) => {
        const d = a.difficulty
        if (!acc[d]) acc[d] = { count: 0, questions: 0 }
        acc[d].count += 1
        acc[d].questions += a.numQuestions
        return acc
    }, {})

    const handleClear = () => {
        if (window.confirm('Clear all activity history?')) {
            clearActivity()
            setActivity([])
        }
    }

    const difficultyColor = (d) => {
        if (d === 'easy') return 'text-emerald-400'
        if (d === 'moderate') return 'text-yellow-400'
        return 'text-red-400'
    }

    const scoreColor = (s) => {
        if (s >= 0.8) return 'text-emerald-400'
        if (s >= 0.5) return 'text-yellow-400'
        return 'text-red-400'
    }

    return (
        <div className='min-h-screen py-12'>
            <h1 className='text-center text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-500 via-pink-400 to-blue-500 bg-clip-text text-transparent q-animate-gradient'>
                User Dashboard
            </h1>

            {/* Summary cards */}
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 max-w-3xl mx-auto'>
                <div className='bg-stone-700/50 rounded p-6 text-center'>
                    <p className='text-3xl font-bold text-emerald-300'>{totalQuizzes}</p>
                    <p className='text-sm text-gray-400 mt-1'>Quizzes Taken</p>
                </div>
                <div className='bg-stone-700/50 rounded p-6 text-center'>
                    <p className='text-3xl font-bold text-pink-300'>{totalQuestions}</p>
                    <p className='text-sm text-gray-400 mt-1'>Total Questions</p>
                </div>
                <div className='bg-stone-700/50 rounded p-6 text-center'>
                    <p className='text-3xl font-bold text-blue-300'>{avgScore.toFixed(1)}%</p>
                    <p className='text-sm text-gray-400 mt-1'>Average Score</p>
                </div>
            </div>

            {/* Breakdown tables */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 max-w-3xl mx-auto'>
                {/* By Topic */}
                <div className='bg-stone-700/30 rounded p-5'>
                    <h2 className='text-lg font-semibold text-emerald-300 mb-3'>By Topic</h2>
                    {Object.keys(byTopic).length === 0 ? (
                        <p className='text-gray-400 text-sm'>No data yet</p>
                    ) : (
                        <table className='w-full text-sm'>
                            <thead>
                                <tr className='text-gray-400 border-b border-gray-600'>
                                    <th className='text-left py-2'>Topic</th>
                                    <th className='text-right py-2'>Quizzes</th>
                                    <th className='text-right py-2'>Questions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(byTopic).map(([topic, data]) => (
                                    <tr key={topic} className='border-b border-gray-700/50'>
                                        <td className='py-2 capitalize'>{topic}</td>
                                        <td className='text-right py-2'>{data.count}</td>
                                        <td className='text-right py-2'>{data.questions}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* By Difficulty / Level */}
                <div className='bg-stone-700/30 rounded p-5'>
                    <h2 className='text-lg font-semibold text-pink-300 mb-3'>By Level</h2>
                    {Object.keys(byDifficulty).length === 0 ? (
                        <p className='text-gray-400 text-sm'>No data yet</p>
                    ) : (
                        <table className='w-full text-sm'>
                            <thead>
                                <tr className='text-gray-400 border-b border-gray-600'>
                                    <th className='text-left py-2'>Level</th>
                                    <th className='text-right py-2'>Quizzes</th>
                                    <th className='text-right py-2'>Questions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(byDifficulty).map(([level, data]) => (
                                    <tr key={level} className='border-b border-gray-700/50'>
                                        <td className={`py-2 capitalize ${difficultyColor(level)}`}>{level}</td>
                                        <td className='text-right py-2'>{data.count}</td>
                                        <td className='text-right py-2'>{data.questions}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Recent activity */}
            <div className='mt-10 max-w-3xl mx-auto'>
                <h2 className='text-lg font-semibold text-blue-300 mb-3'>Recent Activity</h2>
                {activity.length === 0 ? (
                    <p className='text-gray-400 text-sm'>No quizzes taken yet. Go generate one!</p>
                ) : (
                    <div className='overflow-x-auto'>
                        <table className='w-full text-sm bg-stone-700/30 rounded'>
                            <thead>
                                <tr className='text-gray-400 border-b border-gray-600'>
                                    <th className='text-left p-3'>#</th>
                                    <th className='text-left p-3'>Topic</th>
                                    <th className='text-left p-3'>Level</th>
                                    <th className='text-right p-3'>Questions</th>
                                    <th className='text-right p-3'>Score</th>
                                    <th className='text-right p-3'>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...activity].reverse().map((a, i) => (
                                    <>
                                        <tr
                                            key={a.id}
                                            className='border-b border-gray-700/50 cursor-pointer hover:bg-stone-600/30'
                                            onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
                                        >
                                            <td className='p-3 text-gray-400'>{activity.length - i}</td>
                                            <td className='p-3 capitalize'>{a.topic}</td>
                                            <td className={`p-3 capitalize ${difficultyColor(a.difficulty)}`}>{a.difficulty}</td>
                                            <td className='text-right p-3'>{a.numQuestions}</td>
                                            <td className={`text-right p-3 font-bold ${scoreColor(a.score)}`}>
                                                {(a.score * 100).toFixed(0)}%
                                            </td>
                                            <td className='text-right p-3 text-gray-400'>
                                                {new Date(a.date).toLocaleDateString()}
                                            </td>
                                        </tr>
                                        {expandedId === a.id && a.questions && a.questions.length > 0 && (
                                            <tr key={`${a.id}-questions`}>
                                                <td colSpan={6} className='p-0'>
                                                    <div className='bg-stone-800/60 p-4 border-b border-gray-700/50'>
                                                        <h3 className='text-sm font-semibold text-emerald-300 mb-3'>Generated Questions</h3>
                                                        <div className='space-y-3'>
                                                            {a.questions.map((q, qi) => (
                                                                <div key={qi} className='bg-stone-700/40 rounded p-3'>
                                                                    <p className='text-sm font-medium'>
                                                                        <span className='text-gray-400 mr-2'>Q{qi + 1}.</span>
                                                                        {q.query}
                                                                    </p>
                                                                    <div className='mt-2 grid gap-1 ml-6'>
                                                                        {q.choices?.map((c, ci) => (
                                                                            <p key={ci} className={`text-xs ${
                                                                                ci === Number(q.answer)
                                                                                    ? 'text-emerald-400 font-semibold'
                                                                                    : 'text-gray-400'
                                                                            }`}>
                                                                                {String.fromCharCode(65 + ci)}. {c}
                                                                                {ci === Number(q.answer) && ' ✓'}
                                                                            </p>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className='flex justify-center gap-4 mt-10'>
                <button onClick={() => router.push('/')} className='q-button'>
                    Home
                </button>
                {activity.length > 0 && (
                    <button
                        onClick={handleClear}
                        className='inline-block border-2 border-red-400 rounded text-red-400 text-center uppercase text-lg font-semibold px-6 py-2 hover:bg-red-400/40 hover:text-white duration-75'
                    >
                        Clear History
                    </button>
                )}
            </div>
        </div>
    )
}

export default DashboardPage
