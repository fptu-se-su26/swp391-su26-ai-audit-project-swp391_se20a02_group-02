import pandas as pd
import json

try:
    file_path = "Report2_UnitTest_Backup.xlsx"
    df = pd.read_excel(file_path, sheet_name="VTFP-02", header=None)
    
    result = {"rows": {}}
    for i in range(8, min(50, len(df))):
        row_data = [str(x) if pd.notna(x) else "" for x in df.iloc[i]]
        # only keep first 5 columns to avoid clutter
        result["rows"][i] = row_data[:5]
            
    print(json.dumps(result, indent=2))
except Exception as e:
    print(f"Error: {e}")
