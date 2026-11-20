/**
 * ふじみ野市 日本語教室 リアルタイム予約カレンダー
 * Monthly Calendar & Slot Booking Component v2.1 (Fixed)
 *
 * APIs:
 * - 接口 1: GET /api/public/group-activities/{activityId}/calendar?month=YYYY-MM&date=YYYY-MM-DD
 * - 接口 2: GET /api/public/group-activities/{activityId}/daily-slots?date=YYYY-MM-DD
 */

(function () {
    'use strict';

    // ─────────────────────────────────────────────
    // 設定
    // ─────────────────────────────────────────────
    const urlParams = new URLSearchParams(window.location.search);
    const API_BASE = urlParams.get('apiBase') ||
                     localStorage.getItem('CALENDAR_API_BASE') ||
                     window.CALENDAR_API_BASE ||
                     'https://fujimirv.jptungri.shop';

    const ACTIVITIES = {
        STELLA: 41,  // ふじみの日本語教室（ステラ・イースト）
        MINNA:  28   // みんなのいえ 日本語教室（亀久保）
    };

    const DAY_OF_WEEK_INDEX = {
        'SUNDAY': 0, 'MONDAY': 1, 'TUESDAY': 2, 'WEDNESDAY': 3,
        'THURSDAY': 4, 'FRIDAY': 5, 'SATURDAY': 6
    };

    // ─────────────────────────────────────────────
    // テーマカラー（inline style で Tailwind を回避）
    // ─────────────────────────────────────────────
    const THEMES = {
        teal: {
            headerGrad:    'linear-gradient(to right, #0f766e, #0d9488, #059669)',
            borderColor:   '#0d9488',
            bgLight:       '#f0fdfa',
            bgMed:         '#ccfbf1',
            textDark:      '#134e4a',
            textMed:       '#0f766e',
            badgeBg:       '#ccfbf1',
            badgeText:     '#134e4a',
            badgeBorder:   '#99f6e4',
            btnGrad:       'linear-gradient(to right, #0d9488, #059669)',
            btnGradHover:  'linear-gradient(to right, #0f766e, #047857)',
            dotColor:      '#0d9488',
            activeTabText: '#134e4a',
            ring:          '#99f6e4',
        },
        orange: {
            headerGrad:    'linear-gradient(to right, #c2410c, #ea580c, #d97706)',
            borderColor:   '#ea580c',
            bgLight:       '#fff7ed',
            bgMed:         '#fed7aa',
            textDark:      '#7c2d12',
            textMed:       '#c2410c',
            badgeBg:       '#fed7aa',
            badgeText:     '#7c2d12',
            badgeBorder:   '#fdba74',
            btnGrad:       'linear-gradient(to right, #ea580c, #d97706)',
            btnGradHover:  'linear-gradient(to right, #c2410c, #b45309)',
            dotColor:      '#ea580c',
            activeTabText: '#7c2d12',
            ring:          '#fdba74',
        },
        indigo: {
            headerGrad:    'linear-gradient(to right, #3730a3, #4f46e5, #2563eb)',
            borderColor:   '#4f46e5',
            bgLight:       '#eef2ff',
            bgMed:         '#c7d2fe',
            textDark:      '#1e1b4b',
            textMed:       '#4338ca',
            badgeBg:       '#c7d2fe',
            badgeText:     '#1e1b4b',
            badgeBorder:   '#a5b4fc',
            btnGrad:       'linear-gradient(to right, #4f46e5, #2563eb)',
            btnGradHover:  'linear-gradient(to right, #3730a3, #1d4ed8)',
            dotColor:      '#4f46e5',
            activeTabText: '#1e1b4b',
            ring:          '#a5b4fc',
        }
    };

    function getTheme(activityId) {
        if (activityId === ACTIVITIES.STELLA) return THEMES.teal;
        if (activityId === ACTIVITIES.MINNA)  return THEMES.orange;
        return THEMES.indigo;
    }

    // ─────────────────────────────────────────────
    // 多言語辞書
    // ─────────────────────────────────────────────
    const I18N = {
        ja: {
            title: "開催日程・予約カレンダー",
            subtitle: "カレンダーの日付をクリックすると、その日の開催枠や空き状況を確認して直接ネット予約できます。",
            tabStella: "ふじみの日本語教室（ステラ・イースト）",
            tabMinna: "みんなのいえ 日本語教室（亀久保）",
            todayBtn: "今月",
            prevMonth: "前月",
            nextMonth: "翌月",
            weekdays: ["日", "月", "火", "水", "木", "金", "土"],
            todayBadge: "今日",
            legendAvailable: "予約可能",
            legendFull: "満席",
            legendPast: "受付終了",
            legendNone: "開催なし",
            selectedDateTitle: "の開催枠・予約状況",
            noSlots: "この日の開催予定はありません。カレンダー上の枠がある日程（緑色）をお選びください。",
            timeLabel: "時間",
            placeLabel: "場所",
            remainingPrefix: "残り ",
            remainingSuffix: " 席",
            totalPrefix: "定員 ",
            totalSuffix: " 名",
            unlimitedCapacity: "定員なし（自由参加）",
            bookNow: "ネット予約する（無料）",
            bookEnded: "受付終了",
            bookFull: "満員御礼",
            statusAvailable: "受付中",
            statusFull: "満席",
            statusPast: "終了",
            loading: "カレンダーを読み込み中...",
            loadingSlots: "枠情報を取得中...",
            loadError: "データの取得に失敗しました。再試行してください。",
            retryBtn: "もう一度読み込む",
            clickDate: "カレンダーから日付を選択してください。"
        },
        easy: {
            title: "きょうしつの ひにち カレンダー",
            subtitle: "ひにちを おすと、やっている じかんや あいている せきが わかります。",
            tabStella: "ふじみの日本語教室（ステラ・イースト）",
            tabMinna: "みんなのいえ（かめくぼ）",
            todayBtn: "こんげつ",
            prevMonth: "まえの月",
            nextMonth: "つぎの月",
            weekdays: ["日", "月", "火", "水", "木", "金", "土"],
            todayBadge: "きょう",
            legendAvailable: "あいてます",
            legendFull: "いっぱいです",
            legendPast: "おわりました",
            legendNone: "やすみ",
            selectedDateTitle: "の きょうしつ",
            noSlots: "このひは きょうしつが ありません。みどりの ひを えらんでください。",
            timeLabel: "じかん",
            placeLabel: "ばしょ",
            remainingPrefix: "あと ",
            remainingSuffix: " にん",
            totalPrefix: "みんなで ",
            totalSuffix: " にん",
            unlimitedCapacity: "だれでも さんかできます",
            bookNow: "よやくする（０円）",
            bookEnded: "おわりました",
            bookFull: "いっぱいです",
            statusAvailable: "あいてます",
            statusFull: "いっぱい",
            statusPast: "おわり",
            loading: "よみこんでいます...",
            loadingSlots: "しらべています...",
            loadError: "よみこめませんでした。もういちど おしてください。",
            retryBtn: "もういちど よむ",
            clickDate: "ひにちを えらんでください。"
        },
        zh: {
            title: "课程日程与在线预约日历",
            subtitle: "点击日历上的日期，即可查看当天的活动场次、时间地点及剩余名额，并可直接在线免费预约。",
            tabStella: "富士见野日语教室（Stella East）",
            tabMinna: "大家的家 日语教室（龟久保）",
            todayBtn: "本月",
            prevMonth: "上个月",
            nextMonth: "下个月",
            weekdays: ["日", "一", "二", "三", "四", "五", "六"],
            todayBadge: "今日",
            legendAvailable: "可预约",
            legendFull: "已满额",
            legendPast: "已结束",
            legendNone: "无活动",
            selectedDateTitle: "的活动场次与预约状况",
            noSlots: "当天暂无课程安排。请选择日历上有绿色标记的日期。",
            timeLabel: "时间",
            placeLabel: "地点",
            remainingPrefix: "剩余 ",
            remainingSuffix: " 位",
            totalPrefix: "定员 ",
            totalSuffix: " 人",
            unlimitedCapacity: "不限人数（直接参加）",
            bookNow: "免费在线预约",
            bookEnded: "已截止",
            bookFull: "名额已满",
            statusAvailable: "预约中",
            statusFull: "满额",
            statusPast: "已结束",
            loading: "正在加载日历数据...",
            loadingSlots: "正在加载场次详情...",
            loadError: "数据加载失败，请重试。",
            retryBtn: "重新加载",
            clickDate: "请在日历上选择日期。"
        },
        en: {
            title: "Schedule & Online Booking Calendar",
            subtitle: "Click on any date to check available sessions, locations, and remaining spots, and book online directly.",
            tabStella: "Fujimino Japanese Class (Stella East)",
            tabMinna: "Minna no Ie Class (Kamekubo)",
            todayBtn: "Today",
            prevMonth: "Prev",
            nextMonth: "Next",
            weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            todayBadge: "Today",
            legendAvailable: "Available",
            legendFull: "Full",
            legendPast: "Ended",
            legendNone: "No class",
            selectedDateTitle: "Sessions & Availability",
            noSlots: "No sessions scheduled for this date. Please pick a date highlighted in green.",
            timeLabel: "Time",
            placeLabel: "Place",
            remainingPrefix: "Left: ",
            remainingSuffix: " spots",
            totalPrefix: "Capacity: ",
            totalSuffix: " people",
            unlimitedCapacity: "No limit (Walk-ins welcome)",
            bookNow: "Book Online (Free)",
            bookEnded: "Registration Closed",
            bookFull: "Fully Booked",
            statusAvailable: "Open",
            statusFull: "Full",
            statusPast: "Ended",
            loading: "Loading calendar...",
            loadingSlots: "Loading slots...",
            loadError: "Failed to load data. Please retry.",
            retryBtn: "Reload",
            clickDate: "Please select a date from the calendar."
        },
        vi: {
            title: "Lịch học & Đặt chỗ trực tuyến",
            subtitle: "Nhấp vào ngày bất kỳ trên lịch để xem khung giờ, địa điểm và số chỗ còn lại, sau đó đặt chỗ hoàn toàn miễn phí.",
            tabStella: "Lớp học Fujimino (Stella East)",
            tabMinna: "Lớp Minna no Ie (Kamekubo)",
            todayBtn: "Hôm nay",
            prevMonth: "Tháng trước",
            nextMonth: "Tháng sau",
            weekdays: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
            todayBadge: "Hôm nay",
            legendAvailable: "Còn chỗ",
            legendFull: "Hết chỗ",
            legendPast: "Đã qua",
            legendNone: "Không có",
            selectedDateTitle: "Chi tiết lịch học",
            noSlots: "Không có lớp học vào ngày này. Vui lòng chọn ngày có màu xanh lá.",
            timeLabel: "Thời gian",
            placeLabel: "Địa điểm",
            remainingPrefix: "Còn ",
            remainingSuffix: " chỗ",
            totalPrefix: "Tối đa ",
            totalSuffix: " người",
            unlimitedCapacity: "Không giới hạn",
            bookNow: "Đặt chỗ miễn phí",
            bookEnded: "Đã kết thúc",
            bookFull: "Đã kín chỗ",
            statusAvailable: "Đang mở",
            statusFull: "Hết chỗ",
            statusPast: "Đã kết thúc",
            loading: "Đang tải lịch học...",
            loadingSlots: "Đang tải khung giờ...",
            loadError: "Tải dữ liệu thất bại. Vui lòng thử lại.",
            retryBtn: "Thử lại",
            clickDate: "Vui lòng chọn ngày trên lịch."
        }
    };

    // ─────────────────────────────────────────────
    // 状態管理
    // ─────────────────────────────────────────────
    function getDefaultActivityId() {
        if (urlParams.get('activityId')) return parseInt(urlParams.get('activityId'), 10);
        if (window.DEFAULT_ACTIVITY_ID)   return window.DEFAULT_ACTIVITY_ID;
        if (window.location.pathname.includes('minna')) return ACTIVITIES.MINNA;
        return ACTIVITIES.STELLA;
    }

    function getInitialYearMonth() {
        if (urlParams.get('month')) return urlParams.get('month');
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }

    const state = {
        activityId:        getDefaultActivityId(),
        currentYearMonth:  getInitialYearMonth(),
        selectedDate:      urlParams.get('date') || null,
        monthData:         null,
        loading:           false,
        loadingSlots:      false,
        error:             null,
        cache:             {}
    };

    // ─────────────────────────────────────────────
    // i18n ヘルパー
    // ─────────────────────────────────────────────
    function getCurrentLang() {
        const el = document.getElementById('langSelect');
        return (el && el.value) ? el.value : 'ja';
    }

    function t(key) {
        const lang = getCurrentLang();
        const dict = I18N[lang] || I18N.ja;
        return dict[key] !== undefined ? dict[key] : (I18N.ja[key] || key);
    }

    // ─────────────────────────────────────────────
    // API 呼び出し
    // ─────────────────────────────────────────────
    async function fetchCalendarData(activityId, month, date) {
        const cacheKey = `${activityId}_${month}`;
        // キャッシュは date 指定なしのときのみ使用
        if (!date && state.cache[cacheKey]) {
            return state.cache[cacheKey];
        }

        let url = `${API_BASE}/api/public/group-activities/${activityId}/calendar?month=${encodeURIComponent(month)}`;
        if (date) url += `&date=${encodeURIComponent(date)}`;

        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

        const data = await res.json();
        state.cache[cacheKey] = data;
        return data;
    }

    async function fetchDailySlotsData(activityId, date) {
        const url = `${API_BASE}/api/public/group-activities/${activityId}/daily-slots?date=${encodeURIComponent(date)}`;
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const data = await res.json();
        // レスポンスが配列の場合とオブジェクト{slots:[]}の場合を両対応
        return Array.isArray(data) ? data : (data.slots || data.data || []);
    }

    // ─────────────────────────────────────────────
    // 状態更新アクション
    // ─────────────────────────────────────────────
    function changeMonth(delta) {
        const [yearStr, monthStr] = state.currentYearMonth.split('-');
        let year  = parseInt(yearStr, 10);
        let month = parseInt(monthStr, 10) + delta;
        if (month > 12) { year += 1; month = 1; }
        else if (month < 1) { year -= 1; month = 12; }
        state.currentYearMonth = `${year}-${String(month).padStart(2, '0')}`;
        state.selectedDate = null;
        loadCalendar();
    }

    function resetToToday() {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        state.currentYearMonth = `${y}-${m}`;
        state.selectedDate = `${y}-${m}-${d}`;
        loadCalendar();
    }

    function selectActivity(activityId) {
        if (state.activityId === activityId) return;
        state.activityId  = activityId;
        state.selectedDate = null;
        loadCalendar();
    }

    async function selectDate(dateStr) {
        state.selectedDate = dateStr;
        renderCalendarUI();   // グリッドのみ再描画（選択状態の更新）

        const dailySlotsMap = state.monthData && state.monthData.dailySlots;
        const inCache = dailySlotsMap && Object.prototype.hasOwnProperty.call(dailySlotsMap, dateStr);

        if (inCache) {
            renderSlotsUI();
        } else {
            state.loadingSlots = true;
            renderSlotsLoadingUI();
            try {
                const slots = await fetchDailySlotsData(state.activityId, dateStr);
                if (!state.monthData.dailySlots) state.monthData.dailySlots = {};
                state.monthData.dailySlots[dateStr] = slots;
            } catch (err) {
                console.warn('daily-slots fallback error:', err);
                if (!state.monthData.dailySlots) state.monthData.dailySlots = {};
                state.monthData.dailySlots[dateStr] = [];
            } finally {
                state.loadingSlots = false;
                renderSlotsUI();
            }
        }

        // モバイル：スロット領域へ自動スクロール
        const slotsEl = document.getElementById('calendar-slots-section');
        if (slotsEl && window.innerWidth < 768) {
            slotsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    // ─────────────────────────────────────────────
    // メインローダー
    // ─────────────────────────────────────────────
    async function loadCalendar() {
        state.loading = true;
        state.error   = null;
        renderLoadingUI();

        try {
            const data = await fetchCalendarData(state.activityId, state.currentYearMonth, state.selectedDate);
            state.monthData = data;

            // selectedDate の補完：最も近い未来の有枠日を優先
            if (!state.selectedDate && data.calendar) {
                // 1) 今日以降で available な最初の日
                const nextAvail = data.calendar.find(d => d.available && !d.isPast);
                // 2) なければ APIが返した selectedDate
                // 3) それもなければ月初
                state.selectedDate = nextAvail
                    ? nextAvail.date
                    : (data.selectedDate || (data.calendar[0] || {}).date || null);
            } else if (!state.selectedDate && data.selectedDate) {
                state.selectedDate = data.selectedDate;
            }

            state.loading = false;
            renderFullComponent();
        } catch (err) {
            console.error('Calendar load error:', err);
            state.loading = false;
            state.error = err.message || 'Error';
            renderErrorUI();
        }
    }

    // ─────────────────────────────────────────────
    // レンダリング — フルコンポーネント
    // ─────────────────────────────────────────────
    function renderFullComponent() {
        const root = document.getElementById('activity-calendar-app');
        if (!root) return;

        const th = getTheme(state.activityId);
        const isStella = state.activityId === ACTIVITIES.STELLA;
        const isMinna  = state.activityId === ACTIVITIES.MINNA;
        const isCustom = !isStella && !isMinna;
        const customTitle = (state.monthData && state.monthData.activity && state.monthData.activity.title)
                            ? state.monthData.activity.title
                            : `Activity #${state.activityId}`;

        const [y, m] = state.currentYearMonth.split('-');
        const monthDisplay = `${y}年 ${parseInt(m, 10)}月`;

        // タブのスタイル（ステラ・ミンナ固定色）
        const stellaTabStyle = isStella
            ? 'background:white;color:#134e4a;box-shadow:0 1px 3px rgba(0,0,0,.2);'
            : 'background:transparent;color:rgba(255,255,255,0.9);';
        const minnaTabStyle  = isMinna
            ? 'background:white;color:#7c2d12;box-shadow:0 1px 3px rgba(0,0,0,.2);'
            : 'background:transparent;color:rgba(255,255,255,0.9);';

        const isMob = window.innerWidth < 640;

        root.innerHTML = `
            <style>
                #cal-root-wrap { background:white;border-radius:${isMob?'1rem':'1.5rem'};box-shadow:0 8px 32px rgba(0,0,0,.10);border:1px solid #e5e7eb;overflow:hidden; }
                #cal-header { background:${th.headerGrad};padding:${isMob?'0.9rem 1rem':'1.25rem 1.75rem'}; }
                #cal-header-top { display:flex;flex-direction:column;gap:0.75rem; }
                #cal-tabs { display:flex;gap:0.3rem;background:rgba(0,0,0,0.2);padding:0.25rem;border-radius:0.85rem;overflow-x:auto;-webkit-overflow-scrolling:touch; }
                #cal-tabs button { flex-shrink:0;padding:${isMob?'0.45rem 0.6rem':'0.5rem 0.9rem'};border-radius:0.6rem;font-size:${isMob?'0.68rem':'0.72rem'};font-weight:700;border:none;cursor:pointer;display:flex;align-items:center;gap:0.3rem;white-space:nowrap;transition:all 0.2s; }
                #cal-body { padding:${isMob?'0.9rem 0.75rem':'1.25rem 1.75rem'};display:flex;flex-direction:column;gap:${isMob?'0.9rem':'1.25rem'}; }
                #cal-nav { display:flex;align-items:center;justify-content:space-between;padding-bottom:${isMob?'0.6rem':'0.75rem'};border-bottom:1px solid #f3f4f6; }
                #cal-nav-left { display:flex;align-items:center;gap:0.4rem; }
                #cal-nav-right { display:flex;align-items:center;gap:0.5rem; }
                #cal-legend { display:flex;align-items:center;gap:0.4rem;font-size:0.65rem;color:#6b7280;background:#f9fafb;padding:0.3rem 0.6rem;border-radius:0.6rem;border:1px solid #e5e7eb; }
                .cal-nav-btn { width:${isMob?'2.1rem':'2.5rem'};height:${isMob?'2.1rem':'2.5rem'};border-radius:0.65rem;border:1px solid #e5e7eb;background:white;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#374151;font-size:${isMob?'0.8rem':'0.9rem'};transition:all 0.15s; }
                #cal-month-label { font-family:'Kiwi Maru',serif;font-size:${isMob?'1rem':'1.25rem'};font-weight:900;color:#1f2937;min-width:${isMob?'7rem':'8.5rem'};text-align:center; }
                #cal-today-btn { padding:${isMob?'0.35rem 0.6rem':'0.4rem 0.85rem'};border-radius:0.65rem;border:1px solid #d1d5db;background:white;cursor:pointer;font-size:${isMob?'0.7rem':'0.75rem'};font-weight:700;color:#374151;display:flex;align-items:center;gap:0.3rem;white-space:nowrap;transition:all 0.15s; }
                .cal-wd-hdr { display:grid;grid-template-columns:repeat(7,1fr);gap:${isMob?'0.2rem':'0.3rem'};margin-bottom:0.4rem;text-align:center; }
                .cal-grid { display:grid;grid-template-columns:repeat(7,1fr);gap:${isMob?'0.2rem':'0.3rem'}; }
                .cal-day-cell { min-height:${isMob?'3.6rem':'5rem'};border-radius:${isMob?'0.6rem':'0.9rem'};padding:${isMob?'0.3rem 0.25rem':'0.45rem 0.4rem'};display:flex;flex-direction:column;justify-content:space-between;cursor:pointer;transition:all 0.15s;box-sizing:border-box; }
                .cal-day-num { font-size:${isMob?'0.78rem':'0.9rem'};font-weight:700;line-height:1; }
                .cal-today-tag { font-size:${isMob?'0.5rem':'0.58rem'};font-weight:700;background:#f59e0b;color:white;padding:0.05rem 0.3rem;border-radius:0.3rem;flex-shrink:0; }
                .cal-badge-avail { margin-top:0.2rem;font-size:${isMob?'0.55rem':'0.62rem'};font-weight:700;color:#065f46;background:#d1fae5;border:1px solid #6ee7b7;padding:0.15rem 0.25rem;border-radius:0.4rem;display:flex;align-items:center;justify-content:center;gap:0.2rem;overflow:hidden; }
                .cal-badge-full { margin-top:0.2rem;font-size:${isMob?'0.55rem':'0.62rem'};font-weight:700;color:#991b1b;background:#fee2e2;border:1px solid #fca5a5;padding:0.15rem 0.25rem;border-radius:0.4rem;text-align:center; }
                .cal-badge-past { margin-top:0.2rem;font-size:${isMob?'0.55rem':'0.62rem'};color:#9ca3af;background:#f3f4f6;padding:0.15rem 0.25rem;border-radius:0.4rem;text-align:center;font-weight:500; }
                .cal-badge-none { margin-top:0.2rem;font-size:0.6rem;color:#d1d5db;text-align:center; }
                .cal-slots-grid { display:grid;grid-template-columns:${isMob?'1fr':'repeat(auto-fill,minmax(260px,1fr))'};gap:${isMob?'0.75rem':'1rem'};margin-top:0.75rem; }
                .cal-slot-card { background:linear-gradient(135deg,white,${th.bgLight});border-radius:${isMob?'0.85rem':'1rem'};border:1px solid ${th.ring};padding:${isMob?'1rem':'1.1rem'};box-shadow:0 2px 8px rgba(0,0,0,.05);display:flex;flex-direction:column;gap:${isMob?'0.6rem':'0.75rem'};transition:box-shadow 0.2s; }
            </style>
            <div id="cal-root-wrap">
                <!-- ヘッダー -->
                <div id="cal-header">
                    <div id="cal-header-top">
                        <div>
                            <div style="display:inline-flex;align-items:center;gap:0.35rem;background:rgba(255,255,255,0.2);padding:0.18rem 0.65rem;border-radius:9999px;font-size:0.65rem;font-weight:700;color:white;margin-bottom:0.4rem;">
                                <i class="fa-solid fa-calendar-days"></i><span>ONLINE BOOKING</span>
                            </div>
                            <h3 id="cal-heading-title" style="font-family:'Kiwi Maru',serif;font-size:${isMob?'1.1rem':'1.3rem'};font-weight:900;color:white;margin:0 0 0.2rem;">
                                ${t('title')}
                            </h3>
                            <p id="cal-heading-sub" style="color:rgba(255,255,255,0.85);font-size:${isMob?'0.7rem':'0.75rem'};margin:0;line-height:1.5;">
                                ${t('subtitle')}
                            </p>
                        </div>
                        <!-- タブ -->
                        <div id="cal-tabs">
                            <button type="button" id="tab-btn-stella" style="${stellaTabStyle}">
                                <i class="fa-solid fa-graduation-cap"></i>
                                <span>${isMob ? 'ステラ' : t('tabStella')}</span>
                            </button>
                            <button type="button" id="tab-btn-minna" style="${minnaTabStyle}">
                                <i class="fa-solid fa-house-chimney-user"></i>
                                <span>${isMob ? 'みんなのいえ' : t('tabMinna')}</span>
                            </button>
                            ${isCustom ? `
                            <button type="button" id="tab-btn-custom" style="background:white;color:#1e1b4b;">
                                <i class="fa-solid fa-calendar-check"></i>
                                <span>${customTitle}</span>
                            </button>` : ''}
                        </div>
                    </div>
                </div>

                <!-- ボディ -->
                <div id="cal-body">
                    <!-- 月ナビ -->
                    <div id="cal-nav">
                        <div id="cal-nav-left">
                            <button type="button" id="cal-prev-month" class="cal-nav-btn" aria-label="${t('prevMonth')}">
                                <i class="fa-solid fa-chevron-left"></i>
                            </button>
                            <span id="cal-month-label">${monthDisplay}</span>
                            <button type="button" id="cal-next-month" class="cal-nav-btn" aria-label="${t('nextMonth')}">
                                <i class="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                        <div id="cal-nav-right">
                            <button type="button" id="cal-today-btn">
                                <i class="fa-regular fa-calendar-check" style="color:${th.borderColor};"></i>
                                <span>${t('todayBtn')}</span>
                            </button>
                            <div id="cal-legend">
                                <span style="display:flex;align-items:center;gap:0.25rem;">
                                    <span style="width:0.5rem;height:0.5rem;border-radius:50%;background:#10b981;display:inline-block;flex-shrink:0;"></span>${isMob?'':''+t('legendAvailable')}
                                </span>
                                <span style="display:flex;align-items:center;gap:0.25rem;">
                                    <span style="width:0.5rem;height:0.5rem;border-radius:50%;background:#ef4444;display:inline-block;flex-shrink:0;"></span>${isMob?'':''+t('legendFull')}
                                </span>
                                <span style="display:flex;align-items:center;gap:0.25rem;">
                                    <span style="width:0.5rem;height:0.5rem;border-radius:50%;background:#9ca3af;display:inline-block;flex-shrink:0;"></span>${isMob?'':''+t('legendPast')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- カレンダーグリッド -->
                    <div id="calendar-grid-container"></div>

                    <!-- スロット一覧 -->
                    <div id="calendar-slots-section" style="padding-top:0.75rem;border-top:1px solid #f3f4f6;"></div>
                </div>
            </div>
        `;

        // イベントバインド
        document.getElementById('tab-btn-stella').addEventListener('click', () => selectActivity(ACTIVITIES.STELLA));
        document.getElementById('tab-btn-minna').addEventListener('click',  () => selectActivity(ACTIVITIES.MINNA));
        document.getElementById('cal-prev-month').addEventListener('click', () => changeMonth(-1));
        document.getElementById('cal-next-month').addEventListener('click', () => changeMonth(1));
        document.getElementById('cal-today-btn').addEventListener('click',  resetToToday);

        // マウスオーバー効果（月ナビボタン）
        ['cal-prev-month', 'cal-next-month'].forEach(id => {
            const btn = document.getElementById(id);
            if (!btn) return;
            btn.addEventListener('mouseenter', () => {
                btn.style.borderColor = th.borderColor;
                btn.style.background  = th.bgLight;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.borderColor = '#e5e7eb';
                btn.style.background  = 'white';
            });
        });

        renderCalendarUI();
        renderSlotsUI();
    }

    // ─────────────────────────────────────────────
    // レンダリング — カレンダーグリッド
    // ─────────────────────────────────────────────
    function renderCalendarUI() {
        const container = document.getElementById('calendar-grid-container');
        if (!container || !state.monthData || !state.monthData.calendar) return;

        const th = getTheme(state.activityId);
        const calendarList = state.monthData.calendar;
        const isMob = window.innerWidth < 640;

        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        // 曜日ヘッダー
        const weekdays = t('weekdays');
        let html = `<div class="cal-wd-hdr">`;
        weekdays.forEach((wd, i) => {
            const c = i === 0 ? '#dc2626' : (i === 6 ? '#0284c7' : '#6b7280');
            html += `<div style="font-size:${isMob?'0.65rem':'0.72rem'};font-weight:700;color:${c};padding:0.3rem 0;">${wd}</div>`;
        });
        html += `</div>`;

        // 月初曜日インデックス
        let firstIdx = 0;
        const firstDay = calendarList[0];
        if (firstDay) {
            if (firstDay.dayOfWeek && Object.prototype.hasOwnProperty.call(DAY_OF_WEEK_INDEX, firstDay.dayOfWeek)) {
                firstIdx = DAY_OF_WEEK_INDEX[firstDay.dayOfWeek];
            } else {
                const p = firstDay.date.split('-');
                firstIdx = new Date(+p[0], +p[1] - 1, +p[2]).getDay();
            }
        }

        html += `<div class="cal-grid">`;

        // パディングセル
        for (let i = 0; i < firstIdx; i++) {
            html += `<div class="cal-day-cell" style="background:#f9fafb;border:1px dashed #e5e7eb;opacity:0.4;cursor:default;"></div>`;
        }

        // 日付セル
        calendarList.forEach(day => {
            const isToday    = day.date === todayStr;
            const isSelected = day.date === state.selectedDate;
            const isPast     = day.isPast;
            const isFull     = day.isFull;
            const isAvailable = day.available && !isPast && !isFull;
            const hasSlots   = day.slotsCount > 0;

            // 曜日
            let dwIdx = 1;
            if (day.dayOfWeek && Object.prototype.hasOwnProperty.call(DAY_OF_WEEK_INDEX, day.dayOfWeek)) {
                dwIdx = DAY_OF_WEEK_INDEX[day.dayOfWeek];
            } else {
                const p = day.date.split('-');
                dwIdx = new Date(+p[0], +p[1] - 1, +p[2]).getDay();
            }
            const dayColor = dwIdx === 0 ? '#dc2626' : (dwIdx === 6 ? '#0284c7' : '#1f2937');

            // ボックス背景・ボーダー
            let cellBg     = 'white';
            let cellBorder = '1px solid #e5e7eb';
            let cellShadow = 'none';
            let cellOutline = 'none';

            if (isSelected) {
                cellBg      = th.bgLight;
                cellBorder  = `2px solid ${th.borderColor}`;
                cellShadow  = `0 2px 8px rgba(0,0,0,0.1)`;
                cellOutline = `0 0 0 2px ${th.ring}`;
            } else if (isAvailable) {
                cellBg     = '#f0fdf4';
                cellBorder = '1px solid #86efac';
            } else if (isFull) {
                cellBg     = '#fff1f2';
                cellBorder = '1px solid #fca5a5';
            } else if (isPast) {
                cellBg     = '#f9fafb';
                cellBorder = '1px solid #e5e7eb';
            }

            // バッジ
            let badgeHtml = '';
            if (isAvailable) {
                // モバイルは残席数だけ短く表示
                const label = isMob
                    ? (day.statusLabel ? day.statusLabel.replace(/[残](\d+)/, '$1') : '○')
                    : (day.statusLabel || t('statusAvailable'));
                badgeHtml = `<div class="cal-badge-avail">
                    <span style="width:0.35rem;height:0.35rem;border-radius:50%;background:#059669;flex-shrink:0;display:inline-block;"></span>
                    <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${label}</span>
                </div>`;
            } else if (isFull) {
                badgeHtml = `<div class="cal-badge-full">${isMob ? '×' : t('statusFull')}</div>`;
            } else if (isPast && hasSlots) {
                badgeHtml = `<div class="cal-badge-past">${isMob ? '-' : t('statusPast')}</div>`;
            } else {
                badgeHtml = `<div class="cal-badge-none">·</div>`;
            }

            const todayBadge = isToday
                ? `<span class="cal-today-tag">${isMob ? '今' : t('todayBadge')}</span>` : '';

            html += `
                <div class="cal-day-cell" data-date="${day.date}"
                     style="border:${cellBorder};background:${cellBg};box-shadow:${cellShadow};outline:${cellOutline};">
                    <div style="display:flex;align-items:center;justify-content:space-between;">
                        <span class="cal-day-num" style="color:${dayColor};">${day.day}</span>
                        ${todayBadge}
                    </div>
                    <div>${badgeHtml}</div>
                </div>`;
        });

        html += `</div>`;
        container.innerHTML = html;

        // クリックイベント
        container.querySelectorAll('.cal-day-cell').forEach(cell => {
            cell.addEventListener('click', () => {
                const d = cell.getAttribute('data-date');
                if (d) selectDate(d);
            });
            // ホバーエフェクト（PC のみ）
            if (!isMob) {
                cell.addEventListener('mouseenter', () => {
                    if (cell.getAttribute('data-date') !== state.selectedDate) {
                        cell.style.transform = 'translateY(-2px)';
                        cell.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                    }
                });
                cell.addEventListener('mouseleave', () => {
                    if (cell.getAttribute('data-date') !== state.selectedDate) {
                        cell.style.transform = '';
                        cell.style.boxShadow = '';
                    }
                });
            }
        });
    }

    // ─────────────────────────────────────────────
    // レンダリング — スロットカード
    // ─────────────────────────────────────────────
    function renderSlotsUI() {
        const container = document.getElementById('calendar-slots-section');
        if (!container || !state.monthData) return;

        const th = getTheme(state.activityId);
        const isStella = state.activityId === ACTIVITIES.STELLA;
        const isMinna  = state.activityId === ACTIVITIES.MINNA;

        if (!state.selectedDate) {
            container.innerHTML = `<div style="text-align:center;padding:2rem;color:#9ca3af;font-size:0.85rem;">${t('clickDate')}</div>`;
            return;
        }

        // 日付フォーマット
        const parts = state.selectedDate.split('-');
        const dy = parseInt(parts[0], 10);
        const dm = parseInt(parts[1], 10);
        const dd = parseInt(parts[2], 10);

        let dwIdx = new Date(dy, dm - 1, dd).getDay();
        if (state.monthData.calendar) {
            const found = state.monthData.calendar.find(x => x.date === state.selectedDate);
            if (found && found.dayOfWeek && Object.prototype.hasOwnProperty.call(DAY_OF_WEEK_INDEX, found.dayOfWeek)) {
                dwIdx = DAY_OF_WEEK_INDEX[found.dayOfWeek];
            }
        }

        const weekdays = t('weekdays');
        const wdStr = weekdays[dwIdx] || ['日','月','火','水','木','金','土'][dwIdx];

        let formattedDate = `${dy}年${dm}月${dd}日（${wdStr}）`;
        if (getCurrentLang() === 'en') {
            const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
            formattedDate = `${wdStr}, ${months[dm - 1]} ${dd}, ${dy}`;
        } else if (getCurrentLang() === 'zh') {
            formattedDate = `${dy}年${dm}月${dd}日（${wdStr}）`;
        }

        // スロット取得
        let slots = [];
        const dmap = state.monthData.dailySlots;
        if (dmap && Object.prototype.hasOwnProperty.call(dmap, state.selectedDate)) {
            slots = dmap[state.selectedDate];
        } else if (state.monthData.selectedDate === state.selectedDate && state.monthData.selectedDateSlots) {
            slots = state.monthData.selectedDateSlots;
        }

        // スロットカード生成
        const isMob = window.innerWidth < 640;
        let slotsHtml = '';
        if (slots && slots.length > 0) {
            slotsHtml = `<div class="cal-slots-grid">`;
            slots.forEach(slot => {
                const past = slot.isPast;
                const full = slot.isFull;
                const avail = !past && !full;

                let bookingUrl = slot.bookingUrl || '#';
                if (bookingUrl.startsWith('/')) bookingUrl = API_BASE + bookingUrl;

                // 残り席バッジ
                let remainHtml = '';
                if (slot.isUnlimited) {
                    remainHtml = `<span style="font-size:0.75rem;color:#6b7280;font-weight:500;">${t('unlimitedCapacity')}</span>`;
                } else {
                    remainHtml = `
                        <div style="display:flex;align-items:center;gap:0.4rem;font-size:0.75rem;font-weight:700;color:#374151;flex-wrap:wrap;">
                            <span style="color:#065f46;background:#d1fae5;border:1px solid #6ee7b7;padding:0.2rem 0.5rem;border-radius:0.5rem;">
                                ${t('remainingPrefix')}<span style="font-size:${isMob?'0.95rem':'1rem'};font-weight:900;">${slot.remainingPeople}</span>${t('remainingSuffix')}
                            </span>
                            <span style="color:#9ca3af;">/</span>
                            <span style="color:#9ca3af;">${t('totalPrefix')}${slot.capacity}${t('totalSuffix')}</span>
                        </div>`;
                }

                // 予約ボタン
                let btnHtml = '';
                if (avail) {
                    btnHtml = `
                        <a href="${bookingUrl}" target="_blank" rel="noopener noreferrer"
                           style="display:flex;align-items:center;justify-content:center;gap:0.5rem;background:${th.btnGrad};color:white;font-weight:700;padding:${isMob?'0.9rem 1rem':'0.75rem 1rem'};border-radius:0.75rem;text-decoration:none;font-size:${isMob?'0.9rem':'0.82rem'};box-shadow:0 2px 8px rgba(0,0,0,0.15);transition:all 0.2s;">
                            <i class="fa-solid fa-calendar-check"></i>
                            <span>${t('bookNow')}</span>
                            <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.7rem;opacity:0.8;"></i>
                        </a>`;
                } else if (full) {
                    btnHtml = `
                        <button type="button" disabled
                           style="width:100%;background:#e5e7eb;color:#9ca3af;font-weight:700;padding:${isMob?'0.9rem':'0.75rem'} 1rem;border-radius:0.75rem;border:none;font-size:0.85rem;cursor:not-allowed;display:flex;align-items:center;justify-content:center;gap:0.5rem;">
                            <i class="fa-solid fa-ban"></i><span>${t('bookFull')}</span>
                        </button>`;
                } else {
                    btnHtml = `
                        <button type="button" disabled
                           style="width:100%;background:#f3f4f6;color:#d1d5db;font-weight:700;padding:${isMob?'0.9rem':'0.75rem'} 1rem;border-radius:0.75rem;border:none;font-size:0.85rem;cursor:not-allowed;display:flex;align-items:center;justify-content:center;gap:0.5rem;">
                            <i class="fa-regular fa-clock"></i><span>${t('bookEnded')}</span>
                        </button>`;
                }

                slotsHtml += `
                    <div class="cal-slot-card">
                        <div style="display:flex;flex-direction:column;gap:0.5rem;">
                            <!-- 時間タグ + ステータス -->
                            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.4rem;">
                                <span style="background:${th.badgeBg};color:${th.textDark};border:1px solid ${th.badgeBorder};font-size:${isMob?'0.78rem':'0.72rem'};font-weight:700;padding:0.3rem 0.65rem;border-radius:0.5rem;display:flex;align-items:center;gap:0.3rem;">
                                    <i class="fa-regular fa-clock"></i>
                                    ${slot.timeRange || ((slot.startTime || '') + ' - ' + (slot.endTime || ''))}
                                </span>
                                ${avail ? `<span style="font-size:0.68rem;font-weight:700;color:#065f46;background:#d1fae5;padding:0.2rem 0.6rem;border-radius:9999px;">● ${t('statusAvailable')}</span>` : ''}
                            </div>
                            <!-- タイトル -->
                            <h4 style="font-family:'Kiwi Maru',serif;font-weight:700;font-size:${isMob?'1rem':'0.95rem'};color:#111827;margin:0;line-height:1.4;">
                                ${slot.title || '日本語教室 予約枠'}
                            </h4>
                            <!-- 場所 -->
                            <div style="font-size:0.75rem;color:#6b7280;display:flex;align-items:flex-start;gap:0.4rem;background:rgba(255,255,255,0.7);padding:0.45rem 0.6rem;border-radius:0.6rem;border:1px solid #f3f4f6;">
                                <i class="fa-solid fa-location-dot" style="color:${th.borderColor};margin-top:0.1rem;flex-shrink:0;"></i>
                                <span style="line-height:1.5;">${slot.location || (isStella ? 'ふじみ野ステラ・イースト' : (isMinna ? 'みんなのいえ（亀久保）' : ''))}</span>
                            </div>
                            <!-- 残り席 -->
                            <div>${remainHtml}</div>
                        </div>
                        <!-- 予約ボタン -->
                        <div>${btnHtml}</div>
                    </div>`;
            });
            slotsHtml += `</div>`;
        } else {
            slotsHtml = `
                <div style="background:#f9fafb;border-radius:0.85rem;border:2px dashed #e5e7eb;padding:${isMob?'1.5rem':'2rem'};text-align:center;margin-top:0.5rem;">
                    <div style="width:2.5rem;height:2.5rem;background:#e5e7eb;color:#9ca3af;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 0.6rem;font-size:1.1rem;">
                        <i class="fa-solid fa-calendar-xmark"></i>
                    </div>
                    <p style="font-size:0.82rem;color:#6b7280;font-weight:500;margin:0;">${t('noSlots')}</p>
                </div>`;
        }

        container.innerHTML = `
            <div>
                <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;">
                    <span style="width:0.5rem;height:1.3rem;border-radius:9999px;background:${th.dotColor};display:inline-block;flex-shrink:0;"></span>
                    <h4 style="font-family:'Kiwi Maru',serif;font-size:${isMob?'0.95rem':'1.05rem'};font-weight:700;color:#111827;margin:0;line-height:1.3;">
                        ${formattedDate} <span style="font-size:${isMob?'0.78rem':'0.82rem'};font-weight:400;color:#6b7280;">${t('selectedDateTitle')}</span>
                    </h4>
                </div>
                ${slotsHtml}
            </div>`;
    }

    // ─────────────────────────────────────────────
    // ローディング / エラー UI
    // ─────────────────────────────────────────────
    function renderLoadingUI() {
        const container = document.getElementById('calendar-grid-container');
        if (container) {
            container.innerHTML = `
                <div style="padding:4rem 0;text-align:center;">
                    <div style="display:inline-block;animation:spin 1s linear infinite;font-size:1.75rem;color:#0d9488;">
                        <i class="fa-solid fa-circle-notch"></i>
                    </div>
                    <p style="font-size:0.82rem;color:#9ca3af;margin-top:0.75rem;font-weight:500;">${t('loading')}</p>
                </div>`;
        }
        // spin キーフレームが未登録なら追加
        if (!document.getElementById('cal-spin-style')) {
            const st = document.createElement('style');
            st.id = 'cal-spin-style';
            st.textContent = '@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}';
            document.head.appendChild(st);
        }
    }

    function renderSlotsLoadingUI() {
        const container = document.getElementById('calendar-slots-section');
        if (container) {
            container.innerHTML = `
                <div style="padding:2rem 0;text-align:center;">
                    <div style="display:inline-block;animation:spin 1s linear infinite;font-size:1.4rem;color:#0d9488;">
                        <i class="fa-solid fa-circle-notch"></i>
                    </div>
                    <p style="font-size:0.75rem;color:#9ca3af;margin-top:0.5rem;">${t('loadingSlots')}</p>
                </div>`;
        }
    }

    function renderErrorUI() {
        const root = document.getElementById('activity-calendar-app');
        if (!root) return;
        root.innerHTML = `
            <div style="background:white;border-radius:1.5rem;box-shadow:0 4px 20px rgba(0,0,0,0.08);border:1px solid #fee2e2;padding:3rem;text-align:center;">
                <div style="width:3.5rem;height:3.5rem;background:#fee2e2;color:#ef4444;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;font-size:1.5rem;">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </div>
                <h4 style="font-weight:700;color:#1f2937;font-size:1.1rem;margin:0 0 0.5rem;">${t('loadError')}</h4>
                <p style="font-size:0.75rem;color:#9ca3af;margin:0 0 1.25rem;">${state.error || ''}</p>
                <button type="button" id="cal-retry-btn"
                    style="display:inline-flex;align-items:center;gap:0.4rem;background:#1f2937;color:white;font-weight:700;font-size:0.78rem;padding:0.6rem 1.25rem;border-radius:0.75rem;border:none;cursor:pointer;">
                    <i class="fa-solid fa-rotate-right"></i>
                    <span>${t('retryBtn')}</span>
                </button>
            </div>`;
        document.getElementById('cal-retry-btn').addEventListener('click', loadCalendar);
    }

    // ─────────────────────────────────────────────
    // 教室カードボタンとの連携
    // ─────────────────────────────────────────────
    function initCardButtonBindings() {
        const stellaBtn  = document.getElementById('stellaReserveBtn');
        const minnaBtn   = document.getElementById('minnaReserveBtn');
        const calSection = document.getElementById('calendar-section');

        if (stellaBtn && calSection) {
            stellaBtn.addEventListener('click', e => {
                e.preventDefault();
                selectActivity(ACTIVITIES.STELLA);
                calSection.scrollIntoView({ behavior: 'smooth' });
            });
        }
        if (minnaBtn && calSection) {
            minnaBtn.addEventListener('click', e => {
                e.preventDefault();
                selectActivity(ACTIVITIES.MINNA);
                calSection.scrollIntoView({ behavior: 'smooth' });
            });
        }
    }

    // ─────────────────────────────────────────────
    // 言語切り替え連携
    // ─────────────────────────────────────────────
    window.addEventListener('languageChanged', () => {
        if (state.monthData) renderFullComponent();
    });

    // ─────────────────────────────────────────────
    // 公開 API
    // ─────────────────────────────────────────────
    window.JapaneseClassCalendar = {
        init:           function () { initCardButtonBindings(); loadCalendar(); },
        selectActivity: selectActivity,
        selectDate:     selectDate,
        changeMonth:    changeMonth,
        resetToToday:   resetToToday,
        getState:       function () { return state; }
    };

    // DOM 完成後に初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.JapaneseClassCalendar.init());
    } else {
        window.JapaneseClassCalendar.init();
    }

})();
