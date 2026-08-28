import os
for root, dirs, files in os.walk('C:\\Users\\Abhishek'):
    if 'git.exe' in files:
        print(os.path.join(root, 'git.exe'))
        break
