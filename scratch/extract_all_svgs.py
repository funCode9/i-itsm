import os, subprocess, re

diag_dir = r"c:\dev\i-itsm\docs\project-report\diagrams"
files = ["system_architecture", "use_case_diagram", "class_diagram", "er_diagram", "sequence_diagram"]

for name in files:
    test_html = rf"c:\dev\i-itsm\scratch\test_{name}.html"
    res = subprocess.run([
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        "--headless", "--disable-gpu", "--virtual-time-budget=3000", "--dump-dom",
        test_html
    ], capture_output=True, text=True, encoding="utf-8")
    
    m = re.search(r'(<svg[^>]*>.*?</svg>)', res.stdout, re.DOTALL)
    if m:
        svg_code = m.group(1)
        out_path = os.path.join(diag_dir, f"{name}.svg")
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(svg_code)
        print(f"Successfully generated {name}.svg ({len(svg_code)} chars)")
    else:
        print(f"Error: Could not extract SVG for {name}")

print("All diagrams processed.")
