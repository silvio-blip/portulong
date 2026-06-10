# Extensão Portulong para o VS Code

Esta extensão adiciona suporte à linguagem **Portulong (`.ptg`)** no Visual Studio Code.

## Funcionalidades
1. **Destaque de Sintaxe (Syntax Highlighting)**: Cores completas para palavras-chave, variáveis, funções e strings.
2. **Botão de Execução Rápida (Play/Run)**: Um botão triangular no canto superior direito (`editor/title`) que executa `portulong executar <nome-do-ficheiro.ptg>` diretamente num terminal integrado.
3. **Mapeamento de Atalhos**: Pressionar `Ctrl + F5` (ou `Cmd + F5` no macOS) também ativa o comando de execução rápida.

## Como Compilar e Criar o Ficheiro `.vsix`

No seu terminal local, siga estes passos:

1. **Instalar o empacotador de extensões globalmente** (se ainda não o tiver):
   ```bash
   npm install -g @vscode/vsce
   ```

2. **Entrar no diretório da extensão**:
   ```bash
   cd vscode-extension
   ```

3. **Gerar o pacote `.vsix`**:
   ```bash
   vsce package
   ```
   *Nota: O `vsce` perguntará se quer continuar sem um repositório git definido no `package.json`, pode selecionar "y" (sim) para prosseguir.*

4. **Instalar no seu VS Code**:
   - Abra o VS Code.
   - Abra a aba de extensões (`Ctrl+Shift+X`).
   - Clique nos três pontos (`...`) no canto superior direito da aba de extensões.
   - Escolha **"Install from VSIX..."** (Instalar a partir de VSIX).
   - Selecione o ficheiro `.vsix` gerado e divirta-se!
