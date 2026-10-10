from setuptools import setup, find_packages

setup(
    name="portulong-sistema",
    version="1.0.32",
    packages=find_packages(),
    include_package_data=True,
    install_requires=[],
    extras_require={
        "discord": ["discord.py>=2.0.0"],
    },
    entry_points={
        "console_scripts": [
            "ptg=portulong.cli:main",
            "portulong=portulong.cli:main",
        ],
    },
    author="Silvio",
    description="Linguagem de programação em Português de Portugal para criar páginas web com interpretador e servidor integrado.",
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.6",
)
