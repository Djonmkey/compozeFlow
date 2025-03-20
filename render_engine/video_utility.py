import os
import time
import multiprocessing

from typing import Union
from moviepy import *
from datetime import datetime, MINYEAR


def video_file_exists(file_path: str, and_is_newer_than=None) -> bool:
    """
    Check if a given file exists and optionally if it's newer than another file.

    :param file_path: The path to the file.
    :param and_is_newer_than: Path to a reference file. If provided, will check if file_path
                             exists and is newer than the reference file.
    :return: True if the file exists (and is newer than the reference file if specified),
             False otherwise.
    """
    if not os.path.isfile(file_path):
        return False
    
    if and_is_newer_than is not None:
        timestamp = os.path.getmtime(file_path)
        file_mod_time = datetime.fromtimestamp(timestamp)

        return file_mod_time > and_is_newer_than
    
    return True


def crop_video_to_aspect_ratio(video_clip: VideoFileClip, aspect_ratio: str) -> VideoFileClip:
    """Crop the video to match the desired aspect ratio."""
    width, height = video_clip.size
    target_aspect_ratio = eval(aspect_ratio.replace(':', '/'))
    
    if width / height > target_aspect_ratio:
        new_width = int(height * target_aspect_ratio)
        crop_x = (width - new_width) // 2
        return video_clip.cropped(x1=crop_x, x2=crop_x + new_width)
    else:
        new_height = int(width / target_aspect_ratio)
        crop_y = (height - new_height) // 2
        return video_clip.cropped(y1=crop_y, y2=crop_y + new_height)
    

def resize_clips_to_max_resolution(clips):
    """
    Takes a list of VideoFileClip objects, finds the highest resolution among them,
    and resizes all clips to match that resolution.
    
    :param clips: List of VideoFileClip objects
    :return: List of resized VideoFileClip objects
    """
    # Find the maximum resolution
    max_width = max(clip.w for clip in clips)
    max_height = max(clip.h for clip in clips)

    # Resize clips if they are not already at max resolution
    resized_clips = [
        clip if (clip.w == max_width and clip.h == max_height) 
        else clip.resized((max_width, max_height))
        for clip in clips
    ]

    return resized_clips


def ensure_directory_exists(file_path: str) -> None:
    """
    Ensures the directory for the given file path exists. If the directory does not exist,
    it will be created along with any intermediate directories required.

    :param file_path: The fully qualified file path.
    :type file_path: str

    :raises OSError: If the directory creation fails due to permission or filesystem issues.

    :return: None
    """
    directory = os.path.dirname(os.path.abspath(file_path))
    if directory and not os.path.exists(directory):
        os.makedirs(directory, exist_ok=True)


def write_video(
    clip, output_file_pathname: str, render_settings
) -> None:
    """
    Process a video file using MoviePy with multithreading and hardware acceleration.
    Measures and prints the time taken for the operation in seconds.

    :param input_path: Path to the input video file.
    :param output_path: Path to save the processed video file.
    :param threads: Number of threads to use for processing.
    :type input_path: str
    :type output_path: str
    :type threads: int
    """

    codec = render_settings.get("codec", "libx264")
    audio_codec = render_settings.get("audio", {}).get("codec", "aac")
    quality_preset = render_settings.get("quality_preset", "medium")
    fps = render_settings.get("fps", 30)

    cpu_count = multiprocessing.cpu_count() # Get max available CPU cores
    num_threads = render_settings.get("threads", cpu_count)

    if clip.duration is None:
        raise ValueError(
            "Clip duration is None. Check source video or composition process."
        )

    if clip.audio:
        if hasattr(clip.audio, "fps"):
            print(f"Audio FPS: {clip.audio.fps}")
        elif hasattr(clip.audio, "samplerate"):
            print(f"Audio Sample Rate: {clip.audio.samplerate}")

    if (
        clip.audio
        and hasattr(clip.audio, "samplerate")
        and clip.audio.samplerate is None
    ):
        clip.audio.samplerate = 44100  # Set a default sample rate

    ensure_directory_exists(output_file_pathname)

        # Start time
    start_time = time.time()

    """
    # Handle Resize
    width = render_settings.get("width")    # Can be None
    height = render_settings.get("height")   # Can be None

    if width:
        clip = clip.set_size(width=width, maintain_aspect_ratio=True)
    elif height:
        clip = clip.set_size(height=height, maintain_aspect_ratio=True)
    """

    clip.write_videofile(
            output_file_pathname,
            codec=codec,
            fps=fps,
            audio_codec=audio_codec,         
            preset=quality_preset,         
            threads=num_threads
        )

    # End time
    end_time = time.time()

    # Elapsed time
    elapsed_time = end_time - start_time

    # Print the elapsed time
    minutes, seconds = divmod(elapsed_time, 60)

    print(
        f"Processed '{output_file_pathname}' in {int(minutes)}m {seconds:.2f}s.\n"
        f"  - Codec: {codec}\n"
        f"  - FPS: {fps}\n"
        f"  - Audio Codec: {audio_codec}\n"
        f"  - Quality Preset: {quality_preset}\n"
        f"  - Threads: {num_threads}"
    )

def get_last_modified_timestamp(file_path: str) -> Union[str, None]:
    """
    Get the last modified timestamp of a given file.

    :param file_path: The path to the file.
    :type file_path: str
    :return: The last modified timestamp as a string in the format 'YYYY-MM-DD HH:MM:SS',
             or None if the file does not exist.
    :rtype: Union[str, None]
    """
    if not os.path.isfile(file_path):
        print(f"The file '{file_path}' does not exist.")
        # Return the minimum possible datetime as a string
        min_datetime = datetime(MINYEAR, 1, 1)
        return min_datetime.strftime("%Y-%m-%d %H:%M:%S")

    # Get the last modified timestamp
    timestamp = os.path.getmtime(file_path)
    last_modified_datetime = datetime.fromtimestamp(timestamp)

    return last_modified_datetime
