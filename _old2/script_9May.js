// グローバル変数

let isSpinning = false; // 回転中かどうか
let clickCount = 0; // クリック回数
let resultArray = ""; // 結果の配列
let progressMessageElement = null; // 初期化を明示的に設定
let currentRotation = 0;//現在の回転角度
let clickTime = 0; // クリック時刻
let spinnerRotationStart = 0; // スピナーの回転開始角度
let alreadyClicked = false;

// DOM要素の取得
const result = document.getElementById("result");
const resetButton = document.getElementById("reset-button");

// Lottieアニメーションの設定
const spinnerContainer = document.getElementById("lottie-spinner");
const spinnerAnimation = lottie.loadAnimation({
    container: spinnerContainer, // アニメーションを表示するコンテナ
    renderer: 'svg', // SVGレンダリング
    loop: true, // ループさせる
    autoplay: false, // 自動再生をオフに
    width: 300,  // サイズを変更
    height: 300, // サイズを変更
    path: 'assets/animations/spinner-animation.json' // LottieのJSONファイルのパス
});

//Jsonをフェッチする
fetch("hexagram.json")
    .then(response => response.ok ? response.json() : Promise.reject("JSONの読み込みに失敗"))
    .then(data => {
        sixtyFourHexagrams = data;
        console.log(sixtyFourHexagrams); // 読み込まれたデータを確認
    })
    .catch(error => { console.error(error); });

// 結果から該当する卦を取得
function getHexagramByArray(arrayString) {
    return sixtyFourHexagrams.find(hexagram => hexagram.array === arrayString);
}

// スピナークリック時の処理
spinnerContainer.addEventListener("click", () => {
    if (alreadyClicked) return; // 6回目のクリック後は再度クリックできないようにする

    // 進行状況メッセージを追加する要素を作成
    const newProgressElement = document.createElement("div");
    newProgressElement.classList.add("spinner-progress-message"); // スタイルを適用
    document.getElementById("progress-container").appendChild(newProgressElement); // 直接 progress-container に追加

    if (!isSpinning) {
        isSpinning = true;
        clickTime = Date.now();
        spinnerAnimation.play();
    } else {
        isSpinning = false;
        const currentFrame = spinnerAnimation.currentFrame;
        spinnerAnimation.goToAndStop(currentFrame, true);

        const yinYang = Math.random() < 0.5 ? "0" : "1";  // 0: 陰, 1: 陽
        resultArray += yinYang;
        clickCount++;

        // 進行状況を表示（クリック回数に応じて表示内容を変更）
        const progress = getProgressMessage(clickCount, yinYang);

        // 新しいメッセージを追加
        newProgressElement.innerHTML = progress;

        if (clickCount >= 6) {
            setTimeout(() => {
                newProgressElement.innerHTML = `上爻: ${yinYang === "0" ? "<strong>陰</strong>" : "<strong>陽</strong>"}`;
            }, 500);

            setTimeout(() => {
                result.innerHTML = `<div class="waiting-message">本卦を表示します...</div>`;
                updateResultBorder();

                setTimeout(() => {
                    selectedHexagram = getHexagramByArray(resultArray);
                    originalHexagram = selectedHexagram;
                    if (selectedHexagram) {
                        showHexagram(selectedHexagram, true);
                        showVariantButtons();
                    } else {
                        result.innerHTML = `<div class="error-message">該当する卦が見つかりませんでした（${resultArray}）</div>`;
                    }
                    updateResultBorder();
                    resetButton.style.display = "block";
                }, 3000); // 3秒後に結果を表示
            }, 500); // 0.5秒後に「本卦を表示します...」を表示

            alreadyClicked = true; // クリック後に再度クリックできないようにする
        }
    }
});

// 卦の詳細に関連するボタンを表示
function showVariantButtons() {
    const existing = document.getElementById("variant-buttons");
    if (existing) {
        existing.remove();
    }

    const wrapper = document.createElement("div");
    wrapper.className = "variant-button-wrapper";

    const variants = [
        { label: "裏の意味", key: "reverse" },
        { label: "客観的に運命を見ると", key: "sou" },
        { label: "卦の本質は", key: "go" }, 
        { label: "今後の展開", key: "future-expansion" }
    ]

    variants.forEach(variant => {
        const button = document.createElement("button");
        button.textContent = variant.label;
        button.classList.add("variant-button");
        button.onclick = () => {
            const variantHex = sixtyFourHexagrams.find(h => h.number === selectedHexagram[variant.key]);
            if (variantHex) showHexagram(variantHex);
        };
        wrapper.appendChild(button);
    });

    result.appendChild(wrapper);
}

// 進行状況メッセージを取得
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

// 卦の表示処理
function showHexagram(hexagram, isOriginal = false) {
    result.innerHTML = "";

    const description = hexagram.description || "説明は準備中です";
    const formattedDescription = description.replace(/\n/g, "<br>");
    result.innerHTML = `
      <div class="hexagram-title">第${hexagram.number}卦：${hexagram.name}</div>
      <div class="hexagram-reading" style="text-align: center;">${hexagram.reading}——${hexagram.summary}</div>
      <div class="hexagram-svg">
        <object data="images/hexagram_${hexagram.number.toString().padStart(2, '0')}.svg" type="image/svg+xml"></object>
      </div>
      <div class="description-text">${formattedDescription}</div>
        `;
    // 「本卦に戻る」ボタンの表示
    if (!isOriginal && originalHexagram) {
        const backButton = document.createElement("button");
        backButton.textContent = "本卦に戻る";
        backButton.className = "variant-button";
        backButton.onclick = () => {
            selectedHexagram = originalHexagram;
            showHexagram(originalHexagram, true);  // 元の卦を表示
            showVariantButtons();  // ボタンの表示
        };
        result.appendChild(backButton);  // ボタンを結果の下に追加
    };
}

// 本卦以外の卦に関連するボタンを表示
function showVariantButtons() {
    const existing = document.getElementById("variant-buttons");
    if (existing) {
        existing.remove();//既存のボタンを削除
    }

    //ボタンをコンテナを作成
    const wrapper = document.createElement("div");
    wrapper.className = "variant-button-wrapper";
    wrapper.id = "variant-buttons"; // 新たに作成したボタンを識別するためにIDを追加

    const variants = [
        { label: "裏の意味", key: "reverse" },
        { label: "客観的に運命を見ると", key: "sou" },
        { label: "卦の本質は", key: "go" },
        { label: "今後の展開", key: "future-expansion" }
    ];

    // ボタンを動的に作成
    variants.forEach(variant => {
        const button = document.createElement("button");
        button.textContent = variant.label;
        button.classList.add("variant-button");

        //ボタンがクリックされたときの処理
        button.onclick = () => {
            if (variant.key === "future-expansion") {
                handleFutureExpansion();
            } else {
                const variantHex = sixtyFourHexagrams.find(h => h.number === selectedHexagram[variant.key]);
                if (variantHex) showHexagram(variantHex, false);
            }
        };
        wrapper.appendChild(button);
    });
    const result = document.getElementById("result"); // resultコンテナを取得
    result.appendChild(wrapper);
}



// リセットボタン
resetButton.style.display = "none";  // 初期状態でリセットボタンは非表示
// リセットボタンが押された時
resetButton.addEventListener("click", () => {
    // 進行状況メッセージをリセット
    document.getElementById("progress-container").innerHTML = '';  // progress-container内をクリア
    result.innerHTML = "";
    clickCount = 0;
    resultArray = "";
    alreadyClicked = false;
    isSpinning = false;  // スピナーが初期状態では動いていない状態にする
    spinnerAnimation.stop(); // アニメーション停止
    currentRotation = 0;

    // リセット後にボタンを非表示
    resetButton.style.display = "none";
    // 結果の境界を更新（必要に応じて）
    updateResultBorder();
    // h2の文言を初期状態に戻す
    const instructionText = document.querySelector("h2");
    if (instructionText) {
        instructionText.innerHTML = "念じながら６回ルーレットをクリックして";  // 初期文言に戻す
    } else {
        console.error("h2要素が見つかりません。");
    }
});

// 結果のボーダーを更新
function updateResultBorder() {
    if (result.innerHTML.trim() === "") {
        result.style.border = "none";
        result.style.height = "0";
        result.style.padding = "0"; // パディングを0に設定
        result.style.margin = "0"; // マージンを0に設定
        result.style.background = "transparent"; // 背景を透明に設定
        result.style.boxShadow = "none"; // ボックスシャドウを無しに設定
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
};

// ランダムに選ばれた爻の表示を変更（赤色・太字・陰陽反転）
function updateAndHighlightProgressMessage(randomIndex) {
    const progressContainer = document.getElementById("progress-container");

    // すべての爻を取得して元に戻す（色と太字をリセット）
    const lines = progressContainer.querySelectorAll("div");  // 進行状況メッセージの各 div 要素を取得
    lines.forEach(line => {
        line.style.color = ""; // 元の色に戻す
        line.style.fontWeight = ""; // 元のフォントに戻す
    });

    // ランダムに選ばれた爻を選択（0〜5のインデックス）
    const selectedLine = progressContainer.querySelector(`div:nth-child(${(randomIndex + 1) * 2})`);

    console.log(selectedLine);


    if (selectedLine) {
        // 陰→陽、陽→陰の切り替え
        toggleYinYang(selectedLine);

        // 色・太字の変更
        selectedLine.style.color = "red";
        selectedLine.style.fontWeight = "bold";
    } else {
        console.error("選択された爻が見つかりません。");
    }
}

// 陰陽を反転させる処理
function toggleYinYang(selectedLine) {
    const currentState = selectedLine.textContent.includes("陰") ? "陰" : "陽";  // innerHTML ではなく textContent を使用
    const newState = currentState === "陰" ? "陽" : "陰";  // 陰→陽、陽→陰の切り替え

    // 表示内容を反転させる
    selectedLine.textContent = selectedLine.textContent.replace(currentState, newState);
}

// 今後の展開ボタンがクリックされたときの処理
function handleFutureExpansion() {
    console.log("今後の展開ボタンがクリックされました");

    // 結果のボーダーを消去
    const result = document.getElementById("result");
    if (result) {
        result.innerHTML = ""; // 結果のボーダーと中身を消去
        updateResultBorder();  // updateResultBorder() を呼び出してリセット処理を行う
    } else {
        console.error("結果コンテナが見つかりません。");
    }

    // 文言を変更
    const instructionText = document.querySelector("h2");
    if (instructionText) {
        instructionText.innerHTML = "最後に一回だけクリックしてください";  // 今後の展開ボタンで文言変更
    } else {
        console.error("h2要素が見つかりません。");
    }

    // クリック回数とスピナーの制御
    let clickCount = 0; // クリック回数のカウント
    // let isSpinning = false; // スピナーが回転しているかのフラグ
    // let clickTime; // クリック時刻

    spinnerContainer.addEventListener("click", () => {
        if (clickCount === 0) {
            // 最初のクリックでスピナーを回転開始
            isSpinning = true;
            spinnerAnimation.play(); // Lottieアニメーションを再生
            clickTime = Date.now(); // クリック時刻を記録
        } else if (clickCount === 1) {
            // 2回目のクリックでスピナーを停止
            isSpinning = false;
            spinnerAnimation.goToAndStop(currentTime, true);  // Lottieアニメーションを停止

            // スピナーが止まった位置でランダムに爻を選択
            const randomLineIndex = Math.floor(Math.random() * 6);  // 0〜5のランダムなインデックス

            // ランダムに選ばれた爻の表示を変更（赤色・太字・陰陽反転）
            updateAndHighlightProgressMessage(randomLineIndex);
            console.log(randomLineIndex);

        }
        clickCount++; // クリック回数を増加させる

    });

    // 進行状況メッセージに表示されている爻を使って変卦を計算
    const originalHexagramArray = resultArray.split("");  // 元の本卦から配列に変換
    const changedHexagramArray = calculateChangedHexagram(originalHexagramArray); // 変卦の計算

    // 変卦を表示するための処理
    displayChangedHexagram(changedHexagramArray);
}

// 変卦を計算
function calculateChangedHexagram(originalHexagramArray) {
    return originalHexagramArray.map(value => (value === "0" ? "1" : "0"));  // 陰→陽、陽→陰
}

// 変卦を表示する
function displayChangedHexagram(changedHexagramArray) {
    const resultContainer = document.getElementById("result");

    // 変卦を表示
    const changedHexagramText = changedHexagramArray.map((value, index) => {
        const lineLabel = getProgressMessage(index + 1, value);  // 進行状況メッセージを使用して表示
        return `<div>${lineLabel}</div>`;
    }).join("");  // 配列をHTML文字列に結合

    resultContainer.innerHTML = changedHexagramText;  // 結果を表示
    updateResultBorder();  // ボーダーの更新
}




