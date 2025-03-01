from moviepy import VideoFileClip
from image_helper import append_image
from video_utility import crop_video_to_aspect_ratio
from text_helper import append_watermark

def load_video_clip(video_clip_meta, aspect_ratio, quick_and_dirty, video_clips_to_close, source_file_watermark = False):
    return_video_clip = None
    
    video_path = video_clip_meta["clip_file_pathname"]

    playback_speed = 1

    if "playback_speed" in video_clip_meta:
        playback_speed = video_clip_meta["playback_speed"]

    watermark = video_path

    video_clip = VideoFileClip(video_path)
    video_clips_to_close.append(video_clip)

    # Debug: Check FPS
    print(f"Video FPS: {video_clip.fps}")

    if video_clip.fps is None:
        raise ValueError("Error: FPS could not be determined. Check your video file.")

    return_video_clip, watermark = process_time_codes(video_clip_meta, video_clips_to_close, watermark, video_clip)
    
    #if playback_speed != 1:
    #    speen_updated_video_clip = speedx(video_clip, factor=playback_speed)
    #    video_clips_to_close.append(speen_updated_video_clip)
    #    return_video_clip = speen_updated_video_clip

    if return_video_clip != None:
        video_clips_to_close.append(return_video_clip)
        cropped_video_clip = crop_video_to_aspect_ratio(return_video_clip, aspect_ratio) 
        video_clips_to_close.append(video_clips_to_close)
        return_video_clip = cropped_video_clip
    
    if "overlay_images" in video_clip_meta:
        for image in video_clip_meta["overlay_images"]:
            return_video_clip = append_image(image, return_video_clip, video_clips_to_close)

    if source_file_watermark:
        return_video_clip = append_watermark(watermark, return_video_clip, video_clips_to_close)

    return return_video_clip

def process_time_codes(video_clip_meta, video_clips_to_close, watermark, video_clip):
    if "trim_start_seconds" in video_clip_meta and "clip_end_seconds" in video_clip_meta:
        trim_start_minutes = int(video_clip_meta["trim_start_minutes"])
        trim_start_seconds = float(video_clip_meta["trim_start_seconds"])
        clip_end_minutes = int(video_clip_meta["clip_end_minutes"])
        clip_end_seconds = float(video_clip_meta["clip_end_seconds"])

        watermark = watermark + f"\nStart: {trim_start_minutes} minutes, {trim_start_seconds} seconds\nEnd: {clip_end_minutes} minutes, {clip_end_seconds} seconds"

        if "sequence" in video_clip_meta:
            sequence = video_clip_meta["sequence"]
            watermark += f"\nsequence:{sequence}"


        # Convert start time to total seconds (float)
        clip_start_total_seconds = float(trim_start_minutes * 60 + trim_start_seconds)

        # Convert end time to total seconds (float)
        clip_end_total_seconds = float(clip_end_minutes * 60 + clip_end_seconds)

        #print(dir(video_clip))
        sub_video_clip = video_clip.subclipped(clip_start_total_seconds, clip_end_total_seconds)
        return_video_clip = sub_video_clip
        video_clips_to_close.append(sub_video_clip)

    elif "trim_start_seconds" in video_clip_meta and "clip_end_seconds" not in video_clip_meta:
        trim_start_minutes = int(video_clip_meta["trim_start_minutes"])
        trim_start_seconds = float(video_clip_meta["trim_start_seconds"])

        watermark = watermark + f"\nStart: {trim_start_minutes} minutes, {trim_start_seconds} seconds\nEnd: end of clip"

        # Convert start time to total seconds (float)
        clip_start_total_seconds = float(trim_start_minutes * 60 + trim_start_seconds)

        #print(dir(video_clip))
        sub_video_clip = video_clip.subclipped(clip_start_total_seconds)
        return_video_clip = sub_video_clip
        video_clips_to_close.append(sub_video_clip)

    elif "trim_start_seconds" not in video_clip_meta and "clip_end_seconds" in video_clip_meta:
        clip_end_minutes = int(video_clip_meta["clip_end_minutes"])
        clip_end_seconds = float(video_clip_meta["clip_end_seconds"])

        watermark = watermark + f"\nStart: start of clip\nEnd: {clip_end_minutes} minutes, {clip_end_seconds} seconds"

        # Convert end time to total seconds (float)
        clip_end_total_seconds = float(clip_end_minutes * 60 + clip_end_seconds)

        #print(dir(video_clip))
        sub_video_clip = video_clip.subclipped(0, clip_end_total_seconds)
        return_video_clip = sub_video_clip
        video_clips_to_close.append(sub_video_clip)

    else:
        if video_clip != None:
            return_video_clip = video_clip
    return return_video_clip,watermark