import { getBoard } from '@/lib/data';
import { notFound, redirect } from 'next/navigation';
import BoardClient from './BoardClient';
import Link from 'next/link';
import ShareButton from '@/components/ShareButton';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/');
  }

  const { id } = await params;
  const board = await getBoard(id);

  if (!board) {
    notFound();
  }

  const columns = board.type === 'normal' 
    ? ['Backlog', 'To-Do', 'Done'] 
    : ['Backlog', 'To-Do', 'In Progress', 'Done'];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-white to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-black transition-colors flex flex-col">
      <header className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-sm px-4 sm:px-8 py-4 sm:py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/50 dark:border-gray-700/50 sticky top-0 z-10 gap-4 sm:gap-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6 w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
            {board.name}
          </h1>
          <div className="flex gap-2">
            <ShareButton boardId={board.id} />
            <a href={`/api/export/${board.id}`} target="_blank" rel="noreferrer" className="text-sm font-medium bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full hover:bg-white dark:hover:bg-gray-600 shadow-sm transition-all border border-gray-200 dark:border-gray-600">
              Export JSON
            </a>
          </div>
        </div>
        <Link href="/" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 font-semibold flex items-center gap-2 hover:-translate-x-1 transition-transform">
          &larr; Back to Dashboard
        </Link>
      </header>
      
      <main className="flex-1 overflow-x-auto p-8 custom-scrollbar">
        <BoardClient board={board} columns={columns} />
      </main>
    </div>
  );
}
