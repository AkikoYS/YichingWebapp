//Firebaseの認証とデータベースのインポート
import { auth, db } from "./firebase/firebase.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

//ページが読み込まれたら実行
document.addEventListener("DOMContentLoaded", () => {
    let userName = "";//ユーザー名を一時保存
    const chatLog = document.getElementById("chat-log");

    // ローカルストレージから占い情報の読み込み
    const userQuestion = localStorage.getItem("userQuestion") || "（未入力）";
    const originalHexagram = JSON.parse(localStorage.getItem("originalHexagram") || "{}");
    const changedHexagram = JSON.parse(localStorage.getItem("changedHexagram") || "{}");
    const reverseHexagram = JSON.parse(localStorage.getItem("reverseHexagram") || "{}");
    const souHexagram = JSON.parse(localStorage.getItem("souHexagram") || "{}");
    const goHexagram = JSON.parse(localStorage.getItem("goHexagram") || "{}");
    const changedLineIndex = localStorage.getItem("changedLineIndex");
    //占い結果の概要テキストを作成し、表示。
    const summaryText = `あなたの占いたい内容は<strong>「${userQuestion}」</strong>でした。<br>あなたが得たのは、本卦は<strong>${originalHexagram.name}</strong>、変爻は<strong>${Number(changedLineIndex) + 1}爻</strong>でした。<br>（裏卦:<strong>${reverseHexagram.name}</strong>、総卦:<strong>${souHexagram.name}</strong>、互卦:<strong>${goHexagram.name}</strong>、変卦:<strong>${changedHexagram.name}</strong>）`;


    const introBox = document.getElementById("intro-text");
    introBox.innerHTML = `${summaryText}<br>これらの情報に鑑みて5000字程度の具体的な助言をさしあげますので、<br>よろしければ、状況をもう少し詳しく教えてください。`;

    //入力フォームの各ステップ管理
    const steps = document.querySelectorAll(".question-step");
    let currentIndex = 0;
    //次のステップを表示する関数
    function showNextStep() {
        if (currentIndex < steps.length - 1) {
            steps[currentIndex].classList.add("hidden");
            currentIndex++;
            steps[currentIndex].classList.remove("hidden");
            const input = steps[currentIndex].querySelector("input, textarea");
            input?.focus();
        }
    }
    // 「次へ」ボタンにクリックイベントを追加
    document.querySelectorAll(".next-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const currentStep = steps[currentIndex];
            const input = currentStep.querySelector("input, textarea");
            if (!input.value.trim()) {
                input.focus();
                return;
            }

            const label = currentStep.querySelector("label").textContent;
            const value = input.value.trim();

            //ユーザーの回答をチャットログに表示
            const response = document.createElement("div");
            response.className = "chat-log";
            response.innerHTML = `<strong>${label}</strong><br>${value}`;
            chatLog.appendChild(response);
            // ユーザー名が初回入力されたら、他の質問ラベルも個別に変更
            if (currentIndex === 0 && userName === "") {
                userName = value;
                document.getElementById("label-topic").textContent = `${userName}さん、占いたい内容の背景を教えてください。`;
                document.getElementById("label-situation").textContent = `${userName}さん、現在、どのような状況・お気持ちですか？`;
            }

            showNextStep();//次の質問へ
        });
    });

    //submit時に Cloud Function 呼び出し
    document.getElementById("ai-detail-form").addEventListener("submit", async (event) => {
        event.preventDefault();

        const testMode = true; // 本番では false にする

        // 入力値・localStorageからのデータ取得
        const form = event.target;
        const userName = form.querySelector("input[name='username']").value.trim() || "匿名";
        const topic = form.querySelector("textarea[name='topic']").value.trim() || "なし";
        const situation = form.querySelector("textarea[name='situation']").value.trim() || "なし";
        const email = form.querySelector("input[name='email']").value.trim() || "no-email@example.com";
        const userQuestion = localStorage.getItem("userQuestion") || "（未入力）";
        const notes = localStorage.getItem("notes") || "なし";

        const originalHexagram = JSON.parse(localStorage.getItem("originalHexagram") || "{}");
        const changedHexagram = JSON.parse(localStorage.getItem("changedHexagram") || "{}");
        const reverseHexagram = JSON.parse(localStorage.getItem("reverseHexagram") || "{}");
        const souHexagram = JSON.parse(localStorage.getItem("souHexagram") || "{}");
        const goHexagram = JSON.parse(localStorage.getItem("goHexagram") || "{}");
        const changedLineIndex = localStorage.getItem("changedLineIndex");

        const hexagrams = {
            original: originalHexagram,
            changed: changedHexagram,
            reverse: reverseHexagram,
            sou: souHexagram,
            go: goHexagram,
            changedLineIndex,
        };

        const payload = {
            userName,
            userQuestion,
            topic,
            situation,
            notes,
            email,
            hexagrams,
        };

        if (testMode) {
            // ✅ テストモード（決済をスキップして送信）
            try {
                const response = await fetch("/sendAdviceEmail", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                const result = await response.json();
                if (response.ok) {
                    alert("テスト送信成功！メールをご確認ください。");
                } else {
                    alert("送信失敗: " + result.error);
                }
            } catch (error) {
                console.error("通信エラー:", error);
                alert("送信中に通信エラーが発生しました");
            }
        } else {
            // ✅ 本番モード：決済ページへ遷移
            window.location.href = "payment.html";
        }
    });

});

//テスト送信ボタン
document.getElementById("testSendButton").addEventListener("click", async () => {
    const button = document.getElementById("testSendButton");

    // ✅ ボタン無効化 & ローディング表示
    button.disabled = true;
    button.textContent = "送信中...";
    showSending();  // ← 追加：送信中メッセージ表示

    const form = document.getElementById("ai-detail-form");
    const formData = new FormData(form);

    const originalHexagram = JSON.parse(localStorage.getItem("originalHexagram") || "{}");
    const changedHexagram = JSON.parse(localStorage.getItem("changedHexagram") || "{}");
    const reverseHexagram = JSON.parse(localStorage.getItem("reverseHexagram") || "{}");
    const souHexagram = JSON.parse(localStorage.getItem("souHexagram") || "{}");
    const goHexagram = JSON.parse(localStorage.getItem("goHexagram") || "{}");
    const changedLineIndex = localStorage.getItem("changedLineIndex");

    const body = {
        userName: formData.get("username"),
        email: formData.get("email"),
        userQuestion: formData.get("userQuestion") || "（未入力）",
        topic: formData.get("topic"),
        situation: formData.get("situation"),
        notes: formData.get("notes"),
        hexagrams: {
            original: { name: originalHexagram.name },
            changed: { name: changedHexagram.name },
            reverse: { name: reverseHexagram.name },
            sou: { name: souHexagram.name },
            go: { name: goHexagram.name },
            changedLineIndex: changedLineIndex,
        },
    };

    try {
        const endpoint =
            location.hostname === "localhost"
                ? "http://localhost:8805/sendAdviceEmail"
                : "https://us-central1-yichingapp-a5f90.cloudfunctions.net/sendAdviceEmail";

        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const text = await response.text();
        console.log("レスポンス本文:", text);

        if (!text) {
            throw new Error("サーバーから空のレスポンスが返されました");
        }

        const result = JSON.parse(text);

        if (response.ok) {
            showToast("✅ メールが送信されました。ご確認ください。");
            markAsSent();  // ✅ ボタンを「送信済」に変更する
        } else {
            showToast("送信失敗: " + (result.error || "サーバーエラー"));
            button.disabled = false;
            button.textContent = "再送信";
        }
    } catch (error) {
        console.error("通信エラー:", error);
        showToast("通信エラー: " + error.message);
        button.disabled = false;
        button.textContent = "再送信";
    } finally {
        hideSending();  // ✅ 成功でも失敗でもローディング終了
    }
});

//トースト表示
function showToast(message, duration = 3000) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, duration);
  }

const statusDiv = document.getElementById("sendingStatus");

//送信中
function showSending() {
    statusDiv.style.display = "block";
}
function hideSending() {
    statusDiv.style.display = "none";
}
//送信済のボタン記載変更
function markAsSent() {
    const button = document.getElementById("testSendButton");
    button.textContent = "送信済";
    button.disabled = true;
    button.style.backgroundColor = "#ccc";
    button.style.cursor = "default";
}