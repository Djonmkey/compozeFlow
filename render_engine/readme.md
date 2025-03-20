# Create virtual environment
python -m venv venv
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows
pip install -r requirements.txt

# Use source comment
## macOs
source venv/bin/activate

## Windows
venv\Scripts\activate

# To Run
python main.py {video_assembly_file_path_name}
