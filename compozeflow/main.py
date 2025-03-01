import os
import json
import argparse

from typing import Any, Dict

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


def check_file_existence(video_assembly):
    file_paths = []
    all_exist = True  # Assume all files exist initially

    # Collect all file paths
    if "cut" in video_assembly and "segments" in video_assembly["cut"]:
        for segment in video_assembly["cut"]["segments"]:
            if "images" in segment:
                for image in segment["images"]:
                    file_paths.append(image.get("image_file_pathname"))
            if "scenes" in segment:
                for scene in segment["scenes"]:
                    if "timeline_clips" in scene:
                        for clip in scene["timeline_clips"]:
                            file_paths.append(clip.get("clip_file_pathname"))

    # Check for missing files
    for path in file_paths:
        if path and not os.path.exists(path):
            print(f"File not found: {path}")
            all_exist = False  # At least one file is missing

    return all_exist

def update_file_pathnames_with_common_base_file_path(video_assembly: Dict[str, Any]) -> Dict[str, Any]:
    """
    Updates all *_file_pathname fields in the JSON structure by removing
    the common base file path if the 'update_file_pathnames_with_common_base_file_path' 
    setting is enabled.

    :param json_data: The JSON data as a dictionary.
    :return: The updated JSON dictionary.
    """
    settings = video_assembly.get("composeflow.org", {}).get("settings", {})

    # Check if the update setting is enabled
    if not settings.get("update_file_pathnames_with_common_base_file_path", False):
        return video_assembly

    common_base_path = settings.get("common_base_file_path", "").rstrip("/") + "/"

    def process_paths(obj: Any):
        """ Recursively traverse JSON structure and update *_file_pathname fields. """
        if isinstance(obj, dict):
            for key, value in obj.items():
                if isinstance(value, str) and key.endswith("_file_pathname"):
                    if value.startswith(common_base_path):
                        new_path = value[len(common_base_path):]
                        obj[key] = new_path.lstrip("/")  # Ensure it does not start with '/'
                else:
                    process_paths(value)
        elif isinstance(obj, list):
            for item in obj:
                process_paths(item)

    process_paths(video_assembly)

    return video_assembly

def ensure_update_file_pathnames(video_assembly: Dict[str, Any]) -> Dict[str, Any]:
    """
    Updates all *_file_pathname elements in the JSON data by prefixing them with 
    common_base_file_path if they contain a relative path.

    :param json_data: Dictionary containing JSON data with file paths.
    :return: Updated JSON data with fully qualified file paths.
    """
    common_base_file_path = video_assembly.get("composeflow.org", {}).get("settings", {}).get("common_base_file_path", "")

    if not common_base_file_path:
        return video_assembly  # No common base path, nothing to update.

    def update_paths(obj: Any):
        """Recursively updates file path values in the JSON object."""
        if isinstance(obj, dict):
            for key, value in obj.items():
                if key.endswith("_file_pathname") and isinstance(value, str):
                    if not os.path.isabs(value):  # Only update relative paths
                        obj[key] = os.path.normpath(os.path.join(common_base_file_path, value))
                else:
                    update_paths(value)
        elif isinstance(obj, list):
            for item in obj:
                update_paths(item)

    update_paths(video_assembly)
    return video_assembly

def main():
    video_assembly_file_pathname = get_video_assembly_file_pathname()
    
    video_assembly = load_json(video_assembly_file_pathname)
    video_assembly_original_json_text = json.dumps(video_assembly)
    
    video_assembly = update_file_pathnames_with_common_base_file_path(video_assembly)
    video_assembly_updated_json_text = json.dumps(video_assembly)
    
    # Check if the JSON was updated
    if video_assembly_updated_json_text != video_assembly_original_json_text:
        # save the updated JSON
        with open(video_assembly_file_pathname, "w") as file:
            file.write(video_assembly_updated_json_text)
    
    video_assembly_last_modified_timestamp = get_last_modified_timestamp(video_assembly_file_pathname)

    # Ensure all file paths are fully qualified
    video_assembly = ensure_update_file_pathnames(video_assembly)

    # Access the "cut"  safely
    cut = video_assembly.get("cut", {})
    
    if check_file_existence(video_assembly):
        generate_video_cut(video_assembly, cut, video_assembly_last_modified_timestamp)
    else:
        print("Video Assembly Processing Stopped due to missing files.")

if __name__ == "__main__":
    main()
