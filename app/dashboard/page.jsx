'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getActivity, clearActivity, getWeakTopics } from '../utils/activityTracker'

const DashboardPage = () => {
    const router = useRouter()

    const [activity, setActivity] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [expandedId, setExpandedId] = useState(null)
    const [weakTopics, setWeakTopics] = useState([])

    const itemsPerPage = 8

    useEffect(() => {
        setActivity(getActivity())
        setWeakTopics(getWeakTopics())
    }, [])

    // Summary
    const totalQuizzes = activity.length
    const totalQuestions = activity.reduce((sum, a) => sum + a.numQuestions, 0)
    const avgScore =
        totalQuizzes > 0
            ? (activity.reduce((sum, a) => sum + a.score, 0) / totalQuizzes) * 100
            : 0

    // Group by Topic
    const byTopic = activity.reduce((acc, a) => {
        const t = a.topic || 'unknown'
        if (!acc[t]) acc[t] = { count: 0, questions: 0 }
        acc[t].count += 1
        acc[t].questions += a.numQuestions
        return acc
    }, {})

    // Topic Pagination
    const [topicPage, setTopicPage] = useState(1)
    const topicsPerPage = 5
    const topicEntries = Object.entries(byTopic)
    const totalTopicPages = Math.ceil(topicEntries.length / topicsPerPage)
    const paginatedTopics = topicEntries.slice(
        (topicPage - 1) * topicsPerPage,
        topicPage * topicsPerPage
    )

    // Group by Difficulty
    const byDifficulty = activity.reduce((acc, a) => {
        const d = a.difficulty || 'unknown'
        if (!acc[d]) acc[d] = { count: 0, questions: 0 }
        acc[d].count += 1
        acc[d].questions += a.numQuestions
        return acc
    }, {})

    const handleClear = () => {
        if (window.confirm('Clear all activity history?')) {
            clearActivity()
            setActivity([])
            setWeakTopics([])
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

    // Activity Pagination
    const totalPages = Math.ceil(activity.length / itemsPerPage)
    const paginatedActivity = [...activity]
        .reverse()
        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    return (
        <div className="min-h-screen py-12 bg-gradient-to-br from-[#0a0e1a] to-[#13203a]">
            <h1 className="text-center text-4xl font-extrabold text-cyan-300 drop-shadow-lg tracking-tight">User Dashboard</h1>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10 max-w-4xl mx-auto">
                <div className="p-8 text-center rounded-xl shadow-lg bg-[#10182a] border border-cyan-900">
                    <p className="text-4xl font-extrabold text-cyan-200">{totalQuizzes}</p>
                    <p className="text-base mt-2 text-cyan-400">Quizzes Taken</p>
                </div>
                <div className="p-8 text-center rounded-xl shadow-lg bg-[#10182a] border border-cyan-900">
                    <p className="text-4xl font-extrabold text-cyan-200">{totalQuestions}</p>
                    <p className="text-base mt-2 text-cyan-400">Total Questions</p>
                </div>
                <div className="p-8 text-center rounded-xl shadow-lg bg-[#10182a] border border-cyan-900">
                    <p className="text-4xl font-extrabold text-cyan-200">{avgScore.toFixed(1)}%</p>
                    <p className="text-base mt-2 text-cyan-400">Average Score</p>
                </div>
            </div>

            {/* Weak Topics */}
            {weakTopics.length > 0 && (
                <div className="mt-10 max-w-4xl mx-auto">
                    <h2 className="text-red-400 mb-3 text-xl font-semibold">Weak Areas</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {weakTopics.map((wt) => (
                            <div key={wt.topic} className="flex justify-between items-center p-4 rounded-lg shadow bg-[#1a233a] border border-red-900">
                                <div>
                                    <p className="font-semibold text-red-300">{wt.topic}</p>
                                    <p className="text-xs text-gray-400">
                                        {(wt.avgScore * 100).toFixed(0)}% ({wt.attempts} attempts)
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
                                    className="bg-red-400 hover:bg-red-500 text-white px-4 py-2 rounded shadow transition font-semibold"
                                >
                                    Practice
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* By Topic */}
            <div className="mt-10 max-w-4xl mx-auto">
                <h2 className="text-cyan-300 mb-3 text-xl font-semibold">By Topic</h2>

                {topicEntries.length === 0 ? (
                    <p className="text-gray-400">No data</p>
                ) : (
                    <>
                        <div className="overflow-x-auto rounded-lg shadow">
                            <table className="w-full text-sm border border-cyan-900 bg-[#10182a]">
                                <thead className="bg-cyan-900/30">
                                    <tr>
                                        <th className="py-2 px-4">Topic</th>
                                        <th className="py-2 px-4">Quizzes</th>
                                        <th className="py-2 px-4">Questions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedTopics.map(([topic, data]) => (
                                        <tr key={topic} className="hover:bg-cyan-900/10 transition">
                                            <td className="py-2 px-4">{topic}</td>
                                            <td className="py-2 px-4">{data.count}</td>
                                            <td className="py-2 px-4">{data.questions}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex gap-2 mt-3 justify-end">
                            <button onClick={() => setTopicPage(p => Math.max(1, p - 1))} className="px-3 py-1 rounded bg-cyan-900 text-cyan-200 hover:bg-cyan-700 transition">Prev</button>
                            <button onClick={() => setTopicPage(p => Math.min(totalTopicPages, p + 1))} className="px-3 py-1 rounded bg-cyan-900 text-cyan-200 hover:bg-cyan-700 transition">Next</button>
                        </div>
                    </>
                )}
            </div>

            {/* Recent Activity */}
            <div className="mt-10 max-w-4xl mx-auto">
                <h2 className="text-cyan-300 mb-3 text-xl font-semibold">Recent Activity</h2>

                {activity.length === 0 ? (
                    <p className="text-gray-400">No activity</p>
                ) : (
                    <div className="overflow-x-auto rounded-lg shadow">
                        <table className="w-full text-sm border border-cyan-900 bg-[#10182a]">
                            <thead className="bg-cyan-900/40">
                                <tr>
                                    <th className="py-3 px-4 text-left font-bold tracking-wide">#</th>
                                    <th className="py-3 px-4 text-left font-bold tracking-wide">Topic</th>
                                    <th className="py-3 px-4 text-left font-bold tracking-wide">Level</th>
                                    <th className="py-3 px-4 text-left font-bold tracking-wide">Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedActivity.map((a, i) => (
                                    <React.Fragment key={a.id}>
                                        <tr
                                            onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
                                            className={`cursor-pointer transition ${i % 2 === 0 ? 'bg-[#10182a]' : 'bg-[#16213a]'} hover:bg-cyan-900/20`}
                                        >
                                            <td className="py-2 px-4 align-top font-mono">{i + 1}</td>
                                            <td className="py-2 px-4 align-top font-semibold">{a.topic}</td>
                                            <td className={"py-2 px-4 align-top capitalize " + difficultyColor(a.difficulty)}>
                                                {a.difficulty}
                                            </td>
                                            <td className={"py-2 px-4 align-top font-bold " + scoreColor(a.score)}>
                                                {(a.score * 100).toFixed(0)}%
                                            </td>
                                        </tr>
                                        {expandedId === a.id && (
                                            <tr>
                                                <td colSpan={4} className="bg-cyan-900/10 border-t border-cyan-900">
                                                    <div className="p-4">
                                                        <h4 className="text-cyan-200 font-semibold mb-2">Questions:</h4>
                                                        <ul className="list-decimal list-inside space-y-1">
                                                            {a.questions?.map((q, qi) => (
                                                                <li key={qi} className="text-cyan-100">
                                                                    <span className="font-semibold">Q{qi + 1}:</span> {q.query}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap justify-center gap-4 mt-10">
                <button onClick={() => router.push('/')} className="px-6 py-2 rounded bg-cyan-700 text-white font-semibold shadow hover:bg-cyan-500 transition">Home</button>
                {activity.length > 0 && (
                    <button onClick={handleClear} className="px-6 py-2 rounded bg-red-500 text-white font-semibold shadow hover:bg-red-400 transition">Clear History</button>
                )}
            </div>
        </div>
    )
}

export default DashboardPage