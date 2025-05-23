let sorted = false;
function toggleHexagramOrder() {
    const table = document.getElementById("hexTable");
    table.classList.remove("show");
    table.classList.add("fade");
    table.innerHTML = ""; // 全体クリア

    const theadRow = document.createElement("tr");
    const toggleBtn = document.getElementById("toggleBtn");
    toggleBtn.classList.toggle("alt");

    if (!sorted) {
        const tops = ["坤（地）", "艮（山）", "坎（水）", "巽（風）", "震（雷）", "離（火）", "兌（沢）", "乾（天）"];
        tops.forEach(t => {
            const th = document.createElement("th");
            th.className = "header-top";
            th.textContent = t;
            theadRow.appendChild(th);
        });
        const corner = document.createElement("th");
        corner.className = "corner-cell";
        corner.innerHTML = '<span class="upper-label">外卦</span><span class="lower-label">内卦</span>';
        theadRow.appendChild(corner);
        table.appendChild(theadRow);
    }

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 8; i++) {
        const row = document.createElement("tr");
        for (let j = 0; j < 8; j++) {
            let symbol, name;
            if (sorted) {
                const index = i * 8 + j;
                [symbol, name] = hexList[index];
            } else {
                [symbol, name] = hexGrid[i][j];
            }
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
    requestAnimationFrame(() => table.classList.add("show"));
    sorted = !sorted;
    document.getElementById("toggleBtn").textContent = sorted ? "⇩ 卦番号順で表示する" : "⇩ 八卦構成順で表示する";
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

const hexGrid = [
    [["䷊", "11 地天泰"], ["䷙", "26 山天大畜"], ["䷄", "5 水天需"], ["䷈", "9 風天小畜"], ["䷡", "34 雷天大壮"], ["䷍", "14 火天大有"], ["䷪", "43 沢天夬"], ["䷀", "1 乾為天"]],
    [["䷒", "19 地沢臨"], ["䷨", "41 山沢損"], ["䷻", "60 水沢節"], ["䷼", "61 風沢中孚"], ["䷵", "54 雷沢帰妹"], ["䷥", "38 火沢睽"], ["䷹", "58 兌為沢"], ["䷉", "10 天沢履"]],
    [["䷣", "36 地火明夷"], ["䷕", "22 山火賁"], ["䷾", "63 水火既済"], ["䷤", "37 風火家人"], ["䷶", "55 雷火豊"], ["䷝", "30 離為火"], ["䷰", "49 沢火革"], ["䷌", "13 天火同人"]],
    [["䷗", "24 地雷復"], ["䷚", "27 山雷頤"], ["䷂", "3 水雷屯"], ["䷩", "42 風雷益"], ["䷲", "51 震為雷"], ["䷔", "21 火雷噬嗑"], ["䷐", "17 沢雷随"], ["䷘", "25 天雷无妄"]],
    [["䷭", "46 地風升"], ["䷑", "18 山風蠱"], ["䷯", "48 水風井"], ["䷸", "57 巽為風"], ["䷟", "32 雷風恒"], ["䷱", "50 火風鼎"], ["䷛", "28 沢風大過"], ["䷫", "44 天風姤"]],
    [["䷆", "7 地水師"], ["䷃", "4 山水蒙"], ["䷜", "29 坎為水"], ["䷺", "59 風水渙"], ["䷧", "40 雷水解"], ["䷿", "64 火水未済"], ["䷮", "47 沢水困"], ["䷅", "6 天水訟"]],
    [["䷎", "15 地山謙"], ["䷳", "52 艮為山"], ["䷦", "39 水山蹇"], ["䷴", "53 風山漸"], ["䷽", "62 雷山小過"], ["䷷", "56 火山旅"], ["䷞", "31 沢山咸"], ["䷠", "33 天山遯"]],
    [["䷁", "2 坤為地"], ["䷖", "23 山地剥"], ["䷇", "8 水地比"], ["䷓", "20 風地観"], ["䷏", "16 雷地豫"], ["䷢", "35 火地晋"], ["䷬", "45 沢地萃"], ["䷋", "12 天地否"]]
];
window.onload = () => {
    if (typeof toggleHexagramOrder === 'function') {
        sorted = false;
        toggleHexagramOrder(); // ← この時点で true に切り替わる
        document.getElementById('hexTable').style.display = 'table';
    }
  };