const STORAGE_KEY = 'quiz_activity'

export function getActivity() {
    if (typeof window === 'undefined') return []
    try {
        const data = localStorage.getItem(STORAGE_KEY)
        return data ? JSON.parse(data) : []
    } catch {
        return []
    }
}

export function saveQuizActivity({ topic, difficulty, numQuestions, score, questions }) {
    const activity = getActivity()
    activity.push({
        id: Date.now(),
        topic: topic || 'Random',
        difficulty,
        numQuestions,
        score,
        questions: questions || [],
        date: new Date().toISOString(),
    })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activity))
}

export function clearActivity() {
    localStorage.removeItem(STORAGE_KEY)
}

export function getWeakTopics() {
    const activity = getActivity()
    if (activity.length === 0) return []

    const topicStats = {}
    for (const a of activity) {
        const t = a.topic
        if (!topicStats[t]) topicStats[t] = { totalScore: 0, count: 0, lastDifficulty: a.difficulty }
        topicStats[t].totalScore += a.score
        topicStats[t].count += 1
        topicStats[t].lastDifficulty = a.difficulty
    }

    return Object.entries(topicStats)
        .map(([topic, stats]) => ({
            topic,
            avgScore: stats.totalScore / stats.count,
            attempts: stats.count,
            lastDifficulty: stats.lastDifficulty,
        }))
        .filter((t) => t.avgScore < 0.7)
        .sort((a, b) => a.avgScore - b.avgScore)
}
