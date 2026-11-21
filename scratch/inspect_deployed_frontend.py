import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request('https://i-itsm-frontend.onrender.com', headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, context=ctx) as r:
    html = r.read().decode('utf-8')

js_files = re.findall(r'src="(/assets/[^"]+\.js)"', html)
print('Found JS files in deployed index.html:', js_files)

for js in js_files:
    js_url = 'https://i-itsm-frontend.onrender.com' + js
    req_js = urllib.request.Request(js_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req_js, context=ctx) as r_js:
        content = r_js.read().decode('utf-8')
        print(f"Checking {js} ({len(content)} chars)")
        if 'onrender.com' in content:
            print("  --> Contains 'onrender.com'!")
        else:
            print("  --> DOES NOT contain 'onrender.com'!")
        
        # Search for baseURL or /api
        idx = content.find('baseURL')
        if idx != -1:
            snippet = content[max(0, idx-100):min(len(content), idx+100)]
            print(f"  --> baseURL snippet: {snippet}")
