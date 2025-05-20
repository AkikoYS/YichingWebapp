// ============1 初期設定 ===========
//状況管理用関数
let isSpinning = false; // 回転中かどうか
let clickCount = 0; // クリック回数（最大６）
let resultArray = ""; // 結果の配列
let clickTime = 0; // 最後のクリック時刻
let alreadyClicked = false;//クリック済みかどうかのフラグ
let sixtyFourHexagrams = [];//JSONデータ
let selectedHexagram = null;//現在表示されている卦
let originalHexagram = null;//最初に表示された卦（本卦）
let futureExpansionUsed = false;//今後の展開が行われたか？
let cachedChangedHexagram = null;//変爻の一時保存
let cachedChangedLineIndex = null; // ✅ 追加: 変爻のインデックス
let shownVariantKeys = new Set();  // ✅ 追加: バリアント表示履歴
let originalProgressMessages = [];//本卦の進行状況メッセージの保存
let finalFortuneReady = false;// ← 総合的な易断ボタン表示の可否管理


// Index.htmlからUI要素（DOM）の取得
const result = document.getElementById("result");
const resetButton = document.getElementById("reset-button");
const spinnerContainer = document.getElementById("lottie-spinner");
const progressContainer = document.getElementById("progress-container");
const questionInput = document.getElementById("question-input");
const warningText = document.getElementById("question-warning");


// Lottieアニメーションの設定（スピナー初期化）
const spinnerAnimation = lottie.loadAnimation({
    container: spinnerContainer,
    renderer: 'svg',
    loop: true,
    autoplay: false,
    path: 'assets/animations/spinner-animation.json'
});

//jsonをフェッチ
fetch("hexagram.json")
    .then(res => res.ok ? res.json() : Promise.reject("JSONの読み込み失敗"))
    .then(data => { sixtyFourHexagrams = data; })
    .catch(err => console.error(err));

//=======2 ユーティリティ関数 ================    
//卦の情報をjsonからgetする処理の関数    
function getHexagramByArray(arrayString) {
    return sixtyFourHexagrams.find(hexagram => hexagram.array === arrayString);
}

//結果ボーダー関数
function updateResultBorder() {
    if (result.innerHTML.trim() === "") {
        result.style.border = "none";
        result.style.height = "0";
        result.style.padding = "0";
        result.style.margin = "0";
        result.style.background = "transparent";
        result.style.boxShadow = "none";
    } else {
        result.style.border = "1px solid #ccc";
        result.style.background = "#ffffff";
        result.style.borderRadius = "10px";
        result.style.marginTop = "30px";
        result.style.padding = "20px";
        result.style.maxWidth = "700px";
        result.style.marginLeft = "auto";
        result.style.marginRight = "auto";
        result.style.boxShadow = "0 0 10px rgba(0,0,0,0.1)";
        result.style.height = "auto";
    }
}

// 進行状況メッセージ関数
function getProgressMessage(clickCount, yinYang) {
    const yinYangText = yinYang === "0" ? "<strong>陰</strong>" : "<strong>陽</strong>";
    switch (clickCount) {
        case 1: return `初爻: ${yinYangText}`;
        case 2: return `二爻: ${yinYangText}`;
        case 3: return `三爻: ${yinYangText}`;
        case 4: return `四爻: ${yinYangText}`;
        case 5: return `五爻: ${yinYangText}`;
        case 6: return `上爻: ${yinYangText}`;
        default: return "";
    }
}

//進行状況メッセージを初期化
function initializeProgressMessages() {
    progressContainer.innerHTML = "";
    for (let i = 0; i < 6; i++) {
        const div = document.createElement("div");
        div.className = "spinner-progress-message";
        div.id = `progress-line-${i}`;  // ← 文字列にする必要あり
        div.innerHTML = "";
        progressContainer.appendChild(div);
    }
}

//本卦の進行状況メッセージ
function restoreOriginalProgressMessages() {
    if (!originalProgressMessages || originalProgressMessages.length !== 6) {
        console.warn("originalProgressMessages が正しく保存されていません。");
        return;
    }

    for (let i = 0; i < 6; i++) {
        const targetLine = document.getElementById(`progress-line-${i}`);
        if (targetLine) {
            targetLine.innerHTML = originalProgressMessages[i];
            targetLine.style.color = "";       // 赤色などをリセット
            targetLine.style.fontWeight = "";  // 太字もリセット
        }
    }
}

//保存された進行状況メッセージ
function saveOriginalProgressMessages() {
    originalProgressMessages = []; // リセット
    for (let i = 0; i < 6; i++) {
        const line = document.getElementById(`progress-line-${i}`);
        if (line) {
            originalProgressMessages.push(line.innerHTML);
        }
    }
}

//総合的な易断ボタン生成の条件
function allVariantsShown() {
    return cachedChangedHexagram !== null;
}
//易断ボタンの表示、非表示
function maybeShowFinalFortuneButton() {
    const finalButton = document.getElementById("final-fortune-button");
    if (finalButton && allVariantsShown()) {
        finalButton.style.display = "block";
    }
}

// ===== 3. 表示処理 =====

//占う内容が制限文字数を超えた場合の警告
questionInput.addEventListener("input", () => {
    if (questionInput.value.length > 50) {
        warningText.style.display = "block";
    } else {
        warningText.style.display = "none";
    }
});

// 卦の表示処理の関数
function showHexagram(hexagram, isOriginal = false) {
    result.innerHTML = "";
    result.innerHTML = createHexagramHTML(hexagram);
    selectedHexagram = hexagram;

    // ✅ 1回だけしか originalHexagram に代入しない
    if (isOriginal && !originalHexagram) {
        originalHexagram = hexagram;

        // ✅ 本卦としての進行状況メッセージを保存
        originalProgressMessages = [];
        const progressLines = Array.from(progressContainer.children);
        for (let line of progressLines) {
            originalProgressMessages.push(line.innerHTML);
        }
    }
    updateResultBorder();

    if (!isOriginal && originalHexagram) {
        const backButton = createBackToOriginalButton();
        result.appendChild(backButton);
    }

    if (isOriginal) {
        showVariantButtons(hexagram);
        maybeShowFinalFortuneButton();
    }
}
//卦の結果を示す構成の関数
function createHexagramHTML(hexagram) {
    const description = hexagram.description || "説明は準備中です";
    const formattedDescription = description.replace(/\n/g, "<br>");

    return `
      <div class="hexagram-title">第${hexagram.number}卦：${hexagram.name}<span style="font-size: 0.8em;">—${hexagram.composition}</span></div>
      <div class="hexagram-reading" style="text-align: center;">${hexagram.reading}—${hexagram.summary}</div>
      <div class="hexagram-svg">
        <object data="assets/images/hexagrams/hexagram_${hexagram.number.toString().padStart(2, '0')}.svg" type="image/svg+xml"></object>
      </div>
      <div class="description-text">${formattedDescription}</div>
      <div class="description-image">⚪︎イメージ：${hexagram.desimage}</div>
    `;
}
//「本卦に戻る」のボタン生成関数
function createBackToOriginalButton() {
    const button = document.createElement("button");
    button.textContent = "本卦に戻る";
    button.className = "variant-button";
    button.id = "back-to-original-button";
    button.onclick = () => {
        const existingBackButton = document.getElementById("back-to-original-button");
        if (existingBackButton) existingBackButton.remove();

        result.innerHTML = "";
        updateResultBorder();

        if (originalHexagram) {
            selectedHexagram = originalHexagram;
            shownVariantKeys.clear();
            futureExpansionUsed = false;

            // ✅ 進行状況メッセージを先に復元する
            restoreOriginalProgressMessages();

            // ✅ 本卦を表示
            showHexagram(originalHexagram, true);

            // ✅ 総合的な易断の条件が整っているときだけ h2 を更新
            const instructionText = document.getElementById("instructionText");
            if (instructionText && allVariantsShown()) {
                h2.textContent = "総合的な易断がととのいました";
            };

            // ✅ バリアントボタンを再生成
            showVariantButtons(originalHexagram);
            maybeShowFinalFortuneButton();

        } else {
            result.innerHTML = `<div class='error-message'>本卦のデータが存在しません。</div>`;
            console.error("originalHexagram is not defined");
        }
    };
    return button;
}
// VariantButtons表示の関数
function showVariantButtons(originalHexagram) {
    // VariantButtonsがすでに表示されていれば削除
    const existing = document.getElementById("variant-buttons");
    if (existing) existing.remove();

    const wrapper = document.createElement("div");
    wrapper.className = "variant-button-wrapper";
    wrapper.id = "variant-buttons";

    const variants = [
        { label: "今後の展開", key: "future-expansion" },
        { label: "裏の意味", key: "reverse" },
        { label: "客観的に運命を見ると", key: "sou" },
        { label: "卦の本質は", key: "go" }
    ];

    variants.forEach(variant => {
        const button = document.createElement("button");
        button.textContent = variant.label;
        button.classList.add("variant-button");

        button.onclick = () => {
            const buttonContainer = document.getElementById("variant-buttons");
            if (buttonContainer) buttonContainer.remove();

            if (variant.key === "future-expansion") {
                handleFutureExpansion(originalHexagram);
            } else {
                const variantHex = sixtyFourHexagrams.find(h => h.number === selectedHexagram[variant.key]);
                if (variantHex) {
                    if (!shownVariantKeys.has(variant.key)) {
                        result.innerHTML = `<div class="waiting-message">占い結果を読み取っています...</div>`;
                        updateResultBorder();
                        setTimeout(() => {
                            showHexagram(variantHex);
                            shownVariantKeys.add(variant.key);
                        }, 1000);
                    } else {
                        showHexagram(variantHex);
                    }
                }
            }
        };

        wrapper.appendChild(button);
    });

    // 💡 総合的な易断ボタン（あらかじめ追加、非表示にしておく）
    const finalBtn = document.createElement("button");
    finalBtn.id = "final-fortune-button";
    finalBtn.textContent = "総合的な易断";
    finalBtn.classList.add("variant-button");
    finalBtn.style.display = "none"; // ← 初期は非表示
    finalBtn.onclick = () => displayFinalFortune();

    // ボタンを一段下に配置（全体で一括append）
    result.appendChild(wrapper);
    result.appendChild(finalBtn);

    // ボタンの表示を判定して切り替える
    maybeShowFinalFortuneButton();
}


// ===== 4. 今後の展開関連処理 =====

// 今後の展開（変爻と変卦）の準備関数
function prepareForFutureExpansion() {
    result.innerHTML = "";
    updateResultBorder();
    const instructionText = document.getElementById("instructionText");
    if (!futureExpansionUsed && instructionText) {
        instructionText.innerHTML = "最後に一回だけクリックしてください";
    }
    spinnerAnimation.stop();
    isSpinning = false;
}
// 今後の展開（変卦）のメイン処理（１回目と２回目以降の分岐）
function handleFutureExpansion(originalHex) {
    if (!originalHex) originalHex = originalHexagram; // fallback対策
    resetButton.style.display = "none";

    //1回目のボタン押す（まだ一度もボタンが押されておらず、変卦の結果の一時保存も行われていない場合）
    if (!futureExpansionUsed && !cachedChangedHexagram) {
        setupSpinnerForChangedHexagram(originalHex);

    } else {
        // ✅ 2回目以降はクリックなしで即表示
        showCachedChangedHexagram(originalHex);
    }
}
//今後の展開ボタン１回目クリック後のセットアップ処理
function setupSpinnerForChangedHexagram(originalHex) {
    prepareForFutureExpansion();//スピナーやresultをリセットしておく
    futureExpansionUsed = true;//１回目のボタンを押したことにする

    //arrayが6桁ない場合はエラーを返す（用心）
    if (resultArray.length !== 6) {
        console.error("正しい卦が得られていません。6桁の陰陽データが必要です。");
        result.innerHTML = `<div class="error-message">卦のデータが不足しています。</div>`;
        return;
    }
    startChangedHexagramSpin(originalHex);
}

//今後の展開ボタン１回目クリックにより変爻と変卦を決めるロジック
function startChangedHexagramSpin(originalHex) {
    let clickedOnce = false;//１回目と2回目のクリックを区別

    spinnerContainer.onclick = () => {
        if (!clickedOnce) {
            spinnerAnimation.play();
            isSpinning = true;
            clickedOnce = true;
            return;
        }
        spinnerAnimation.goToAndStop(spinnerAnimation.currentFrame, true);
        isSpinning = false;

        //ランダムな位置で爻を反転させ、変卦を生成
        cachedChangedLineIndex = Math.floor(Math.random() * 6);
        const changedArray = resultArray.split("").map((bit, i) =>
            i === cachedChangedLineIndex ? (bit === "0" ? "1" : "0") : bit
        );
        const changedArrayString = changedArray.join("");
        const hexagramCandidate = getHexagramByArray(changedArrayString);

        if (!hexagramCandidate) {
            console.error("変卦が見つかりませんでした: ", changedArrayString);
            result.innerHTML = `<div class="error-message">変卦が見つかりませんでした（${changedArrayString}）</div>`;
        } else {
            cachedChangedHexagram = hexagramCandidate;
            finalFortuneReady = true;
            displayChangedLine(cachedChangedLineIndex, originalHex);
        }
        spinnerContainer.onclick = null; //クリックイベントを解除
    }
};

//今後の展開ボタンの2回目以降クリック処理
function showCachedChangedHexagram(originalHex) {
    if (cachedChangedHexagram) {
        const instructionText = document.getElementById("instructionText");
        if (instructionText) {
            instructionText.innerHTML = "もうすぐ総合的な運勢が出ます";
        }
        resetButton.style.display = "block";
        showChangedHexagram(cachedChangedHexagram, originalHex);
    } else {
        console.warn("cachedChangedHexagram is null: 変卦が未生成の状態で2回目の展開が呼ばれました。");
        result.innerHTML = `<div class="error-message">変卦データが存在しません。最初からやり直してください。</div>`;
    }
}

// 変爻の情報表示と、爻辞の表示処理
function displayChangedLine(index, hexagram) {
    const yaoNames = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"];

    // 全ての progress-line の色と太字をリセット
    for (let i = 0; i < 6; i++) {
        const line = document.getElementById(`progress-line-${i}`);
        if (line) {
            line.style.color = "";
            line.style.fontWeight = "";
        }
    }
    // 対象の爻を赤く太字にする
    const targetLine = document.getElementById(`progress-line-${index}`);
    if (targetLine) {
        targetLine.style.color = "red";
        targetLine.style.fontWeight = "bold";
    }

    // 結果表示
    result.innerHTML = `<div class="spinner-progress-message"><strong>変爻は${yaoNames[index]}です</strong></div>`;
    updateResultBorder();

    setTimeout(() => {
        const instructionText = document.getElementById("instructionText");
        if (instructionText) {
            instructionText.innerHTML = "もうすぐ総合的な運勢が出ます";
        }

        const yaoText = hexagram.yao_descriptions?.[(index + 1).toString()] || "該当する爻辞が見つかりません。";
        const yaoName = yaoNames[index];
        const title = `第${hexagram.number}卦：${hexagram.name} の ${yaoName}`;

        result.innerHTML = `
            <div class="hexagram-title">${title}</div>
            <div class="description-text">${yaoText}</div>
        `;
        createFutureButton(hexagram, index);
    }, 1500);
}

//「長い目で見るとどうなるか？」ボタン作成
function createFutureButton(originalHexagram, index) {
    const button = document.createElement("button");
    button.textContent = "長い目で見るとどうなる？";
    button.classList.add("variant-button");
    button.onclick = () => {
        toggleYinYangAtIndex(index);
        const changedArray = resultArray.split("").map((bit, i) =>
            i === index ? (bit === "0" ? "1" : "0") : bit
        );
        const changedHexagram = getHexagramByArray(changedArray.join(""));
        cachedChangedHexagram = changedHexagram;

        showChangedHexagram(changedHexagram, originalHexagram, true);
    };
    result.appendChild(button);
}

//変卦の表示処理（遅延あるなし）
function showChangedHexagram(hexagram, originalHexagram, delay = false) {
    if (delay) {
        result.innerHTML = `<div class="waiting-message">占い結果が表示されます...</div>`;
        updateResultBorder();
        setTimeout(() => {
            if (hexagram) {
                showHexagram(hexagram);
                resetButton.style.display = "none";
            } else {
                result.innerHTML = `<div class="error-message">該当する変卦が見つかりませんでした。</div>`;
            }
        }, 1000);
    } else {
        if (hexagram) {
            showHexagram(hexagram);
            resetButton.style.display = "none";
        } else {
            result.innerHTML = `<div class="error-message">該当する変卦が見つかりませんでした。</div>`;
        }
    }
}
// 爻の陰陽を反転させる関数
function toggleYinYangAtIndex(index) {
    const line = document.getElementById(`progress-line-${index}`);
    if (!line) return;

    if (line.innerHTML.includes("陰")) {
        line.innerHTML = line.innerHTML.replace("陰", "<strong>陽</strong>");
    } else if (line.innerHTML.includes("陽")) {
        line.innerHTML = line.innerHTML.replace("陽", "<strong>陰</strong>");
    }

    // スタイルは維持（赤・太字のまま）
    line.style.color = "red";
    line.style.fontWeight = "bold";
}

// ===== 5. イベントハンドラ =====
//占い開始ボタン
document.getElementById("start-button").addEventListener("click", () => {
    const input = document.getElementById("question-input");
    userQuestion = input.value.trim(); // 空でもOK

    const questionSection = document.getElementById("question-section");
    const mainApp = document.getElementById("main-app");

    // フェードアウト
    questionSection.classList.remove("show");

    setTimeout(() => {
        questionSection.style.display = "none";

        // フェードイン
        mainApp.style.display = "block";
        setTimeout(() => {
            mainApp.classList.add("show");
        }, 20); // 微遅延で transition を発火させる
    }, 1000); // CSSの transition と同じ時間にする
});

//スピナー処理
spinnerContainer.addEventListener("click", () => {
    if (alreadyClicked) return;

    if (!isSpinning) {
        isSpinning = true;
        clickTime = Date.now();
        spinnerAnimation.play();
        if (clickCount === 0) {
            initializeProgressMessages();  // ✅ 最初のクリック時に6行の空行を用意
        }

    } else {
        isSpinning = false;
        const currentFrame = spinnerAnimation.currentFrame;
        spinnerAnimation.goToAndStop(currentFrame, true);

        const yinYang = Math.random() < 0.5 ? "0" : "1";
        resultArray += yinYang;
        clickCount++;

        const progress = getProgressMessage(clickCount, yinYang);
        setTimeout(() => {
            const targetLine = document.getElementById(`progress-line-${clickCount - 1}`);
            if (targetLine) {
                targetLine.innerHTML = progress;
            }
        }, 200);

        if (clickCount >= 6) {
            setTimeout(() => {
                result.innerHTML = `<div class="waiting-message">本卦を表示します...</div>`;
                updateResultBorder();

                setTimeout(() => {
                    const instructionText = document.getElementById("instructionText");
                    if (instructionText) {
                        instructionText.textContent = "今後の展開、裏の意味などを探ってみましょう";
                    }
                    selectedHexagram = getHexagramByArray(resultArray);
                    originalHexagram = selectedHexagram;
                    if (selectedHexagram) {
                        showHexagram(selectedHexagram, true);
                        saveOriginalProgressMessages();
                        showVariantButtons(originalHexagram);
                    } else {
                        result.innerHTML = `<div class="error-message">該当する卦が見つかりませんでした（${resultArray}）</div>`;
                    }
                    updateResultBorder();
                    resetButton.style.display = "none";
                }, 1500);
            }, 500);

            alreadyClicked = true;
        }
    }
});

//リセットボタンによる初期化（もう一度占う）
resetButton.style.display = "none";
resetButton.addEventListener("click", () => {
    document.getElementById("progress-container").innerHTML = '';
    result.innerHTML = "";
    clickCount = 0;
    resultArray = "";
    alreadyClicked = false;
    isSpinning = false;
    spinnerAnimation.stop();
    currentRotation = 0;
    resetButton.style.display = "none";
    // const finalButton = document.getElementById("final-fortune-button");
    // if (finalButton) finalButton.style.display = "none";
    // const instructionText = document.querySelector("h2");
    // futureExpansionUsed = false;
    cachedChangedHexagram = null;
    cachedChangedLineIndex = null;
    shownVariantKeys.clear();
    selectedHexagram = null;
    originalProgressMessages = [];

    // ✅ スピナーと進行状況メッセージを再表示
    const spinnerContainer = document.getElementById("lottie-spinner");
    if (spinnerContainer) {
        spinnerContainer.style.display = "block";
    }

    const progressContainer = document.getElementById("progress-container");
    if (progressContainer) {
        progressContainer.style.display = "flex";
    }
    updateResultBorder();
    //h2テキスト初期化
    const instructionText = document.getElementById("instructionText");
    if (instructionText) {
        instructionText.innerHTML = "こころに念じながら６回クリックしてください";
    }

    // ✅ 表示を最初の画面に戻す
    const questionSection = document.getElementById("question-section");
    const mainApp = document.getElementById("main-app");

    // フェードアウト mainApp
    mainApp.classList.remove("show");

    setTimeout(() => {
        mainApp.style.display = "none";

        // フェードイン questionSection
        questionSection.style.display = "block";
        setTimeout(() => {
            questionSection.classList.add("show");
        }, 20);
    }, 1000);



    // ✅ 占いたい内容の入力欄をクリア
    const questionInput = document.getElementById("question-input");
    if (questionInput) {
        questionInput.value = "";
    }
});

// ===== 6. 総合的な易断表示処理 =====
function displayFinalFortune() {
    if (!originalHexagram || !cachedChangedHexagram || cachedChangedLineIndex === null) {
        result.innerHTML = "<div class='error-message'>必要な情報がそろっていません。</div>";
        return;
    }
    //h2テキストの変更
    const instructionText = document.getElementById("instructionText");
    if (instructionText) {
        instructionText.textContent = "卦を保存して記録を残しましょう";
    }
    setTimeout(() => {
    //スピナー非表示
    const spinnerContainer = document.getElementById("lottie-spinner");
    if (spinnerContainer) {
        spinnerContainer.style.display = "none";
    }

    //進行状況メッセージ非表示
    const progressContainer = document.getElementById("progress-container");
    if (progressContainer) {
        progressContainer.style.display = "none";
    }

    //易断結果を表示（1.5秒）
    
        const reverseHex = sixtyFourHexagrams.find(h => h.number === originalHexagram.reverse);
        const souHex = sixtyFourHexagrams.find(h => h.number === originalHexagram.sou);
        const goHex = sixtyFourHexagrams.find(h => h.number === originalHexagram.go);

        const yaoDescription = originalHexagram.yao_descriptions?.[(cachedChangedLineIndex + 1).toString()] || "該当する爻辞が見つかりません";

        // 卦・爻・変卦などの概要
        const summaryHTML = `
        <div class="fortune-summary">
            <h3>🔮 総合的な易断</h3>
            <p>今のあなたの状況は、本卦である「<strong>${originalHexagram.name}</strong>（${originalHexagram.summary}）」に示されています。<strong>${originalHexagram.description}</strong></p>
            <p>とくに注目すべきは <strong>${["初", "二", "三", "四", "五", "上"][cachedChangedLineIndex]}爻</strong> の変化であり、</p>
            <p>この爻辞である「<strong>${yaoDescription}</strong>」があなたの今後の行動の鍵です。</p>
            <p>この変化により、中長期的に状況は「<strong>${cachedChangedHexagram.name}</strong> (${cachedChangedHexagram.summary})」へと展開していきます。</p>
            <hr>
            <p>この本卦に隠されている裏の意味は「<strong>${reverseHex?.name || "不明"}</strong> (${reverseHex?.summary || "不明"})」です。</p><p>状況を俯瞰すると、「<strong>${souHex?.name || "不明"}</strong> (${souHex?.summary || "不明"})」となります。</p><p>そもそも本質は「<strong>${goHex?.name || "不明"}</strong> (${goHex?.summary || "不明"})」です。</p>
        </div>
    `;

        result.innerHTML = summaryHTML;
        updateResultBorder();
        resetButton.style.display = "block";
    }, 1500);
}
