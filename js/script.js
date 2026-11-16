// Chỉ có một chức năng: đổi giao diện sáng / tối và nhớ lựa chọn.
(function () {
    'use strict';

    var root = document.documentElement;
    var button = document.getElementById('themeToggle');

    function systemPrefersDark() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    function currentTheme() {
        return root.getAttribute('data-theme') || (systemPrefersDark() ? 'dark' : 'light');
    }

    try {
        var saved = localStorage.getItem('cv-theme');
        if (saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved);
    } catch (e) { /* trình duyệt chặn localStorage: bỏ qua */ }

    if (button) {
        button.addEventListener('click', function () {
            var next = currentTheme() === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-theme', next);
            try { localStorage.setItem('cv-theme', next); } catch (e) { /* bỏ qua */ }
        });
    }
})();
