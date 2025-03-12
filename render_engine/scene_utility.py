import os
import re
import uuid
import datetime

from typing import List, Dict
from video_utility import write_video, crop_video_to_aspect_ratio, video_file_exists
from moviepy import VideoFileClip, concatenate_videoclips, AudioFileClip, concatenate_audioclips, CompositeVideoClip
#from moviepy.video.fx.speedx import speedx
from clip_utility import load_video_clip, process_video_time_codes
from audio_helper import append_audio, process_audio_time_codes
from image_helper import create_video_from_image

def sort_sequential_audio_clips_by_sequence(scene: Dict) -> List[Dict]:
    """
    Sorts the sequential audio  clips in a scene by their sequence value.

    :param scene: A dictionary containing a list of sequential audio clips under the key "sequential_audio_clips".
    :return: A sorted list of sequential audio clips by sequence.
    """
    return sorted(scene.get("sequential_audio_clips", []), key=lambda clip: clip["sequence"])


def sort_timeline_clips_by_sequence(scene: Dict) -> List[Dict]:
    """
    Sorts the timeline clips in a scene by their sequence value.

    :param scene: A dictionary containing a list of timeline clips under the key "timeline_clips".
    :return: A sorted list of timeline clips by sequence.
    """
    return sorted(scene.get("timeline_clips", []), key=lambda clip: clip["sequence"])
    
def crop_and_process_sequential_audio_clips(scene, video_clips, audio_clips, aspect_ratio, clips_to_close, output_path, quick_and_dirty):
    if len(video_clips) > 0:
        cropped_video_clip = None 

        if len(video_clips) == 1:
            cropped_video_clip = crop_video_to_aspect_ratio(video_clips[0], aspect_ratio) 
        else:
            video_clip = concatenate_videoclips(video_clips)
            clips_to_close.append(video_clip)
            cropped_video_clip = crop_video_to_aspect_ratio(video_clip, aspect_ratio)

        clips_to_close.append(cropped_video_clip)

        if "sequential_audio_clips" in scene:
            sequential_audio_clip = load_audio_clips(audio_clips, clips_to_close)
            
            if sequential_audio_clip != None:
                clips_to_close.append(sequential_audio_clip)

                timeline_clip_type = scene.get("timeline_clip_type", "video").lower()

                sequential_audio_timeline_clips_volume = 1

                if timeline_clip_type == "image":
                    # No audio for image clips
                    sequential_audio_timeline_clips_volume = 0
                else:
                    sequential_audio_timeline_clips_volume = scene.get("sequential_audio_timeline_clips_volume", 1)

                clips_to_close.append(cropped_video_clip)
                cropped_video_clip = append_audio(sequential_audio_clip, cropped_video_clip, sequential_audio_timeline_clips_volume, clips_to_close)
                clips_to_close.append(cropped_video_clip)

        write_video(cropped_video_clip, output_path, quick_and_dirty)

        for video_clip_item in clips_to_close:
            try:
                video_clip_item.close()
            except:
                pass 

        return output_path
    else:
        return None
    
def load_image_clips(segment, scene, image_list, audio_clips, aspect_ratio, quick_and_dirty, source_file_watermark = False):
    # Load all video clips
    video_clips = []
    clips_to_close = []

    segment_title = segment["title"]
    scene_title = scene.get("title", "default-scene")
    scene_sequence = str(scene["sequence"])  # Explicit conversion

    # Sanitize `segment_title` to remove problematic characters
    safe_segment_title = re.sub(r'[^a-zA-Z0-9_-]', '_', segment_title)[:50]  # Keep it safe & under 50 chars
    
    output_path = f"temp_video_pipeline_clip_{safe_segment_title}_{scene_sequence}_{scene_title}_{aspect_ratio}.mp4"

    if video_file_exists(output_path, None) == False:
        for image_meta in image_list:
            video_clip = create_video_from_image(image_meta, aspect_ratio, quick_and_dirty, clips_to_close, source_file_watermark)
            clips_to_close.append(video_clip)
            video_clips.append(video_clip)

        # Concatenate video clips
        output_path = crop_and_process_sequential_audio_clips(scene, video_clips, audio_clips, aspect_ratio, clips_to_close, output_path, quick_and_dirty)
        return output_path
    else:
        return output_path

def load_video_clips(segment, scene, video_clip_list, audio_clips, aspect_ratio, quick_and_dirty, source_file_watermark = False):
    # Load all video clips
    video_clips = []
    clips_to_close = []

    segment_title = segment["title"]
    scene_title = scene.get("title", "default-scene")
    scene_sequence = str(scene["sequence"])  # Explicit conversion

    # Sanitize `segment_title` to remove problematic characters
    safe_segment_title = re.sub(r'[^a-zA-Z0-9_-]', '_', segment_title)[:50]  # Keep it safe & under 50 chars
    
    output_path = f"temp_video_pipeline_clip_{safe_segment_title}_{scene_sequence}_{scene_title}_{aspect_ratio}.mp4"

    if video_file_exists(output_path) == False:
        for video in video_clip_list:
            # If we have an image defined at the scene, then copy it to the clip
            if "overlay_images" in scene:
                if "overlay_images" not in video:
                    video["overlay_images"] = []
                video["overlay_images"].extend(scene["overlay_images"])

            video_clip = load_video_clip(video, aspect_ratio, quick_and_dirty, clips_to_close, source_file_watermark)
            clips_to_close.append(video_clip)
            video_clips.append(video_clip)

        # Concatenate video clips
        output_path = crop_and_process_sequential_audio_clips(scene, video_clips, audio_clips, aspect_ratio, clips_to_close, output_path, quick_and_dirty)
        return output_path
    else:
        return output_path


def load_audio_clips(audio_clip_list, clips_to_close):
    """
    Load and concatenate multiple audio clips with optional volume adjustment.

    :param audio_clip_list: List[Dict[str, Union[str, float]]]
        A list of dictionaries, each containing:
        - 'clip_file_pathname': str, the file path to the audio clip.
        - 'audio_volume' (optional): float, the volume scaling factor.
    :return: AudioFileClip
        The concatenated audio clip.
    """
    audio_clips = []

    for audio in audio_clip_list:
        audio_path = audio["path"]

        audio_clip = AudioFileClip(audio_path)
        clips_to_close.append(audio_clip)

        watermark = ""
        audio_clip, watermark = process_audio_time_codes(audio, clips_to_close, watermark, audio_clip)
        clips_to_close.append(audio_clip)

        if "audio_volume" in audio:
            audio_volume = audio["audio_volume"]
            audio_clip = audio_clip.with_volume_scaled(audio_volume)

        audio_clips.append(audio_clip)

    if not audio_clips:
        return None  # Return None if no audio clips were provided

    if len(audio_clips) > 0:
        if len(audio_clips) == 1:
            return audio_clips[0]
        else:
            segment_audio = concatenate_audioclips(audio_clips)
            clips_to_close.append(segment_audio)
            return segment_audio
    else:
        return None
    
    

def generate_video_scene(segment, scene, quick_and_dirty, manifest_last_modified_timestamp, aspect_ratio, source_file_watermark = False):
    timeline_clip_type = scene.get("timeline_clip_type", "video").lower()
    sorted_timeline_clips = sort_timeline_clips_by_sequence(scene)
    sorted_sequential_audio_clips = sort_sequential_audio_clips_by_sequence(scene)
    enabled = scene.get("enabled", True)

    scene_video = None 
    timeline_video_clip = None 

    if enabled:
        if timeline_clip_type == "image":
            timeline_video_clip = load_image_clips(segment, scene, sorted_timeline_clips, sorted_sequential_audio_clips, aspect_ratio, quick_and_dirty, source_file_watermark)

        else:
            timeline_video_clip = load_video_clips(segment, scene, sorted_timeline_clips, sorted_sequential_audio_clips, aspect_ratio, quick_and_dirty, source_file_watermark)

    if timeline_video_clip != None:
        scene_video = VideoFileClip(timeline_video_clip)

    return scene_video
    
