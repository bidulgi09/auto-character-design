import { useEffect, useMemo, useState } from 'react'
import {
  Copy,
  Download,
  FileJson,
  ImageUp,
  Lock,
  Moon,
  RefreshCcw,
  Sparkles,
  Sun,
  Trash2,
  Unlock,
  Upload,
} from 'lucide-react'
import { GENRE_OPTIONS, HISTORY_KEY, IMAGE_STYLE_OPTIONS, LOCKABLE_FIELDS, THEME_KEY } from './constants'
import {
  generateCharacterFromInput,
  generateCharacterImage,
  generateRandomCharacter,
} from './services/api'
import type { CharacterConfig, Genre, HistoryItem, ImageStyle } from './types'

type Tab = 'random' | 'input' | 'history'

const emptyLocks = LOCKABLE_FIELDS.reduce(
  (acc, item) => ({ ...acc, [item.key]: false }),
  {} as Record<string, boolean>,
)

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('random')
  const [genre, setGenre] = useState<Genre>('랜덤')
  const [style, setStyle] = useState<ImageStyle>('애니풍')
  const [includeProfileInfo, setIncludeProfileInfo] = useState(false)
  const [locks, setLocks] = useState<Record<string, boolean>>(emptyLocks)
  const [characterConfig, setCharacterConfig] = useState<CharacterConfig | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [inputText, setInputText] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isDark, setIsDark] = useState(false)
  const [isConfigLoading, setIsConfigLoading] = useState(false)
  const [isImageLoading, setIsImageLoading] = useState(false)
  const [error, setError] = useState('')
  const [configEditor, setConfigEditor] = useState('')

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY)
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const nextDark = savedTheme ? savedTheme === 'dark' : prefersDark
    setIsDark(nextDark)
    document.documentElement.classList.toggle('dark', nextDark)

    const raw = localStorage.getItem(HISTORY_KEY)
    if (raw) {
      setHistory(JSON.parse(raw))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  }, [history])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light')
  }, [isDark])

  useEffect(() => {
    if (!characterConfig) {
      setConfigEditor('')
      return
    }
    setConfigEditor(JSON.stringify(characterConfig, null, 2))
  }, [characterConfig])

  const configText = useMemo(() => {
    if (!characterConfig) return ''
    const lines = [
      characterConfig.name ? `이름: ${characterConfig.name}` : '',
      characterConfig.age !== null ? `나이: ${characterConfig.age}` : '',
      characterConfig.gender ? `성별/젠더: ${characterConfig.gender}` : '',
      characterConfig.race ? `종족: ${characterConfig.race}` : '',
      characterConfig.role ? `직업/역할: ${characterConfig.role}` : '',
      (characterConfig.personality || []).length
        ? `성격: ${(characterConfig.personality || []).join(', ')}`
        : '',
      `외형: ${characterConfig.appearance.hairColor} 머리 / ${characterConfig.appearance.hairStyle}, 눈 ${characterConfig.appearance.eyeColor}, 체형 ${characterConfig.appearance.bodyType}, 키 ${characterConfig.appearance.height}`,
      `의상: ${characterConfig.outfit}`,
      `소품/액세서리: ${characterConfig.accessories}`,
      characterConfig.background ? `배경: ${characterConfig.background}` : '',
      `색상 팔레트: ${(characterConfig.colorPalette || []).join(', ')}`,
    ]
    return lines.filter(Boolean).join('\n')
  }, [characterConfig])

  const pushHistory = (nextConfig: CharacterConfig, nextImageUrl?: string) => {
    // 한국어 주석: 최신 결과를 항상 목록 맨 위에 저장한다.
    setHistory((prev) => [
      {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        characterConfig: nextConfig,
        imageUrl: nextImageUrl,
        style,
      },
      ...prev,
    ])
  }

  const validateImage = (file: File | null) => {
    if (!file) return ''
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) return '이미지는 jpg/png/webp 형식만 가능합니다.'
    if (file.size > 5 * 1024 * 1024) return '이미지 용량은 5MB를 초과할 수 없습니다.'
    return ''
  }

  const onSelectFile = (file: File | null) => {
    const message = validateImage(file)
    if (message) {
      setError(message)
      return
    }
    setError('')
    setUploadFile(file)
    setPreviewUrl(file ? URL.createObjectURL(file) : '')
  }

  const handleRandomGenerate = async () => {
    setError('')
    setIsConfigLoading(true)
    try {
      const response = await generateRandomCharacter({
        genre,
        currentConfig: characterConfig,
        lockedFields: locks,
        includeProfileInfo,
      })
      setCharacterConfig(response.characterConfig)
      setImageUrl('')
      pushHistory(response.characterConfig)
      setActiveTab('random')
    } catch (e) {
      setError(e instanceof Error ? e.message : '랜덤 생성에 실패했습니다.')
    } finally {
      setIsConfigLoading(false)
    }
  }

  const handleInputGenerate = async () => {
    if (!inputText.trim() && !uploadFile) {
      setError('텍스트 또는 이미지를 하나 이상 입력해주세요.')
      return
    }
    setError('')
    setIsConfigLoading(true)
    try {
      const response = await generateCharacterFromInput({
        text: inputText,
        genre,
        imageFile: uploadFile,
        includeProfileInfo,
      })
      setCharacterConfig(response.characterConfig)
      setImageUrl('')
      pushHistory(response.characterConfig)
    } catch (e) {
      setError(e instanceof Error ? e.message : '입력 기반 생성에 실패했습니다.')
    } finally {
      setIsConfigLoading(false)
    }
  }

  const handleGenerateImage = async () => {
    if (!characterConfig) {
      setError('먼저 캐릭터 설정을 생성해주세요.')
      return
    }
    setError('')
    setIsImageLoading(true)
    try {
      const response = await generateCharacterImage({ characterConfig, style })
      setImageUrl(response.imageUrl)
      pushHistory(characterConfig, response.imageUrl)
    } catch (e) {
      setError(e instanceof Error ? e.message : '이미지 생성에 실패했습니다.')
    } finally {
      setIsImageLoading(false)
    }
  }

  const toggleLock = (key: string) => {
    setLocks((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const copyConfig = async () => {
    if (!configText) return
    await navigator.clipboard.writeText(configText)
  }

  const exportJson = () => {
    if (!characterConfig) return
    const blob = new Blob([JSON.stringify(characterConfig, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${characterConfig.name || 'character'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadImage = () => {
    if (!imageUrl) return
    const a = document.createElement('a')
    a.href = imageUrl
    a.download = `${characterConfig?.name || 'character'}-image.png`
    a.click()
  }

  const applyConfigEdit = () => {
    if (!configEditor.trim()) return
    try {
      const parsed = JSON.parse(configEditor) as CharacterConfig
      if (!parsed?.appearance || !Array.isArray(parsed?.colorPalette)) {
        throw new Error('invalid character config')
      }
      // 한국어 주석: 사용자가 수정한 설정을 즉시 반영해 다시 이미지를 생성할 수 있게 한다.
      setCharacterConfig(parsed)
      setError('')
    } catch {
      setError('설정 JSON 형식이 올바르지 않습니다.')
    }
  }

  return (
    <div className="min-h-screen bg-white text-[#1F2328] dark:bg-[#0D1117] dark:text-[#F0F6FC]">
      <header className="border-b border-[#D0D7DE] dark:border-[#30363D]">
        <div className="mx-auto flex max-w-[960px] items-center justify-between px-4 py-3">
          <h1 className="text-base font-semibold">Character Design Generator</h1>
          <button
            type="button"
            onClick={() => setIsDark((prev) => !prev)}
            className="rounded-md border border-[#D0D7DE] bg-[#F6F8FA] p-2 dark:border-[#30363D] dark:bg-[#161B22]"
            aria-label="다크 모드 토글"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[960px] px-4 py-6">
        <div className="mb-5 flex gap-2">
          {([
            ['random', '랜덤'],
            ['input', '입력 기반'],
            ['history', '기록'],
          ] as [Tab, string][]).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`rounded-md border px-3 py-1.5 text-sm ${
                activeTab === key
                  ? 'border-[#0969DA] bg-[#0969DA] text-white'
                  : 'border-[#D0D7DE] bg-[#F6F8FA] dark:border-[#30363D] dark:bg-[#161B22]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/50 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        )}

        <section className="mb-4 rounded-md border border-[#D0D7DE] bg-[#F6F8FA] p-4 dark:border-[#30363D] dark:bg-[#161B22]">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              장르
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value as Genre)}
                className="mt-1 w-full rounded-md border border-[#D0D7DE] bg-white px-3 py-2 focus:border-[#0969DA] focus:outline-none focus:ring-2 focus:ring-[#0969DA]/30 dark:border-[#30363D] dark:bg-[#0D1117]"
              >
                {GENRE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm">
              이미지 스타일
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as ImageStyle)}
                className="mt-1 w-full rounded-md border border-[#D0D7DE] bg-white px-3 py-2 focus:border-[#0969DA] focus:outline-none focus:ring-2 focus:ring-[#0969DA]/30 dark:border-[#30363D] dark:bg-[#0D1117]"
              >
                {IMAGE_STYLE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm text-[#656D76] dark:text-[#8B949E]">
            <input
              type="checkbox"
              checked={includeProfileInfo}
              onChange={(e) => setIncludeProfileInfo(e.target.checked)}
              className="h-4 w-4 rounded border-[#D0D7DE] text-[#0969DA] focus:ring-[#0969DA]"
            />
            신체적 특징 외 정보(이름/나이/직업/배경 등)도 생성하기
          </label>
        </section>

        {activeTab === 'random' && (
          <section className="mb-4 rounded-md border border-[#D0D7DE] p-4 dark:border-[#30363D]">
            <div className="mb-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleRandomGenerate}
                disabled={isConfigLoading}
                className="inline-flex items-center gap-2 rounded-md border border-[#0969DA] bg-[#0969DA] px-3 py-2 text-sm text-white disabled:opacity-60"
              >
                <Sparkles size={16} />
                {isConfigLoading ? '생성 중...' : '랜덤 생성'}
              </button>
              <button
                type="button"
                onClick={handleRandomGenerate}
                disabled={isConfigLoading || !characterConfig}
                className="inline-flex items-center gap-2 rounded-md border border-[#D0D7DE] bg-[#F6F8FA] px-3 py-2 text-sm dark:border-[#30363D] dark:bg-[#161B22]"
              >
                <RefreshCcw size={16} />잠금 제외 재생성
              </button>
            </div>

            <p className="mb-2 text-sm text-[#656D76]">항목 잠금 토글</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {LOCKABLE_FIELDS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleLock(item.key)}
                  className="flex items-center justify-between rounded-md border border-[#D0D7DE] px-3 py-2 text-sm dark:border-[#30363D]"
                >
                  {item.label}
                  {locks[item.key] ? <Lock size={15} /> : <Unlock size={15} />}
                </button>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'input' && (
          <section className="mb-4 rounded-md border border-[#D0D7DE] p-4 dark:border-[#30363D]">
            <label className="text-sm">
              키워드/문장 입력
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="mt-1 min-h-[110px] w-full rounded-md border border-[#D0D7DE] bg-white px-3 py-2 focus:border-[#0969DA] focus:outline-none focus:ring-2 focus:ring-[#0969DA]/30 dark:border-[#30363D] dark:bg-[#0D1117]"
                placeholder="예: 비 오는 날 우산을 든 쓸쓸한 마법사"
              />
            </label>

            <div
              className="mt-3 rounded-md border border-dashed border-[#D0D7DE] p-4 text-center text-sm dark:border-[#30363D]"
              onDrop={(e) => {
                e.preventDefault()
                onSelectFile(e.dataTransfer.files[0] ?? null)
              }}
              onDragOver={(e) => e.preventDefault()}
            >
              <Upload className="mx-auto mb-2" size={18} />
              드래그 앤 드롭 또는 파일 선택 (jpg/png/webp, 최대 5MB)
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="mt-2 block w-full text-xs"
                onChange={(e) => onSelectFile(e.target.files?.[0] ?? null)}
              />
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="업로드 미리보기"
                  className="mx-auto mt-3 max-h-40 rounded-md border border-[#D0D7DE] object-cover dark:border-[#30363D]"
                />
              )}
            </div>

            <button
              type="button"
              onClick={handleInputGenerate}
              disabled={isConfigLoading}
              className="mt-3 inline-flex items-center gap-2 rounded-md border border-[#0969DA] bg-[#0969DA] px-3 py-2 text-sm text-white disabled:opacity-60"
            >
              <ImageUp size={16} />
              {isConfigLoading ? '생성 중...' : '입력 기반 생성'}
            </button>
          </section>
        )}

        {activeTab === 'history' && (
          <section className="mb-4 rounded-md border border-[#D0D7DE] p-4 dark:border-[#30363D]">
            {history.length === 0 ? (
              <p className="text-sm text-[#656D76]">저장된 기록이 없습니다.</p>
            ) : (
              <ul className="space-y-2">
                {history.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[#D0D7DE] px-3 py-2 text-sm dark:border-[#30363D]"
                  >
                    <button
                      type="button"
                      className="text-left"
                      onClick={() => {
                        setCharacterConfig(item.characterConfig)
                        setImageUrl(item.imageUrl || '')
                        setStyle(item.style || '애니풍')
                        setActiveTab('random')
                      }}
                    >
                      {item.characterConfig.name || '이름 미생성'} · {new Date(item.createdAt).toLocaleString()}
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistory((prev) => prev.filter((v) => v.id !== item.id))}
                      className="rounded-md border border-[#D0D7DE] p-1.5 dark:border-[#30363D]"
                      aria-label="기록 삭제"
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <section className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <article className="rounded-md border border-[#D0D7DE] p-4 dark:border-[#30363D]">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">캐릭터 이미지</h2>
              <button
                type="button"
                onClick={handleGenerateImage}
                disabled={isImageLoading || !characterConfig}
                className="inline-flex items-center gap-2 rounded-md border border-[#0969DA] bg-[#0969DA] px-3 py-1.5 text-sm text-white disabled:opacity-60"
              >
                <RefreshCcw size={15} />
                {isImageLoading ? '생성 중...' : '이미지 다시 생성'}
              </button>
            </div>

            {imageUrl ? (
              <img src={imageUrl} alt="생성된 캐릭터 이미지" className="w-full rounded-md border border-[#D0D7DE] dark:border-[#30363D]" />
            ) : (
              <div className="flex h-[340px] items-center justify-center rounded-md border border-dashed border-[#D0D7DE] text-sm text-[#656D76] dark:border-[#30363D]">
                {isImageLoading ? '이미지 생성 중입니다...' : '이미지를 아직 생성하지 않았습니다.'}
              </div>
            )}

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={downloadImage}
                disabled={!imageUrl}
                className="inline-flex items-center gap-1 rounded-md border border-[#D0D7DE] bg-[#F6F8FA] px-3 py-1.5 text-sm disabled:opacity-50 dark:border-[#30363D] dark:bg-[#161B22]"
              >
                <Download size={15} /> 이미지 다운로드
              </button>
            </div>
          </article>

          <article className="rounded-md border border-[#D0D7DE] p-4 dark:border-[#30363D]">
            <h2 className="mb-3 text-sm font-semibold">설정 카드</h2>
            {characterConfig ? (
              <>
                <pre className="max-h-[380px] overflow-auto whitespace-pre-wrap rounded-md bg-[#F6F8FA] p-3 text-sm leading-6 dark:bg-[#161B22]">
                  {configText}
                </pre>
                <label className="mt-3 block text-sm">
                  설정 JSON 수정
                  <textarea
                    value={configEditor}
                    onChange={(e) => setConfigEditor(e.target.value)}
                    className="mt-1 min-h-[180px] w-full rounded-md border border-[#D0D7DE] bg-white px-3 py-2 font-mono text-xs focus:border-[#0969DA] focus:outline-none focus:ring-2 focus:ring-[#0969DA]/30 dark:border-[#30363D] dark:bg-[#0D1117]"
                  />
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={copyConfig}
                    className="inline-flex items-center gap-1 rounded-md border border-[#D0D7DE] px-3 py-1.5 text-sm dark:border-[#30363D]"
                  >
                    <Copy size={15} /> 복사
                  </button>
                  <button
                    type="button"
                    onClick={exportJson}
                    className="inline-flex items-center gap-1 rounded-md border border-[#D0D7DE] px-3 py-1.5 text-sm dark:border-[#30363D]"
                  >
                    <FileJson size={15} /> JSON 내보내기
                  </button>
                  <button
                    type="button"
                    onClick={applyConfigEdit}
                    className="inline-flex items-center gap-1 rounded-md border border-[#0969DA] bg-[#0969DA] px-3 py-1.5 text-sm text-white"
                  >
                    <RefreshCcw size={15} /> 설정 반영
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(characterConfig.colorPalette || []).map((hex) => (
                    <div key={hex} className="rounded border border-[#D0D7DE] px-2 py-1 text-xs font-mono dark:border-[#30363D]">
                      <span className="mr-1 inline-block h-3 w-3 rounded-full align-middle" style={{ backgroundColor: hex }} />
                      {hex}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-[#656D76]">캐릭터 설정을 먼저 생성해주세요.</p>
            )}
          </article>
        </section>
      </main>
    </div>
  )
}

export default App
