'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getActivity, clearActivity, getWeakTopics } from '../utils/activityTracker'

const DashboardPage = () => {
    const router = useRouter()
    const [activity, setActivity] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 8
    const [expandedId, setExpandedId] = useState(null)
    const [weakTopics, setWeakTopics] = useState([])

    useEffect(() => {
        setActivity(getActivity())
        setWeakTopics(getWeakTopics())
    }, [])

    const totalQuizzes = activity.length
    const totalQuestions = activity.reduce((sum, a) => sum + a.numQuestions, 0)
    const avgScore =
        totalQuizzes > 0
            ? (activity.reduce((sum, a) => sum + a.score, 0) / totalQuizzes) * 100
            : 0

<<<<<<< HEAD
=======

>>>>>>> 42f5ae2 (Add quiz submit all button and topic table pagination)
    // Group by topic
    const byTopic = activity.reduce((acc, a) => {
        const t = a.topic
        if (!acc[t]) acc[t] = { count: 0, questions: 0 }
        acc[t].count += 1
        acc[t].questions += a.numQuestions
        return acc
    }, {})

<<<<<<< HEAD
=======
    // Pagination for By Topic table
    const [topicPage, setTopicPage] = useState(1)
    const topicsPerPage = 5
    const topicEntries = Object.entries(byTopic)
    const totalTopicPages = Math.ceil(topicEntries.length / topicsPerPage)
    const paginatedTopics = topicEntries.slice((topicPage - 1) * topicsPerPage, topicPage * topicsPerPage)

>>>>>>> 42f5ae2 (Add quiz submit all button and topic table pagination)
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
        if (d === 'easy') return 'text-cyan-400'
        if (d === 'moderate') return 'text-blue-300'
        return 'text-red-400'
    }

    const scoreColor = (s) => {
        if (s >= 0.8) return 'text-cyan-300'
        if (s >= 0.5) return 'text-blue-300'
        return 'text-red-400'
    }

    // Pagination logic
    const totalPages = Math.ceil(activity.length / itemsPerPage)
    const paginatedActivity = [...activity].reverse().slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    return (
        <div className='min-h-screen py-12'>
            <h1 className='text-center text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-600 bg-clip-text text-transparent q-animate-gradient'>
                User Dashboard
            </h1>

            {/* Summary cards */}
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 max-w-3xl mx-auto'>
                <div className='bg-blue-900/20 border border-blue-500/20 rounded p-6 text-center'>
                    <p className='text-3xl font-bold text-cyan-300'>{totalQuizzes}</p>
                    <p className='text-sm text-blue-300/60 mt-1'>Quizzes Taken</p>
                </div>
                <div className='bg-blue-900/20 border border-blue-500/20 rounded p-6 text-center'>
                    <p className='text-3xl font-bold text-blue-300'>{totalQuestions}</p>
                    <p className='text-sm text-blue-300/60 mt-1'>Total Questions</p>
                </div>
                <div className='bg-blue-900/20 border border-blue-500/20 rounded p-6 text-center'>
                    <p className='text-3xl font-bold text-cyan-200'>{avgScore.toFixed(1)}%</p>
                    <p className='text-sm text-blue-300/60 mt-1'>Average Score</p>
                </div>
            </div>

            {/* Weak Areas */}
            {weakTopics.length > 0 && (
                <div className='mt-10 max-w-3xl mx-auto'>
                    <div className='bg-red-900/15 border border-red-500/20 rounded p-5'>
                        <h2 className='text-lg font-semibold text-red-400 mb-1'>Weak Areas Detected</h2>
                        <p className='text-xs text-gray-400 mb-4'>Topics where your average score is below 70%. Practice to improve!</p>
                        <div className='space-y-3'>
                            {weakTopics.map((wt) => (
                                <div key={wt.topic} className='flex items-center justify-between bg-[#0a0e1a]/60 rounded p-3'>
                                    <div>
                                        <p className='capitalize font-medium'>{wt.topic}</p>
                                        <p className='text-xs text-gray-400 mt-1'>
                                            Avg score: <span className='text-red-400 font-semibold'>{(wt.avgScore * 100).toFixed(0)}%</span>
                                            {' · '}{wt.attempts} attempt{wt.attempts !== 1 ? 's' : ''}
                                            {' · '}Last level: <span className='capitalize'>{wt.lastDifficulty}</span>
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const params = new URLSearchParams({
                                                topic: wt.topic,
                                                difficulty: wt.lastDifficulty,
                                                numQuestions: '5',
                                            })
                                            router.push(`/quiz?${params.toString()}`)
                                        }}
                                        className='text-sm border border-cyan-400 text-cyan-400 rounded px-4 py-1.5 hover:bg-cyan-400/20 hover:text-white transition shrink-0 ml-4'
                                    >
                                        Practice
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Breakdown tables */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 max-w-3xl mx-auto'>
                {/* By Topic */}
                <div className='bg-blue-900/20 border border-blue-500/20 rounded p-5'>
                    <h2 className='text-lg font-semibold text-cyan-300 mb-3'>By Topic</h2>
<<<<<<< HEAD
                    {Object.keys(byTopic).length === 0 ? (
                        <p className='text-gray-400 text-sm'>No data yet</p>
                    ) : (
=======
                    {topicEntries.length === 0 ? (
                        <p className='text-gray-400 text-sm'>No data yet</p>
                    ) : (
                        <>
>>>>>>> 42f5ae2 (Add quiz submit all button and topic table pagination)
                        <table className='w-full text-sm'>
                            <thead>
                                <tr className='text-gray-400 border-b border-gray-600'>
                                    <th className='text-left py-2'>Topic</th>
                                    <th className='text-right py-2'>Quizzes</th>
                                    <th className='text-right py-2'>Questions</th>
                                </tr>
                            </thead>
                            <tbody>
<<<<<<< HEAD
                                {Object.entries(byTopic).map(([topic, data]) => (
=======
                                {paginatedTopics.map(([topic, data]) => (
>>>>>>> 42f5ae2 (Add quiz submit all button and topic table pagination)
                                    <tr key={topic} className='border-b border-gray-700/50'>
                                        <td className='py-2 capitalize'>{topic}</td>
                                        <td className='text-right py-2'>{data.count}</td>
                                        <td className='text-right py-2'>{data.questions}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
<<<<<<< HEAD
=======
                        {/* Pagination controls for topics */}
                        {totalTopicPages > 1 && (
                            <div className='flex justify-center mt-4 gap-2'>
                                <button
                                    className='px-3 py-1 rounded border border-cyan-400 text-cyan-300 disabled:opacity-40'
                                    onClick={() => setTopicPage((p) => Math.max(1, p - 1))}
                                    disabled={topicPage === 1}
                                >
                                    Prev
                                </button>
                                {Array.from({ length: totalTopicPages }, (_, idx) => (
                                    <button
                                        key={idx + 1}
                                        className={`px-3 py-1 rounded border ${topicPage === idx + 1 ? 'bg-cyan-400 text-white' : 'border-cyan-400 text-cyan-300'}`}
                                        onClick={() => setTopicPage(idx + 1)}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                                <button
                                    className='px-3 py-1 rounded border border-cyan-400 text-cyan-300 disabled:opacity-40'
                                    onClick={() => setTopicPage((p) => Math.min(totalTopicPages, p + 1))}
                                    disabled={topicPage === totalTopicPages}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                        </>
>>>>>>> 42f5ae2 (Add quiz submit all button and topic table pagination)
                    )}
                </div>

                {/* By Difficulty / Level */}
                <div className='bg-blue-900/20 border border-blue-500/20 rounded p-5'>
                    <h2 className='text-lg font-semibold text-blue-300 mb-3'>By Level</h2>
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
                <h2 className='text-lg font-semibold text-cyan-300 mb-3'>Recent Activity</h2>
                {activity.length === 0 ? (
                    <p className='text-gray-400 text-sm'>No quizzes taken yet. Go generate one!</p>
                ) : (
                    <>
                        <div className='overflow-x-auto'>
                            <table className='w-full text-sm bg-blue-900/20 border border-blue-500/20 rounded'>
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
                                    {paginatedActivity.map((a, i) => (
                                        <>
                                            <tr
                                                key={a.id}
                                                className='border-b border-blue-900/30 cursor-pointer hover:bg-blue-500/10'
                                                onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
                                            >
                                                <td className='p-3 text-gray-400'>{activity.length - ((currentPage - 1) * itemsPerPage + i)}</td>
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
                                                        <div className='bg-[#0a0e1a]/80 p-4 border-b border-blue-900/30'>
                                                            <h3 className='text-sm font-semibold text-cyan-300 mb-3'>Generated Questions</h3>
                                                            <div className='space-y-3'>
                                                                {a.questions.map((q, qi) => (
                                                                    <div key={qi} className='bg-blue-900/20 border border-blue-500/10 rounded p-3'>
                                                                        <p className='text-sm font-medium'>
                                                                            <span className='text-gray-400 mr-2'>Q{qi + 1}.</span>
                                                                            {q.query}
                                                                        </p>
                                                                        <div className='mt-2 grid gap-1 ml-6'>
                                                                            {q.choices?.map((c, ci) => (
                                                                                <p key={ci} className={`text-xs ${
                                                                                    ci === Number(q.answer)
                                                                                        ? 'text-cyan-300 font-semibold'
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
                        {/* Pagination controls */}
                        {totalPages > 1 && (
                            <div className='flex justify-center mt-6 gap-2'>
                                <button
                                    className='px-3 py-1 rounded border border-cyan-400 text-cyan-300 disabled:opacity-40'
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Prev
                                </button>
                                {Array.from({ length: totalPages }, (_, idx) => (
                                    <button
                                        key={idx + 1}
                                        className={`px-3 py-1 rounded border ${currentPage === idx + 1 ? 'bg-cyan-400 text-white' : 'border-cyan-400 text-cyan-300'}`}
                                        onClick={() => setCurrentPage(idx + 1)}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                                <button
                                    className='px-3 py-1 rounded border border-cyan-400 text-cyan-300 disabled:opacity-40'
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
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
                        className='inline-block border-2 border-red-500/60 rounded text-red-400 text-center uppercase text-lg font-semibold px-6 py-2 hover:bg-red-500/30 hover:text-white duration-75'
                    >
                        Clear History
                    </button>
                )}
            </div>
        </div>
    )
}

export default DashboardPage
