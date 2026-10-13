import type { CharacterConfig, Genre, ImageStyle, RandomRequest } from '../types'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, options)
  let payload: any = null

  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    throw new Error(payload?.message || '요청 처리에 실패했습니다.')
  }

  return payload as T
}

export async function generateRandomCharacter(input: RandomRequest) {
  return request<{ characterConfig: CharacterConfig }>('/api/character/random', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export async function generateCharacterFromInput(input: {
  text: string
  genre: Genre
  imageFile: File | null
}) {
  const formData = new FormData()
  formData.append('text', input.text)
  formData.append('genre', input.genre)
  if (input.imageFile) {
    formData.append('image', input.imageFile)
  }

  return request<{ characterConfig: CharacterConfig }>('/api/character/from-input', {
    method: 'POST',
    body: formData,
  })
}

export async function generateCharacterImage(input: {
  characterConfig: CharacterConfig
  style: ImageStyle
}) {
  return request<{ imageUrl: string }>('/api/image/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}
