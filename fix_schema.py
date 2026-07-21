import re

with open('import-data.sql', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if line.startswith('INSERT INTO bookings'):
        # We need to remove the column names from the brackets and the corresponding NULL or 0.00 values.
        # But wait, it's easier to just rebuild the line or use regex
        
        # columns to remove
        cols_to_remove = ['[dropoff_lat]', '[dropoff_lng]', '[estimated_time]', '[pickup_lat]', '[pickup_lng]', '[route_distance]', '[route_polyline]']
        
        # extract columns part and values part
        match = re.search(r"INSERT INTO bookings \((.*?)\) VALUES \((.*?)\);", line)
        if match:
            cols_str = match.group(1)
            vals_str = match.group(2)
            
            # split by comma (respecting quotes in values is tricky, but values for these columns are all NULL anyway)
            cols = [c.strip() for c in cols_str.split(',')]
            
            # For values, we can split by comma. But strings might contain commas.
            # However, looking at the data, notes and addresses might contain commas. 
            # A safer way: just use the exact column indices to remove.
            
            # Let's split using a simple regex for CSV
            vals = []
            curr = ''
            in_quotes = False
            for char in vals_str:
                if char == "'":
                    in_quotes = not in_quotes
                if char == ',' and not in_quotes:
                    vals.append(curr.strip())
                    curr = ''
                else:
                    curr += char
            vals.append(curr.strip())
            
            new_cols = []
            new_vals = []
            
            for i, col in enumerate(cols):
                if col not in cols_to_remove:
                    new_cols.append(col)
                    if i < len(vals):
                        new_vals.append(vals[i])
            
            new_line = "INSERT INTO bookings (" + ", ".join(new_cols) + ") VALUES (" + ", ".join(new_vals) + ");\n"
            new_lines.append(new_line)
        else:
            new_lines.append(line)
    else:
        new_lines.append(line)

with open('import-data.sql', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
