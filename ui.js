// UI処理

document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    // ハンバーガーメニュー開閉処理
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('show');
            hamburger.classList.toggle('open');
        });
    }

    // // スマホで .nav-link の現在ページリンクを削除
    // if (window.innerWidth <= 768) {
    //     const currentPage = window.location.pathname.split('/').pop();
    //     const navLinks = document.querySelectorAll('.nav-link');

    //     navLinks.forEach(link => {
    //         const href = link.getAttribute('href');
    //         const isActivePage = (href && href === currentPage) || link.classList.contains('active');

    //         if (isActivePage) {
    //             const li = link.closest('li');
    //             if (li) li.remove(); // <li> ごと削除
    //         }
    //     });

    //     // ✅ スマホでは signin-text を削除してアイコンを表示
    //     const authIconContainer = document.querySelector(".auth-icon-container");
    //     if (authIconContainer?.classList.contains("signin-text")) {
    //         authIconContainer.classList.remove("signin-text");
    //     }
   
    // }

    // // ✅ スマホの場合は .login-container を非表示に強制する
    // if (window.innerWidth <= 768) {
    //     const pcLogin = document.querySelector(".login-container");
    //     if (pcLogin) {
    //         pcLogin.style.display = "none";
    //     }
    // }
});
