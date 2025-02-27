from moviepy import VideoFileClip, TextClip, CompositeVideoClip

def append_watermark(watermark_text, video, clips_to_close):
    # Create a text watermark with default font and black outline

    font_path = "/System/Library/Fonts/Supplemental/Arial.ttf"  # Update this if needed
    watermark = TextClip(
        text=watermark_text,
        font=font_path,
        font_size=60,
        color="orange",
        stroke_color="black",
        stroke_width=2
    )

    # Position the watermark in the center with the video's duration
    watermark = watermark.with_position("center").with_duration(video.duration)

    # Overlay the watermark on the video
    clips_to_close.append(watermark)
    clips_to_close.append(video)

    watermarked_video = CompositeVideoClip([video, watermark])

    clips_to_close.append(watermarked_video)

    # Export the final video
    return watermarked_video