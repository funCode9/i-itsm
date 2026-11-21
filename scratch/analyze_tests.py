import os
import re

total = 0
for root, dirs, files in os.walk('backend/src/test/java'):
    for f in files:
        if f.endswith('.java'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as fh:
                content = fh.read()
            # find @Test methods
            matches = re.findall(r'(@DisplayName\("([^"]+)"\)\s+)?@Test\s+void\s+(\w+)|@Test\s+(@DisplayName\("([^"]+)"\)\s+)?void\s+(\w+)|@Test\s+public void\s+(\w+)', content)
            print(f"=== {f} ===")
            for m in matches:
                total += 1
                disp = m[1] or m[4] or ""
                meth = m[2] or m[5] or m[6] or ""
                print(f"  [{meth}] {disp}")
print(f"Total tests: {total}")
