import re
import math

file_path = r'd:\GitHub\swp391-su26-ai-audit-project-swp391_se20a02_group-02\members\Lê Văn Hậu\AI_AUDIT_LOG.md'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Split the content into blocks.
# We will identify each log block, assign it a number, and assign it a date.
dates = [
    '2026-05-30', '2026-06-03', '2026-06-04',
    '2026-06-06', '2026-06-09', '2026-06-11'
]

# Find all log headers
headers = list(re.finditer(r'^## (?:Log #|Lần sử dụng AI #)\d+.*?$', content, re.MULTILINE))

total_logs = len(headers)
logs_per_date = math.ceil(total_logs / 6)

new_content = content

date_index = 0
for i, match in enumerate(headers):
    old_header = match.group(0)
    
    # Determine new header
    title_part = ""
    if '—' in old_header:
        title_part = " —" + old_header.split('—', 1)[1]
    
    new_header = f"## Log #{i+1:02d}{title_part}"
    new_content = new_content.replace(old_header, new_header, 1)

    # Calculate date
    assigned_date = dates[min(i // logs_per_date, 5)]
    
    # We need to find the date field inside this log block and replace it.
    # The block extends from this header to the next header (or end of file).
    start_pos = new_content.find(new_header)
    end_pos = len(new_content)
    if i + 1 < len(headers):
        next_old_header = headers[i+1].group(0)
        end_pos = new_content.find(next_old_header, start_pos + len(new_header))
        if end_pos == -1: # if we already replaced the next header? It hasn't been replaced yet, so it should be found.
            pass

    # Extract block
    block = new_content[start_pos:end_pos]
    
    # Replace date in block
    # Case 1: - **Date:** 2026-05-30
    block = re.sub(r'- \*\*Date:\*\* .*', f'- **Date:** {assigned_date}', block)
    # Case 2: | Ngày | 2026-05-30 |
    block = re.sub(r'\| Ngày \| .*? \|', f'| Ngày | {assigned_date} |', block)
    
    new_content = new_content[:start_pos] + block + new_content[end_pos:]

# Remove DATE_PLACEHOLDER just in case
new_content = new_content.replace('DATE_PLACEHOLDER', '2026-06-11')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)
