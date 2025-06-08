import { auth, db } from "./firebase/firebase.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    let userName = "";
    const chatLog = document.getElementById("chat-log");

    // 占い情報の読み込み
    const userQuestion = localStorage.getItem("userQuestion") || "（未入力）";
    const originalHexagram = JSON.parse(localStorage.getItem("originalHexagram") || "{}");
    const changedHexagram = JSON.parse(localStorage.getItem("changedHexagram") || "{}");
    const reverseHexagram = JSON.parse(localStorage.getItem("reverseHexagram") || "{}");
    const souHexagram = JSON.parse(localStorage.getItem("souHexagram") || "{}");
    const goHexagram = JSON.parse(localStorage.getItem("goHexagram") || "{}");
    const changedLineIndex = localStorage.getItem("changedLineIndex");

    const summaryText = `あなたの占いたい内容は<strong>「${userQuestion}」</strong>でした。<br>あなたが得たのは、<br>本卦は<strong>${originalHexagram.name}${originalHexagram.unicode}</strong>、変爻は<strong>${Number(changedLineIndex) + 1}爻</strong>でした。（裏卦:<strong>${reverseHexagram.name}${reverseHexagram.unicode}</strong>、総卦:<strong>${souHexagram.name}${souHexagram.unicode}</strong>、互卦:<strong>${goHexagram.name}${goHexagram.unicode}</strong>、変卦:<strong>${changedHexagram.name}${changedHexagram.unicode}</strong>）`;

    const introBox = document.getElementById("intro-text");
    introBox.innerHTML = `${summaryText}<br>これらの情報に鑑みて3000字程度の具体的な助言をさしあげますので、<br>よろしければ、状況をもう少し詳しく教えてください。`;

    // 質問ステップ処理
    const steps = document.querySelectorAll(".question-step");
    let currentIndex = 0;

    function showNextStep() {
        if (currentIndex < steps.length - 1) {
            steps[currentIndex].classList.add("hidden");
            currentIndex++;
            steps[currentIndex].classList.remove("hidden");
            const input = steps[currentIndex].querySelector("input, textarea");
            input?.focus();
        }
    }

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

            const response = document.createElement("div");
            response.className = "chat-log";
            response.innerHTML = `<strong>${label}</strong><br>${value}`;
            chatLog.appendChild(response);

            if (currentIndex === 0 && userName === "") {
                userName = value;
                document.getElementById("label-topic").textContent = `${userName}さん、何についてアドバイスをお望みですか？`;
                document.getElementById("label-situation").textContent = `${userName}さん、現在、どのような状況・お気持ちですか？`;
            }

            showNextStep();
        });
    });

    document.getElementById("ai-detail-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });

        // 表示
        const finalMessage = document.createElement("div");
        finalMessage.className = "final-message";
        finalMessage.innerHTML = `<strong>${userName}さん、ありがとうございました。</strong><br>入力いただいた内容をもとにAIが丁寧に助言を作成します。次に決済画面へ進みます。`;
        chatLog.appendChild(finalMessage);

        steps[currentIndex].classList.add("hidden");

        // Firestoreに保存
        try {
            const userId = auth.currentUser?.uid || "anonymous";
            await addDoc(collection(db, "ai_advice_requests"), {
                userId,
                userName: data.username,
                email: data.email,
                topic: data.topic,
                situation: data.situation,
                notes: data.notes,
                userQuestion,
                hexagrams: {
                    original: originalHexagram,
                    changed: changedHexagram,
                    reverse: reverseHexagram,
                    sou: souHexagram,
                    go: goHexagram,
                    changedLineIndex
                },
                createdAt: new Date()
            });
            console.log("✅ Firestore に保存されました");
        } catch (error) {
            console.error("❌ Firestore 保存エラー:", error);
        }

        // 遷移
        setTimeout(() => {
            window.location.href = "payment.html";
        }, 1500);
    });
});
