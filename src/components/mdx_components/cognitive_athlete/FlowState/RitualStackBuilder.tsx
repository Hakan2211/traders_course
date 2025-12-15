import React, { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Sun,
  CloudRain,
  Smartphone,
  Coffee,
  Brain,
  Waves,
  Dumbbell,
  GlassWater,
  BedDouble,
  RotateCcw,
  Play,
} from 'lucide-react'
import { BioHack, TimelineSlot, Stats } from './types'

// --- Data Definitions ---

const BIO_HACKS: BioHack[] = [
  {
    id: 'sunlight',
    label: 'Morning Sunlight',
    iconName: 'Sun',
    type: 'positive',
    effects: { dopamine: 15, cortisol: -5, alpha: 5, flowScore: 15 },
    description: 'Sets circadian rhythm, healthy cortisol rise.',
  },
  {
    id: 'cold_shower',
    label: 'Cold Shower',
    iconName: 'CloudRain',
    type: 'positive',
    effects: { dopamine: 30, cortisol: 10, alpha: 5, flowScore: 25 },
    description: 'Acute stress spike followed by deep calm.',
  },
  {
    id: 'phone',
    label: 'Check Social Media',
    iconName: 'Smartphone',
    type: 'negative',
    effects: { dopamine: 15, cortisol: 30, alpha: -20, flowScore: -40 },
    description: 'Cheap dopamine and stress spike.',
  },
  {
    id: 'snooze',
    label: 'Hit Snooze Button',
    iconName: 'BedDouble',
    type: 'negative',
    effects: { dopamine: -10, cortisol: 15, alpha: -10, flowScore: -20 },
    description: 'Increases sleep inertia and anxiety.',
  },
  {
    id: 'box_breathing',
    label: 'Box Breathing',
    iconName: 'Waves',
    type: 'positive',
    effects: { dopamine: 5, cortisol: -20, alpha: 30, flowScore: 20 },
    description: 'Activates parasympathetic nervous system.',
  },
  {
    id: 'hydrate',
    label: 'Hydrate & Electrolytes',
    iconName: 'GlassWater',
    type: 'positive',
    effects: { dopamine: 5, cortisol: -5, alpha: 5, flowScore: 10 },
    description: 'Reverses overnight dehydration.',
  },
  {
    id: 'movement',
    label: 'Light Movement',
    iconName: 'Dumbbell',
    type: 'positive',
    effects: { dopamine: 15, cortisol: 5, alpha: 10, flowScore: 15 },
    description: 'Increases blood flow to prefrontal cortex.',
  },
  {
    id: 'meditation',
    label: 'Meditation',
    iconName: 'Brain',
    type: 'positive',
    effects: { dopamine: 5, cortisol: -15, alpha: 25, flowScore: 20 },
    description: 'Builds focus and gray matter.',
  },
  {
    id: 'coffee',
    label: 'Coffee (Optimized)',
    iconName: 'Coffee',
    type: 'neutral',
    effects: { dopamine: 20, cortisol: 10, alpha: 0, flowScore: 10 },
    description: 'Focus boost, keep away from wake-up.',
  },
]

const INITIAL_TIMELINE: TimelineSlot[] = [
  { time: '06:00', item: null },
  { time: '06:30', item: null },
  { time: '07:00', item: null },
  { time: '07:30', item: null },
  { time: '08:00', item: null },
  { time: '08:30', item: null },
  { time: '09:00', item: null },
  {
    time: '09:30',
    item: {
      // Preset Market Open
      id: 'market_open',
      label: 'Market Open',
      iconName: 'Play',
      type: 'neutral',
      effects: { dopamine: 0, cortisol: 0, alpha: 0, flowScore: 0 },
      description: 'The bell rings.',
    },
  },
]

// --- Helper Components ---

const IconComponent: React.FC<{ name: string; className?: string }> = ({
  name,
  className,
}) => {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    Sun,
    CloudRain,
    Smartphone,
    Coffee,
    Brain,
    Waves,
    Dumbbell,
    GlassWater,
    BedDouble,
    RotateCcw,
    Play,
  }
  // Fallback to Brain if the name is not found
  const Icon = icons[name as keyof typeof icons] ?? Brain
  return <Icon className={className} />
}

const DraggableItem = ({
  item,
  isOverlay = false,
}: {
  item: BioHack
  isOverlay?: boolean
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: { type: 'item', item },
    disabled: isOverlay, // Disable sorting logic for the overlay itself
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  }

  const bgColors = {
    positive: 'bg-slate-800 border-emerald-900/50 hover:border-emerald-500/50',
    negative: 'bg-slate-800 border-rose-900/50 hover:border-rose-500/50',
    neutral: 'bg-slate-800 border-amber-900/50 hover:border-amber-500/50',
  }

  const iconColors = {
    positive: 'text-emerald-400',
    negative: 'text-rose-400',
    neutral: 'text-amber-400',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        relative p-3 rounded-lg border flex items-center gap-3 cursor-grab active:cursor-grabbing group
        ${bgColors[item.type]} 
        ${
          isOverlay
            ? 'shadow-xl scale-105 z-50 ring-2 ring-cyan-500 border-cyan-500 bg-slate-800'
            : ''
        }
        transition-all duration-200
      `}
    >
      <div className={`p-2 rounded-md bg-slate-950 ${iconColors[item.type]}`}>
        <IconComponent name={item.iconName} className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-200">{item.label}</p>
        <p className="text-xs text-slate-500 line-clamp-1">
          {item.description}
        </p>
      </div>
    </div>
  )
}

// Simple wrapper to allow dropping onto the slots
const DroppableSlot = ({
  id,
  children,
}: {
  id: string
  children: React.ReactNode
}) => {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`w-full h-full flex items-center justify-center transition-colors ${
        isOver ? 'bg-slate-800' : ''
      }`}
    >
      {children}
    </div>
  )
}

// --- Main Component ---

const RitualStackBuilder: React.FC = () => {
  const [timeline, setTimeline] = useState<TimelineSlot[]>(INITIAL_TIMELINE)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [stats, setStats] = useState<Stats>({
    dopamine: 20,
    cortisol: 20,
    alpha: 20,
    flowScore: 20,
  }) // Base stats

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Calculate stats whenever timeline changes
  useEffect(() => {
    let newStats = { dopamine: 30, cortisol: 20, alpha: 20, flowScore: 20 } // Starting baseline

    timeline.forEach((slot) => {
      if (slot.item && slot.item.id !== 'market_open') {
        newStats.dopamine += slot.item.effects.dopamine
        newStats.cortisol += slot.item.effects.cortisol
        newStats.alpha += slot.item.effects.alpha
        newStats.flowScore += slot.item.effects.flowScore
      }
    })

    // Clamp values between 0 and 100
    const clamp = (num: number) => Math.min(Math.max(num, 0), 100)

    setStats({
      dopamine: clamp(newStats.dopamine),
      cortisol: clamp(newStats.cortisol),
      alpha: clamp(newStats.alpha),
      flowScore: clamp(newStats.flowScore),
    })
  }, [timeline])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    // Find the item being dragged
    const activeItem = BIO_HACKS.find((i) => i.id === active.id)
    if (!activeItem) return

    // Find which slot we dropped over
    const slotIndex = timeline.findIndex((slot) => slot.time === over.id)

    if (slotIndex !== -1) {
      // Don't overwrite Market Open
      if (timeline[slotIndex].time === '09:30') return

      const newTimeline = [...timeline]
      newTimeline[slotIndex] = { ...newTimeline[slotIndex], item: activeItem }
      setTimeline(newTimeline)
    }
  }

  const removeItem = (index: number) => {
    if (timeline[index].time === '09:30') return
    const newTimeline = [...timeline]
    newTimeline[index] = { ...newTimeline[index], item: null }
    setTimeline(newTimeline)
  }

  const resetTimeline = () => {
    setTimeline(INITIAL_TIMELINE)
  }

  // Helper for stats bars
  const StatBar = ({
    label,
    value,
    colorClass,
    desc,
  }: {
    label: string
    value: number
    colorClass: string
    desc: string
  }) => (
    <div className="mb-4">
      <div className="flex justify-between items-end mb-1">
        <span className="text-sm font-semibold text-slate-300">{label}</span>
        <span className={`text-xs font-mono ${colorClass}`}>{value}%</span>
      </div>
      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ease-out ${colorClass.replace(
            'text-',
            'bg-',
          )}`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
      <p className="text-[10px] text-slate-500 mt-1">{desc}</p>
    </div>
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl my-12">
        {/* Header */}
        <div className="bg-slate-900/80 p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Brain className="w-6 h-6 text-emerald-400" />
              The Ritual Stack Builder
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Design your morning to maximize Flow Probability at Market Open.
            </p>
          </div>
          <button
            onClick={resetTimeline}
            className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset Routine
          </button>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Left: Timeline & Drop Zone */}
          <div className="flex-1 p-6 border-r border-slate-800 bg-slate-950 relative">
            <div className="relative">
              {/* Vertical line connecting slots */}
              <div className="absolute left-13 top-4 bottom-4 w-0.5 bg-slate-800 -z-10"></div>

              <div className="space-y-4">
                {timeline.map((slot, index) => (
                  <div
                    key={slot.time}
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-20 text-right font-mono text-sm text-slate-500 font-medium pt-3">
                      {slot.time}
                    </div>

                    {/* Drop Target */}
                    <div
                      id={slot.time}
                      // Use a custom droppable ref logic if purely dnd-kit droppable,
                      // but here we repurpose the area as a drop target via onDragEnd logic detection
                      // For visuals we style it
                      className={`
                        flex-1 min-h-[72px] rounded-lg border-2 border-dashed transition-all relative
                        ${
                          slot.item
                            ? 'border-transparent bg-slate-900/30'
                            : 'border-slate-800 bg-slate-900/20 hover:border-slate-700'
                        }
                        ${
                          slot.time === '09:30'
                            ? 'border-emerald-500/30 bg-emerald-950/10'
                            : ''
                        }
                      `}
                    >
                      {/* We need a Droppable area. Dnd-kit uses `useDroppable`. 
                            However, simpler approach for this specific list is handling it in onDragEnd 
                            by detecting collision with the div ID. 
                            Dnd-kit `closestCenter` handles this naturally if IDs match. */}
                      <DroppableSlot id={slot.time}>
                        {slot.item ? (
                          <div className="relative w-full h-full">
                            <div
                              className={`
                                p-3 rounded-lg border w-full h-full flex items-center gap-3
                                ${
                                  slot.item.type === 'positive'
                                    ? 'bg-slate-800 border-emerald-500/30'
                                    : slot.item.type === 'negative'
                                      ? 'bg-slate-800 border-rose-500/30'
                                      : 'bg-slate-800 border-amber-500/30'
                                }
                              `}
                            >
                              <div
                                className={`p-2 rounded-md bg-slate-950 
                                  ${
                                    slot.item.type === 'positive'
                                      ? 'text-emerald-400'
                                      : slot.item.type === 'negative'
                                        ? 'text-rose-400'
                                        : 'text-amber-400'
                                  }
                                `}
                              >
                                <IconComponent
                                  name={slot.item.iconName}
                                  className="w-5 h-5"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-200">
                                  {slot.item.label}
                                </p>
                                <div className="flex gap-2 text-[10px] uppercase font-bold tracking-wider opacity-70">
                                  {slot.item.effects.dopamine > 0 && (
                                    <span className="text-cyan-400">DOP +</span>
                                  )}
                                  {slot.item.effects.cortisol > 0 && (
                                    <span className="text-rose-400">
                                      CORT +
                                    </span>
                                  )}
                                  {slot.item.effects.cortisol < 0 && (
                                    <span className="text-emerald-400">
                                      CORT -
                                    </span>
                                  )}
                                  {slot.item.effects.alpha > 0 && (
                                    <span className="text-indigo-400">
                                      ALPHA +
                                    </span>
                                  )}
                                </div>
                              </div>

                              {slot.time !== '09:30' && (
                                <button
                                  onClick={() => removeItem(index)}
                                  className="absolute top-2 right-2 text-slate-600 hover:text-rose-400"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs uppercase tracking-wide font-medium">
                            Drag Item Here
                          </div>
                        )}
                      </DroppableSlot>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Controls & Dashboard */}
          <div className="w-full lg:w-96 bg-slate-900/50 p-6 flex flex-col gap-8">
            {/* Stats Dashboard */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-inner">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
                Neuro-Dashboard
              </h3>

              <StatBar
                label="Flow Probability"
                value={stats.flowScore}
                colorClass="text-emerald-400"
                desc="Likelihood of entering 'The Zone' at 9:30."
              />
              <StatBar
                label="Dopamine (Drive)"
                value={stats.dopamine}
                colorClass="text-cyan-400"
                desc="Motivation & Pattern Recognition."
              />
              <StatBar
                label="Alpha Waves (Calm Focus)"
                value={stats.alpha}
                colorClass="text-indigo-400"
                desc="Access to subconscious competence."
              />
              <StatBar
                label="Cortisol (Stress)"
                value={stats.cortisol}
                colorClass="text-rose-400"
                desc="High levels block rational decision making."
              />

              <div
                className={`mt-4 p-3 rounded text-center text-sm font-bold border
              ${
                stats.flowScore > 75
                  ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
                  : stats.flowScore > 40
                    ? 'bg-amber-950/50 border-amber-500/50 text-amber-300'
                    : 'bg-rose-950/50 border-rose-500/50 text-rose-300'
              }
            `}
              >
                {stats.flowScore > 75
                  ? 'STATUS: ELITE PERFORMANCE'
                  : stats.flowScore > 40
                    ? 'STATUS: SUB-OPTIMAL'
                    : 'STATUS: HIGH RISK OF TILT'}
              </div>
            </div>

            {/* Palette */}
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                Available Bio-Hacks
              </h3>
              <div className="space-y-3">
                <SortableContext
                  items={BIO_HACKS}
                  strategy={verticalListSortingStrategy}
                >
                  {BIO_HACKS.filter((h) => h.id !== 'market_open').map(
                    (hack) => (
                      <DraggableItem key={hack.id} item={hack} />
                    ),
                  )}
                </SortableContext>
              </div>
            </div>
          </div>
        </div>

        {/* Draggable Overlay moved to top level */}
        <DragOverlay
          dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: { active: { opacity: '0.5' } },
            }),
          }}
        >
          {activeId ? (
            <DraggableItem
              item={BIO_HACKS.find((i) => i.id === activeId)!}
              isOverlay
            />
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  )
}

export default RitualStackBuilder
