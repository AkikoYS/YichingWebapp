let sorted = false;
function toggleHexagramOrder() {
    const table = document.querySelector(".hexagram-table");
    table.innerHTML = ""; // 全体クリア

    const theadRow = document.createElement("tr");

    if (!sorted) {
        const corner = document.createElement("th");
        corner.className = "corner-cell";
        corner.innerHTML = '<span class="upper-label">上卦</span><span class="lower-label">下卦</span>';
        theadRow.appendChild(corner);
        const tops = ["坤（地）", "艮（山）", "坎（水）", "巽（風）", "震（雷）", "離（火）", "兌（沢）", "乾（天）"];
        tops.forEach(t => {
            const th = document.createElement("th");
            th.className = "header-top";
            th.textContent = t;
            theadRow.appendChild(th);
        });
        table.appendChild(theadRow);
    }

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 8; i++) {
        const row = document.createElement("tr");
        for (let j = 0; j < 8; j++) {
            const index = sorted ? (7 - i) * 8 + (7 - j) : i * 8 + j;
            const [symbol, name] = hexList[index];
            const td = document.createElement("td");
            td.innerHTML = `<div class="hexagram">${symbol}</div><div>${name}</div>`;
            row.appendChild(td);
        }
        if (!sorted) {
            const sideLabel = ["乾（天）", "兌（沢）", "離（火）", "震（雷）", "巽（風）", "坎（水）", "艮（山）", "坤（地）"];
            const th = document.createElement("th");
            th.className = "header-side";
            th.textContent = sideLabel[i];
            row.appendChild(th);
        }
        fragment.appendChild(row);
    }
    table.appendChild(fragment);
    sorted = !sorted;
    document.getElementById("toggleBtn").textContent = sorted ? "八卦構成順で表示する" : "卦番号順で表示する";
}

const hexList = [
    ["䷀", "1 乾為天"], ["䷁", "2 坤為地"], ["䷂", "3 水雷屯"], ["䷃", "4 山水蒙"],
    ["䷄", "5 水天需"], ["䷅", "6 天水訟"], ["䷆", "7 地水師"], ["䷇", "8 水地比"],
    ["䷈", "9 風天小畜"], ["䷉", "10 天沢履"], ["䷊", "11 地天泰"], ["䷋", "12 天地否"],
    ["䷌", "13 天火同人"], ["䷍", "14 火天大有"], ["䷎", "15 地山謙"], ["䷏", "16 雷地豫"],
    ["䷐", "17 沢雷随"], ["䷑", "18 山風蠱"], ["䷒", "19 地沢臨"], ["䷓", "20 風地観"],
    ["䷔", "21 火雷噬嗑"], ["䷕", "22 山火賁"], ["䷖", "23 山地剥"], ["䷗", "24 地雷復"],
    ["䷘", "25 天雷无妄"], ["䷙", "26 山天大畜"], ["䷚", "27 山雷頤"], ["䷛", "28 沢風大過"],
    ["䷜", "29 坎為水"], ["䷝", "30 離為火"], ["䷞", "31 沢山咸"], ["䷟", "32 雷風恒"],
    ["䷠", "33 天山遯"], ["䷡", "34 雷天大壮"], ["䷢", "35 火地晋"], ["䷣", "36 地火明夷"],
    ["䷤", "37 風火家人"], ["䷥", "38 火沢睽"], ["䷦", "39 水山蹇"], ["䷧", "40 雷水解"],
    ["䷨", "41 山沢損"], ["䷩", "42 風雷益"], ["䷪", "43 沢天夬"], ["䷫", "44 天風姤"],
    ["䷬", "45 沢地萃"], ["䷭", "46 地風升"], ["䷮", "47 沢水困"], ["䷯", "48 水風井"],
    ["䷰", "49 沢火革"], ["䷱", "50 火風鼎"], ["䷲", "51 震為雷"], ["䷳", "52 艮為山"],
    ["䷴", "53 風山漸"], ["䷵", "54 雷沢帰妹"], ["䷶", "55 雷火豊"], ["䷷", "56 火山旅"],
    ["䷸", "57 巽為風"], ["䷹", "58 兌為沢"], ["䷺", "59 風水渙"], ["䷻", "60 水沢節"],
    ["䷼", "61 風沢中孚"], ["䷽", "62 雷山小過"], ["䷾", "63 水火既済"], ["䷿", "64 火水未済"]
];