// ✅ 必要なモジュールをインポート
const functions = require("firebase-functions");
const { onRequest } = require("firebase-functions/v2/https");
const cors = require("cors");
const OpenAI = require("openai");
const nodemailer = require("nodemailer");
const { jsPDF } = require("jspdf");
require("dotenv").config();
const { NotoSansJP } = require("./fonts/NotoSansJP-Regular.js");
const fs = require("fs");
const path = require("path");


// ✅ CORSミドルウェア（全ドメイン許可）
const corsHandler = cors({ origin: true });

// ✅ OpenAI クライアントの設定
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
// JSONファイルのパス
const quotesPath = path.join(__dirname, "quotes.json");

// 同期読み込み（デプロイ時に確実な方法）
const quotes = JSON.parse(fs.readFileSync(quotesPath, "utf-8"));

// ✅ メイン関数（Cloud Functions）
exports.sendAdviceEmail = onRequest((req, res) => {
    corsHandler(req, res, async () => {
        try {
            const { userName, email, userQuestion, topic, situation, notes, hexagrams } = req.body;
            console.log("📥 リクエスト受信:", req.body);
            console.log("🔍 userName の中身:", userName);
            const summaryText = req.body.summaryText || "（概要情報はありません）";
            const content = `【事前の総合的な易断】（相談者の状態を示す既知情報）：\n${summaryText}`;

            // ✅ OpenAI へプロンプト送信
            const prompt = `あなたは熟練の易者であり、相談者に誠実で深い助言を与えるAIです。相談者 ${userName} さんに対して、日本語で約5,000字のエッセイ方式のアドバイスを作成してください。形式的な箇条書きではなく、論理的かつ有機的に流れる文章にしてください。
            【0. 総合的な易断（前提）】
以下は、相談者に対する全体的な状況診断（summary）です。  
この内容を**全体構成の出発点**として扱い、以後の分析やアドバイスと整合性を持たせてください。
${summaryText}

【1. 重視する構成比と観点】
- 本卦と変爻の解釈を全体の7割に充て、現在の状況とその変化の兆しを深く掘り下げてください。
- 残りの3割で、以下の補助卦を必要に応じて補完的に解釈してください。
  - 裏卦：未来の兆し、得卦の補完的意味
  - 総卦：他者の気持ち、客観情勢、自分がどう見られているか
  - 互卦：隠された問題、深層心理、本質的な構造
  - 変爻：「天の声」にどう対処すべきかという指針
  - 変卦：中長期的な未来像の暗示
  ※ 補助卦は羅列しないでください。


【2. 文章の構成】
- 導入：相談者の状況を要約
- 展開：本卦の詳細分析 → 変爻を軸にした状況の変化
- 補足：必要に応じて補助卦について
- 提言：人生・人間関係・行動の具体的指針（ずばりという）
- 結論：今後に向けた希望とまとめ

【3. 執筆スタイル】
※ 上記の構成は出力には含めず、自然な日本語の文章として展開してください。
※ 導入と結論は短く簡潔に書いてください。
※ 「1. 導入」などの番号付き見出しや、項目立て（箇条書き）は使わず、論理的かつ有機的に流れる読み物のようにしてください。
※ 裏卦、総卦、互卦は、解釈のみに使い、それぞれの卦辞や意味を卦名を使って説明する必要はありません。
※ 無理に良い話にせず、必要に応じて厳しいことも誠実に伝えてください。

【4. 占断に用いる卦】
- 本卦: ${hexagrams.original.name}
- 変爻: 第${Number(hexagrams.changedLineIndex) + 1}爻
- 変卦: ${hexagrams.changed.name}
- 裏卦: ${hexagrams.reverse.name}
- 総卦: ${hexagrams.sou.name}
- 互卦: ${hexagrams.go.name}

【4. 相談内容】
- テーマ: ${userQuestion}
- 背景: ${topic}
- 状況: ${situation}
- 補足: ${notes}
  `;
            console.log("🧠 OpenAI に送信中...");
            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [{ role: "user", content: prompt }],
            });

            const adviceText = completion.choices[0].message.content;
            console.log("✅ OpenAI 応答取得");


            // ✅ PDFをbase64形式で生成
            const pdf = new jsPDF();
            pdf.addFileToVFS("NotoSansJP-Regular.ttf", NotoSansJP);
            pdf.addFont("NotoSansJP-Regular.ttf", "NotoSansJP", "normal");
            pdf.setFont("NotoSansJP");
            pdf.setFontSize(10);

            // ランダム選択
            const randomQuoteObj = quotes[Math.floor(Math.random() * quotes.length)];
            const randomQuote = `${randomQuoteObj.text}\n— ${randomQuoteObj.author}`;

            // ✅ PDF生成時に名言を最初に表示
            let y = 30;
            const quoteLines = pdf.splitTextToSize(randomQuoteObj.text, 170);
            quoteLines.forEach(line => {
                pdf.text(line, 20, y);
                y += 6;
            });
            pdf.text(`― ${randomQuoteObj.author}`, 195, y, { align: "right" });
            y += 12; // 名言と本文の間のスペース

            // 本文整形
            const cleanText = adviceText.replace(/^#+\s*/gm, "").replace(/\n{2,}/g, "\n\n");
            const bodyLines = pdf.splitTextToSize(cleanText, 160);
            const marginLeft = 15;  // 左余白を広げる

            // ✅ 本文出力
            pdf.setFontSize(11.5);
            bodyLines.forEach(line => {
                if (y > 270) {
                    pdf.addPage();
                    y = 20;
                }
                pdf.text(line, marginLeft, y);
                y += 6.5;
            });

            const pdfBase64 = pdf.output("datauristring").split(',')[1];
            console.log("📄 PDF 生成完了");

            // ✅ メール送信
            const transporter = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: process.env.GMAIL_USER,
                    pass: process.env.GMAIL_PASSWORD,
                },
            });
            console.log("📧 メール送信中...");
            const name = req.body?.userName || "お客様";
            await transporter.sendMail({
                from: `"易経くじAI" <${process.env.GMAIL_USER}>`,
                to: email,
                subject: `${userName}さんへのAI助言PDF`,
                html: `${userName}さま<br><br>易経AIアドバイスを添付しました。ご確認ください。<br><br>`,
                attachments: [
                    {
                        filename: "advice.pdf",
                        content: Buffer.from(pdfBase64, "base64"),
                        encoding: "base64",
                        contentType: "application/pdf",
                    },
                ],
            });
            console.log("✅ メール送信成功");
            res.status(200).json({ message: "✅ メール送信成功（PDF添付済）" });

        } catch (error) {
            console.error("メール送信失敗:", error);
            res.status(500).json({ error: "❌ メール送信に失敗しました" });
        }
    });
});




