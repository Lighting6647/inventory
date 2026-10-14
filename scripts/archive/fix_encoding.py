import sys

files = ['src/app/promotions/page.tsx', 'src/lib/lineNotify.ts', 'src/app/pos/page.tsx']
for f in files:
    with open(f, 'r', encoding='utf-8-sig') as file:
        content = file.read()
    content = content.replace('\\${', '${')
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)