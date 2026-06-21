import re

file_path = r'd:\GitHub\swp391-su26-ai-audit-project-swp391_se20a02_group-02\members\Lê Văn Hậu\AI_AUDIT_LOG.md'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

dates = [
    '2026-05-30', '2026-06-03', '2026-06-04',
    '2026-06-06', '2026-06-09', '2026-06-11'
]

# We want to sequentially replace every ## Log #... and assign a date.
# First, let's normalize all of them to just ## Log #PLACEHOLDER so we don't mess up with old numbers.
# Actually, just use a counter.
counter = [0]
def header_replacer(match):
    counter[0] += 1
    old_header = match.group(0)
    # preserve title if exists
    title = ""
    if "—" in old_header:
        title = " —" + old_header.split("—", 1)[1]
    
    return f"## Log #{counter[0]:02d}{title}"

content = re.sub(r'^## (?:Log #|Lần sử dụng AI #)\d+.*?$', header_replacer, content, flags=re.MULTILINE)

# Now we have exactly sequential ## Log #01 to ## Log #24.
# We need to assign dates. There are 24 logs. 4 logs per date.
# We will iterate through the file and replace Date fields.
# Let's split the content by ## Log #
blocks = re.split(r'^(?=## Log #)', content, flags=re.MULTILINE)

# The first block is everything before ## Log #01
new_blocks = [blocks[0]]

for i in range(1, len(blocks)):
    block = blocks[i]
    log_index = i - 1 # 0 to 23
    assigned_date = dates[min(log_index // 4, 5)]
    
    # Replace the date inside this block
    # Match - **Date:** ...
    block = re.sub(r'- \*\*Date:\*\* .*', f'- **Date:** {assigned_date}', block)
    # Match | Ngày | ... |
    block = re.sub(r'\| Ngày \| .*? \|', f'| Ngày | {assigned_date} |', block)
    
    new_blocks.append(block)

new_content = "".join(new_blocks)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)
