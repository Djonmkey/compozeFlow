from video_utility import write_video, resize_clips_to_max_resolution, file_exists
from segment_utility import generate_video_segment
from moviepy import concatenate_videoclips
from image_helper import append_image

def generate_video_cut(manifest, cut, quick_and_dirty, manifest_last_modified_timestamp,  source_file_watermark = False):
    # Loop through each aspect ratio
    for aspect_ratio in cut["aspect_ratios"]:
        video_output_file_pathname = aspect_ratio["output_file_pathname"]

        if file_exists(video_output_file_pathname) == False:
            aspect_ratio_text = aspect_ratio["aspect_ratio"]
            # Sort segments by sequence value before looping
            sorted_segments = sorted(cut["segments"], key=lambda segment: segment["sequence"])

            segments_for_aspect_ratio = []

            video_clips_to_close = []

            for segment in sorted_segments:
                print(f"  Segment Title: {segment['title']}")
                print(f"  Min Length: {segment['min_len_seconds']} seconds")
                print(f"  Max Length: {segment['max_len_seconds']} seconds") 

                segment_video = generate_video_segment(manifest, segment, quick_and_dirty, manifest_last_modified_timestamp, aspect_ratio_text, source_file_watermark)

                if segment_video != None:
                    segments_for_aspect_ratio.append(segment_video)
                    
            if len(segments_for_aspect_ratio) > 0:
                if len(segments_for_aspect_ratio) == 1:
                    cut_for_aspect_ratio = segments_for_aspect_ratio[0]
                else:
                    segments_for_aspect_ratio = resize_clips_to_max_resolution(segments_for_aspect_ratio)
                    cut_for_aspect_ratio = concatenate_videoclips(segments_for_aspect_ratio)

                # Save video
                write_video(cut_for_aspect_ratio, video_output_file_pathname, quick_and_dirty)     

            for video_clip_item in video_clips_to_close:
                try:
                    video_clip_item.close()
                except:
                    pass 

            if quick_and_dirty:
                return