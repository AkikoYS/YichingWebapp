//logis.js

//陰陽生成と変換ロジック

let sixtyFourHexagrams = [];

export function setHexagramData(data) {
    sixtyFourHexagrams = data;
}

// 結果から該当する卦を取得
export function getHexagramByArray(arrayString) {
    return sixtyFourHexagrams.find(hexagram => hexagram.array === arrayString);
}

export function getHexagramByNumber(number) {
    return sixtyFourHexagrams.find(hex => hex.number === number);
}

export function getProgressMessage(clickCount, yinYang) {
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

//変爻。陰なら陽にして陽なら陰にする
export function toggleYinYang(selectedLine) {
    const currentState = selectedLine.textContent.includes("陰") ? "陰" : "陽";
    const newState = currentState === "陰" ? "陽" : "陰";
    selectedLine.textContent = selectedLine.textContent.replace(currentState, newState);
}
