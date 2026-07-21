import paramiko

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('160.191.164.132', username='root', password='Vps@7d0209dbz', timeout=10)
    
    commands = [
        "cd /opt/luxeway && git pull origin main",
        "cd /opt/luxeway && docker compose down",
        "docker volume rm luxeway_sqlserver-data",
        "cd /opt/luxeway && docker compose up -d"
    ]
    
    for cmd in commands:
        print(f"Executing: {cmd}")
        stdin, stdout, stderr = ssh.exec_command(cmd)
        
        # Wait for the command to finish
        exit_status = stdout.channel.recv_exit_status()
        
        out = stdout.read().decode('utf-8')
        err = stderr.read().decode('utf-8')
        
        if out: print(f"STDOUT: {out}")
        if err: print(f"STDERR: {err}")
        print(f"Exit Status: {exit_status}\n")
        
    ssh.close()
    print("Deployment and DB reset successful!")
except Exception as e:
    print(f"Error: {e}")
