import sys
with open('src/app/pos/page.tsx', 'r', encoding='utf-8') as file:
    content = file.read()
content = content.replace("\\'", "'")
with open('src/app/pos/page.tsx', 'w', encoding='utf-8') as file:
    file.write(content)