console.log("✅ log.js 読み込み完了");

import { auth, db } from './firebase.js';
import { collection, query, where, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.querySelector("#log-table tbody");

    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            console.warn("未ログイン状態です。ログを表示できません。");
            return;
        }

        const q = query(collection(db, "logs"), where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((docSnap) => {
            const entry = docSnap.data();
            const tr = document.createElement("tr");

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

            // 🔴 Firestore削除処理（doc.id を使う）
            tr.querySelector(".delete-button").addEventListener("click", async () => {
                if (confirm("このログを削除してもよろしいですか？")) {
                    await deleteDoc(doc(db, "logs", docSnap.id));
                    tr.remove(); // 表からも削除
                }
            });

            tbody.appendChild(tr);
        });
    });
});