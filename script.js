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
        title: "【自己紹介/ASMR】ここは「Lueur」疲れ果てたあなたのための隠れ家です",
        mood: ["sleep", "comfort"],
        length: "short",
        duration: "01:43",
        desc: "Lueurの世界へようこそ。眠れない夜、孤独を感じる日に寄り添う最初の声。",
        toneClass: "tone-clear",
        tags: ["自己紹介", "睡眠導入"],
        isPremium: false,
        url: "https://youtu.be/uCL4tZEmi2w",
        videoId: "uCL4tZEmi2w"
    },
    {
        id: "v002",
        title: "今日はもう、何もしなくていいよ",
        mood: ["comfort", "sleep"],
        length: "medium",
        duration: "12:00",
        desc: "頑張りすぎたあなたへ。隣に座って、ただただ甘やかす12分間。",
        toneClass: "tone-mild",
        tags: ["慰め"],
        isPremium: false,
        isComingSoon: true,
        url: "",
        videoId: ""
    },
    {
        id: "v003",
        title: "雨降る夜の、静かな読書タイム",
        mood: ["work", "sleep"],
        length: "long",
        duration: "30:00",
        desc: "作業用・睡眠導入用。共に静かな時間を過ごす30分。",
        toneClass: "tone-deep",
        tags: ["作業用"],
        isPremium: false,
        isComingSoon: true,
        url: "",
        videoId: ""
    },
    {
        id: "v004",
        title: "不安で眠れないなら、朝まで一緒に",
        mood: ["sleep"],
        length: "long",
        duration: "45:00",
        desc: "ぽつりぽつりとこぼす声が、あなたが眠りにつくまで付き添います。",
        toneClass: "tone-clear",
        tags: ["睡眠導入"],
        isPremium: false,
        isComingSoon: true,
        url: "",
        videoId: ""
    },
    {
        id: "v005",
        title: "【極上バイノーラル】耳元で囁く完全睡眠導入",
        mood: ["sleep"],
        length: "long",
        duration: "60:00",
        desc: "ダミーヘッドマイクを使用した高音質版。深い眠りに落ちるまで、あなたの耳元から離れません。",
        toneClass: "tone-deep",
        tags: ["睡眠導入", "バイノーラル"],
        isPremium: true,
        isComingSoon: true,
        price: "¥500",
        url: "",
        videoId: ""
    },
    {
        id: "v006",
        title: "少しだけ泣きたい夜の、ホットミルク",
        mood: ["comfort"],
        length: "short",
        duration: "08:30",
        desc: "誰にも言えない辛さを吐き出したい時。ただ黙って、背中を撫で続けます。",
        toneClass: "tone-mild",
        tags: ["慰め"],
        isPremium: false,
        isComingSoon: true,
        url: "",
        videoId: ""
    },
    {
        id: "v007",
        title: "【特別編】看病ボイス - 熱を出したあなたへ",
        mood: ["comfort", "sleep"],
        length: "medium",
        duration: "25:00",
        desc: "風邪をひいて心細い夜。氷を替え、手を握り、あなたが安心するまで看病します。",
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
        title: "深夜2時の勉強会。たまには息抜きも必要",
        mood: ["work"],
        length: "long",
        duration: "50:00",
        desc: "ポモドーロ・テクニック対応（25分集中＋5分休憩）。休憩時間に少しだけおしゃべりします。",
        toneClass: "tone-clear",
        tags: ["作業用", "ポモドーロ"],
        isPremium: false,
        isComingSoon: true,
        url: "",
        videoId: ""
    },
    {
        id: "v009",
        title: "朗読：星の王子さま（抜粋）",
        mood: ["sleep", "work"],
        length: "medium",
        duration: "18:00",
        desc: "静かな雨音を背景に、名作をぽつりぽつりと朗読します。BGM代わりにどうぞ。",
        toneClass: "tone-deep",
        tags: ["朗読", "文学"],
        isPremium: false,
        isComingSoon: true,
        url: "",
        videoId: ""
    },
    {
        id: "v010",
        title: "【プレミアムフルセット】Lueurの夜をすべてあなたに",
        mood: ["sleep", "comfort"],
        length: "long",
        duration: "120:00",
        desc: "過去のすべてのボイスの高音質WAV版と、未公開の「朝の目覚ましボイス」を含む特盛コンプリートセット。",
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
        if (activeFilters.mood !== 'all' && !item.mood.includes(activeFilters.mood)) return false;
        if (activeFilters.length !== 'all' && item.length !== activeFilters.length) return false;
        if (activeFilters.favorite && !favorites.includes(item.id)) return false;
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

        card.innerHTML = `
            <div class="library-item-header">
                <h3 class="library-item-title">
                    ${item.isPremium ? '<span class="premium-badge">👑 Premium</span>' : ''} 
                    ${item.title}
                </h3>
                <button class="library-fav-btn ${isFav ? 'active' : ''}" data-id="${item.id}" title="お気に入りに登録">
                    ${isFav ? '★' : '☆'}
                </button>
            </div>
            <div class="library-meta">
                <span>⏱ ${item.duration}</span>
                ${item.isPremium && item.price ? `<span class="premium-price">${item.price}</span>` : ''}
                ${tagsHtml}
            </div>
            <p class="library-desc">${item.desc}</p>
            <div class="library-actions">
                ${item.videoId
                ? `<button class="library-play-btn embed-play-btn" data-video-id="${item.videoId}">▶ ${item.isPremium ? 'サイト内で試聴' : 'サイト内で再生'}</button>`
                : ''}
                ${!item.videoId && (item.youtubeUrl || (!item.isPremium && item.url))
                ? `<a href="${item.youtubeUrl || item.url}" class="library-play-btn" target="_blank">▶ YouTubeで開く</a>`
                : ''}
                ${item.boothUrl || (item.isPremium && item.url)
                ? `<a href="${item.boothUrl || item.url}" class="library-play-btn buy-btn" target="_blank">🛒 BOOTHで${item.videoId || item.youtubeUrl ? '本編を' : ''}購入する</a>`
                : ''}
            </div>
            <div class="youtube-player-container" id="player-container-${item.id}"></div>
        `;
        libraryList.appendChild(card);
    });

    // お気に入りボタンのクリックイベントを設定
    document.querySelectorAll('.library-fav-btn').forEach(btn => {
        btn.addEventListener('click', function () {
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

    // サイト内再生ボタンのイベント
    document.querySelectorAll('.embed-play-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const videoId = this.getAttribute('data-video-id');
            const containerId = this.closest('.library-item').querySelector('.youtube-player-container').id;
            const container = document.getElementById(containerId);

            if (container.classList.contains('active')) {
                // すでに開いていれば閉じる（iframe削除）
                container.innerHTML = '';
                container.classList.remove('active');
                this.textContent = '▶ サイト内で再生';
            } else {
                // 開く（iframe生成）
                container.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
                container.classList.add('active');
                this.textContent = '▼ 閉じる';
            }
        });
    });
}

// フィルターボタンのクリックイベント
document.querySelectorAll('.filter-btn').forEach(btn => {
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

// ページ読み込み時の初期描画
if (libraryList) {
    renderLibrary();
}
