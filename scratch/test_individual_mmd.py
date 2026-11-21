import subprocess, re

for name in ["system_architecture", "use_case_diagram", "class_diagram", "er_diagram", "sequence_diagram"]:
    with open(f"docs/project-report/diagrams/{name}.mmd", "r", encoding="utf-8") as f:
        content = f.read()
    
    html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <script>mermaid.initialize({{startOnLoad:true, theme: 'default'}});</script>
</head>
<body>
<div class="mermaid">
{content}
</div>
</body>
</html>"""
    with open(f"scratch/test_{name}.html", "w", encoding="utf-8") as f:
        f.write(html)
    
    res = subprocess.run([
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        "--headless", "--disable-gpu", "--virtual-time-budget=3000", "--dump-dom",
        f"c:\\dev\\i-itsm\\scratch\\test_{name}.html"
    ], capture_output=True, text=True, encoding="utf-8")
    
    has_svg = "<svg" in res.stdout
    print(f"{name}: has_svg={has_svg}")
    if not has_svg:
        # print error if any in output
        print("  Preview:", res.stdout[-400:])
