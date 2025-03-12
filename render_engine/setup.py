from setuptools import setup, find_packages

setup(
    name="compozeFlow",
    version="0.5.0",
    packages=find_packages(),
    install_requires=[
        "moviepy==2.1.2",
        "numpy",
        "opencv-python"
    ],
    entry_points={
        "console_scripts": [
            "compozeFlow=compozeFlow.main:main"
        ]
    },
    author="David Jonathan McKee",
    description="composeFlow is an open-source framework for video batch processing and automation. Built for professional editors, it streamlines high-volume workflows by automating editing, encoding, and processing with precision. Seamlessly integrating into production pipelines, composeFlow enhances efficiency in post-production and content delivery.",
    license="AGPL-3.0",
    classifiers=[
        "License :: OSI Approved :: GNU Affero General Public License v3",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.10",
        "Operating System :: OS Independent",
    ],
)
