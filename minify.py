"""
minify.py — минификатор CSS и JS без зависимостей.
Запуск: python3 minify.py
Создаёт: styles.min.css, modal.min.js в той же папке.
"""

import re
import sys
from pathlib import Path


# ── CSS минификация ──────────────────────────────────────────────────────────

def minify_css(src: str) -> str:
    # Убираем комментарии /* ... */
    src = re.sub(r'/\*.*?\*/', '', src, flags=re.DOTALL)
    # Убираем пробелы вокруг : ; { } , >
    src = re.sub(r'\s*([:{};,>~+])\s*', r'\1', src)
    # Схлопываем пробельные символы
    src = re.sub(r'\s+', ' ', src)
    # Убираем ; перед }
    src = src.replace(';}', '}')
    # Убираем пробел после открывающей скобки медиа-запроса
    src = re.sub(r'\(\s+', '(', src)
    src = re.sub(r'\s+\)', ')', src)
    return src.strip()


# ── JS минификация ───────────────────────────────────────────────────────────

def minify_js(src: str) -> str:
    result = []
    i = 0
    n = len(src)

    while i < n:
        c = src[i]

        # Строка в одинарных кавычках
        if c == "'":
            j = i + 1
            while j < n:
                if src[j] == '\\':
                    j += 2
                    continue
                if src[j] == "'":
                    j += 1
                    break
                j += 1
            result.append(src[i:j])
            i = j
            continue

        # Строка в двойных кавычках
        if c == '"':
            j = i + 1
            while j < n:
                if src[j] == '\\':
                    j += 2
                    continue
                if src[j] == '"':
                    j += 1
                    break
                j += 1
            result.append(src[i:j])
            i = j
            continue

        # Шаблонные строки
        if c == '`':
            j = i + 1
            while j < n:
                if src[j] == '\\':
                    j += 2
                    continue
                if src[j] == '`':
                    j += 1
                    break
                j += 1
            result.append(src[i:j])
            i = j
            continue

        # Блочный комментарий /* ... */
        if c == '/' and i + 1 < n and src[i + 1] == '*':
            j = src.find('*/', i + 2)
            i = j + 2 if j != -1 else n
            result.append(' ')  # сохраняем пробел на месте комментария
            continue

        # Строчный комментарий // ...
        if c == '/' and i + 1 < n and src[i + 1] == '/':
            j = src.find('\n', i + 2)
            i = j if j != -1 else n
            result.append('\n')
            continue

        # Пробельные символы — схлопываем в один пробел
        if c in ' \t\r\n':
            result.append(' ')
            # Пропускаем все последующие пробелы
            while i + 1 < n and src[i + 1] in ' \t\r\n':
                i += 1
            i += 1
            continue

        result.append(c)
        i += 1

    minified = ''.join(result)
    # Убираем пробелы вокруг операторов/скобок (осторожно — не трогаем строки)
    minified = re.sub(r' *([\{\}\(\)\[\];,]) *', r'\1', minified)
    # Убираем пробел перед : в объектах но не в тернарных операторах
    # (простая эвристика — убираем пробел только после идентификатора)
    minified = re.sub(r'(\w) :', r'\1:', minified)
    minified = re.sub(r': (\S)', r':\1', minified)
    return minified.strip()


# ── Запуск ───────────────────────────────────────────────────────────────────

def process_file(input_path: str, output_path: str, mode: str):
    src = Path(input_path).read_text(encoding='utf-8')
    original_size = len(src.encode('utf-8'))

    if mode == 'css':
        out = minify_css(src)
    else:
        out = minify_js(src)

    Path(output_path).write_text(out, encoding='utf-8')
    minified_size = len(out.encode('utf-8'))
    saved = 100 - (minified_size / original_size * 100)
    print(f"  {Path(input_path).name} → {Path(output_path).name}  "
          f"{original_size/1024:.1f}KB → {minified_size/1024:.1f}KB  "
          f"(-{saved:.0f}%)")


if __name__ == '__main__':
    print("Минификация файлов...\n")

    css_files = [
        ('css/styles.css', 'css/styles.min.css'),
        ('css/focus-visible.css', 'css/focus-visible.min.css'),
        ('css/animations.css', 'css/animations.min.css'),
    ]

    js_files = [
        ('js/modal.js', 'js/modal.min.js'),
    ]

    for src, dst in css_files:
        if Path(src).exists():
            process_file(src, dst, 'css')
        else:
            print(f"  Пропущен (не найден): {src}")

    for src, dst in js_files:
        if Path(src).exists():
            process_file(src, dst, 'js')
        else:
            print(f"  Пропущен (не найден): {src}")

    print("\nГотово! Подключи .min файлы в index.html перед деплоем:")
    print("  <link rel=\"stylesheet\" href=\"./css/styles.min.css\" />")
    print("  <script src=\"./js/modal.min.js\"></script>")