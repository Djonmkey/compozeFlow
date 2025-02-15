import numpy as np

from typing import List
from moviepy import VideoFileClip, AudioFileClip, CompositeAudioClip


def append_audio(voice_over, video_clip, video_volume, clips_to_close):
    """
    Appends an audio clip to a video while temporarily reducing 
    the video's original audio volume during the overlayed audio. 
    Once the added audio ends, the video's volume returns to normal.

    :return: Video clip with adjusted audio.
    """
    # Extract the original audio from the video clip
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
        remaining_audio = original_audio.subclipped(voice_duration).with_volume(1.0)
        clips_to_close.append(remaining_audio)
        final_audio = CompositeAudioClip([faded_audio, voice_over, remaining_audio])
    else:
        final_audio = CompositeAudioClip([faded_audio, voice_over])

    clips_to_close.append(final_audio)
    
    # Apply the modified audio to the video
    clips_to_close.append(video_clip)
    final_video = video_clip.with_audio(final_audio)
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

