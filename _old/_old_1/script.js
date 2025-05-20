// script.js

let sixtyFourHexagrams = [
    { number: 1, name: "乾為天" },
    { number: 2, name: "坤為地" },
    { number: 3, name: "水雷屯" },
    { number: 4, name: "山水蒙" },
    { number: 5, name: "水天需" },
    { number: 6, name: "天水訟" },
    { number: 7, name: "地水師" },
    { number: 8, name: "水地比" },
    { number: 9, name: "風天小畜" },
    { number: 10, name: "天沢履" },
    { number: 11, name: "地天泰" },
    { number: 12, name: "天地否" },
    { number: 13, name: "天火同人" },
    { number: 14, name: "火天大有" },
    { number: 15, name: "地山謙" },
    { number: 16, name: "雷地豫" },
    { number: 17, name: "沢雷随" },
    { number: 18, name: "山風蠱" },
    { number: 19, name: "地沢臨" },
    { number: 20, name: "風地観" },
    { number: 21, name: "火雷噬嗑" },
    { number: 22, name: "山火賁" },
    { number: 23, name: "山地剥" },
    { number: 24, name: "地雷復" },
    { number: 25, name: "天雷无妄" },
    { number: 26, name: "山天大畜" },
    { number: 27, name: "山雷頤" },
    { number: 28, name: "沢風大過" },
    { number: 29, name: "坎為水" },
    { number: 30, name: "離為火" },
    { number: 31, name: "沢山咸" },
    { number: 32, name: "雷風恒" },
    { number: 33, name: "天山遯" },
    { number: 34, name: "雷天大壮" },
    { number: 35, name: "火地晋" },
    { number: 36, name: "地火明夷" },
    { number: 37, name: "風火家人" },
    { number: 38, name: "火沢睽" },
    { number: 39, name: "水山蹇" },
    { number: 40, name: "雷水解" },
    { number: 41, name: "山沢損" },
    { number: 42, name: "風雷益" },
    { number: 43, name: "沢天夬" },
    { number: 44, name: "天風姤" },
    { number: 45, name: "沢地萃" },
    { number: 46, name: "地風升" },
    { number: 47, name: "沢水困" },
    { number: 48, name: "水風井" },
    { number: 49, name: "沢火革" },
    { number: 50, name: "火風鼎" },
    { number: 51, name: "震為雷" },
    { number: 52, name: "艮為山" },
    { number: 53, name: "風山漸" },
    { number: 54, name: "雷沢帰妹" },
    { number: 55, name: "雷火豊" },
    { number: 56, name: "火山旅" },
    { number: 57, name: "巽為風" },
    { number: 58, name: "兌為沢" },
    { number: 59, name: "風水渙" },
    { number: 60, name: "水沢節" },
    { number: 61, name: "風沢中孚" },
    { number: 62, name: "雷山小過" },
    { number: 63, name: "水火既済" },
    { number: 64, name: "火水未済" }
];

// script.js

// グローバル変数
window.clickCount = 0;
window.resultArray = "";
window.changedHexagram = null;
window.originalHexagram = null;
window.isFutureExpansionClicked = false;
window.alreadyClicked = false;

const spinnerContainerID = "lottie-spinner";
const result = document.getElementById("result");
const resetButton = document.getElementById("reset-button");

// logic.js の読み込み
import {
    getHexagramByArray,
    setHexagramData,
    getProgressMessage,
    toggleYinYang
} from './logic.js';

// spinner.js の読み込み
import {
    initSpinner,
    startSpinner,
    stopSpinner,
    isSpinnerRunning
} from './spinner.js';

// ui.js の読み込み
import {
    showHexagram,
    updateResultBorder,
    showVariantButtons,
    updateAndHighlightProgressMessage,
    resetToOriginal,
    resetSpinnerForInit,
    handleFutureExpansion
} from './ui.js';

// JSON データ読み込み
fetch("hexagram.json")
    .then(res => res.ok ? res.json() : Promise.reject("読み込み失敗"))
    .then(data => setHexagramData(data))
    .catch(err => console.error("hexagram.json 読み込みエラー:", err));



// スピナークリックイベント
document.addEventListener("DOMContentLoaded", () => {
    initSpinner("lottie-spinner", "assets/animations/spinner-animation.json");
    const spinnerContainer = document.getElementById(spinnerContainerID);
    spinnerContainer.addEventListener("click", () => {
        if (window.isFutureExpansionClicked || window.alreadyClicked) return;

        const progressContainer = document.getElementById("progress-container");
        const newProgress = document.createElement("div");
        newProgress.classList.add("spinner-progress-message");
        progressContainer.appendChild(newProgress);

        if (!isSpinnerRunning()) {
            startSpinner();
        } else {
            const currentTime = stopSpinner();
            const yinYang = Math.random() < 0.5 ? "0" : "1";
            window.resultArray += yinYang;
            window.clickCount++;

            newProgress.innerHTML = getProgressMessage(window.clickCount, yinYang);

            if (window.clickCount >= 6) {
                setTimeout(() => {
                    newProgress.innerHTML = `上爻: ${yinYang === "0" ? "<strong>陰</strong>" : "<strong>陽</strong>"}`;
                }, 500);

                setTimeout(() => {
                    result.innerHTML = `<div class="waiting-message">本卦を表示します...</div>`;
                    updateResultBorder();

                    setTimeout(() => {
                        const hexagram = getHexagramByArray(window.resultArray);
                        window.originalHexagram = hexagram;

                        if (hexagram) {
                            showHexagram(hexagram, true);
                            showVariantButtons(hexagram);
                        } else {
                            result.innerHTML = `<div class="error-message">該当する卦が見つかりませんでした（\${window.resultArray}）</div>`;
                        }

                        updateResultBorder();
                        resetButton.style.display = "block";
                    }, 3000);
                }, 500);

                window.alreadyClicked = true;
            }
        }
    });
});

// リセットボタン設定
resetButton.style.display = "none";
resetButton.addEventListener("click", () => {
    resetSpinnerForInit();
    document.getElementById("progress-container").innerHTML = '';
    result.innerHTML = "";

    window.clickCount = 0;
    window.resultArray = "";
    window.alreadyClicked = false;
    window.isFutureExpansionClicked = false;
    window.changedHexagram = null;

    resetToOriginal();
    updateResultBorder();

    const instructionText = document.querySelector("h2");
    if (instructionText) {
        instructionText.innerHTML = "念じながら６回ルーレットをクリックして";
    }
});