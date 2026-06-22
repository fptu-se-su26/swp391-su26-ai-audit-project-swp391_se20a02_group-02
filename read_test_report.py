import openpyxl

def read_all_rows(file_path):
    wb = openpyxl.load_workbook(file_path, data_only=False)
    ws = wb["Test Statistics"]
    
    for r in range(10, 42):
        row_data = []
        for c in range(2, 9):
            row_data.append(str(ws.cell(row=r, column=c).value))
        print(f"Row {r}: {row_data}")

if __name__ == "__main__":
    read_all_rows("Report5_TestReport.xlsx")
