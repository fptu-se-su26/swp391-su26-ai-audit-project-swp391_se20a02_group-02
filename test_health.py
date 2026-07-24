import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8')
try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('160.191.164.132', username='root', password='Vps@7d0209dbz', timeout=10)
    
    cmds = [
        "curl -i -s https://luxeway.io.vn/api/v1/health",
        "curl -i -s https://luxeway.io.vn/"
    ]
    for cmd in cmds:
        print(f"--- RUNNING: {cmd} ---")
        stdin, stdout, stderr = ssh.exec_command(cmd)
        print("STDOUT:\n", stdout.read().decode('utf-8', errors='replace')[:500])
        print("STDERR:\n", stderr.read().decode('utf-8', errors='replace'))
    ssh.close()
except Exception as e:
    print(f"Error: {e}")
