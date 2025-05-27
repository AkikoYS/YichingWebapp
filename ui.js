// UI処理

// ハンバーガークリックでメニューを開閉
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
//開くとハンバーガーがバツになる
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('show');
            hamburger.classList.toggle('open'); // ← ✖️に切り替え
        });
    }
    
//active navの空白を削除
    document.addEventListener('DOMContentLoaded', () => {
        if (window.innerWidth <= 768) {
            const currentPage = window.location.pathname.split('/').pop();
            const navLinks = document.querySelectorAll('.nav-link');

            navLinks.forEach(link => {
                let href = link.getAttribute('href');

                // hrefが無い場合は span要素とみなして現在ページと判断
                const isActivePage =
                    (href && href === currentPage) || link.classList.contains('active');

                if (isActivePage) {
                    const li = link.closest('li');
                    if (li) {
                        li.remove(); // ✅ <li> ごと削除
                    }
                }
            });
        }
    });

});