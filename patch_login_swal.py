import os

def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    replacements = [
        ('Swal.fire({ title: "Welcome back!"', 'Swal.fire({ toast: true, position: "top-end", title: "Welcome back!"'),
        ("Swal.fire({ title: 'Account Created!'", "Swal.fire({ toast: true, position: 'top-end', title: 'Account Created!'")
    ]
    
    new_content = content
    for old, new in replacements:
        new_content = new_content.replace(old, new)
        
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Patched {filepath}")

patch_file('src/components/auth/SignIn.js')
patch_file('src/components/auth/SignUp.js')

