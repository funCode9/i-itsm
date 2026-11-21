import os, subprocess

env = dict(os.environ)
env["DB_PASSWORD"] = "Bit$7187S"

print("Running LiveWorkflowsVerificationTest...")
cmd = [r"C:\dev\i-itsm\backend\mvnw.cmd", "test", "-Dtest=LiveWorkflowsVerificationTest"]
res = subprocess.run(cmd, cwd=r"C:\dev\i-itsm\backend", env=env, capture_output=True, text=True)

print("Exit code:", res.returncode)
lines = res.stdout.splitlines()
for l in lines:
    if any(k in l for k in ["=== EXECUTING", "[WF1]", "[WF2]", "[WF3]", "=== WORKFLOW", "Tests run:", "BUILD SUCCESS", "BUILD FAILURE"]):
        print(l)

if res.returncode != 0:
    print("\n--- ERROR LOG ---")
    print("\n".join(lines[-40:]))
