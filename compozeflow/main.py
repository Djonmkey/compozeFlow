import json
import argparse

from typing import Dict
from cut_utility  import generate_video_cut
from video_utility import get_last_modified_timestamp

def load_json(file_path: str) -> Dict:
    """Load a JSON file and return its contents."""
    with open(file_path, 'r') as file:
        return json.load(file)

def get_manifest_file_pathname() -> str:
    """Get the manifest file pathname from command-line arguments or prompt the user if not provided."""
    parser = argparse.ArgumentParser(description="Generate videos from a manifest file.")
    parser.add_argument("manifest_file", nargs="?", help="Path to the video manifest JSON file.")
    parser.add_argument("--quick_and_dirty", choices=["yes", "no"], help="Enable quick and dirty mode (yes/no).")
    parser.add_argument("--source_file_watermark", choices=["yes", "no"], help="Show source file watermark (yes/no).")
    args = parser.parse_args()
    
    if args.manifest_file:
        manifest_file = args.manifest_file
    else:
        manifest_file = input("Enter the path to the video manifest JSON file: ")
    
    if args.quick_and_dirty:
        quick_and_dirty = args.quick_and_dirty.lower() == "yes"
    else:
        quick_and_dirty = input("Enable quick and dirty mode? (yes/no): ").strip().lower() == "yes"
    
    if args.source_file_watermark:
        source_file_watermark = args.source_file_watermark.lower() == "yes"
    else:
        source_file_watermark = input("Show source file watermark? (yes/no): ").strip().lower() == "yes"

    return manifest_file, quick_and_dirty, source_file_watermark

def main():
    manifest_file_pathname, quick_and_dirty, source_file_watermark = get_manifest_file_pathname()
    
    manifest = load_json(manifest_file_pathname)
    manifest_last_modified_timestamp = get_last_modified_timestamp(manifest_file_pathname)

    # Access the "cuts" list
    cuts = manifest["episode"]["cuts"]

    # Loop through each "cut"
    for cut in cuts:
        generate_video_cut(manifest, cut, quick_and_dirty, manifest_last_modified_timestamp, source_file_watermark)

if __name__ == "__main__":
    main()
