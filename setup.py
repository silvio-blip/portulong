#!/usr/bin/env python3
"""Setup com post-install automático"""

from setuptools import setup, find_packages
from setuptools.command.install import install
from setuptools.command.develop import develop
import subprocess
import sys
import os

class PostInstallCommand(install):
    """Post-install para configuração automática"""
    def run(self):
        install.run(self)
        self.executar_configuracao()

    def executar_configuracao(self):
        try:
            # Importar e executar instalador
            sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))
            from portulong.portulong_installer import main
            print("\n🔧 Executando configuração automática...")
            main()
        except Exception as e:
            print(f"⚠️ Configuração automática falhou: {e}")
            print("Execute manualmente: portulong-install")

class PostDevelopCommand(develop):
    """Post-develop para modo desenvolvimento"""
    def run(self):
        develop.run(self)
        self.executar_configuracao()

    def executar_configuracao(self):
        try:
            sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))
            from portulong.portulong_installer import main
            print("\n🔧 Executando configuração automática...")
            main()
        except Exception as e:
            print(f"⚠️ Configuração automática falhou: {e}")
            print("Execute manualmente: portulong-install")

# Ler README
with open("README.md", "r", encoding="utf-8") as f:
    long_description = f.read()

setup(
    name="portulong-sistema",
    version="1.0.15",
    author="portulong",
    author_email="portulong@example.com",
    description="Linguagem de programação em Português de Portugal para criar páginas web",
    long_description=open("README.md", "r", encoding="utf-8").read(),
    long_description_content_type="text/markdown",
    url="https://github.com/silvio-blip/portulong",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    include_package_data=True,
    package_data={
        "portulong": ["imagens/*.png", "*.ptg", "syntaxes/*.json", "snippets/*.json"],
    },
    install_requires=[],
    entry_points={
        "console_scripts": [
            "portulong-sistema=portulong.__main__:main",
            "portulong-install=portulong.portulong_installer:main",
            "ptg=portulong.ptg_wrapper:main",
            "ptg-iniciar=portulong.ptg_wrapper:main",
            "ptg-atualizar=portulong.ptg_atualizar:main",
        ],
    },
    cmdclass={
        'install': PostInstallCommand,
        'develop': PostDevelopCommand,
    },
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Natural Language :: Portuguese",
    ],
    python_requires=">=3.6",
)