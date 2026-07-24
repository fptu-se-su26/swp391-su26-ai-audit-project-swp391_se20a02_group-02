import paramiko

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('160.191.164.132', username='root', password='Vps@7d0209dbz', timeout=10)
    
    cmds = [
        "docker ps",
        "docker logs --tail 50 luxeway-backend"
    ]
    for cmd in cmds:
        print(f"--- RUNNING: {cmd} ---")
        stdin, stdout, stderr = ssh.exec_command(cmd)
        print("STDOUT:\n", stdout.read().decode())
        print("STDERR:\n", stderr.read().decode())
    ssh.close()
except Exception as e:
    print(f"Error: {e}")
