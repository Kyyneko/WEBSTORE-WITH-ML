import os
import glob

def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # We want to replace Swal.fire({ title: "Added!"... with toast: true, position: 'top-end'
    # Also "Removed!", "Updated!", "Deleted!", "Created!"
    replacements = [
        ('Swal.fire({ title: "Added!"', 'Swal.fire({ toast: true, position: "top-end", title: "Added!"'),
        ('Swal.fire({ title: "Removed!"', 'Swal.fire({ toast: true, position: "top-end", title: "Removed!"'),
        ('Swal.fire({ title: "Updated!"', 'Swal.fire({ toast: true, position: "top-end", title: "Updated!"'),
        ('Swal.fire({ title: "Deleted!"', 'Swal.fire({ toast: true, position: "top-end", title: "Deleted!"'),
        ('Swal.fire({ title: "Created!"', 'Swal.fire({ toast: true, position: "top-end", title: "Created!"'),
        ('Swal.fire({ title: \'Added!\'', 'Swal.fire({ toast: true, position: "top-end", title: \'Added!\''),
        ('Swal.fire({ title: \'Removed!\'', 'Swal.fire({ toast: true, position: "top-end", title: \'Removed!\''),
        ('Swal.fire({ title: \'Updated!\'', 'Swal.fire({ toast: true, position: "top-end", title: \'Updated!\''),
        ('Swal.fire({ title: \'Deleted!\'', 'Swal.fire({ toast: true, position: "top-end", title: \'Deleted!\''),
        ('Swal.fire({ title: \'Created!\'', 'Swal.fire({ toast: true, position: "top-end", title: \'Created!\''),
        ('Swal.fire({ title: "Added to Cart!"', 'Swal.fire({ toast: true, position: "top-end", title: "Added to Cart!"')
    ]
    
    new_content = content
    for old, new in replacements:
        new_content = new_content.replace(old, new)
        
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Patched {filepath}")

for root, dirs, files in os.walk('src/components'):
    for file in files:
        if file.endswith('.js'):
            patch_file(os.path.join(root, file))

