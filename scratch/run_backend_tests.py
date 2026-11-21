import os, subprocess

env = dict(os.environ)
env["DB_PASSWORD"] = "Bit$7187S"

print("Running mvn test with DB_PASSWORD='Bit$7187S'...")
cmd = [r"C:\dev\i-itsm\backend\mvnw.cmd", "test"]
res = subprocess.run(cmd, cwd=r"C:\dev\i-itsm\backend", env=env, capture_output=True, text=True)

print("Maven test exit code:", res.returncode)
lines = res.stdout.splitlines()
for l in lines[-30:]:
    print(l)

if res.returncode != 0:
    print("\n--- STDERR ---")
    print(res.stderr[-1000:])
