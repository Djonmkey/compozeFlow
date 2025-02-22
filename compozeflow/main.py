import json
import argparse
from typing import Dict

# Import error handling
try:
    from cut_utility import generate_video_cut
    from video_utility import get_last_modified_timestamp
except ImportError as e:
    print(f"Error: Missing required module - {e.name}")
    exit(1)

def load_json(file_path: str) -> Dict:
    """Load a JSON file and return its contents safely."""
    try:
        with open(file_path, 'r') as file:
            data = json.load(file)
            if not isinstance(data, dict):
                raise ValueError("JSON content must be a dictionary.")
            return data
    except FileNotFoundError:
        print(f"Error: The file '{file_path}' was not found.")
        exit(1)
    except json.JSONDecodeError:
        print(f"Error: The file '{file_path}' is not a valid JSON file or is empty.")
        exit(1)
    except ValueError as e:
        print(f"Error: {e}")
        exit(1)
    except Exception as e:
        print(f"Unexpected error while reading JSON: {e}")
        exit(1)

def get_video_assembly_file_pathname() -> str:
    """Get the video assembly file pathname from the command-line."""
    parser = argparse.ArgumentParser(description="Generate videos from a video assembly file.")
    parser.add_argument("video_assembly_file", nargs="?", default=None, help="Path to the video assembly JSON file.")
    
    args = parser.parse_args()
    
    file_path = args.video_assembly_file or input("Enter the file pathname to the video assembly JSON file: ").strip()
    
    if not file_path:
        print("Error: No file path provided.")
        exit(1)

    return file_path

def main():
    video_assembly_file_pathname = get_video_assembly_file_pathname()
    
    video_assembly = load_json(video_assembly_file_pathname)
    video_assembly_last_modified_timestamp = get_last_modified_timestamp(video_assembly_file_pathname)

    # Access the "cut"  safely
    cut = video_assembly.get("cut", {})
    
    generate_video_cut(video_assembly, cut, video_assembly_last_modified_timestamp)

if __name__ == "__main__":
    main()
