'use client';

import { useState, useRef, useEffect } from 'react';
import { Board, Task } from '@/lib/data';
import { createNewTask, moveTaskAction, deleteTaskAction } from '@/app/actions';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus } from 'lucide-react';

const PRIORITY_TAGS = [
  { label: 'HIGH', color: 'bg-red-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.6)]' },
  { label: 'MEDIUM', color: 'bg-orange-500 text-white shadow-[0_0_8px_rgba(249,115,22,0.6)]' },
  { label: 'LOW', color: 'bg-green-500 text-white shadow-[0_0_8px_rgba(34,197,94,0.6)]' },
  { label: 'URGENT', color: 'bg-purple-500 text-white shadow-[0_0_8px_rgba(168,85,247,0.6)]' },
];

const AVATARS = [
  'https://i.pravatar.cc/150?img=1',
  'https://i.pravatar.cc/150?img=32',
  'https://i.pravatar.cc/150?img=12',
  'https://i.pravatar.cc/150?img=5',
  'https://i.pravatar.cc/150?img=47',
];

function TaskCard({ task, isDragging = false }: { task: Task; isDragging?: boolean }) {
  const stickyColors = [
    'bg-[#FFEA00] text-black', // Vibrant Yellow
    'bg-[#00E5FF] text-black', // Vibrant Cyan
    'bg-[#FF007F] text-white', // Vibrant Pink
    'bg-[#39FF14] text-black', // Vibrant Neon Green
    'bg-[#9D00FF] text-white', // Vibrant Purple
    'bg-[#FF6600] text-white', // Vibrant Orange
  ];
  
  const idNum = parseInt(task.id.slice(-4) || '0', 16);
  const colorClass = stickyColors[idNum % stickyColors.length];
  const tag = task.priority 
    ? PRIORITY_TAGS.find(t => t.label === task.priority) || PRIORITY_TAGS[1] 
    : PRIORITY_TAGS[idNum % PRIORITY_TAGS.length];
  const avatar = AVATARS[idNum % AVATARS.length];
  
  const rotations = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2', 'rotate-0'];
  const rotation = rotations[idNum % rotations.length];
  const margins = ['ml-0', 'ml-4', 'ml-8', 'ml-2'];
  const margin = margins[idNum % margins.length];

  return (
    <div className={`relative p-3 mb-4 shadow-[2px_4px_6px_rgba(0,0,0,0.2)] dark:shadow-[0_0_15px_rgba(255,255,255,0.1)] ${colorClass} ${rotation} ${margin} w-32 h-32 transform-gpu transition-shadow group flex flex-col rounded-sm`}>
      <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm self-start mb-1 ${tag.color}`}>
        {tag.label}
      </div>
      
      <p className="font-semibold text-xs leading-snug line-clamp-3">{task.title}</p>
      
      <div className="mt-auto flex items-center justify-between gap-1">
        <span className="text-[9px] font-medium truncate opacity-80" title={task.authorName || 'Unknown'}>
          {task.authorName || 'Unknown'}
        </span>
        <img src={avatar} alt="Assignee" className="w-5 h-5 rounded-full border border-black/20 shadow-sm shrink-0" />
      </div>

      {isDragging && <div className="absolute inset-0 bg-black/10 dark:bg-white/20 border-2 border-blue-500 border-dashed pointer-events-none" />}
    </div>
  );
}

function SortableTask({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id, data: { type: 'Task', task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing outline-none"
    >
      <TaskCard task={task} isDragging={isDragging} />
    </div>
  );
}

function Column({ title, tasks, boardId, playSound, isLast }: { title: string; tasks: Task[]; boardId: string; playSound: () => void; isLast: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: title, data: { type: 'Column', title } });
  const formRef = useRef<HTMLFormElement>(null);

  const bgHighlight = isOver ? 'bg-gray-100 dark:bg-gray-700/50 shadow-inner' : 'bg-transparent';

  return (
    <div ref={setNodeRef} className={`flex flex-col flex-1 min-w-[240px] p-6 transition-colors duration-200 ${bgHighlight} ${!isLast ? 'border-r-2 border-gray-200 dark:border-gray-700' : ''}`}>
      <div className="mb-6 border-b-2 border-gray-200 dark:border-gray-700 pb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{title}</h3>
        <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold px-2 py-0.5 rounded-full">{tasks.length}</span>
      </div>

      <form 
        ref={formRef}
        action={async (formData) => {
          playSound();
          formRef.current?.reset();
          await createNewTask(boardId, title, formData);
        }}
        className="mb-6"
      >
        <div className="relative flex shadow-sm rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus-within:border-blue-500 transition-colors mb-2">
          <input
            name="title"
            type="text"
            placeholder="What needs doing?"
            className="flex-1 min-w-0 pl-3 py-2 text-sm bg-transparent border-none text-black dark:text-white placeholder:text-gray-400 outline-none"
            required
            autoComplete="off"
          />
          <div className="border-l border-gray-300 dark:border-gray-600 flex items-center">
            <select 
              name="priority" 
              className="pl-2 pr-2 py-2 text-xs font-bold bg-transparent text-gray-500 dark:text-gray-400 outline-none cursor-pointer appearance-none text-center"
              defaultValue="MEDIUM"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MED</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
            </select>
          </div>
        </div>
        <button type="submit" className="w-full flex items-center justify-center gap-1 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold py-2 rounded-md transition-colors border border-gray-300 dark:border-gray-700 shadow-sm cursor-pointer active:scale-95 transform-gpu duration-100">
          <Plus size={14} />
          Add Task
        </button>
      </form>

      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 min-h-[300px]">
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.div
                layoutId={task.id}
                key={task.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0, rotate: 180, y: 100 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              >
                <SortableTask task={task} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </SortableContext>
    </div>
  );
}

function TrashZone({ deletedTasks }: { deletedTasks: Task[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'trash', data: { type: 'Trash' } });
  
  return (
    <div 
      ref={setNodeRef}
      className={`fixed bottom-6 right-6 w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all duration-300 z-40 cursor-pointer ${
        isOver 
          ? 'scale-125' 
          : 'scale-100 hover:scale-110'
      }`}
    >
      <div className="relative w-10 h-10 pointer-events-none z-50">
        {/* Base */}
        <svg className={`absolute inset-0 w-full h-full transition-colors duration-300 ${isOver ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]' : 'text-gray-400 dark:text-gray-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
        {/* Lid */}
        <svg className={`absolute inset-0 w-full h-full origin-[15%_25%] transition-all duration-300 ${isOver ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] -rotate-45 -translate-y-2 translate-x-1' : 'text-gray-400 dark:text-gray-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </div>

      <AnimatePresence>
        {deletedTasks.map(task => (
          <motion.div
            layoutId={task.id}
            key={task.id}
            initial={{ scale: 1, opacity: 1, rotate: 0 }}
            animate={{ scale: 0, opacity: 0, rotate: 180, y: 30 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute z-40 pointer-events-none"
          >
            <TaskCard task={task} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function BoardClient({ board, columns }: { board: Board; columns: string[] }) {
  const [tasks, setTasks] = useState<Task[]>(board.tasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [deletedTasks, setDeletedTasks] = useState<Task[]>([]);

  useEffect(() => {
    setTasks(board.tasks);
  }, [board.tasks]);

  const slapSoundRef = useRef<HTMLAudioElement | null>(null);
  const trashSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    slapSoundRef.current = new Audio('https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg');
    trashSoundRef.current = new Audio('https://actions.google.com/sounds/v1/cartoon/slip_and_crash.ogg');
  }, []);

  const playSound = () => {
    if (slapSoundRef.current) {
      slapSoundRef.current.currentTime = 0;
      slapSoundRef.current.play().catch(() => {});
    }
  };
  
  const playTrashSound = () => {
    if (trashSoundRef.current) {
      trashSoundRef.current.currentTime = 0;
      trashSoundRef.current.play().catch(() => {});
    }
  };

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (overId === 'trash') {
      playTrashSound();
      
      const taskToDelete = tasks.find(t => t.id === activeId);
      if (taskToDelete) {
        setDeletedTasks(prev => [...prev, taskToDelete]);
        setTimeout(() => {
          setDeletedTasks(prev => prev.filter(t => t.id !== taskToDelete.id));
        }, 500);
      }
      
      setTasks(tasks.filter(t => t.id !== activeId));
      await deleteTaskAction(board.id, activeId as string);
      return;
    }

    if (activeId === overId) return;

    const activeTask = tasks.find((t) => t.id === activeId);
    let newColumn = '';

    const overTask = tasks.find((t) => t.id === overId);
    if (overTask) {
      newColumn = overTask.column;
    } else if (columns.includes(overId as string)) {
      newColumn = overId as string;
    }

    if (activeTask && newColumn && activeTask.column !== newColumn) {
      playSound();
      setTasks(tasks.map(t => t.id === activeId ? { ...t, column: newColumn } : t));
      await moveTaskAction(board.id, activeTask.id, newColumn);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="bg-white dark:bg-gray-900 shadow-2xl mx-auto rounded-xl overflow-x-auto border border-gray-200 dark:border-gray-800">
        <div className="flex items-stretch min-w-max min-h-[750px]">
          {columns.map((col, idx) => (
            <Column
              key={col}
              title={col}
              boardId={board.id}
              playSound={playSound}
              tasks={tasks.filter((t) => t.column === col)}
              isLast={idx === columns.length - 1}
            />
          ))}
        </div>
      </div>
      
      <TrashZone deletedTasks={deletedTasks} />

      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <div className="scale-110 rotate-3 z-50">
             <div className="absolute -top-4 -left-4 z-10 text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-red-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.6)]">MOVING</div>
             <TaskCard task={activeTask} isDragging={false} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
