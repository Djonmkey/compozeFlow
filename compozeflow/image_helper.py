from moviepy import ImageClip, CompositeVideoClip

def set_image_position(image_meta, image):
    # Extract position data
    position_data = image_meta["position"]
    position_type = position_data.get("type")
    position_value = position_data.get("value")

    # Determine the correct format for `with_position()`
    if position_type == "preset":
        position = position_value  # e.g., "center"
    elif position_type == "absolute":
        position = tuple(position_value)  # Convert list to tuple
    elif position_type == "relative":
        position = tuple(position_value)
    elif position_type == "function":
        position = eval(position_value)  # Converts the lambda string to a function (CAUTION: only use with trusted sources)

    # Apply position from JSON
    image = image.with_position(position)

    return image

def append_image(image_meta, video_clip, video_clips_to_close):
    auto_size = True

    image_file_pathname = image_meta["image_file_pathname"]

    # Load the transparent image
    image = ImageClip(image_file_pathname)

    if "height" in image_meta:
        image_height = image_meta["height"]
        image = image.resized(height=image_height)
        auto_size = False

    if "width" in image_meta:
        image_width = image_meta["width"]
        image = image.resized(width=image_width)
        auto_size = False

    if "position" in image_meta:
        image = set_image_position(image_meta, image)
    else:
        # Center the image
        image = image.with_position("center")

    if auto_size:
        # Resize image to match video width while maintaining aspect ratio
        image = image.resized(width=video_clip.size[0])

    # Set the duration for the overlay
    image = image.with_duration(video_clip.duration)

    # Create a composite video with the image overlay
    final_clip = CompositeVideoClip([video_clip, image])

    video_clips_to_close.append(video_clip)
    video_clips_to_close.append(final_clip)

    return final_clip
