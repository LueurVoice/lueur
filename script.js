const rainContainer = document.getElementById('rain-container');

function createDrop() {
    const drop = document.createElement('div');
    drop.classList.add('drop');

    // 画面のランダムな位置（X座標）に配置
    drop.style.left = `${Math.random() * 100}vw`;

    // 落ちるスピード、長さ、透明度をランダムにして自然な雨音のゆらぎを作る
    const duration = Math.random() * 0.5 + 0.5; // 0.5秒〜1秒
    drop.style.animationDuration = `${duration}s`;
    drop.style.opacity = Math.random() * 0.3 + 0.1; // 薄い雨（0.1~0.4）

    rainContainer.appendChild(drop);

    // アニメーションが終わった雨粒（DOM）を削除してメモリリークを防ぐ
    setTimeout(() => {
        drop.remove();
    }, duration * 1000);
}

// 毎秒一定量の雨粒を生成する（本数を調整すると雨の強さが変わる）
setInterval(createDrop, 50); // 50msごとに1粒＝やや静かなしとしと雨

// 初期化時にページ全体に雨が降っている状態にしておく
for (let i = 0; i < 50; i++) {
    setTimeout(createDrop, Math.random() * 1000);
}

// --------------------------------------------------
// ナビゲーションと遷移の「ぬるっと感（極上のスムーズさ）」実装
// --------------------------------------------------

// --- 「ぬるっと」移動させるカスタムスクロール関数 ---
function smoothScrollTo(targetElement, duration = 1200) {
    const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - 80; // ちょっと余裕をもたせる
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    let startTime = null;

    // イージング関数 (easeInOutQuart: ゆったり動き出して、最後もすごくゆっくり止まる、高級感のある動き)
    function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t * t * t + b;
        t -= 2;
        return -c / 2 * (t * t * t * t - 2) + b;
    }

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        } else {
            window.scrollTo(0, targetPosition); // 最後にピタッと合わせる
        }
    }
    requestAnimationFrame(animation);
}

document.querySelectorAll('a.nav-link').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetHref = this.getAttribute('href');

        // --- 同じページ内のハッシュリンク（例：「#about」）の場合 ---
        if (targetHref.startsWith('#')) {
            e.preventDefault();
            const targetElement = document.querySelector(targetHref);
            if (targetElement) {
                smoothScrollTo(targetElement, 1500); // 1.5秒かけてゆっくり移動
            }
        }
        // --- 別ページ（または別ページのハッシュ付き）への遷移の場合 ---
        else {
            e.preventDefault(); // 一旦ブラウザのデフォルト「画面バッツリ切り替え遷移」を止める
            document.body.style.transition = "opacity 0.4s ease"; // フェードアウトの準備
            document.body.style.opacity = 0; // 画面をフワッと暗くする

            // 0.4秒後に実際のページ遷移を実行（暗くなった状態で飛び、新しいページ側でフェードインする）
            setTimeout(() => {
                window.location.href = targetHref;
            }, 400);
        }
    });
});

// 別ページから「ハッシュ付き（例：index.html#about）」で飛んできた場合の処理
// ブラウザが瞬時にテレポートするのを防ぎ、トップ画面を見せてから「ぬるっと」目的地へスクロールさせる
window.addEventListener('load', () => {
    if (window.location.hash) {
        const hash = window.location.hash;
        const targetElement = document.querySelector(hash);
        if (targetElement) {
            // ブラウザの仕様による瞬間移動を強制的にトップに戻す
            setTimeout(() => window.scrollTo(0, 0), 1);

            // 少し（0.1秒）待ってから、目的の場所へ「ぬるっと」移動
            setTimeout(() => {
                smoothScrollTo(targetElement, 1500); // 1.5秒かけてゆっくり移動
            }, 100);
        }
    }
});

// ブラウザの「戻る」ボタンなどを考慮し、画面が常に明るく見えるように保つ
window.addEventListener('pageshow', () => {
    document.body.style.transition = "opacity 0.4s ease";
    document.body.style.opacity = 1;
});

// --------------------------------------------------
// ランダムメッセージ（お守り機能）
// --------------------------------------------------
const messages = [
    "今日もお疲れ様。よく頑張ったね。",
    "ゆっくり息を吐いて。ここは誰も見ていないから。",
    "無理して笑わなくていい。そのままの君でいていいんだよ。",
    "寂しい夜は、いつでも帰っておいで。",
    "この灯りの下では、すべての荷物を下ろしていい。",
    "泣きたい時は、声を出して泣いていい場所だから。",
    "君がここにいてくれて、嬉しいよ。",
    "目を閉じて、ただ雨の音だけを感じて。"
];

const messageContainer = document.getElementById('random-message');
if (messageContainer) {
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    messageContainer.textContent = randomMessage;
}

// --------------------------------------------------
// Voice Library (検索・お気に入り機能)
// --------------------------------------------------
// 動画データのモックアップ（今後これが増えていきます）
const voiceData = [
    {
        id: "v001",
        title: "最初の灯り",
        mood: ["sleep", "comfort"],
        length: "short",
        duration: "01:43",
        desc: "最初の声。孤独な夜のための隠れ家。",
        toneClass: "tone-clear",
        tags: ["自己紹介", "睡眠導入", "囁き"],
        isPremium: false,
        url: "https://youtu.be/uCL4tZEmi2w",
        videoId: "uCL4tZEmi2w"
    },
    {
        id: "v002",
        title: "甘い、夜更かし",
        mood: ["comfort", "sleep"],
        length: "medium",
        duration: "06:45", // 正確な時間に修正
        desc: "頑張りすぎたあなたへ。ただ甘やかす特別な夜。",
        toneClass: "tone-mild",
        tags: ["隣に座る", "慰め", "睡眠導入", "囁き", "雨音"],
        isPremium: false,
        isComingSoon: false,
        url: "https://www.youtube.com/watch?v=rX7rbd9Th_A",
        videoId: "rX7rbd9Th_A",
        boothUrl: "" // ※将来フル尺を置いた時用
    },
    {
        id: "v003",
        title: "雨音と本の匂い",
        mood: ["work", "sleep"],
        length: "long",
        duration: "30:00",
        desc: "静かな読書と、隣の気配。",
        toneClass: "tone-deep",
        tags: ["作業用BGM", "雨音"],
        isPremium: false,
        isComingSoon: true,
        url: "",
        videoId: ""
    },
    {
        id: "v004",
        title: "朝まで一緒に",
        mood: ["sleep"],
        length: "long",
        duration: "45:00",
        desc: "ぽつりぽつりとこぼす声。あなたが眠りにつくまで。",
        toneClass: "tone-clear",
        tags: ["睡眠導入", "添い寝", "囁き"],
        isPremium: false,
        isComingSoon: true,
        url: "",
        videoId: ""
    },
    {
        id: "v005",
        title: "完全睡眠導入",
        mood: ["sleep"],
        length: "long",
        duration: "60:00",
        desc: "深い眠りに落ちるまでの、耳元での囁き。",
        toneClass: "tone-deep",
        tags: ["睡眠導入", "バイノーラル", "吐息", "耳かき"],
        isPremium: true,
        isComingSoon: true,
        price: "¥500",
        url: "",
        videoId: ""
    },
    {
        id: "v006",
        title: "ホットミルク",
        mood: ["comfort"],
        length: "short",
        duration: "08:30",
        desc: "少し泣きたい夜に。ただ黙って、背中を撫で長ける。",
        toneClass: "tone-mild",
        tags: ["慰め"],
        isPremium: false,
        isComingSoon: true,
        url: "",
        videoId: ""
    },
    {
        id: "v007",
        title: "看病",
        mood: ["comfort", "sleep"],
        length: "medium",
        duration: "25:00",
        desc: "風邪をひいて心細い夜。あなたが安心するまで。",
        toneClass: "tone-mild",
        tags: ["看病", "甘やかし"],
        isPremium: true,
        isComingSoon: true,
        price: "¥300",
        url: "",
        videoId: ""
    },
    {
        id: "v008",
        title: "深夜の勉強会",
        mood: ["work"],
        length: "long",
        duration: "50:00",
        desc: "ポモドーロ用。休憩時間に少しだけおしゃべり。",
        toneClass: "tone-clear",
        tags: ["作業用", "ポモドーロ"],
        isPremium: false,
        isComingSoon: true,
        url: "",
        videoId: ""
    },
    {
        id: "v009",
        title: "朗読：星の王子さま",
        mood: ["sleep", "work"],
        length: "medium",
        duration: "18:00",
        desc: "静かな雨音と、ぽつりぽつりとした文学の朗読。",
        toneClass: "tone-deep",
        tags: ["朗読", "文学"],
        isPremium: false,
        isComingSoon: true,
        url: "",
        videoId: ""
    },
    {
        id: "v010",
        title: "Premium Set",
        mood: ["sleep", "comfort"],
        length: "long",
        duration: "120:00",
        desc: "全ボイスの高音質版と、未公開の「朝」のコンプリートセット。",
        toneClass: "tone-deep",
        tags: ["詰め合わせ", "高音質"],
        isPremium: true,
        isComingSoon: true,
        price: "¥1,500",
        url: "",
        videoId: ""
    }
];

// ローカルストレージからお気に入りを取得（なければ空配列）
let favorites = JSON.parse(localStorage.getItem('lueur_favorites')) || [];

// 現在の検索フィルター状態
const activeFilters = {
    mood: 'all',
    length: 'all',
    favorite: false
};

const libraryList = document.getElementById('library-list');

// ライブラリの描画とフィルター処理を行う関数
function renderLibrary() {
    if (!libraryList) return;

    // フィルター処理
    const filtered = voiceData.filter(item => {
        // 1. 簡易検索（Mood, Length, Fav）の判定
        if (activeFilters.mood !== 'all' && !item.mood.includes(activeFilters.mood)) return false;
        if (activeFilters.length !== 'all' && item.length !== activeFilters.length) return false;
        if (activeFilters.favorite && !favorites.includes(item.id)) return false;

        // 2. 詳細検索（チェックされたタグ）の判定
        // 詳細パネル内でチェックがついているすべての checkbox 要素を取得
        const checkedTags = Array.from(document.querySelectorAll('.advanced-search-panel input[type="checkbox"]:checked')).map(cb => cb.value);

        // チェックされているタグがある場合、その「すべて」を含んでいるか（AND検索）チェックする
        if (checkedTags.length > 0) {
            // item.tags に checkedTagsの要素がすべて含まれているか
            const hasAllTags = checkedTags.every(tag => item.tags.includes(tag));
            if (!hasAllTags) {
                return false;
            }
        }

        return true;
    });

    libraryList.innerHTML = '';

    if (filtered.length === 0) {
        libraryList.innerHTML = '<div class="no-results">条件に一致するVoiceが見つかりませんでした。別のタグをお試しください。</div>';
        return;
    }

    filtered.forEach(item => {
        const isFav = favorites.includes(item.id);
        const card = document.createElement('div');
        // iSComingSoonフラグがtrueなら coming-soon クラスを追加
        card.className = `library-item fade-in ${item.toneClass} ${item.isComingSoon ? 'coming-soon' : ''}`;

        // タグのHTML生成
        const tagsHtml = item.tags.map(t => `<span class="library-tag">${t}</span>`).join('');

        if (item.isComingSoon) {
            // Coming Soonの場合は中身を生成せず、シンプルな枠と文字だけにする
            card.innerHTML = `
                <div style="display: flex; justify-content: center; align-items: center; height: 150px; flex-direction: column;">
                    <span style="font-size: 1.5rem; letter-spacing: 0.2em; color: rgba(255, 255, 255, 0.3);">Coming Soon...</span>
                </div>
            `;
        } else {
            // 本公開されている場合のみ、中身を描画する
            card.innerHTML = `
                <button class="library-fav-btn ${isFav ? 'active' : ''}" data-id="${item.id}" title="お気に入りに登録">
                    ${isFav ? '★' : '☆'}
                </button>
                <div class="library-item-header">
                    <h3 class="library-item-title">
                        ${item.title}
                    </h3>
                    <p class="library-subtitle">⏱ ${item.duration} ${item.isPremium && item.price ? `| ${item.price}` : ''}</p>
                </div>
            `;
        }
        libraryList.appendChild(card);
    });

    // お気に入りボタンのクリックイベントを設定
    document.querySelectorAll('.library-fav-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation(); // モーダルを開くイベントを発火させない
            const id = this.getAttribute('data-id');
            if (favorites.includes(id)) {
                favorites = favorites.filter(f => f !== id);
                this.classList.remove('active');
                this.textContent = '☆';
            } else {
                favorites.push(id);
                this.classList.add('active');
                this.textContent = '★';
            }
            // ローカルストレージに保存（ログイン・会員登録不要でブラウザに記憶）
            localStorage.setItem('lueur_favorites', JSON.stringify(favorites));

            // お気に入りのみ表示モードなら即時再描画してリストから消す
            if (activeFilters.favorite) renderLibrary();
        });
    });

    // カードクリックでモーダルを開くイベントを設定
    document.querySelectorAll('.library-item:not(.coming-soon)').forEach((card, index) => {
        card.addEventListener('click', function (e) {
            // お気に入りボタンのクリックは弾く
            if (e.target.closest('.library-fav-btn')) return;

            // クリックされたアイテムのデータを取得 (filteredのindexに対応)
            // もしくはdata属性から取得する方が安全ですが、今回はfilteredのindexでも一致します。
            // Wtf wait! Since it's sorted, we need to match by ID.
            const titleElement = card.querySelector('.library-item-title').innerText.trim();
            const item = filtered.find(v => v.title === titleElement);
            if (item) openModal(item);
        });
    });
}

// === モーダル（ポップアップ）機能の実装 ===
function openModal(item) {
    // 既存のモーダルがあれば削除
    const existingModal = document.getElementById('lueur-modal');
    if (existingModal) existingModal.remove();

    const tagsHtml = item.tags.map(t => `<span class="library-tag">${t}</span>`).join('');

    // Play button logic
    let actionsHtml = '';
    if (item.videoId) {
        actionsHtml += `<button class="library-play-btn embed-play-btn" data-video-id="${item.videoId}">▶ サイト内で${item.isPremium ? '試聴' : '再生'}</button>`;
    } else if (item.youtubeUrl || (!item.isPremium && item.url)) {
        actionsHtml += `<a href="${item.youtubeUrl || item.url}" class="library-play-btn" target="_blank">▶ YouTube</a>`;
    }

    if (item.boothUrl || (item.isPremium && item.url)) {
        actionsHtml += `<a href="${item.boothUrl || item.url}" class="library-play-btn buy-btn" target="_blank">🛒 BOOTH</a>`;
    }

    const modal = document.createElement('div');
    modal.id = 'lueur-modal';
    modal.className = `modal-overlay fade-in`;
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close-btn">&times;</button>
            <div class="modal-header">
                <h2>${item.title}</h2>
                <p>⏱ ${item.duration} ${item.isPremium && item.price ? `| ${item.price}` : ''}</p>
            </div>
            <div class="modal-body">
                <div class="library-meta">
                    ${item.isPremium ? '<span class="library-tag" style="background: rgba(255,215,0,0.1); border-color: rgba(255,215,0,0.3); color: #ffd700;">👑 Premium</span>' : ''}
                    ${tagsHtml}
                </div>
                <p class="library-desc">${item.desc}</p>
                
                <div class="youtube-player-container" id="modal-player-container"></div>

                <div class="library-actions">
                    ${actionsHtml}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden'; // 背景のスクロールを止める

    // 閉じるボタンのイベント
    modal.querySelector('.modal-close-btn').addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal(); // 背景クリックで閉じる
    });

    // サイト内再生ボタンのイベント
    const playBtn = modal.querySelector('.embed-play-btn');
    if (playBtn) {
        playBtn.addEventListener('click', function () {
            const videoId = this.getAttribute('data-video-id');
            const container = document.getElementById('modal-player-container');

            if (container.classList.contains('active')) {
                // すでに開いていれば閉じる（iframe削除）
                container.innerHTML = '';
                container.classList.remove('active');
                this.textContent = '▶ サイト内で再生';
            } else {
                // 開く（iframe生成）
                const domain = window.location.origin;
                container.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&origin=${domain}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
                container.classList.add('active');
                this.textContent = '▼ 閉じる';
            }
        });
    }
}

function closeModal() {
    const modal = document.getElementById('lueur-modal');
    if (modal) {
        modal.classList.remove('fade-in');
        modal.classList.add('fade-out');
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = ''; // スクロール復帰
        }, 400); // アニメーション時間待つ
    }
}

// 簡易フィルターボタンのクリックイベント
document.querySelectorAll('.filter-btn:not(#advanced-search-toggle)').forEach(btn => {
    btn.addEventListener('click', function () {
        if (this.id === 'fav-filter-btn') {
            activeFilters.favorite = !activeFilters.favorite;
            this.classList.toggle('active');
        } else {
            const btnGroup = this.closest('.filter-buttons');
            const group = btnGroup.getAttribute('data-filter-group');
            const val = this.getAttribute('data-filter');

            // アクティブクラスの更新（色を変える）
            btnGroup.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            activeFilters[group] = val;
        }
        renderLibrary();
    });
});

// 詳細検索アコーディオンの開閉処理
const advancedSearchToggle = document.getElementById('advanced-search-toggle');
const advancedSearchPanel = document.getElementById('advanced-search-panel');

if (advancedSearchToggle && advancedSearchPanel) {
    advancedSearchToggle.addEventListener('click', function () {
        if (advancedSearchPanel.style.display === 'none') {
            advancedSearchPanel.style.display = 'block';
            this.textContent = '▲ 詳細検索を閉じる';
            this.classList.add('active');
        } else {
            advancedSearchPanel.style.display = 'none';
            this.textContent = '🔍 詳細検索を開く';
            this.classList.remove('active');
        }
    });
}

// 詳細検索内の各チェックボックス変更時の再描画イベント
document.querySelectorAll('.advanced-search-panel input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        renderLibrary();
    });
});

// ページ読み込み時の初期描画
if (libraryList) {
    renderLibrary();
}
