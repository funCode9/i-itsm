import os, subprocess, re

diag_dir = r"c:\dev\i-itsm\docs\project-report\diagrams"
files = ["system_architecture", "use_case_diagram", "class_diagram", "er_diagram", "sequence_diagram"]

html_parts = ["""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <script>mermaid.initialize({startOnLoad:true, theme: 'default'});</script>
</head>
<body>
"""]

for name in files:
    mmd_path = os.path.join(diag_dir, f"{name}.mmd")
    with open(mmd_path, "r", encoding="utf-8") as f:
        content = f.read()
    html_parts.append(f'<div id="{name}" class="mermaid">\n{content}\n</div>\n')

html_parts.append("</body></html>")

test_html_path = r"c:\dev\i-itsm\scratch\all_diagrams.html"
with open(test_html_path, "w", encoding="utf-8") as f:
    f.write("".join(html_parts))

cmd = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    "--headless",
    "--disable-gpu",
    "--virtual-time-budget=5000",
    "--dump-dom",
    test_html_path
]

res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
dom = res.stdout

for name in files:
    # find div with id="{name}" and extract svg inside
    pattern = rf'<div id="{name}"[^>]*>(.*?)</div>'
    m = re.search(pattern, dom, re.DOTALL)
    if m:
        div_content = m.group(1)
        svg_m = re.search(r'(<svg[^>]*>.*?</svg>)', div_content, re.DOTALL)
        if svg_m:
            svg_code = svg_m.group(1)
            svg_out_path = os.path.join(diag_dir, f"{name}.svg")
            with open(svg_out_path, "w", encoding="utf-8") as out_f:
                out_f.write(svg_code)
            print(f"Extracted {name}.svg ({len(svg_code)} chars)")
        else:
            print(f"Warning: No SVG found inside {name}")
    else:
        print(f"Warning: Div {name} not found in DOM")

print("Done exporting standalone SVGs.")
