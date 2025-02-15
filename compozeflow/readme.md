source ~/Documents/projects/ramrally.com-admin/adv_trail_reviews/src/video_pipeline_pro/video_pipeline_pro/bin/activate

#Quick and Dirty#
python main.py video_manifests/ocala_national_forest.json --quick_and_dirty yes --source_file_watermark yes

#High Quality#
python3 main.py video_manifests/ocala_national_forest.json --quick_and_dirty no --source_file_watermark no
