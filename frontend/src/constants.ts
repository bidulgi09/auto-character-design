import type { Genre, ImageStyle } from './types'

export const GENRE_OPTIONS: Genre[] = ['판타지', 'SF', '현대', '학원물', '동양풍', '랜덤']
export const IMAGE_STYLE_OPTIONS: ImageStyle[] = ['애니풍', '수채화', '픽셀아트', '반실사', '라인아트']

export const LOCKABLE_FIELDS = [
  { key: 'name', label: '이름' },
  { key: 'age', label: '나이' },
  { key: 'gender', label: '성별/젠더' },
  { key: 'race', label: '종족' },
  { key: 'role', label: '직업/역할' },
  { key: 'personality', label: '성격' },
  { key: 'appearance', label: '외형' },
  { key: 'outfit', label: '의상' },
  { key: 'accessories', label: '소품/액세서리' },
  { key: 'background', label: '배경 설정' },
  { key: 'colorPalette', label: '색상 팔레트' },
] as const

export const HISTORY_KEY = 'character-design-history-v1'
export const THEME_KEY = 'character-design-theme'
