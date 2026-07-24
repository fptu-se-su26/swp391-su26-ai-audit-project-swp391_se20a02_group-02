import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8')
try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('160.191.164.132', username='root', password='Vps@7d0209dbz', timeout=10)
    
    token = "eyJhbGciOiJIUzUxMiJ9.eyJwcmVmZXJyZWRMYW5ndWFnZSI6ImVuIiwicm9sZSI6IkNVU1RPTUVSIiwidXNlcklkIjoiNzAxYzBhN2ItYjBiMS00NTkzLTgyMDktZDMzNWIyYWMzNzU2Iiwic3ViIjoidGh1dHJhbmcyNjUzMDFAZ21haWwuY29tIiwiaWF0IjoxNzg0Nzc4MTg0LCJleHAiOjE3ODQ4NjQ1ODR9.4EJ71S9Kb6IQ9ZWFwT9FKBZLhxbCuAwHzrVzC_T6YSDGZ3OSr5h-9YtUroTP7khcZ-IQKPVOcenb-4mykRufww"
    cmd = f"curl -i -s -H 'Authorization: Bearer {token}' http://localhost:8080/api/v1/auth/me"
    print(f"--- RUNNING: {cmd} ---")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    print("STDOUT:\n", stdout.read().decode('utf-8', errors='replace'))
    print("STDERR:\n", stderr.read().decode('utf-8', errors='replace'))
    ssh.close()
except Exception as e:
    print(f"Error: {e}")
