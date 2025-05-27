console.log("✅ log.js 読み込み完了");

document.addEventListener("DOMContentLoaded", () => {
    const logs = JSON.parse(localStorage.getItem("fortuneLogs") || "[]");
    const tbody = document.querySelector("#log-table tbody");

    logs.forEach((entry, index) => {
        const tr = document.createElement("tr");
        tr.dataset.index = index; // ✅ インデックスを記録

        tr.innerHTML = `
            <td>${entry.timestamp}</td>
            <td>${entry.question}</td>
            <td>${entry.original.name}<br><img src="assets/images/hexagrams/${entry.original.image}" alt=""></td>
            <td>${entry.changedLine.label}<br>${entry.changedLine.yaoText}</td>
            <td>${entry.changed.name}<br><img src="assets/images/hexagrams/${entry.changed.image}" alt=""></td>
            <td>${entry.reverse?.name || "不明"}<br><img src="assets/images/hexagrams/${entry.reverse?.image || ""}" alt=""></td>
            <td>${entry.sou?.name || "不明"}<br><img src="assets/images/hexagrams/${entry.sou?.image || ""}" alt=""></td>
            <td>${entry.go?.name || "不明"}<br><img src="assets/images/hexagrams/${entry.go?.image || ""}" alt=""></td>               
            <td class="delete-cell"><span class="delete-button">✖</span></td>
        `;

        // ✅ 削除ボタンのイベント
        tr.querySelector(".delete-button").addEventListener("click", () => {
            const indexToDelete = parseInt(tr.dataset.index);
            logs.splice(indexToDelete, 1);
            localStorage.setItem("fortuneLogs", JSON.stringify(logs));
            location.reload(); // リロードで再描画
        });

        tbody.appendChild(tr);
    });
});

