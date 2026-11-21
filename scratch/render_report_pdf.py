import os, re, base64, subprocess

md_path = r"c:\dev\i-itsm\docs\project-report\I_ITSM_Project_Report.md"
pdf_path = r"c:\dev\i-itsm\docs\project-report\I_ITSM_Project_Report.pdf"
diag_dir = r"c:\dev\i-itsm\docs\project-report\diagrams"
screen_dir = r"c:\dev\i-itsm\docs\project-report\screenshots"
html_path = r"c:\dev\i-itsm\scratch\report_for_pdf.html"

with open(md_path, "r", encoding="utf-8") as f:
    md_content = f.read()

# Helper to load image as base64
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
    # clean up svg for inline inclusion
    svg = re.sub(r'<\?xml[^>]*\?>', '', svg)
    return svg

# Convert markdown to basic HTML sections
# Handle code blocks
code_blocks = {}
def save_code_block(match):
    idx = len(code_blocks)
    lang = match.group(1) or ""
    code = match.group(2)
    # escape html in code
    code_esc = code.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    code_blocks[f"__CODE_{idx}__"] = f'<pre><code class="language-{lang}">{code_esc}</code></pre>'
    return f"__CODE_{idx}__"

md_content = re.sub(r'```(\w+)?\n(.*?)```', save_code_block, md_content, flags=re.DOTALL)

# Handle markdown tables
def parse_markdown_table(match):
    table_text = match.group(0).strip()
    lines = [l.strip() for l in table_text.split('\n') if l.strip()]
    if len(lines) < 2:
        return table_text
    
    html = ['<div class="table-container"><table>']
    # Header
    headers = [c.strip() for c in lines[0].split('|')[1:-1]]
    html.append('<thead><tr>')
    for h in headers:
        html.append(f'<th>{h}</th>')
    html.append('</tr></thead><tbody>')
    
    # Rows
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

# Handle bold & italic
md_content = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', md_content)
md_content = re.sub(r'\*(.+?)\*', r'<em>\1</em>', md_content)

# Handle math inline $...$
md_content = re.sub(r'\$(.+?)\$', r'<span class="math">\1</span>', md_content)

# Handle images
def replace_img(match):
    alt = match.group(1)
    src = match.group(2)
    # resolve image path
    local_img_path = os.path.join(r"c:\dev\i-itsm\docs\project-report", src)
    if os.path.exists(local_img_path):
        b64 = get_image_base64(local_img_path)
        return f'<div class="figure-box"><img src="{b64}" alt="{alt}"/><div class="caption">{alt}</div></div>'
    return f'<div class="caption">Image: {alt}</div>'

md_content = re.sub(r'!\[(.*?)\]\((.*?)\)', replace_img, md_content)

# Restore code blocks
for placeholder, block in code_blocks.items():
    md_content = md_content.replace(placeholder, block)

# Handle paragraphs and page breaks
paragraphs = md_content.split('\n\n')
formatted_p = []
for p in paragraphs:
    p = p.strip()
    if not p:
        continue
    if p.startswith('<h') or p.startswith('<div') or p.startswith('<pre') or p.startswith('<hr') or p.startswith('<table'):
        formatted_p.append(p)
    elif p.startswith('- ') or p.startswith('* '):
        # List
        items = [f'<li>{line[2:].strip()}</li>' for line in p.split('\n') if line.strip().startswith(('- ', '* '))]
        formatted_p.append(f'<ul>{"".join(items)}</ul>')
    elif re.match(r'^\d+\. ', p):
        items = [f'<li>{re.sub(r"^\d+\.\s*", "", line).strip()}</li>' for line in p.split('\n') if re.match(r'^\d+\. ', line.strip())]
        formatted_p.append(f'<ol>{"".join(items)}</ol>')
    else:
        formatted_p.append(f'<p>{p}</p>')

body_html = '\n'.join(formatted_p)

# Embed vector diagrams into appropriate chapters
# We will inject the SVGs right after references to Figures
svg_arch = get_svg_content(os.path.join(diag_dir, "system_architecture.svg"))
svg_seq = get_svg_content(os.path.join(diag_dir, "sequence_diagram.svg"))
svg_uc = get_svg_content(os.path.join(diag_dir, "use_case_diagram.svg"))
svg_class = get_svg_content(os.path.join(diag_dir, "class_diagram.svg"))
svg_er = get_svg_content(os.path.join(diag_dir, "er_diagram.svg"))

def inject_diagram(html, placeholder, svg_code, fig_num, caption):
    if not svg_code:
        return html
    block = f'''
    <div class="figure-box svg-container">
      {svg_code}
      <div class="caption"><strong>Figure {fig_num}:</strong> {caption}</div>
    </div>
    '''
    return html.replace(placeholder, block)

body_html = inject_diagram(body_html, "Please inspect Figure 4.1 (`docs/project-report/diagrams/system_architecture.svg`) for the complete vector architectural blueprint showing component interconnects.", svg_arch, "4.1", "I-ITSM Four-Tier Layered System Architecture Diagram")
body_html = inject_diagram(body_html, "Please refer to Figure 4.2 (`docs/project-report/diagrams/sequence_diagram.svg`), which illustrates the end-to-end processing sequence from incident submission, priority calculation, strategy assignment, observer notifications, technician acknowledgment, RCA investigation, resolution, and closure.", svg_seq, "4.2", "End-to-End Incident Lifecycle Processing Sequence Diagram")
body_html = inject_diagram(body_html, "<li><strong>Figure 5.1:</strong> Use Case Diagram (`docs/project-report/diagrams/use_case_diagram.svg`)</li>", svg_uc, "5.1", "Unified Modeling Language (UML) Use Case Diagram")
body_html = inject_diagram(body_html, "<li><strong>Figure 5.2:</strong> Comprehensive Class Diagram (`docs/project-report/diagrams/class_diagram.svg`)</li>", svg_class, "5.2", "Comprehensive Object-Oriented Domain Class Diagram")
body_html = inject_diagram(body_html, "Please inspect Figure 6.1 (`docs/project-report/diagrams/er_diagram.svg`) for the complete Crow's Foot ER diagram depicting entities, attributes, primary keys, foreign keys, and cardinalities.", svg_er, "6.1", "Entity-Relationship (ER) Diagram for the 15 Relational Tables")

# Full HTML template with academic styling
full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>I-ITSM Project Report - CS F213 / MAC F212</title>
  <style>
    @page {{
      size: A4;
      margin: 22mm 18mm 22mm 18mm;
      @bottom-right {{
        content: counter(page);
        font-family: 'Segoe UI', Arial, sans-serif;
        font-size: 9pt;
        color: #64748b;
      }}
      @top-right {{
        content: "I-ITSM Academic Project Report — CS F213 / MAC F212";
        font-family: 'Segoe UI', Arial, sans-serif;
        font-size: 8pt;
        color: #94a3b8;
      }}
    }}

    body {{
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 10.5pt;
      line-height: 1.55;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }}

    /* Cover Page */
    .cover-page {{
      text-align: center;
      padding-top: 40px;
      padding-bottom: 40px;
      page-break-after: always;
    }}

    .cover-title {{
      font-size: 23pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin-bottom: 8px;
      line-height: 1.25;
      text-transform: uppercase;
    }}

    .cover-subtitle {{
      font-size: 12.5pt;
      font-weight: 500;
      color: #0284c7;
      margin-bottom: 30px;
      line-height: 1.4;
    }}

    .cover-badge {{
      display: inline-block;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 10pt;
      font-weight: 600;
      color: #334155;
      margin-bottom: 35px;
    }}

    .cover-table {{
      width: 100%;
      margin: 30px auto;
      border-collapse: collapse;
      text-align: left;
    }}

    .cover-table th {{
      background: #1e293b;
      color: #ffffff;
      padding: 8px 12px;
      font-size: 9.5pt;
    }}

    .cover-table td {{
      padding: 8px 12px;
      border: 1px solid #e2e8f0;
      font-size: 9.5pt;
    }}

    /* Typography */
    h1 {{
      font-size: 16pt;
      font-weight: 800;
      color: #0f172a;
      border-bottom: 2px solid #0284c7;
      padding-bottom: 6px;
      margin-top: 32px;
      margin-bottom: 16px;
      page-break-before: always;
      text-transform: uppercase;
      letter-spacing: -0.01em;
    }}

    /* Do not break before first h1 */
    .cover-page + * h1:first-of-type {{
      page-break-before: avoid;
    }}

    h2 {{
      font-size: 13pt;
      font-weight: 700;
      color: #1e293b;
      margin-top: 24px;
      margin-bottom: 10px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
    }}

    h3 {{
      font-size: 11pt;
      font-weight: 700;
      color: #334155;
      margin-top: 18px;
      margin-bottom: 8px;
    }}

    h4 {{
      font-size: 10.5pt;
      font-weight: 600;
      color: #475569;
      margin-top: 14px;
      margin-bottom: 6px;
    }}

    p {{
      margin-top: 0;
      margin-bottom: 10px;
      text-align: justify;
    }}

    ul, ol {{
      margin-top: 4px;
      margin-bottom: 12px;
      padding-left: 24px;
    }}

    li {{
      margin-bottom: 4px;
      text-align: justify;
    }}

    /* Tables */
    .table-container {{
      width: 100%;
      margin: 14px 0;
      page-break-inside: avoid;
    }}

    table {{
      width: 100%;
      border-collapse: collapse;
      font-size: 8.5pt;
      line-height: 1.4;
      background: #ffffff;
    }}

    th {{
      background: #1e293b;
      color: #f8fafc;
      font-weight: 700;
      text-align: left;
      padding: 7px 9px;
      border: 1px solid #334155;
    }}

    td {{
      padding: 6px 9px;
      border: 1px solid #cbd5e1;
      vertical-align: top;
    }}

    tbody tr:nth-child(even) {{
      background: #f8fafc;
    }}

    /* Code Blocks */
    pre {{
      background: #0f172a;
      color: #f1f5f9;
      padding: 12px 14px;
      border-radius: 6px;
      font-family: 'Consolas', 'JetBrains Mono', Courier, monospace;
      font-size: 8.2pt;
      line-height: 1.45;
      overflow-x: auto;
      margin: 12px 0;
      page-break-inside: avoid;
      border: 1px solid #334155;
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

    /* Math */
    .math {{
      font-family: 'Cambria Math', 'Times New Roman', serif;
      font-style: italic;
      color: #0369a1;
      font-weight: 600;
    }}

    /* Figures and Diagrams */
    .figure-box {{
      text-align: center;
      margin: 18px auto;
      page-break-inside: avoid;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }}

    .figure-box img {{
      max-width: 95%;
      height: auto;
      max-height: 480px;
      border-radius: 4px;
      border: 1px solid #cbd5e1;
    }}

    .svg-container svg {{
      max-width: 98%;
      height: auto;
      max-height: 520px;
    }}

    .caption {{
      font-size: 8.8pt;
      font-weight: 500;
      color: #475569;
      margin-top: 8px;
      text-align: center;
    }}

    hr {{
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 20px 0;
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

print("Generated report_for_pdf.html successfully. Now invoking Google Chrome headless to compile PDF...")

# Call Chrome headless to print to PDF
cmd = [
    "powershell",
    "-Command",
    f"Start-Process -FilePath 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' -ArgumentList '--headless', '--disable-gpu', '--virtual-time-budget=5000', '--run-all-compositor-stages-before-draw', '--print-to-pdf={pdf_path}', '{html_path}' -Wait -PassThru"
]

res = subprocess.run(cmd, capture_output=True, text=True)
print("Chrome execution finished with exit code:", res.returncode)

if os.path.exists(pdf_path):
    size = os.path.getsize(pdf_path)
    print(f"SUCCESS! Generated {pdf_path} ({size} bytes)")
else:
    print("Error: PDF file was not created!")
