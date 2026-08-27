import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export interface Task {
  id: string;
  title: string;
  column: string;
  priority?: string | null;
  authorName?: string | null;
}

export interface Board {
  id: string;
  name: string;
  type: string;
  tasks: Task[];
  ownerId: string;
}

// Helper to get current user ID
export async function getCurrentUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id;
}

// Security Helper: Check if user has access to board
export async function canAccessBoard(boardId: string, userId: string) {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: { members: true },
  });

  if (!board) return false;
  if (board.ownerId === userId) return true;
  if (board.members.some(m => m.userId === userId)) return true;
  return false;
}

export async function getBoards() {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const ownedBoards = await prisma.board.findMany({
    where: { ownerId: userId },
    include: { tasks: true },
    orderBy: { createdAt: 'desc' }
  });

  const memberRecords = await prisma.boardMember.findMany({
    where: { userId },
    include: {
      board: {
        include: { tasks: true }
      }
    }
  });

  const sharedBoards = memberRecords.map(m => m.board);

  return [...ownedBoards, ...sharedBoards];
}

export async function getBoard(id: string) {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const hasAccess = await canAccessBoard(id, userId);
  if (!hasAccess) return null;

  return await prisma.board.findUnique({
    where: { id },
    include: { tasks: { orderBy: { createdAt: 'asc' } } },
  });
}

export async function createBoard(name: string, type: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Unauthorized');

  return await prisma.board.create({
    data: {
      name,
      type,
      ownerId: userId,
    }
  });
}

export async function joinBoard(boardId: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Unauthorized');

  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board) throw new Error('Board not found');

  if (board.ownerId === userId) return board; // Already owner

  const existingMember = await prisma.boardMember.findUnique({
    where: {
      boardId_userId: {
        boardId,
        userId
      }
    }
  });

  if (!existingMember) {
    await prisma.boardMember.create({
      data: {
        boardId,
        userId
      }
    });
  }

  return board;
}

export async function addTask(boardId: string, title: string, column: string, priority?: string) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) throw new Error('Unauthorized');

  const hasAccess = await canAccessBoard(boardId, userId);
  if (!hasAccess) throw new Error('Unauthorized');

  await prisma.task.create({
    data: {
      title,
      column,
      priority,
      authorName: session.user.name || 'Unknown',
      boardId
    }
  });
}

export async function moveTask(boardId: string, taskId: string, newColumn: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Unauthorized');

  const hasAccess = await canAccessBoard(boardId, userId);
  if (!hasAccess) throw new Error('Unauthorized');

  await prisma.task.update({
    where: { id: taskId },
    data: { column: newColumn }
  });
}

export async function deleteTask(boardId: string, taskId: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Unauthorized');

  const hasAccess = await canAccessBoard(boardId, userId);
  if (!hasAccess) throw new Error('Unauthorized');

  await prisma.task.delete({
    where: { id: taskId }
  });
}
