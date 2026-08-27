import { NextResponse } from 'next/server';
import { getBoard } from '@/lib/data';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const resolvedParams = await params;
  const board = await getBoard(resolvedParams.boardId);

  if (!board) {
    return new NextResponse('Board not found or unauthorized', { status: 404 });
  }

  return new NextResponse(JSON.stringify(board, null, 2), {
    headers: {
      'Content-Disposition': `attachment; filename="board-${resolvedParams.boardId}.json"`,
      'Content-Type': 'application/json',
    },
  });
}
