// ui.js

import {
    getHexagramByNumber,
    getHexagramByArray,
    getProgressMessage,
    toggleYinYang
} from './logic.js';

import {
    startSpinner,
    stopSpinner,
    isSpinnerRunning
} from './spinner.js';

let futureHandler = null;

export function showHexagram(hexagram, isOriginal = false) {
    if (!hexagram) {
        console.error("hexagram is undefined");
        return;
    }

    const result = document.getElementById("result");
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

    if (isOriginal) {
        showVariantButtons(hexagram);
    } else {
        appendBackToOriginalButton();
    }
}

function appendBackToOriginalButton() {
    const result = document.getElementById("result");
    const existing = document.getElementById("back-to-original-button");
    if (existing) existing.remove();

    const button = document.createElement("button");
    button.id = "back-to-original-button";
    button.textContent = "本卦に戻る";
    button.className = "variant-button";
    button.onclick = () => {
        showHexagram(window.originalHexagram, true);
        restoreProgressMessages(window.resultArray);
        updateResultBorder();
        removeBackToOriginalButton();
        resetToOriginal();
        resetSpinnerContainer();
    };
    result.appendChild(button);
}

function removeBackToOriginalButton() {
    const backButton = document.getElementById("back-to-original-button");
    if (backButton) backButton.remove();
}

export function updateResultBorder() {
    const result = document.getElementById("result");
    if (result.innerHTML.trim() === "") {
        Object.assign(result.style, {
            border: "none",
            height: "0",
            padding: "0",
            margin: "0",
            background: "transparent",
            boxShadow: "none"
        });
    } else {
        Object.assign(result.style, {
            border: "1px solid #ccc",
            background: "#ffffff",
            borderRadius: "10px",
            marginTop: "30px",
            padding: "20px",
            maxWidth: "700px",
            marginLeft: "auto",
            marginRight: "auto",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            height: "auto"
        });
    }
}

export function showVariantButtons(selectedHexagram) {
    const existing = document.getElementById("variant-buttons");
    if (existing) existing.remove();

    const wrapper = document.createElement("div");
    wrapper.className = "variant-button-wrapper";
    wrapper.id = "variant-buttons";

    const variants = [
        { label: "裏の意味", key: "reverse" },
        { label: "客観的に運命を見ると", key: "sou" },
        { label: "卦の本質は", key: "go" },
        { label: "具体的な指針", key: "future-expansion" }
    ];

    variants.forEach(variant => {
        const button = document.createElement("button");
        button.textContent = variant.label;
        button.classList.add("variant-button");
        button.onclick = () => {
            if (variant.key === "future-expansion") {
                handleFutureExpansion();
                enableFutureExpansionClick();
            } else {
                const variantNumber = Number(selectedHexagram[variant.key]);
                const variantHex = getHexagramByNumber(variantNumber);
                if (variantHex) {
                    showHexagram(variantHex, false);
                } else {
                    console.error("該当する variantHex が見つかりません", variantNumber);
                }
            }
        };
        wrapper.appendChild(button);
    });
    document.getElementById("result").appendChild(wrapper);
}

export function enableFutureExpansionClick() {
    const spinner = document.getElementById("lottie-spinner");
    let clickCount = 0;
    const handler = () => {
        if (clickCount === 0) {
            startSpinner();
        } else if (clickCount === 1) {
            stopSpinner();
            // …以下の処理はそのままでOK
        }
        clickCount++;
    };

    // 二重登録防止
    spinner.replaceWith(spinner.cloneNode(true));
    const newSpinner = document.getElementById("lottie-spinner");
    newSpinner.addEventListener("click", handler);
}
//再初期化関数
export function resetSpinnerForInit() {
    initSpinner("lottie-spinner", "assets/animations/spinner-animation.json");
}

export function updateAndHighlightProgressMessage(randomIndex, toggleYinYang) {
    const progressContainer = document.getElementById("progress-container");
    const lines = progressContainer.querySelectorAll("div");
    lines.forEach(line => {
        line.style.color = "";
        line.style.fontWeight = "";
    });

    const selectedLine = progressContainer.querySelector(`div:nth-child(${(randomIndex + 1) * 2})`);
    if (selectedLine) {
        toggleYinYang(selectedLine);
        selectedLine.style.color = "red";
        selectedLine.style.fontWeight = "bold";
    } else {
        console.error("選択された爻が見つかりません。");
    }
}

export function resetToOriginal() {
    document.getElementById("progress-container").innerHTML = "";
    document.getElementById("reset-button").style.display = "none";
    const backButton = document.getElementById("back-to-original-button");
    if (backButton) backButton.remove();
    const instructionText = document.querySelector("h2");
    if (instructionText) {
        instructionText.innerHTML = "念じながら６回ルーレットをクリックして";
    }
    window.changedHexagram = null;
    window.resultArray = "";
    window.clickCount = 0;
    window.alreadyClicked = false;
    window.isFutureExpansionClicked = false;
}

function restoreProgressMessages(resultArray) {
    const container = document.getElementById("progress-container");
    container.innerHTML = "";
    const lines = resultArray.split("");
    lines.forEach((bit, i) => {
        const line = document.createElement("div");
        const label = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"][i];
        const yinYang = bit === "0" ? "<strong>陰</strong>" : "<strong>陽</strong>";
        line.classList.add("spinner-progress-message");
        line.innerHTML = `${label}: ${yinYang}`;
        container.appendChild(line);
    });
}