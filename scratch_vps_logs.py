import paramiko
import os

hostname = '160.191.164.132'
username = 'root'
password = 'Vps@7d0209dbz'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print(f"Connecting to {hostname}...")
    client.connect(hostname, username=username, password=password, timeout=10)
    
    print("Fetching last 2000 lines of luxeway-backend logs...")
    # Get logs 
    stdin, stdout, stderr = client.exec_command('docker logs --tail 2000 luxeway-backend')
    logs = stdout.read().decode('utf-8')
    errs = stderr.read().decode('utf-8')
    
    all_logs = logs + "\n" + errs
    
    # Filter only relevant lines
    relevant = []
    for line in all_logs.split('\n'):
        if "error" in line.lower() or "exception" in line.lower() or "oauth" in line.lower() or "google" in line.lower():
            relevant.append(line)
            
    with open('vps_backend_logs.txt', 'w', encoding='utf-8') as f:
        f.write('\n'.join(relevant))
        
    print("Saved to vps_backend_logs.txt")

finally:
    client.close()
