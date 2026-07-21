with open('import-data.sql', 'r', encoding='utf-8') as f:
    content = f.read()
    
content = content.replace('$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
content = content.replace('.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')

with open('import-data.sql', 'w', encoding='utf-8') as f:
    f.write(content)
