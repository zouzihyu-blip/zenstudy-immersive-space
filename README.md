# ZenStudy 澄境 · 單人沉浸式讀書空間
> 115 學年度第 1 學期 商業設計系「自然科學與人工智慧」期末專題（CD000A 第 17 組）

![ZenStudy Banner](https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1600&q=80)

---

## 📖 專題簡介 (Overview)
**ZenStudy 澄境** 是一款專為深度學習、考照衝刺與閱讀設計的「個人沉浸式虛擬自習室」。本專案融合商業設計之**極簡美學（Glassmorphism & Zen Aesthetics）**與 **Web Audio API 自然聲學合成技術**，幫助使用者在紛擾的數位環境中迅速隔絕干擾、進入專注心流（Flow State）。

- **專案主題**：單人沉浸式讀書空間 (Solo Immersive Study Space)
- **團隊組別**：CD000A 第 17 組
- **團隊成員**：
  - **鄒粢伃**（學號：11533146）
  - **謝芸榛**

---

## ✨ 核心特色與功能亮點 (Key Features)

### 1. 🖼️ 多感官動態場景庫 (Visual Sceneries)
- **8 款精選高解析度氛圍場景**：
  - 🌧️ 雨天咖啡廳 (Rainy Cafe)
  - 🌃 深夜東京 (Tokyo Night)
  - 🌲 森林木屋 (Forest Cabin)
  - 📚 星光圖書館 (Starlit Library)
  - 🌅 黃昏海灘 (Sunset Beach)
  - 🔥 壁爐微光 (Cozy Fireplace)
  - 🚀 賽博專注艙 (Cyber Space)
  - 🎋 禪意庭園 (Zen Garden)
- **個人自訂場景庫（CRUD）**：使用者可隨時新增自訂圖片/動態桌布 URL、自訂分類標籤，並支援刪除自訂場景。
- **環境濾鏡調節**：支援背景暗度（Brightness: 20%~100%）與景深模糊度（Blur: 0~16px）自由滑動微調，保護眼睛並減少視覺干擾。

### 2. 🎵 Web Audio 程序化環境音效混音器 (Ambient Sound Mixer)
- **零依賴、純前端聲學合成（Web Audio API）**：
  - 🌧️ **細雨連綿**：粉紅噪音（Pink Noise）經低通濾波合成雨滴聲。
  - ☕ **咖啡漫談**：頻段調變模擬遠處咖啡館的環境低頻。
  - 🪵 **溫暖壁爐**：布朗噪音底層結合隨機劈啪爆破微音效。
  - 🌊 **寧靜海浪**：低頻振盪器（LFO）週期性振幅調變模擬潮起潮落波濤。
  - ⌨️ **機械鍵盤**：隨機鍵擊短衝激波音效。
  - 🍃 **森林蟲鳴**：高通風吹微動與隨機正弦波鳥鳴。
  - ⚡ **遠處雷鳴**：低頻巨響與漸進衰減混響。
  - 📻 **深度白噪**：純白噪音提供最強遮噪專注力。
- **8 軌獨立混音滑桿**：每個環境音效均可獨立微調音量，自由疊加最適合當前心情的聲音空間。
- **暖光 Lo-Fi 和弦生成器**：自動循環撥放 Fmaj7 - Dm7 - Cmaj7 - Em7 溫暖爵士七和弦。
- **禪宗結束提示音**：內建西藏頌缽（Tibetan Singing Bowl）、柔和禪鐘（Soft Bell）與明亮三音階，提供平靜而不刺耳的時段轉換提醒。

### 3. ⏱️ 三大多元計時模式 (Versatile Timers)
- 🍅 **番茄工作法 (Pomodoro)**：
  - 專注 25 分鐘 / 短休息 5 分鐘 / 長休息 15 分鐘（支援每 4 回合自動觸發長休息）。
  - 可於設定面板自由微調分鐘數，並可開啟自動進入休息/自動開始下個番茄鐘。
- ⏳ **倒數計時模式 (Countdown)**：快速選取 15 / 25 / 45 / 60 / 90 分鐘或自訂時長，適合模擬考或衝刺。
- ⏱️ **自主正數碼表 (Stopwatch)**：記錄無上限的沉浸閱讀總時長。
- **防止背景分頁飄移**：採用 `Date.now()` 時間戳差值運算（Delta Timing），即便瀏覽器休眠也能精準計時。
- **分頁標題動態同步**：分頁標題即時顯示當前剩餘時間與專注狀態。

### 4. 📊 完整資料管理系統（CRUD & LocalStorage）
> 符合期末專題加分項目第 2 項（能實際新增、編輯、刪除資料，即時在畫面呈現並保存）
- **待辦目標清單 (Tasks CRUD)**：
  - 新增任務（名稱、分類標籤、預估番茄鐘數）。
  - 標記完成狀態、編輯或刪除任務。
  - 可設定「當前專注任務」，計時器與頂部橫幅即時錨定該任務，完成後自動累加獲得番茄數！
- **靈感隨手便箋 (Notes CRUD)**：
  - 自由新增便箋，提供琥珀黃、鼠尾草綠、天際藍、玫瑰粉四款設計主題色。
  - 內容與標題即時自動儲存（防抖 auto-save），可隨時刪除或更換顏色。
- **自訂場景庫 (Scenes CRUD)**：
  - 新增、套用、刪除個人化背景圖片。
- **專注歷史紀錄與統計 (Stats & History CRUD)**：
  - 自動記錄每次完成的專注時段、時長、任務名稱與日期時間。
  - 統計「今日專注分鐘」、「完成番茄數」、「累積總專注時長」、「累計學習回合」。
  - 歷史紀錄支援單筆手動刪除或一鍵清空。
- **資料備份 (JSON Export / Import)**：
  - 提供一鍵匯出完整 JSON 備份檔，並可從 JSON 檔案完整復原所有任務、便箋、自訂場景與統計紀錄。

### 5. 🧘 Zen 極簡專注模式與快捷鍵 (Focus Controls)
- 按 **Z** 或點擊「👁️ 極簡專注」：瞬間淡出所有功能面板與導航列，僅保留發光進度環與當前時間，消除一切干擾。
- **快捷鍵支援**：
  - `Space`：開始 / 暫停計時
  - `Z` / `Esc`：切換 / 退出極簡專注模式
  - `F`：全螢幕切換
  - `M`：一鍵靜音 / 解除靜音

---

## 🛠️ 技術架構與技術棧 (Tech Stack)
- **架構設計**：純前端單頁應用（SPA），零依賴、免編譯、相容性 100%。
- **視覺與排版**：HTML5 語意化標籤 + CSS3 原生現代變數 + Glassmorphism 毛玻璃磨砂 + SVG 向量動態進度環。
- **音訊核心**：Web Audio API（OscillatorNode, BiquadFilterNode, AudioBufferSourceNode, GainNode）。
- **資料儲存**：Client-side LocalStorage（封裝完整 CRUD 模組）+ JSON 結構化資料備份。
- **部署平台**：Vercel（配置 `vercel.json` 靜態部署）與 GitHub Pages。

---

## 🚀 本地啟動與預覽指南 (Quick Start)

### 方式一：直接雙擊開啟（最簡單）
直接使用 Chrome / Edge 瀏覽器雙擊打開專案目錄中的 `index.html` 即可完整體驗所有視覺、計時與音效功能！

### 方式二：使用本地 HTTP 伺服器
若電腦已安裝 Python、Node.js 或 PowerShell：
```bash
# 透過 PowerShell (專案已內建 serve.ps1):
powershell -ExecutionPolicy Bypass -File serve.ps1

# 或透過 Python:
python -m http.server 8080

# 或透過 npx:
npx serve .
```
開啟瀏覽器訪問 `http://127.0.0.1:8080`。

---

## ☁️ Vercel 一鍵線上部署教學 (Deployment)
1. 將本專案程式碼 Push 至 GitHub 公開專案庫（Public Repository）。
2. 前往 [Vercel](https://vercel.com/) 點擊 **Add New Project**。
3. 選擇 **Import Git Repository**，選取本專案。
4. Framework Preset 保持預設（Other / None），Root Directory 設為 `./`。
5. 點擊 **Deploy**，約 30 秒內即可取得公開可訪問的網址（如 `https://zenstudy.vercel.app`）！

---

## 👥 團隊成員分工與 GitHub 協作紀錄 (Team Collaboration)
本專案由 **CD000A 第 17 組** 共同開發：

| 成員姓名 | 學號 | 負責項目與貢獻說明 |
| :--- | :--- | :--- |
| **鄒粢伃** | 11533146 | **專案主體架構與視覺設計**：整體毛玻璃介面設計、8 大場景庫建置、Web Audio API 自然音效合成器研發、Zen 極簡沉浸模式實作。 |
| **謝芸榛** | | **資料管理模組與使用者體驗**：待辦目標（Tasks CRUD）、隨手便箋（Notes CRUD）、專注歷史數據統計與 JSON 備份功能、番茄鐘循環與自訂時長測試。 |

### GitHub 協作流程建議：
1. 由鄒粢伃建立 GitHub 公開庫 `zenstudy-immersive-space` 並推送 `main` 初版，邀請謝芸榛為 Collaborator。
2. 謝芸榛建立個人分支 `feature/tasks-and-notes-crud` 進行提交，並發起 Pull Request 併入主分支。
3. 兩位成員均留下實質的 commit 紀錄，符合個人貢獻加分要求！

---

## 📄 專案目錄結構 (Directory Structure)
```
zenstudy-immersive-space/
├── index.html                   # 主頁面結構與所有模態抽屜
├── vercel.json                  # Vercel 一鍵部署設定檔
├── package.json                 # 專案資訊宣告檔
├── serve.ps1                    # 本地端即開即用 HTTP 伺服器
├── README.md                    # 專題詳細說明與操作文件
├── css/
│   └── styles.css               # 頂級深色毛玻璃、排版與動畫樣式
├── js/
│   ├── storage.js               # LocalStorage CRUD 資料管理模組
│   ├── audio-engine.js          # Web Audio 程序化自然音效合成引擎
│   ├── timer.js                 # 核心防漂移精準計時器
│   └── app.js                   # 主控制器與使用者介面互動邏輯
└── docs/
    ├── improvement-records.md   # 期末評分必備：4 項真實改善紀錄
    └── presentation-outline.md  # 期末 10~15 分鐘投影片大綱與口頭講稿
```

---

## 🏆 評分指標對照自評 (Rubric Self-Assessment)
- [x] **基本作品（60 分）**：完整交付具備主題、美感與可操作性之沉浸式讀書網站。
- [x] **加分項 1 - 作品上線（+10 分）**：具備 `vercel.json`，可無縫部署至 Vercel 公開網址。
- [x] **加分項 2 - 管理／資料功能 CRUD（+10 分）**：具備任務目標、靈感便箋、自訂場景、專注歷史紀錄 4 大完整 CRUD，並支援 JSON 備份匯出匯入。
- [x] **加分項 3 - 個人貢獻（+10 分）**：兩位組員分工明確，具備個人功能模組規劃與 GitHub 協作指南。
- [x] **加分項 4 - 完成度與創意（+10 分）**：商業設計美學視覺、Web Audio 自然音效即時合成、Lofi 和弦生成、Zen 極簡沉浸模式。
