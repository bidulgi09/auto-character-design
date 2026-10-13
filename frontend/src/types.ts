export type Genre = '판타지' | 'SF' | '현대' | '학원물' | '동양풍' | '랜덤'
export type ImageStyle = '애니풍' | '수채화' | '픽셀아트' | '반실사' | '라인아트'

export interface CharacterConfig {
  name: string
  age: number | null
  gender: string
  race: string
  role: string
  personality: string[]
  appearance: {
    hairColor: string
    hairStyle: string
    eyeColor: string
    bodyType: string
    height: string
  }
  outfit: string
  accessories: string
  background: string
  colorPalette: string[]
  genre: string
}

export interface HistoryItem {
  id: string
  createdAt: string
  characterConfig: CharacterConfig
  imageUrl?: string
  style?: ImageStyle
}

export interface RandomRequest {
  genre: Genre
  currentConfig?: CharacterConfig | null
  lockedFields: Record<string, boolean>
  includeProfileInfo: boolean
}
