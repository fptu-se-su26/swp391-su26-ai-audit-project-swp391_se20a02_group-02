import paramiko

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('160.191.164.132', username='root', password='Vps@7d0209dbz', timeout=10)
    
    cmd = "docker exec luxeway-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'YourStrongPassword123!' -C -d car_rental_platform -Q \"UPDATE users SET driver_license_status='VERIFIED', driving_license_verified=1, kyc_status='VERIFIED', kyc_verified=1, license_class='A1, B2' WHERE email='nguyen.van.a@gmail.com';\""
    stdin, stdout, stderr = ssh.exec_command(cmd)
    
    print("STDOUT:", stdout.read().decode())
    print("STDERR:", stderr.read().decode())
    ssh.close()
except Exception as e:
    print(f"Error: {e}")
