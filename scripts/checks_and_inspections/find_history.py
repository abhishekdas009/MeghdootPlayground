import os
import glob
history_dir = r"C:\Users\Abhishek\AppData\Roaming\Code\User\History"
if os.path.exists(history_dir):
    for root, dirs, files in os.walk(history_dir):
        for f in files:
            path = os.path.join(root, f)
            try:
                with open(path, 'r', encoding='utf-8') as file:
                    content = file.read()
                    if 'Cancellation SOQL Batches' in content and 'isChildDetailsToParent' in content and 'Paste SOQL Result Batch' in content:
                        print(f"Found candidate: {path} (size: {len(content)})")
            except Exception:
                pass
