import os

directory = r'c:\Users\Ryan\Desktop\ResQMate\frontend\js'

for filename in os.listdir(directory):
    if filename.endswith('.js'):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        orig_content = content
        
        content = content.replace('"http://127.0.0.1:8000/users/register"', '`${API_BASE_URL}/users/register`')
        content = content.replace('"http://127.0.0.1:8000/users/login"', '`${API_BASE_URL}/users/login`')
        content = content.replace('"http://127.0.0.1:8000/reports/monthly"', '`${API_BASE_URL}/reports/monthly`')
        content = content.replace('`http://127.0.0.1:8000/requests/user/${user.user_id}`', '`${API_BASE_URL}/requests/user/${user.user_id}`')
        content = content.replace("'http://127.0.0.1:8000/requests/create'", '`${API_BASE_URL}/requests/create`')
        content = content.replace('"http://127.0.0.1:8000/users/"', '`${API_BASE_URL}/users/`')
        content = content.replace('"http://127.0.0.1:8000/resources/"', '`${API_BASE_URL}/resources/`')
        content = content.replace('"http://127.0.0.1:8000/reports"', '`${API_BASE_URL}/reports`')
        content = content.replace('"http://127.0.0.1:8000"', 'API_BASE_URL')
        
        if content != orig_content or '127.0.0.1:8000' in orig_content:
            if 'API_BASE_URL' in content and 'const API_BASE_URL =' not in content:
                prefix = 'const API_BASE_URL = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost" ? "http://127.0.0.1:8000" : `${window.location.origin}/api`;\n'
                content = prefix + content

            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
        elif filename == 'config.js':
            content = 'const API_BASE_URL = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost" ? "http://127.0.0.1:8000" : `${window.location.origin}/api`;\nconst API_URL = API_BASE_URL;\n'
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
