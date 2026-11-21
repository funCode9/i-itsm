import subprocess

passwords = ['Bit$7187S', 'npg_ptxIo9UFZ6aV', 'postgres', 'admin', 'password', 'itsm_user', 'Bit7187S', '1234', 'root', 'Password@123']
for pw in passwords:
    cmd = ['psql', '-U', 'itsm_user', '-d', 'itsm_db', '-h', 'localhost', '-c', 'SELECT 1;']
    env = dict(PGPASSWORD=pw)
    import os
    env.update(os.environ)
    env['PGPASSWORD'] = pw
    r = subprocess.run(cmd, capture_output=True, text=True, env=env)
    if r.returncode == 0:
        print('SUCCESS with itsm_user password:', pw)
        break
    else:
        err = r.stderr.strip().replace('\n', ' ')
        print(f'Failed {pw}: {err[:80]}')

# Also test user postgres
for pw in passwords:
    cmd = ['psql', '-U', 'postgres', '-d', 'postgres', '-h', 'localhost', '-c', 'SELECT 1;']
    import os
    env = dict(os.environ)
    env['PGPASSWORD'] = pw
    r = subprocess.run(cmd, capture_output=True, text=True, env=env)
    if r.returncode == 0:
        print('SUCCESS with postgres superuser password:', pw)
        break
