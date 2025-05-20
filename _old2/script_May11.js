// グローバル変数
//状況管理用関数
let isSpinning = false; // 回転中かどうか
let clickCount = 0; // クリック回数
let resultArray = ""; // 結果の配列
let clickTime = 0; // クリック時刻
let alreadyClicked = false;
let sixtyFourHexagrams = [];
let selectedHexagram = null;
let originalHexagram = null;

let futureExpansionUsed = false;
let chachedChangedHexagram = null;
let cachedChangedLineIndex = null; // ✅ 追加: 変爻のインデックス
let shownVariantKeys = new Set();  // ✅ 追加: バリアント表示履歴

// 以下省略（既に確認済みの全文をここに入れる）
