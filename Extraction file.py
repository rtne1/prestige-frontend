import os

# Folders to ignore
IGNORE_FOLDERS = {
    ".git",
    "__pycache__",
    "node_modules",
    "vendor",
    ".idea",
    ".vscode",
    ".next",
    "storage/logs"
}

# Files to ignore
IGNORE_FILES = {
    "folder_structure.txt"
}


def generate_tree(start_path, prefix=""):
    tree = []

    try:
        items = sorted(os.listdir(start_path), key=lambda x: (not os.path.isdir(os.path.join(start_path, x)), x.lower()))
    except PermissionError:
        return ["[Permission Denied]"]

    filtered_items = []

    for item in items:
        full_path = os.path.join(start_path, item)

        if item in IGNORE_FILES:
            continue

        if os.path.isdir(full_path) and item in IGNORE_FOLDERS:
            continue

        filtered_items.append(item)

    for index, item in enumerate(filtered_items):
        full_path = os.path.join(start_path, item)
        is_last = index == len(filtered_items) - 1

        connector = "└── " if is_last else "├── "
        tree.append(prefix + connector + item)

        if os.path.isdir(full_path):
            extension = "    " if is_last else "│   "
            tree.extend(generate_tree(full_path, prefix + extension))

    return tree


def main():
    root_folder = os.path.dirname(os.path.abspath(__file__))
    folder_name = os.path.basename(root_folder)

    structure = [folder_name]
    structure.extend(generate_tree(root_folder))

    output_file = os.path.join(root_folder, "folder_structure.txt")

    with open(output_file, "w", encoding="utf-8") as f:
        f.write("\n".join(structure))

    print(f"\nStructure saved successfully:")
    print(output_file)


if __name__ == "__main__":
    main()