from scene_utility import generate_video_scene
from moviepy import concatenate_videoclips

def generate_video_segment(
    manifest, segment, quick_and_dirty, manifest_last_modified_timestamp, aspect_ratio, source_file_watermark = False
):
    # Sort scenes by sequence value before looping
    sorted_scenes = sorted(
        (scene for scene in segment.get("scenes", []) if "sequence" in scene),
        key=lambda scene: scene["sequence"],
    )

    scene_video_clips = []

    for scene in sorted_scenes:
        # If we have an image defined at the segment, then copy it to the scene
        if "images" in segment:
            if "images" not in scene:
                scene["images"] = []
            scene["images"].extend(segment["images"])
    
        scene_video = generate_video_scene(
            segment,
            scene,
            quick_and_dirty,
            manifest_last_modified_timestamp,
            aspect_ratio,
            source_file_watermark
        )
        if scene_video != None:
            scene_video_clips.append(scene_video)

    if len(scene_video_clips) > 0:
        if len(scene_video_clips) == 1:
            return scene_video_clips[0]
        else:
            segment_video = concatenate_videoclips(scene_video_clips)
            return segment_video
    else:
        return None
