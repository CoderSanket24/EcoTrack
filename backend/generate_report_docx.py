import pypandoc
import os
import sys

# Define paths
base_dir = os.path.dirname(os.path.abspath(__file__))
# report.md is one level up from backend
source_file = os.path.join(base_dir, '..', 'report.md')
output_file = os.path.join(base_dir, '..', 'EcoTrack_Report.docx')

print(f"Converting '{source_file}' to '{output_file}'...")

try:
    # Attempt conversion
    output = pypandoc.convert_file(
        source_file, 
        'docx', 
        outputfile=output_file,
        extra_args=['--reference-doc=custom-reference.docx'] if os.path.exists('custom-reference.docx') else []
    )
    print(f"Successfully created: {output_file}")
except OSError as e:
    print("Error: Pandoc not found. pypandoc-binary might not be installed correctly or added to path.")
    print(e)
except RuntimeError as e:
    print("Pandoc runtime error:")
    print(e)
except Exception as e:
    print(f"An unexpected error occurred: {e}")
