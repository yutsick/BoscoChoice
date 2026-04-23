'use client'

import { buildRoundRobinQueue, QuizQuestion } from '@/lib/quiz-engine'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useReducer } from 'react'

const STORAGE_KEY = 'bosco-shown-questions'

interface Props {
  questions: QuizQuestion[]
  startCategoryId: string
}

const bgColorMap: Record<string, string> = {
  rose: 'bg-rose-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-400',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  indigo: 'bg-indigo-500',
  violet: 'bg-violet-500',
  pink: 'bg-pink-500',
}

const lightColorMap: Record<string, string> = {
  rose: 'bg-rose-50',
  orange: 'bg-orange-50',
  yellow: 'bg-yellow-50',
  green: 'bg-green-50',
  blue: 'bg-blue-50',
  indigo: 'bg-indigo-50',
  violet: 'bg-violet-50',
  pink: 'bg-pink-50',
}

const borderColorMap: Record<string, string> = {
  rose: 'border-rose-200',
  orange: 'border-orange-200',
  yellow: 'border-yellow-200',
  green: 'border-green-200',
  blue: 'border-blue-200',
  indigo: 'border-indigo-200',
  violet: 'border-violet-200',
  pink: 'border-pink-200',
}

const textColorMap: Record<string, string> = {
  rose: 'text-rose-600',
  orange: 'text-orange-600',
  yellow: 'text-yellow-700',
  green: 'text-green-600',
  blue: 'text-blue-600',
  indigo: 'text-indigo-600',
  violet: 'text-violet-600',
  pink: 'text-pink-600',
}

interface State {
  queue: QuizQuestion[]
  index: number
  direction: 1 | -1
  showTransition: boolean
  finished: boolean
}

type Action =
  | { type: 'NEXT' }
  | { type: 'HIDE_TRANSITION' }
  | { type: 'INIT'; queue: QuizQuestion[] }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'INIT':
      return { ...state, queue: action.queue, index: 0, finished: action.queue.length === 0 }
    case 'NEXT': {
      const nextIndex = state.index + 1
      if (nextIndex >= state.queue.length) {
        return { ...state, finished: true }
      }
      const showTransition = nextIndex % 3 === 0
      return {
        ...state,
        index: nextIndex,
        direction: 1,
        showTransition,
      }
    }
    case 'HIDE_TRANSITION':
      return { ...state, showTransition: false }
    default:
      return state
  }
}

function getShownIds(): Set<string> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function addShownId(id: string) {
  const shown = getShownIds()
  shown.add(id)
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...shown]))
}

export default function QuizClient({ questions, startCategoryId }: Props) {
  const [state, dispatch] = useReducer(reducer, {
    queue: [],
    index: 0,
    direction: 1,
    showTransition: false,
    finished: false,
  })

  useEffect(() => {
    // Filter out already-shown questions from sessionStorage
    const shownIds = getShownIds()
    const available = questions.filter((q) => !shownIds.has(q.id))
    const queue = buildRoundRobinQueue(available, startCategoryId)
    dispatch({ type: 'INIT', queue })
  }, [questions, startCategoryId])

  // Mark current question as shown in sessionStorage
  useEffect(() => {
    const current = state.queue[state.index]
    if (current) {
      addShownId(current.id)
    }
  }, [state.queue, state.index])

  // Auto-hide transition overlay after 700ms
  useEffect(() => {
    if (state.showTransition) {
      const t = setTimeout(() => dispatch({ type: 'HIDE_TRANSITION' }), 700)
      return () => clearTimeout(t)
    }
  }, [state.showTransition])

  const handleNext = useCallback(() => {
    if (!state.showTransition) {
      dispatch({ type: 'NEXT' })
    }
  }, [state.showTransition])

  const current = state.queue[state.index]

  // Use current question's category color (changes per question)
  const color = current?.categoryColor ?? 'blue'
  const bg = bgColorMap[color] ?? bgColorMap.blue
  const lightBg = lightColorMap[color] ?? lightColorMap.blue
  const border = borderColorMap[color] ?? borderColorMap.blue
  const accent = textColorMap[color] ?? textColorMap.blue

  if (state.queue.length === 0 && !state.finished) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400 text-xl">Завантаження питань…</p>
      </div>
    )
  }

  if (state.finished) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${lightBg} px-4`}>
        <div className={`rounded-3xl border-2 ${border} bg-white p-10 max-w-xl w-full text-center shadow-xl`}>
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">Всі питання пройдено!</h2>
          <p className="text-gray-500 mb-8">Нових питань більше немає</p>
          <a
            href="/"
            className={`${bg} text-white px-8 py-3 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity`}
          >
            ← До категорій
          </a>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center ${lightBg} px-4 py-8 relative overflow-hidden transition-colors duration-300`}
      onClick={handleNext}
    >
      {/* Transition overlay — every 3rd question */}
      <AnimatePresence>
        {state.showTransition && (
          <motion.div
            key="transition"
            className={`fixed inset-0 ${bg} z-50 flex items-center justify-center`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              className="text-white text-center select-none"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.2 }}
            >
              <div className="text-8xl font-black mb-2 opacity-30">
                <img src="/icon_bosco.png" alt="" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="w-full max-w-2xl mb-8 flex items-center justify-between">
        <a
          href="/"
          className="text-gray-400 hover:text-gray-600 transition-colors text-sm font-medium"
          onClick={(e) => e.stopPropagation()}
        >
          ← Категорії
        </a>
        <div className={`${accent} font-bold text-sm`}>
          {state.index + 1} / {state.queue.length}
        </div>
      </div>

      {/* Question card with slide animation */}
      <div className="w-full max-w-2xl relative">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current?.id ?? state.index}
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -80, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className={`
              rounded-3xl border-2 ${border} bg-white
              p-8 md:p-12 shadow-xl cursor-pointer select-none
              min-h-[280px] flex flex-col items-center justify-center
              transition-colors duration-300
            `}
          >
            <p className={`${accent} text-xs font-bold uppercase tracking-widest mb-6`}>
              {current?.categoryName}
            </p>
            <div
              className="rich-content text-gray-900 text-center w-full"
              dangerouslySetInnerHTML={{ __html: current?.htmlContent ?? '' }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Tap hint */}
      <p className="mt-8 text-gray-400 text-sm select-none">
        Натисніть будь-де, щоб перейти до наступного питання
      </p>

      {/* Progress bar */}
      <div className="w-full max-w-2xl mt-6 bg-white/60 rounded-full h-1.5 overflow-hidden">
        <motion.div
          className={`h-full ${bg} rounded-full`}
          animate={{ width: `${((state.index + 1) / state.queue.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  )
}
