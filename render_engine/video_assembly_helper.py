import json

def get_this_run_only(video_assembly):
    this_run_only = None 

    if "this_run_only" in video_assembly:
        this_run_only = video_assembly["this_run_only"]

    return this_run_only


def get_render_only(video_assembly):
    render_only = None 

    this_run_only = get_this_run_only(video_assembly)

    if this_run_only:
        if "render_only" in this_run_only:
            render_only = this_run_only["render_only"]

    return render_only


def clear_this_run_only(video_assembly, video_assembly_file_pathname):
    if "this_run_only" in video_assembly:
        del video_assembly["this_run_only"]

        video_assembly_updated_json_text = json.dumps(video_assembly)

        # save the updated JSON
        with open(video_assembly_file_pathname, "w") as file:
            file.write(video_assembly_updated_json_text)

def skip_segment_render(video_assembly, segment):
    skip_segment = False

    render_only = get_render_only(video_assembly)

    if render_only:
        render_only_segment_sequence = render_only.get("segment_sequence")
        segment_sequence = segment["sequence"]

        if render_only_segment_sequence and segment_sequence != render_only_segment_sequence:
             skip_segment = True 

    return skip_segment

def skip_scene_render(video_assembly, segment, scene):
    skip_scene = False 

    if skip_segment_render(video_assembly, segment):
         skip_scene = True
    else:
        render_only = get_render_only(video_assembly)

        if render_only:
            render_only_scene_sequence = render_only.get("scene_sequence")
            
            scene_sequence = scene.get("sequence")

            if render_only_scene_sequence and scene_sequence != render_only_scene_sequence:
                skip_scene = True

    return  skip_scene

    
