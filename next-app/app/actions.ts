'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createBoard, addTask, moveTask, deleteTask, joinBoard } from '@/lib/data';

export async function createNewBoard(formData: FormData) {
  const name = formData.get('name') as string;
  const type = formData.get('type') as 'normal' | 'project';
  if (!name) return;

  const board = await createBoard(name, type);
  revalidatePath('/');
  redirect(`/board/${board.id}`);
}

export async function joinSharedBoard(formData: FormData) {
  const boardId = formData.get('boardId') as string;
  if (!boardId) return;

  try {
    await joinBoard(boardId);
    revalidatePath('/');
    redirect(`/board/${boardId}`);
  } catch (error) {
    console.error(error);
    // Silent fail for now if board not found
  }
}

export async function createNewTask(boardId: string, column: string, formData: FormData) {
  const title = formData.get('title') as string;
  const priority = formData.get('priority') as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | null;
  if (!title) return;

  await addTask(boardId, title, column, priority || undefined);
  revalidatePath(`/board/${boardId}`);
}

export async function moveTaskAction(boardId: string, taskId: string, newColumn: string) {
  await moveTask(boardId, taskId, newColumn);
  revalidatePath(`/board/${boardId}`);
}

export async function deleteTaskAction(boardId: string, taskId: string) {
  await deleteTask(boardId, taskId);
  revalidatePath(`/board/${boardId}`);
}
