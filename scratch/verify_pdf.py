import os, re

pdf_path = r"docs/project-report/I_ITSM_Project_Report.pdf"
html_path = r"scratch/report_for_pdf.html"

with open(pdf_path, "rb") as f:
    pdf_bytes = f.read()

pages = len(re.findall(rb'/Type\s*/Page[^s]', pdf_bytes))
size = len(pdf_bytes)

with open(html_path, "r", encoding="utf-8") as f:
    html = f.read()

svgs = html.count("figure-box svg-container")
imgs = html.count("data:image")

print(f"PDF File: {pdf_path}")
print(f"File Size: {size:,} bytes ({size / (1024*1024):.2f} MB)")
print(f"Page Count: {pages} pages")
print(f"Embedded SVG Diagrams: {svgs}")
print(f"Embedded Screenshot Images: {imgs}")
