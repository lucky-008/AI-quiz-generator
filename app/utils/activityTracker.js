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
