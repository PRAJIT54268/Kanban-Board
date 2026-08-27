import { getBoards } from '@/lib/data';
import { createNewBoard, joinSharedBoard } from '@/app/actions';
import Link from 'next/link';
import { LayoutDashboard, Plus, KanbanSquare, Users } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import LoginButton from '@/components/LoginButton';

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  
  // If not logged in, show a landing page
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-white to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-black transition-colors">
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-12 rounded-3xl shadow-2xl text-center max-w-md border border-white/50 dark:border-gray-700">
          <KanbanSquare size={64} className="mx-auto mb-6 text-blue-500" />
          <h1 className="text-4xl font-extrabold mb-4 text-gray-900 dark:text-white">Kanban Flow</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">Sign in to manage your workspaces, collaborate with your team, and organize tasks.</p>
          <div className="flex justify-center">
            <LoginButton />
          </div>
        </div>
      </div>
    );
  }

  const boards = await getBoards();

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-white to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-black p-8 transition-colors">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
              My Workspaces
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg">Manage your projects and collaborate.</p>
          </div>
          <LoginButton />
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {boards.map((board) => (
            <Link href={`/board/${board.id}`} key={board.id} className="block group">
              <div className="h-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-white/50 dark:border-gray-700">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-violet-500 rounded-2xl text-white shadow-lg">
                    <LayoutDashboard size={24} />
                  </div>
                  <span className="inline-block bg-blue-100/80 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-xs font-bold px-3 py-1.5 rounded-full capitalize">
                    {board.type}
                  </span>
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                  {board.name}
                </h2>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-medium text-sm">
                  <span>{board.tasks.length} {board.tasks.length === 1 ? 'task' : 'tasks'}</span>
                  {board.ownerId !== session.user?.id && (
                    <span className="flex items-center gap-1 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 px-2 py-0.5 rounded-md text-xs">
                      <Users size={12} /> Shared
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}

          {/* Create New Board */}
          <div className="h-full bg-white/40 dark:bg-gray-800/40 backdrop-blur-md p-8 rounded-3xl shadow-sm flex flex-col justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 transition-colors group">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
                <Plus size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">New Board</h2>
            </div>
            
            <form action={createNewBoard} className="flex flex-col gap-4">
              <input 
                name="name" 
                placeholder="Name your board..." 
                required 
                className="bg-white/80 dark:bg-gray-700/80 border-none shadow-inner p-4 rounded-xl placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
              />
              <div className="relative">
                <select name="type" className="w-full appearance-none bg-white/80 dark:bg-gray-700/80 border-none shadow-inner p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white cursor-pointer font-medium text-sm">
                  <option value="normal">Normal (Backlog, To-Do, Done)</option>
                  <option value="project">Project (Backlog, To-Do, In Progress, Done)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <KanbanSquare size={20} />
                </div>
              </div>
              <button type="submit" className="mt-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:translate-y-0">
                Create Workspace
              </button>
            </form>
          </div>

          {/* Join Shared Board */}
          <div className="h-full bg-white/40 dark:bg-gray-800/40 backdrop-blur-md p-8 rounded-3xl shadow-sm flex flex-col justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 transition-colors group">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
                <Users size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Join Workspace</h2>
            </div>
            
            <form action={joinSharedBoard} className="flex flex-col gap-4">
              <input 
                name="boardId" 
                placeholder="Paste Invite ID..." 
                required 
                className="bg-white/80 dark:bg-gray-700/80 border-none shadow-inner p-4 rounded-xl placeholder:text-gray-400 focus:ring-2 focus:ring-green-500 outline-none transition-all dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center px-4">
                Ask the board owner for their unique Invite ID to collaborate.
              </p>
              <button type="submit" className="mt-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:translate-y-0">
                Join Shared Board
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}