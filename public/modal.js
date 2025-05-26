// modal.js

// モーダル初期化とJSON読み込み
fetch("hexagrams_single_demo.json")
    .then(res => res.json())
    .then(data => {
        const list = document.getElementById("hexagram-list");
        data.forEach(hex => {
            const li = document.createElement("li");
            li.innerHTML = `<a href="#" data-id="${hex.number}">${hex.name}</a>`;
            list.appendChild(li);
        });

        document.querySelectorAll("#hexagram-list a").forEach(link => {
            link.addEventListener("click", e => {
                e.preventDefault();
                const id = parseInt(link.dataset.id);
                const hex = data.find(h => h.number === id);
                const modal = document.getElementById("hexagram-modal");
                const body = document.getElementById("modal-body");
                body.innerHTML = `
          <h2>${hex.name}（${hex.reading}）</h2>
          <p><strong>卦辞：</strong>${hex.hexagram_text}</p>
          <p><strong>象徴：</strong>${hex.symbolism}</p>
          <p><strong>物語：</strong>${hex.story}</p>
        `;
                modal.style.display = "block";
            });
        });

        document.querySelector(".modal .close").onclick = () => {
            document.getElementById("hexagram-modal").style.display = "none";
        };

        window.onclick = (e) => {
            if (e.target === document.getElementById("hexagram-modal")) {
                document.getElementById("hexagram-modal").style.display = "none";
            }
        };
    });
