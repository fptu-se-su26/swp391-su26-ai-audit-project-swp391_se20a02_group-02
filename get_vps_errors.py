import paramiko

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('160.191.164.132', username='root', password='Vps@7d0209dbz', timeout=10)
    
    cmd = "docker logs luxeway-backend 2>&1 | grep ERROR -A 5 -B 2 | tail -n 50"
    stdin, stdout, stderr = ssh.exec_command(cmd)
    
    print("STDOUT:", stdout.read().decode())
    print("STDERR:", stderr.read().decode())
    ssh.close()
except Exception as e:
    print(f"Error: {e}")
