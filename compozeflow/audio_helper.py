import numpy as np

from typing import List
from moviepy import VideoFileClip, AudioFileClip, CompositeAudioClip, concatenate_audioclips


def process_time_codes(audio_clip_meta, clips_to_close, watermark, audio_clip):
    if "clip_start_seconds" in audio_clip_meta and "clip_end_seconds" in audio_clip_meta:
        clip_start_minutes = int(audio_clip_meta["clip_start_minutes"])
        clip_start_seconds = float(audio_clip_meta["clip_start_seconds"])
        clip_end_minutes = int(audio_clip_meta["clip_end_minutes"])
        clip_end_seconds = float(audio_clip_meta["clip_end_seconds"])

        watermark = watermark + f" clip_start_minutes:{clip_start_minutes}, clip_start_seconds:{clip_start_seconds}, clip_end_minutes:{clip_end_minutes}, clip_end_seconds:{clip_end_seconds}"

        # Convert start time to total seconds (float)
        clip_start_total_seconds = float(clip_start_minutes * 60 + clip_start_seconds)

        # Convert end time to total seconds (float)
        clip_end_total_seconds = float(clip_end_minutes * 60 + clip_end_seconds)

        #print(dir(video_clip))
        sub_video_clip = audio_clip.subclipped(clip_start_total_seconds, clip_end_total_seconds)
        return_video_clip = sub_video_clip
        clips_to_close.append(sub_video_clip)

    elif "clip_start_seconds" in audio_clip_meta and "clip_end_seconds" not in audio_clip_meta:
        clip_start_minutes = int(audio_clip_meta["clip_start_minutes"])
        clip_start_seconds = float(audio_clip_meta["clip_start_seconds"])

        watermark = watermark + f" clip_start_minutes:{clip_start_minutes}, clip_start_seconds:{clip_start_seconds}, clip_end_minutes:END, clip_end_seconds:END"

        # Convert start time to total seconds (float)
        clip_start_total_seconds = float(clip_start_minutes * 60 + clip_start_seconds)

        #print(dir(video_clip))
        sub_video_clip = audio_clip.subclipped(clip_start_total_seconds)
        return_video_clip = sub_video_clip
        clips_to_close.append(sub_video_clip)

    elif "clip_start_seconds" not in audio_clip_meta and "clip_end_seconds" in audio_clip_meta:
        clip_end_minutes = int(audio_clip_meta["clip_end_minutes"])
        clip_end_seconds = float(audio_clip_meta["clip_end_seconds"])

        watermark = watermark + f" clip_start_minutes:START, clip_start_seconds:START, clip_end_minutes:{clip_end_minutes}, clip_end_seconds:{clip_end_seconds}"

        # Convert end time to total seconds (float)
        clip_end_total_seconds = float(clip_end_minutes * 60 + clip_end_seconds)

        #print(dir(video_clip))
        sub_video_clip = audio_clip.subclipped(0, clip_end_total_seconds)
        return_video_clip = sub_video_clip
        clips_to_close.append(sub_video_clip)

    else:
        if audio_clip != None:
            return_video_clip = audio_clip
    return return_video_clip,watermark


def append_audio(voice_over, video_clip, video_volume, clips_to_close):
    """
    Appends an audio clip to a video while temporarily reducing 
    the video's original audio volume during the overlayed audio. 
    Once the added audio ends, the video's volume returns to normal.

    :return: Video clip with adjusted audio.
    """
    # Extract the original audio from the video clip
    clips_to_close.append(voice_over)
    clips_to_close.append(video_clip)
    original_audio = video_clip.audio
    clips_to_close.append(original_audio)

    # Determine the duration of the voice-over
    voice_duration = voice_over.duration
    video_duration = original_audio.duration

    # Reduce original audio volume while the voice-over is playing
    faded_audio = original_audio.subclipped(0, video_duration).with_volume_scaled(video_volume)
    
    clips_to_close.append(faded_audio)

    # Restore original volume for the remaining duration
    if video_duration > voice_duration:
        clips_to_close.append(original_audio)
        remaining_audio = original_audio.subclipped(voice_duration, video_duration).with_volume_scaled(1.0)
        clips_to_close.append(remaining_audio)
        # Play the original video audio scaled and the voice-over at the same time.
        # then trim to the voice-over duration
        combined_starting_audio = CompositeAudioClip([faded_audio, voice_over])
        clips_to_close.append(combined_starting_audio)

        trimmed_combined = combined_starting_audio.subclipped(0, voice_duration)
        clips_to_close.append(trimmed_combined)
        
        final_audio = concatenate_audioclips([trimmed_combined, remaining_audio])
    else:
        # Play the original video audio scaled and the voice-over at the same time.
        final_audio = CompositeAudioClip([faded_audio, voice_over])
    
    # Ensure voice_over doesn't exceed video duration
    clips_to_close.append(final_audio)
    trimmed_voice = final_audio.subclipped(0, video_duration)
    clips_to_close.append(trimmed_voice)
    
    # Apply the modified audio to the video
    final_video = video_clip.with_audio(trimmed_voice)
    clips_to_close.append(final_video)

    return final_video


def get_audio_volume(video: VideoFileClip) -> float:
    """
    Calculates the mean volume level of a video's audio.

    :param video: A MoviePy VideoFileClip object.
    :return: The mean absolute volume level.
    """
    audio = video.audio.to_soundarray(fps=44100)
    if audio is None:
        return 0.0  # No audio
    return np.mean(np.abs(audio))

def normalize_audio(video: VideoFileClip, target_volume: float, gain: float = 0.0) -> VideoFileClip:
    """
    Adjusts the video's audio volume to match the target volume with an optional gain adjustment.

    :param video: A MoviePy VideoFileClip object.
    :param target_volume: The base target volume level.
    :param gain: A float value to adjust the target volume (positive or negative).
    :return: A VideoFileClip with adjusted audio volume.
    """
    current_volume = get_audio_volume(video)
    adjusted_target_volume = target_volume + gain

    if current_volume == 0:
        return video  # No audio to adjust
    
    return video.volumex(adjusted_target_volume / current_volume)

def normalize_videos(videos: List[VideoFileClip], gain: float = 0.0) -> List[VideoFileClip]:
    """
    Normalizes the volume of a list of VideoFileClip objects while applying a gain adjustment.

    :param videos: A list of MoviePy VideoFileClip objects.
    :param gain: A float value to adjust the target volume (positive or negative).
    :return: A list of VideoFileClips with normalized audio volumes.
    """
    # Compute volume levels for all clips
    volumes = [get_audio_volume(clip) for clip in videos]
    
    # Determine the target volume as the average of non-zero volumes
    non_zero_volumes = [v for v in volumes if v > 0]
    target_volume = np.mean(non_zero_volumes) if non_zero_volumes else 1.0  # Default to 1.0 if all are silent

    # Normalize each video clip
    return [normalize_audio(clip, target_volume, gain) for clip in videos]

