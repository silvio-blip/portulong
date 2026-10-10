#!/usr/bin/env python3
from setuptools import setup, find_packages
from pathlib import Path

this_directory = Path(__file__).parent
long_description = (this_directory / "README.md").read_text(encoding="utf-8") if (this_directory / "README.md").exists() else ""

setup(
    name="portulong-sistema",
    version="1.0.26",
    description="Linguagem de programação em Português de Portugal para a Web com servidor e interpretador nativos.",
    long_description=long_description,
    long_description_content_type="text/markdown",
    author="Silvio",
    author_email="silviok5000@gmail.com",
    url="https://github.com/silvio-blip/portulong",
    license="MIT",
    packages=find_packages(),
    include_package_data=True,
    package_data={
        "portulong": [
            "imagens/*",
        ],
    },
    entry_points={
        "console_scripts": [
            "ptg=portulong.cli:main",
            "portulong=portulong.cli:main",
        ],
        "gui_scripts": [
            "ptg-gui=portulong.cli:main",
        ],
    },
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Developers",
        "Intended Audience :: Education",
        "Topic :: Software Development :: Compilers",
        "Topic :: Software Development :: Interpreters",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Operating System :: OS Independent",
        "Natural Language :: Portuguese",
    ],
    python_requires=">=3.8",
)
