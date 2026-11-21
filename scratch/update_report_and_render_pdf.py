import os, re, base64, subprocess

md_path = r"c:\dev\i-itsm\docs\project-report\I_ITSM_Project_Report.md"
pdf_path = r"c:\dev\i-itsm\docs\project-report\I_ITSM_Project_Report.pdf"
diag_dir = r"c:\dev\i-itsm\docs\project-report\diagrams"
screen_dir = r"c:\dev\i-itsm\docs\project-report\screenshots"
html_path = r"c:\dev\i-itsm\scratch\report_for_pdf.html"

# 1. Update markdown with standard image tags for SVGs
with open(md_path, "r", encoding="utf-8") as f:
    text = f.read()

# Replace text references with clean markdown image tags
text = text.replace(
    "Please inspect Figure 4.1 (`docs/project-report/diagrams/system_architecture.svg`) for the complete vector architectural blueprint showing component interconnects.",
    "![Figure 4.1: I-ITSM Four-Tier Layered System Architecture Diagram](diagrams/system_architecture.svg)"
)
text = text.replace(
    "Please refer to Figure 4.2 (`docs/project-report/diagrams/sequence_diagram.svg`), which illustrates the end-to-end processing sequence from incident submission, priority calculation, strategy assignment, observer notifications, technician acknowledgment, RCA investigation, resolution, and closure.",
    "![Figure 4.2: End-to-End Incident Lifecycle Processing Sequence Diagram](diagrams/sequence_diagram.svg)"
)
text = text.replace(
    "- <li><strong>Figure 5.1:</strong> Use Case Diagram (`docs/project-report/diagrams/use_case_diagram.svg`)</li>\n- <li><strong>Figure 5.2:</strong> Comprehensive Class Diagram (`docs/project-report/diagrams/class_diagram.svg`)</li>",
    "![Figure 5.1: Unified Modeling Language (UML) Use Case Diagram](diagrams/use_case_diagram.svg)\n\n![Figure 5.2: Comprehensive Object-Oriented Domain Class Diagram](diagrams/class_diagram.svg)"
)
text = text.replace(
    "Please inspect Figure 6.1 (`docs/project-report/diagrams/er_diagram.svg`) for the complete Crow's Foot ER diagram depicting entities, attributes, primary keys, foreign keys, and cardinalities.",
    "![Figure 6.1: Entity-Relationship (ER) Diagram for the 15 Relational Tables](diagrams/er_diagram.svg)"
)

# Fix any LaTeX escape issues in markdown
text = text.replace("\\text", "\\text").replace("\\times", "\\times")

with open(md_path, "w", encoding="utf-8") as f:
    f.write(text)

print(f"Updated {md_path} with uniform diagram tags.")

# 2. Build HTML
def get_image_base64(path):
    if not os.path.exists(path):
        return ""
    ext = os.path.splitext(path)[1].lower().replace(".", "")
    if ext == "jpg": ext = "jpeg"
    with open(path, "rb") as f:
        data = base64.b64encode(f.read()).decode("utf-8")
    return f"data:image/{ext};base64,{data}"

def get_svg_content(path):
    if not os.path.exists(path):
        return ""
    with open(path, "r", encoding="utf-8") as f:
        svg = f.read()
    svg = re.sub(r'<\?xml[^>]*\?>', '', svg)
    svg = re.sub(r'<!DOCTYPE[^>]*>', '', svg)
    return svg

md_content = text

# Handle code blocks
code_blocks = {}
def save_code_block(match):
    idx = len(code_blocks)
    lang = match.group(1) or ""
    code = match.group(2)
    code_esc = code.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    code_blocks[f"__CODE_{idx}__"] = f'<pre><code class="language-{lang}">{code_esc}</code></pre>'
    return f"__CODE_{idx}__"

md_content = re.sub(r'```(\w+)?\n(.*?)```', save_code_block, md_content, flags=re.DOTALL)

# Handle tables
def parse_markdown_table(match):
    table_text = match.group(0).strip()
    lines = [l.strip() for l in table_text.split('\n') if l.strip()]
    if len(lines) < 2:
        return table_text
    
    html = ['<div class="table-container"><table>']
    headers = [c.strip() for c in lines[0].split('|')[1:-1]]
    html.append('<thead><tr>')
    for h in headers:
        html.append(f'<th>{h}</th>')
    html.append('</tr></thead><tbody>')
    
    for row in lines[2:]:
        cols = [c.strip() for c in row.split('|')[1:-1]]
        html.append('<tr>')
        for c in cols:
            html.append(f'<td>{c}</td>')
        html.append('</tr>')
    html.append('</tbody></table></div>')
    return '\n'.join(html)

table_regex = re.compile(r'(\|[^\n]+\|\n\|[-:| ]+\|\n(?:\|[^\n]+\|\n?)+)')
md_content = table_regex.sub(parse_markdown_table, md_content)

# Handle headings
md_content = re.sub(r'^# (.+)$', r'<h1>\1</h1>', md_content, flags=re.MULTILINE)
md_content = re.sub(r'^## (.+)$', r'<h2>\1</h2>', md_content, flags=re.MULTILINE)
md_content = re.sub(r'^### (.+)$', r'<h3>\1</h3>', md_content, flags=re.MULTILINE)
md_content = re.sub(r'^#### (.+)$', r'<h4>\1</h4>', md_content, flags=re.MULTILINE)

# Bold & italic
md_content = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', md_content)
md_content = re.sub(r'\*(.+?)\*', r'<em>\1</em>', md_content)

# Math inline & display
md_content = re.sub(r'\$\$(.+?)\$\$', r'<div class="math-display">\1</div>', md_content, flags=re.DOTALL)
md_content = re.sub(r'\$(.+?)\$', r'<span class="math">\1</span>', md_content)

# Images and SVGs
def replace_img(match):
    alt = match.group(1)
    src = match.group(2)
    local_img_path = os.path.join(r"c:\dev\i-itsm\docs\project-report", src)
    if os.path.exists(local_img_path):
        if local_img_path.lower().endswith(".svg"):
            svg_code = get_svg_content(local_img_path)
            return f'<div class="figure-box svg-container">{svg_code}<div class="caption"><strong>{alt}</strong></div></div>'
        else:
            b64 = get_image_base64(local_img_path)
            return f'<div class="figure-box"><img src="{b64}" alt="{alt}"/><div class="caption"><strong>{alt}</strong></div></div>'
    return f'<div class="caption">Image: {alt}</div>'

md_content = re.sub(r'!\[(.*?)\]\((.*?)\)', replace_img, md_content)

# Restore code blocks
for placeholder, block in code_blocks.items():
    md_content = md_content.replace(placeholder, block)

# Format paragraphs
paragraphs = md_content.split('\n\n')
formatted_p = []
for p in paragraphs:
    p = p.strip()
    if not p:
        continue
    if p.startswith('<h') or p.startswith('<div') or p.startswith('<pre') or p.startswith('<hr') or p.startswith('<table'):
        formatted_p.append(p)
    elif p.startswith('- ') or p.startswith('* '):
        items = [f'<li>{line[2:].strip()}</li>' for line in p.split('\n') if line.strip().startswith(('- ', '* '))]
        formatted_p.append(f'<ul>{"".join(items)}</ul>')
    elif re.match(r'^\d+\. ', p):
        items = [f'<li>{re.sub(r"^\d+\.\s*", "", line).strip()}</li>' for line in p.split('\n') if re.match(r'^\d+\. ', line.strip())]
        formatted_p.append(f'<ol>{"".join(items)}</ol>')
    else:
        formatted_p.append(f'<p>{p}</p>')

body_html = '\n'.join(formatted_p)

# HTML document with styling
full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>I-ITSM Academic Project Report</title>
  <style>
    @page {{
      size: A4;
      margin: 20mm 18mm 20mm 18mm;
      @bottom-right {{
        content: counter(page);
        font-family: 'Segoe UI', Arial, sans-serif;
        font-size: 8.5pt;
        color: #64748b;
      }}
      @top-right {{
        content: "I-ITSM Project Report — CS F213 / MAC F212";
        font-family: 'Segoe UI', Arial, sans-serif;
        font-size: 8pt;
        color: #94a3b8;
      }}
    }}

    body {{
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.5;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }}

    h1 {{
      font-size: 15pt;
      font-weight: 800;
      color: #0f172a;
      border-bottom: 2px solid #0284c7;
      padding-bottom: 5px;
      margin-top: 26px;
      margin-bottom: 14px;
      page-break-before: always;
      text-transform: uppercase;
      letter-spacing: -0.01em;
    }}

    /* Do not break before title h1 */
    h1:first-of-type {{
      page-break-before: avoid;
    }}

    h2 {{
      font-size: 12.5pt;
      font-weight: 700;
      color: #1e293b;
      margin-top: 20px;
      margin-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
    }}

    h3 {{
      font-size: 10.5pt;
      font-weight: 700;
      color: #334155;
      margin-top: 14px;
      margin-bottom: 6px;
    }}

    p {{
      margin-top: 0;
      margin-bottom: 8px;
      text-align: justify;
    }}

    ul, ol {{
      margin-top: 4px;
      margin-bottom: 10px;
      padding-left: 22px;
    }}

    li {{
      margin-bottom: 3px;
      text-align: justify;
    }}

    /* Table styling */
    .table-container {{
      width: 100%;
      margin: 12px 0;
      page-break-inside: avoid;
    }}

    table {{
      width: 100%;
      border-collapse: collapse;
      font-size: 8.5pt;
      margin: 0 auto;
    }}

    th {{
      background: #f1f5f9;
      color: #0f172a;
      font-weight: 700;
      text-align: left;
      padding: 6px 10px;
      border: 1px solid #cbd5e1;
    }}

    td {{
      padding: 5px 10px;
      border: 1px solid #e2e8f0;
      vertical-align: top;
    }}

    tr:nth-child(even) td {{
      background: #f8fafc;
    }}

    /* Code blocks */
    pre {{
      background: #0f172a;
      color: #f8fafc;
      padding: 10px 14px;
      border-radius: 5px;
      font-family: 'Consolas', 'JetBrains Mono', Courier, monospace;
      font-size: 8pt;
      line-height: 1.4;
      overflow-x: auto;
      page-break-inside: avoid;
      margin: 10px 0;
    }}

    code {{
      font-family: 'Consolas', 'JetBrains Mono', Courier, monospace;
      font-size: 8.5pt;
      background: #f1f5f9;
      color: #0f172a;
      padding: 1px 4px;
      border-radius: 3px;
      border: 1px solid #e2e8f0;
    }}

    pre code {{
      background: transparent;
      color: inherit;
      padding: 0;
      border: none;
    }}

    .math {{
      font-family: 'Cambria Math', 'Times New Roman', serif;
      font-style: italic;
      color: #0369a1;
      font-weight: 600;
    }}

    .math-display {{
      text-align: center;
      margin: 10px 0;
      font-family: 'Cambria Math', 'Times New Roman', serif;
      font-size: 11pt;
      color: #0369a1;
      font-weight: 600;
    }}

    /* Figures and Diagrams */
    .figure-box {{
      text-align: center;
      margin: 14px auto;
      page-break-inside: avoid;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }}

    .figure-box img {{
      max-width: 95%;
      height: auto;
      max-height: 420px;
      border-radius: 4px;
      border: 1px solid #cbd5e1;
    }}

    .svg-container svg {{
      max-width: 98%;
      height: auto;
      max-height: 480px;
    }}

    .caption {{
      font-size: 8.5pt;
      font-weight: 600;
      color: #475569;
      margin-top: 6px;
      text-align: center;
    }}

    hr {{
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 16px 0;
    }}
  </style>
</head>
<body>

{body_html}

</body>
</html>
"""

with open(html_path, "w", encoding="utf-8") as f:
    f.write(full_html)

print("HTML generated. Compiling PDF via Chrome headless...")

cmd = [
    "powershell",
    "-Command",
    f"Start-Process -FilePath 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' -ArgumentList '--headless', '--disable-gpu', '--virtual-time-budget=5000', '--run-all-compositor-stages-before-draw', '--print-to-pdf={pdf_path}', '{html_path}' -Wait -PassThru"
]

res = subprocess.run(cmd, capture_output=True, text=True)
print("Chrome execution finished with exit code:", res.returncode)

if os.path.exists(pdf_path):
    size = os.path.getsize(pdf_path)
    print(f"SUCCESS! Generated {pdf_path} ({size:,} bytes)")
else:
    print("Error: PDF file was not created!")
