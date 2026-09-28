# RC.Theme

Tema customizado para o Rocket.Chat, aplicado pelo **Custom Script** do workspace. Não precisa alterar o servidor nem fazer build: o script injeta o CSS em tempo de execução e cada usuário ajusta cores, bordas e raios por um painel de configuração.

## Como funciona

```
Custom Script (admin)
  └─ busca rc_custom_theme.js no gist e executa rc_custom_theme()
       ├─ cria o painel "Theme Config" (Cmd/Ctrl + clique no avatar)
       ├─ lê as preferências do localStorage (chave gist_theme2)
       └─ se o tema estiver habilitado:
            └─ busca theme2.js no gist e executa applyCustomTheme2(CONFIG)
                 └─ injeta <style id="theme-2"> na página
```

Os arquivos são carregados pela API de gists do GitHub, a partir do gist [`d8123818f79ad0bd4a651e48a5ccb73a`](https://gist.github.com/rodrigok/d8123818f79ad0bd4a651e48a5ccb73a).

## Arquivos

| Arquivo | Função |
| --- | --- |
| `rc_custom_theme.js` | Define `window.rc_custom_theme()`. Monta o painel de configuração, salva as preferências no `localStorage` e carrega/aplica o tema. |
| `theme2.js` | Define `window.applyCustomTheme2(options)`. Gera o CSS do tema a partir das opções e injeta na página. |
| `inject.js` | Snippet para colar no console do DevTools e testar o `theme2.js` direto, sem passar pelo painel. Preencha o `CONFIG` antes de rodar. |

## Instalação

1. Acesse **Administration → Workspace → Settings → Layout → Custom scripts**.
2. Cole o código abaixo em **Custom script for logged in users** e salve.

```js
// Code added by Rodrigo Nascimento on March 20th 2026

if (!window.rc_custom_theme_code) {
	(async () => {
		const GIST_ID = 'd8123818f79ad0bd4a651e48a5ccb73a';
		const FILENAME = 'rc_custom_theme.js';
	
		const r = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
			headers: { 'Accept': 'application/vnd.github+json' },
			cache: 'no-store'
		});
		if (!r.ok) throw new Error('Failed to load gist meta: ' + r.status);
		const data = await r.json();
		const file = data.files?.[FILENAME];
		if (!file) throw new Error(`File ${FILENAME} not found in gist`);
		const code = file.truncated
			? await (await fetch(file.raw_url, { cache: 'no-store' })).text()
			: file.content;
			
		window.rc_custom_theme_code = code;
		
		// Run it in the page context
		(0, eval)(window.rc_custom_theme_code);

		rc_custom_theme();

		console.log('Gist executed:', FILENAME);
	})();
}
```

## Uso

O tema começa **desabilitado**. Para ligar:

1. Segure **Cmd** (macOS) ou **Ctrl** (Windows/Linux) e clique no seu avatar na barra de navegação.
2. No painel **Theme Config**, marque **Enable theme**.

As alterações são aplicadas na hora e ficam salvas no `localStorage` do navegador, ou seja, valem por usuário e por navegador.

| Opção | Padrão | Descrição |
| --- | --- | --- |
| Enable theme | desligado | Liga ou desliga o tema. |
| GIST_ID | `d8123818f79ad0bd4a651e48a5ccb73a` | Gist de onde o tema é carregado. |
| FILENAME | `theme2.js` | Arquivo do tema dentro do gist. |
| Background Dark | `#0F0F0F` | Cor de fundo base no modo escuro. |
| Background Light | `#F0F0F0` | Cor de fundo base no modo claro. |
| Container Border | `0px` | Espessura da borda dos containers (0–5px). |
| Border Radius (Default) | `10px` | Raio dos containers, mensagens e campos (0–40px). |
| Border Radius (Small) | `8px` | Raio de itens menores, como opções de menu (0–40px). |
| Border Radius (Avatar) | `30%` | Raio dos avatares (0–100%). |
| ABAC | `none` | Moldura de classificação da sala: `top-secret` (laranja) ou `unclassified` (verde). |

**Reset to Defaults** restaura todos os valores, exceto o **Enable theme**.

Como `GIST_ID` e `FILENAME` são editáveis, dá para testar uma versão nova do tema apontando para outro gist ou arquivo, sem mexer no Custom Script do workspace.

## Publicando alterações

O Rocket.Chat carrega os arquivos **do gist, não deste repositório**. Depois de alterar `rc_custom_theme.js` ou `theme2.js` aqui, copie o conteúdo para o arquivo correspondente no gist.

O código fica em cache na página (`window.rc_custom_theme_code`), então é preciso recarregar o Rocket.Chat para pegar a versão nova.

## Observações

- A API do GitHub sem autenticação aceita 60 requisições por hora por IP. Cada carregamento de página faz uma requisição, ou duas com o tema habilitado. Em redes onde muitos usuários saem pelo mesmo IP, o limite pode ser atingido e o tema deixa de carregar até a janela resetar.
- O tema depende das classes CSS do Fuselage (`.rcx-*`) e da estrutura atual do DOM. Atualizações do Rocket.Chat podem quebrar partes do layout.
