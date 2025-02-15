import os
import re
import uuid

from typing import List, Dict
from video_utility import write_video, crop_video_to_aspect_ratio, file_exists
from moviepy import VideoFileClip, concatenate_videoclips, AudioFileClip, concatenate_audioclips
#from moviepy.video.fx.speedx import speedx
from clip_utility import load_video_clip
from audio_helper import append_audio

def sort_parallel_clips_by_sequence(scene: Dict) -> List[Dict]:
    """
    Sorts the parallel clips in a scene by their sequence value.

    :param scene: A dictionary containing a list of parallel clips under the key "parallel_clips".
    :return: A sorted list of parallel clips by sequence.
    """
    return sorted(scene.get("parallel_clips", []), key=lambda clip: clip["sequence"])


def sort_master_clips_by_sequence(scene: Dict) -> List[Dict]:
    """
    Sorts the master clips in a scene by their sequence value.

    :param scene: A dictionary containing a list of master clips under the key "master_clips".
    :return: A sorted list of master clips by sequence.
    """
    return sorted(scene.get("master_clips", []), key=lambda clip: clip["sequence"])
    

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

    if file_exists(output_path) == False:
        for video in video_clip_list:
            # If we have an image defined at the scene, then copy it to the clip
            if "images" in scene:
                if "images" not in video:
                    video["images"] = []
                video["images"].extend(scene["images"])

            video_clip = load_video_clip(video, aspect_ratio, quick_and_dirty, clips_to_close, source_file_watermark)
            clips_to_close.append(video_clip)
            video_clips.append(video_clip)

        # Concatenate video clips
        if len(video_clips) > 0:
            cropped_video_clip = None 

            if len(video_clips) == 1:
                cropped_video_clip = crop_video_to_aspect_ratio(video_clips[0], aspect_ratio) 
            else:
                video_clip = concatenate_videoclips(video_clips)
                clips_to_close.append(video_clip)
                cropped_video_clip = crop_video_to_aspect_ratio(video_clip, aspect_ratio)

            clips_to_close.append(cropped_video_clip)

            if "parallel_clips" in scene:
                parallel_audio_clip = load_audio_clips(audio_clips, clips_to_close)
                
                if parallel_audio_clip != None:
                    clips_to_close.append(parallel_audio_clip)
                    parallel_clips_video_volume = scene.get("parallel_clips_video_volume", 0.75)
                    clips_to_close.append(cropped_video_clip)
                    cropped_video_clip = append_audio(parallel_audio_clip, cropped_video_clip, parallel_clips_video_volume, clips_to_close)
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
        audio_path = audio["clip_file_pathname"]
        audio_clip = AudioFileClip(audio_path)
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
    master_clips_type = scene.get("master_clips_type", "audio").lower()
    sorted_master_clips = sort_master_clips_by_sequence(scene)
    sorted_parallel_clips = sort_parallel_clips_by_sequence(scene)
    enabled = scene.get("enabled", True)

    scene_video = None 

    if enabled:
        if master_clips_type == "audio":
            # The timeline is bound by the audio length, parallel_clips should all be of type video
            master_audio_clip = load_audio_clips(sorted_master_clips)
            parallel_video_clip = load_video_clips(segment, scene, sorted_parallel_clips, aspect_ratio)

            if parallel_video_clip != None:
                scene_video = VideoFileClip(parallel_video_clip)
        else:
            # The timeline is bound by the video length, parallel_clips should all be of type audio
            master_video_clip = load_video_clips(segment, scene, sorted_master_clips, sorted_parallel_clips, aspect_ratio, quick_and_dirty, source_file_watermark)

            if master_video_clip != None:
                scene_video = VideoFileClip(master_video_clip)

    return scene_video
    
