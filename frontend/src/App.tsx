import { useEffect, useMemo, useState } from 'react'
import {
  Copy,
  Download,
  FileJson,
  ImageIcon,
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

// 공통 스타일 (실제 스타일은 index.css의 .neu-*, .glass 클래스에 정의)
const btnPrimary = 'neu-btn neu-btn-primary'
const btnSecondary = 'neu-btn'
const inputCls = 'neu-input mt-1 w-full px-3 py-2 text-sm'
const cardCls = 'glass'
const mutedCls = 'text-[#656D76] dark:text-[#8B949E]'

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

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

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

  // 설정 카드 표시용 (라벨/값 목록)
  const configRows = useMemo<[string, string][]>(() => {
    if (!characterConfig) return []
    const c = characterConfig
    const rows: [string, string][] = [
      ['이름', String(c.name ?? '')],
      ['나이', c.age !== null && c.age !== undefined ? String(c.age) : ''],
      ['성별/젠더', String(c.gender ?? '')],
      ['종족', String(c.race ?? '')],
      ['직업/역할', String(c.role ?? '')],
      ['성격', (c.personality || []).join(', ')],
      [
        '외형',
        `${c.appearance.hairColor} 머리 / ${c.appearance.hairStyle}, 눈 ${c.appearance.eyeColor}, 체형 ${c.appearance.bodyType}, 키 ${c.appearance.height}`,
      ],
      ['의상', String(c.outfit ?? '')],
      ['소품/액세서리', String(c.accessories ?? '')],
      ['배경', String(c.background ?? '')],
    ]
    return rows.filter(([, value]) => value)
  }, [characterConfig])

  const lockedCount = Object.values(locks).filter(Boolean).length

  const tabs: [Tab, string][] = [
    ['random', '랜덤'],
    ['input', '입력 기반'],
    ['history', `기록${history.length ? ` (${history.length})` : ''}`],
  ]
  const tabIndex = tabs.findIndex(([key]) => key === activeTab)

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
    if (previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
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

  const safePreviewUrl = previewUrl.startsWith('blob:') ? previewUrl : ''

  return (
    <div className="relative min-h-screen text-[#1F2328] dark:text-[#F0F6FC]">
      {/* 배경: 천천히 떠다니는 색 덩어리 (유리 효과가 보이게 해줌) */}
      <div className="bg-blobs" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      {/* 헤더 */}
      <header className="glass-header sticky top-0 z-20">
        <div className="mx-auto flex max-w-[960px] items-center justify-between px-4 py-3">
          <h1 className="flex items-center gap-2 text-base font-semibold">
            <Sparkles size={18} className="anim-twinkle text-[#0969DA] dark:text-[#58A6FF]" />
            Character Design Generator
          </h1>
          <button
            type="button"
            onClick={() => setIsDark((prev) => !prev)}
            className="neu-btn !p-2"
            aria-label="다크 모드 토글"
          >
            <span key={String(isDark)} className="anim-spin-in inline-flex">
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </span>
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-[960px] px-4 py-6">
        {/* 탭 (슬라이딩 인디케이터) */}
        <nav className="seg mb-6" role="tablist">
          <span className="seg-indicator" style={{ transform: `translateX(${tabIndex * 100}%)` }} />
          {tabs.map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={activeTab === key}
              onClick={() => setActiveTab(key)}
              className={`seg-tab ${
                activeTab === key ? 'font-semibold text-[#0969DA] dark:text-[#58A6FF]' : mutedCls
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {error && (
          <div className="anim-in mb-4 rounded-xl border border-red-300/70 bg-red-50/80 px-3 py-2 text-sm text-red-700 backdrop-blur dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}

        {/* 컨트롤 카드 (랜덤 / 입력 기반 공통) */}
        {activeTab !== 'history' && (
          <section key={activeTab} className="glass anim-in mb-6 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">
                장르
                <select value={genre} onChange={(e) => setGenre(e.target.value as Genre)} className={inputCls}>
                  {GENRE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium">
                이미지 스타일
                <select value={style} onChange={(e) => setStyle(e.target.value as ImageStyle)} className={inputCls}>
                  {IMAGE_STYLE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className={`mt-4 flex items-center gap-2 text-xs ${mutedCls}`}>
              <input
                type="checkbox"
                checked={includeProfileInfo}
                onChange={(e) => setIncludeProfileInfo(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-[#D0D7DE] text-[#0969DA] focus:ring-[#0969DA]"
              />
              신체적 특징 외 정보(이름/나이/직업/배경 등)도 생성하기
            </label>

            <div className="my-5 h-px bg-gradient-to-r from-transparent via-slate-400/40 to-transparent" />

            {activeTab === 'random' && (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleRandomGenerate}
                    disabled={isConfigLoading}
                    className={btnPrimary}
                  >
                    <Sparkles size={15} />
                    {isConfigLoading ? '생성 중...' : '랜덤 생성'}
                  </button>
                  <button
                    type="button"
                    onClick={handleRandomGenerate}
                    disabled={isConfigLoading || !characterConfig}
                    className={btnSecondary}
                  >
                    <RefreshCcw size={15} className={isConfigLoading ? 'animate-spin' : ''} />
                    잠금 제외 재생성
                  </button>
                  {lockedCount > 0 && (
                    <span className={`text-xs ${mutedCls}`}>{lockedCount}개 항목 고정됨</span>
                  )}
                </div>

                <details className="group mt-5">
                  <summary className={`cursor-pointer select-none text-sm ${mutedCls}`}>
                    항목 잠금 {lockedCount > 0 ? `(${lockedCount})` : ''}
                  </summary>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {LOCKABLE_FIELDS.map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => toggleLock(item.key)}
                        aria-pressed={locks[item.key]}
                        className="neu-chip"
                      >
                        {locks[item.key] ? <Lock size={12} /> : <Unlock size={12} />}
                        {item.label}
                      </button>
                    ))}
                  </div>
                </details>
              </>
            )}

            {activeTab === 'input' && (
              <>
                <label className="text-sm font-medium">
                  키워드/문장 입력
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className={`${inputCls} min-h-[96px] resize-y`}
                    placeholder="예: 비 오는 날 우산을 든 쓸쓸한 마법사"
                  />
                </label>

                <label
                  className={`neu-well mt-4 flex cursor-pointer flex-col items-center gap-1 p-5 text-center text-sm transition-transform hover:-translate-y-0.5 ${mutedCls}`}
                  onDrop={(e) => {
                    e.preventDefault()
                    onSelectFile(e.dataTransfer.files[0] ?? null)
                  }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <Upload size={18} />
                  <span>드래그 앤 드롭 또는 클릭해서 파일 선택</span>
                  <span className="text-xs">jpg/png/webp, 최대 5MB</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(e) => onSelectFile(e.target.files?.[0] ?? null)}
                  />
                  {safePreviewUrl && (
                    <img
                      key={safePreviewUrl}
                      src={safePreviewUrl}
                      alt="업로드 미리보기"
                      className="anim-pop mt-3 max-h-40 rounded-xl object-cover shadow-md"
                    />
                  )}
                </label>

                <button
                  type="button"
                  onClick={handleInputGenerate}
                  disabled={isConfigLoading}
                  className={`${btnPrimary} mt-4`}
                >
                  <ImageUp size={15} />
                  {isConfigLoading ? '생성 중...' : '입력 기반 생성'}
                </button>
              </>
            )}
          </section>
        )}

        {/* 기록 */}
        {activeTab === 'history' && (
          <section className={`${cardCls} anim-in mb-6 p-5`}>
            {history.length === 0 ? (
              <p className={`text-sm ${mutedCls}`}>저장된 기록이 없습니다.</p>
            ) : (
              <ul className="divide-y divide-slate-400/25">
                {history.map((item, i) => (
                  <li
                    key={item.id}
                    className="anim-in flex items-center justify-between gap-2 py-2.5 text-sm first:pt-0 last:pb-0"
                    style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                  >
                    <button
                      type="button"
                      className="min-w-0 flex-1 truncate text-left transition-colors hover:text-[#0969DA] dark:hover:text-[#58A6FF]"
                      onClick={() => {
                        setCharacterConfig(item.characterConfig)
                        setImageUrl(item.imageUrl || '')
                        setStyle(item.style || '애니풍')
                        setActiveTab('random')
                      }}
                    >
                      {item.characterConfig.name || '이름 미생성'}
                      <span className={`ml-2 text-xs ${mutedCls}`}>{new Date(item.createdAt).toLocaleString()}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistory((prev) => prev.filter((v) => v.id !== item.id))}
                      className="neu-btn !p-1.5"
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

        {/* 결과 영역 */}
        <section className="grid gap-5 lg:grid-cols-2">
          {/* 이미지 */}
          <article className={`${cardCls} anim-in p-5`}>
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold">캐릭터 이미지</h2>
              <button
                type="button"
                onClick={handleGenerateImage}
                disabled={isImageLoading || !characterConfig}
                className={btnPrimary}
              >
                <RefreshCcw size={14} className={isImageLoading ? 'animate-spin' : ''} />
                {isImageLoading ? '생성 중...' : imageUrl ? '이미지 다시 생성' : '이미지 생성'}
              </button>
            </div>

            {imageUrl ? (
              <img
                key={imageUrl}
                src={imageUrl}
                alt="생성된 캐릭터 이미지"
                className="anim-pop w-full rounded-2xl shadow-lg"
              />
            ) : (
              <div
                className={`neu-well flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 px-6 text-center text-sm ${mutedCls} ${
                  isImageLoading ? 'shimmer' : ''
                }`}
              >
                <ImageIcon size={28} className={isImageLoading ? 'animate-pulse' : ''} />
                {isImageLoading
                  ? '이미지 생성 중입니다...'
                  : characterConfig
                    ? '"이미지 생성"을 눌러 그림을 만들어보세요.'
                    : '먼저 캐릭터 설정을 생성해주세요.'}
              </div>
            )}

            <div className="mt-4">
              <button type="button" onClick={downloadImage} disabled={!imageUrl} className={btnSecondary}>
                <Download size={14} /> 이미지 다운로드
              </button>
            </div>
          </article>

          {/* 설정 카드 */}
          <article className={`${cardCls} anim-in p-5`} style={{ animationDelay: '80ms' }}>
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold">설정 카드</h2>
              {characterConfig && (
                <div className="flex gap-3">
                  <button type="button" onClick={copyConfig} className={btnSecondary}>
                    <Copy size={14} /> 복사
                  </button>
                  <button type="button" onClick={exportJson} className={btnSecondary}>
                    <FileJson size={14} /> JSON
                  </button>
                </div>
              )}
            </div>

            {characterConfig ? (
              <>
                <div className="mb-4 flex flex-wrap gap-2">
                  {(characterConfig.colorPalette || []).map((hex, i) => (
                    <div
                      key={`${hex}-${i}`}
                      className="anim-pop inline-flex items-center gap-1.5 rounded-full bg-white/50 px-2.5 py-1 font-mono text-xs shadow-sm ring-1 ring-white/60 dark:bg-white/5 dark:ring-white/10"
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <span
                        className="inline-block h-3 w-3 rounded-full border border-black/10"
                        style={{ backgroundColor: hex }}
                      />
                      {hex}
                    </div>
                  ))}
                </div>

                <dl key={configText} className="divide-y divide-slate-400/25 text-sm">
                  {configRows.map(([label, value], i) => (
                    <div
                      key={label}
                      className="anim-in grid grid-cols-[88px_1fr] gap-3 py-2"
                      style={{ animationDelay: `${i * 45}ms` }}
                    >
                      <dt className={mutedCls}>{label}</dt>
                      <dd className="break-words">{value}</dd>
                    </div>
                  ))}
                </dl>

                <details className="mt-4">
                  <summary className={`cursor-pointer select-none text-sm ${mutedCls}`}>설정 JSON 직접 수정</summary>
                  <textarea
                    value={configEditor}
                    onChange={(e) => setConfigEditor(e.target.value)}
                    className={`${inputCls} min-h-[200px] font-mono text-xs`}
                  />
                  <button type="button" onClick={applyConfigEdit} className={`${btnPrimary} mt-3`}>
                    <RefreshCcw size={14} /> 설정 반영
                  </button>
                </details>
              </>
            ) : (
              <div
                className={`flex min-h-[200px] flex-col items-center justify-center gap-2 text-center text-sm ${mutedCls}`}
              >
                <Sparkles size={24} className="anim-twinkle" />
                캐릭터 설정을 먼저 생성해주세요.
              </div>
            )}
          </article>
        </section>
      </main>
    </div>
  )
}

export default App