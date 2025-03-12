from scene_utility import generate_video_scene
from moviepy import concatenate_videoclips

def generate_video_segment(
    video_assembly, cut, segment, quick_and_dirty, manifest_last_modified_timestamp, aspect_ratio, source_file_watermark = False
):
    # Sort scenes by sequence value before looping
    sorted_scenes = sorted(
        (scene for scene in segment.get("scenes", []) if "sequence" in scene),
        key=lambda scene: scene["sequence"],
    )

    scene_video_clips = []

    render_only = cut.get("render_only", {})
    render_only_scene = render_only.get("scene_sequence")

    for scene in sorted_scenes:
        scene_sequence = scene["sequence"]

        if render_only_scene and scene_sequence != render_only_scene:
            continue
        
        # If we have an image defined at the segment, then copy it to the scene
        if "overlay_images" in segment:
            if "overlay_images" not in scene:
                scene["overlay_images"] = []
            scene["overlay_images"].extend(segment["overlay_images"])
    
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
