from setuptools import setup, find_packages

setup(
    name="portulong",
    version="1.0.1",
    author="portulong",
    author_email="portulong@example.com",
    description="Linguagem de programação em Português de Portugal para criar páginas web",
    long_description=open("README.md", "r", encoding="utf-8").read(),
    long_description_content_type="text/markdown",
    url="https://github.com/portulong/portulong",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    include_package_data=True,
    package_data={
        "portulong": ["imagens/*.png", "*.ptg"],
    },
    install_requires=[],
    entry_points={
        "console_scripts": [
            "portulong=portulong.__main__:main",
        ],
    },
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Natural Language :: Portuguese",
    ],
    python_requires=">=3.6",
)