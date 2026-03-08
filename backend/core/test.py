
from pathlib import Path
import os

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parent.parent.parent / '.env')
except ImportError:
    pass

print(f"{os.getenv('EMAIL_HOST_USER')}")
print(os.getenv('EMAIL_HOST_PASSWORD'))
