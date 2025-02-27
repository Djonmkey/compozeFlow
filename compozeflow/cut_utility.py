import os

from video_utility import write_video, resize_clips_to_max_resolution, file_exists
from segment_utility import generate_video_segment
from moviepy import concatenate_videoclips
from image_helper import append_image

def generate_html_from_video_assembly(data: dict, output_html_path: str) -> None:
    """
    Generates an HTML page from the provided video assembly JSON structure.

    :param data: Dictionary containing the video assembly data.
    :param output_html_path: Path to the output HTML file.
    """
    
    cut = data.get("cut", {})
    title = cut.get("title", "Untitled")
    subtitle = cut.get("subtitle", "")

    html_content = f"""<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{title}</title>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; }}
            h1 {{ text-align: center; }}
            h2 {{ text-align: center; color: gray; }}
            h3 {{ margin-top: 20px; }}
            h4 {{ margin-top: 10px; font-style: italic; }}
            table {{ width: 100%; border-collapse: collapse; margin-bottom: 20px; }}
            th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
            th {{ background-color: #f4f4f4; }}
            .clip-path {{ font-size: 8pt; color: gray; }}
            .clip-name {{ font-weight: bold; }}
        </style>
    </head>
    <body>
        <h1>{title}</h1>
        <h2>{subtitle}</h2>
    """

    # Process segments
    for segment in cut.get("segments", []):
        segment_title = segment.get("title", "Unnamed Segment")
        html_content += f"<h3>{segment_title}</h3>\n"

        for scene in segment.get("scenes", []):
            scene_title = scene.get("title")
            if scene_title:
                html_content += f"<h4>{scene_title}</h4>\n"

            html_content += """
            <table>
                <tr>
                    <th>Sequence</th>
                    <th>Clip File Pathname</th>
                    <th>Start (min:sec)</th>
                    <th>End (min:sec)</th>
                </tr>
            """

            for clip in scene.get("master_clips", []):
                sequence = clip.get("sequence", "N/A")
                clip_path = clip.get("clip_file_pathname", "Unknown Path")

                clip_start = ""
                clip_end = ""
                # Extract optional values safely
                if "clip_start_seconds" in clip:
                    clip_start_minutes = clip.get("clip_start_minutes", 0)
                    clip_start_seconds = float(clip.get("clip_start_seconds", 0))
                    clip_start = f"{clip_start_minutes}:{clip_start_seconds:05.2f}"
                else:
                    clip_start = "Start of clip"

                if "clip_end_seconds" in clip:
                    clip_end_minutes = clip.get("clip_end_minutes", 0)
                    clip_end_seconds = float(clip.get("clip_end_seconds", 0))
                    clip_end = f"{clip_end_minutes}:{clip_end_seconds:05.2f}"
                else:
                    clip_end = "End of clip"

                file_path, file_name = os.path.split(clip_path)

                html_content += f"""
                <tr>
                    <td>{sequence}</td>
                    <td>
                        <div class="clip-path">{file_path}</div>
                        <div class="clip-name">{file_name}</div>
                    </td>
                    <td>{clip_start}</td>
                    <td>{clip_end}</td>
                </tr>
                """

            html_content += "</table>\n"

    html_content += """
    </body>
    </html>
    """

    # Write HTML to file
    with open(output_html_path, 'w', encoding='utf-8') as html_file:
        html_file.write(html_content)
    
    print(f"HTML file successfully created: {output_html_path}")


def generate_video_cut(video_assembly, cut, video_assembly_last_modified_timestamp):
    # Read settings with default values safely
    composeflow_org = video_assembly.get("composeflow.org", {})
    settings = composeflow_org.get("settings", {})

    quick_and_dirty = settings.get("quick_and_dirty", False)
    source_file_watermark = settings.get("source_file_watermark", False)

    # Loop through each aspect ratio
    for aspect_ratio in cut["aspect_ratios"]:
        video_output_file_pathname = aspect_ratio["output_file_pathname"]

        if file_exists(video_output_file_pathname) == False:
            html_output_file_pathname = os.path.splitext(video_output_file_pathname)[0] + ".video_assembly.html"

            generate_html_from_video_assembly(video_assembly, html_output_file_pathname)

            aspect_ratio_text = aspect_ratio["aspect_ratio"]
            # Sort segments by sequence value before looping
            sorted_segments = sorted(cut["segments"], key=lambda segment: segment["sequence"])

            segments_for_aspect_ratio = []

            video_clips_to_close = []

            for segment in sorted_segments:
                print(f"  Segment Title: {segment['title']}")
                print(f"  Min Length: {segment['min_len_seconds']} seconds")
                print(f"  Max Length: {segment['max_len_seconds']} seconds") 

                segment_video = generate_video_segment(video_assembly, segment, quick_and_dirty, video_assembly_last_modified_timestamp, aspect_ratio_text, source_file_watermark)

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