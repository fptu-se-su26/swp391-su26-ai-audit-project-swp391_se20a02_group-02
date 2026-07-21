import pyodbc

server = '160.191.164.132,1433'
database = 'car_rental_platform'
username = 'sa'
password = 'SqlserverPass123!'
driver = '{ODBC Driver 17 for SQL Server}'

try:
    conn = pyodbc.connect('DRIVER='+driver+';SERVER='+server+';DATABASE='+database+';UID='+username+';PWD='+ password)
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, password_hash, role FROM users WHERE email='nguyen.van.a@gmail.com' OR email='admin@luxeway.vn'")
    for row in cursor.fetchall():
        print(row)
    conn.close()
except Exception as e:
    print(f'Error: {e}')
