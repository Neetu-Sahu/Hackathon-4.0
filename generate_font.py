import urllib.request
import base64
import os

url = "https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansDevanagari/NotoSansDevanagari-Regular.ttf"

req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        font_data = response.read()
    
    encoded = base64.b64encode(font_data).decode('utf-8')
    
    js_content = f"export const notoSansDevanagariBase64 = '{encoded}';\n"
    
    out_dir = r"d:\BPIS_2026\frontend\dashboard\src\assets"
    os.makedirs(out_dir, exist_ok=True)
    
    with open(os.path.join(out_dir, "fontBase64.js"), "w") as f:
        f.write(js_content)
    print("Successfully generated fontBase64.js")
except Exception as e:
    print("Error:", e)
