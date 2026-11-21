import os

out_dir = r"c:\dev\i-itsm\docs\project-report"
os.makedirs(out_dir, exist_ok=True)
md_path = os.path.join(out_dir, "I_ITSM_Project_Report.md")

print("Writing full report...")
