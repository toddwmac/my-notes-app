export interface Note {
  id: string
  text: string
  createdAt: number
  updatedAt: number
}

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export type DeleteCallback = (noteId: string) => void
export type EditCallback = (note: Note) => void
