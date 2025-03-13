import os
import json
import argparse

from typing import Any, Dict
from video_assembly_helper import clear_this_run_only, skip_segment_render, skip_scene_render

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


def check_file_existence(video_assembly: Dict[str, Any]) -> bool:
    """
    Check if all files referenced in the video assembly exist.
    
    Args:
        video_assembly: Dictionary containing the video assembly data
        
    Returns:
        bool: True if all files exist, False if any files are missing
    """
    # Helper function to collect file paths from overlay images
    def collect_image_paths(overlay_images):
        paths = []
        for image in overlay_images:
            path = image.get("image_file_pathname")
            if path:  # Only append if not None or empty
                paths.append(path)
        return paths
    
    # Helper function to collect file paths from timeline clips
    def collect_clip_paths(timeline_clips):
        paths = []
        for clip in timeline_clips:
            path = clip.get("clip_file_pathname")
            if path:  # Only append if not None or empty
                paths.append(path)
        return paths
    
    file_paths = []
    
    # Safely access the cut dictionary
    cut = video_assembly.get("cut", {})
    segments = cut.get("segments", [])
    
    # Process each segment
    for segment in segments:
        # Skip segments that don't match the target segment (if filtering)
        if skip_segment_render(video_assembly, segment):
            continue
            
        # Add overlay image paths
        file_paths.extend(collect_image_paths(segment.get("overlay_images", [])))
        
        # Process scenes in this segment
        for scene in segment.get("scenes", []):
            if skip_scene_render(video_assembly, segment, scene):
                continue

            # Add timeline clip paths
            file_paths.extend(collect_clip_paths(scene.get("timeline_clips", [])))
    
    # Check for missing files
    missing_files = []
    for path in file_paths:
        if not os.path.exists(path):
            print(f"File not found: {path}")
            missing_files.append(path)
    
    # Return True if all files exist, False otherwise
    return len(missing_files) == 0

def update_file_pathnames_with_common_base_file_path(video_assembly: Dict[str, Any]) -> Dict[str, Any]:
    """
    Updates all *_file_pathname fields in the JSON structure by removing
    the content source paths from the 'cut.content_sources' array.

    :param video_assembly: The video assembly data as a dictionary.
    :return: The updated video assembly dictionary.
    """
    settings = video_assembly.get("composeflow.org", {}).get("settings", {})

    # Check if the update setting is enabled
    if not settings.get("update_paths_with_content_source_paths", False):
        return video_assembly

    # Get content sources from the cut element
    content_sources = video_assembly.get("cut", {}).get("content_sources", [])
    
    # If no content sources, return unchanged
    if not content_sources:
        return video_assembly
    
    # Collect all paths from content sources
    source_paths = []
    for source in content_sources:
        if "path" in source and source["path"]:
            # Ensure path ends with a slash for proper replacement
            path = source["path"].rstrip("/") + "/"
            source_paths.append(path)
    
    # Sort paths by length (descending) to ensure longer paths are processed first
    # This prevents issues where a shorter path might be a prefix of a longer path
    source_paths.sort(key=len, reverse=True)

    def process_paths(obj: Any):
        """ Recursively traverse JSON structure and update *_file_pathname fields. """
        if isinstance(obj, dict):
            for key, value in obj.items():
                if isinstance(value, str) and key == "path" and ',' not in value:
                    # Try each content source path
                    for path in source_paths:
                        if value.startswith(path) and value != path and value.endswith("/") == False and value.endswith("\\") == False:
                            new_path = value[len(path):]
                            obj[key] = new_path.lstrip("/")  # Ensure it does not start with '/'
                            break  # Stop after first match
                else:
                    process_paths(value)
        elif isinstance(obj, list):
            for item in obj:
                process_paths(item)

    process_paths(video_assembly)

    return video_assembly


def main():
    video_assembly_file_pathname = get_video_assembly_file_pathname()
    
    video_assembly = load_json(video_assembly_file_pathname)
    video_assembly_original_json_text = json.dumps(video_assembly)
    
    #video_assembly = update_file_pathnames_with_common_base_file_path(video_assembly)
    video_assembly_updated_json_text = json.dumps(video_assembly)
    
    # Check if the JSON was updated
    if video_assembly_updated_json_text != video_assembly_original_json_text:
        # save the updated JSON
        with open(video_assembly_file_pathname, "w") as file:
            file.write(video_assembly_updated_json_text)
    
    video_assembly_last_modified_timestamp = get_last_modified_timestamp(video_assembly_file_pathname)

    # Access the "cut"  safely
    cut = video_assembly.get("cut", {})
    
    if check_file_existence(video_assembly):
        generate_video_cut(video_assembly, cut, video_assembly_last_modified_timestamp)
        clear_this_run_only(video_assembly, video_assembly_file_pathname)
    else:
        print("Video Assembly Processing Stopped due to missing files.")

if __name__ == "__main__":
    main()
