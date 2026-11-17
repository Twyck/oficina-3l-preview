# Oficina 3L · prévia de redesign

Site-proposta não solicitado da **Verenna Digital** para a Oficina 3L, mecânica em Franco da Rocha (SP). Hoje a oficina não tem site: os clientes chegam pelo Instagram, pelo WhatsApp e pela ficha do Google.

```bash
npm install
npm run dev      # desenvolvimento
npm run images   # regera public/img a partir de assets-src
npm run build    # gera dist/
npm run deploy   # publica no GitHub Pages (Twyck/oficina-3l-preview), só com autorização
```

## Direção (v4: segue o modelo enviado pelo João em 17/11)
A v1 (painel de carro) e a v2 (base clara) foram descartadas. A v3 segue as referências (BeMechanic, CarHive, Car Doctor e Depower) com a cara da marca: preto dos posts, dourado da logo, amarelo do card de localização e o quadriculado do flyer de férias. Hero com foto cheia (BeMechanic):
- **Blocos de cor:** preto e grafite com blocos dourados sólidos (`--gold`); a faixa quadriculada do flyer separa hero e rodapé.
- **Tipografia:** Unbounded (larga, como o letreiro da logo), Manrope e Geist Mono.
- **Hero (BeMechanic + Depower):** foto cheia de um mecânico trabalhando, título com "do início ao fim" em dourado, cartão dourado de status ao vivo e a linha de números (5,0 · 36 · 9–18h · 120 kg).
- **Por que a 3L (BeMechanic):** seção preta com checklist e a fileira de ícones de serviço.
- **Serviços (CarHive):** painel preto com cards brancos por cima; a seta de cada card abre o WhatsApp já com o serviço.
- **Equipe:** os dois Lucas.
- **Agendar (BeMechanic):** bloco dourado + foto. Interação própria: a **ordem de serviço** se preenche enquanto a pessoa digita o carro e o problema, e o botão manda tudo pronto para o WhatsApp.
- **Como funciona (Car Doctor):** 5 etapas com frases reais de clientes; o trilho enche com o scroll.
- **Galeria em mosaico**, **avaliações** e **rodapé em bloco dourado** com horário ao vivo.

## Roteiro das cenas
1. "3L" sobe, a foto abre de cima para baixo como porta de garagem, os números contam.
2. Checks e ícones entram em sequência.
3. Cards sobem sobre o painel preto.
4. Equipe com parallax dentro da moldura.
5. Ticket da ordem de serviço "sai da impressora".
6. Trilho das etapas enche e cada número fica dourado.
7. Galeria revela de baixo para cima; a coluna da direita anda mais devagar.

## Fontes de cada informação
| Informação | Fonte |
|---|---|
| Nome, endereço (R. Hercílio Caetano Pereira, 18a · Jardim Progresso · 07812-180), telefone, coordenadas, categoria | Ficha "Oficina 3L" no Google Maps |
| Nota 5,0, 36 avaliações, assuntos (preço 8, diagnóstico 4...), citações de Kaio Langame, Denilson Oliveira, Bruno Henrique, Leonardo Fuentealba e destaques | Google Maps (consultado em 17/11/2026) |
| "Andrelo Garagem" como nome anterior; Lucas proprietário | Respostas do proprietário e avaliações no Google |
| Bio: "Oficina mecânica em Franco da Rocha · Transparência e cuidado em cada detalhe" | Instagram @oficina.3l |
| Slogan "Transparência e cuidado do início ao fim" | Logo/placas e post de 09/11/2026 |
| Seg. a sex. 9h–18h, fim de semana fechado ("pra recarregar as baterias") | Reel de 21/07/2025 + Google Maps |
| Mudança de endereço e o Lacerda na nova fase | Reel de 21/07/2025 |
| Nomes Lucas Andrelo e Lucas Lacerda | Moletons na foto da equipe (Google Maps) |
| Serviços: diagnóstico completo, manutenção preventiva e corretiva, freios, suspensão, troca de óleo, revisão para viagens | Posts de 09 e 10/11/2026 |
| Sapata nova trincada na Frontier | Reel de 13/11/2026 |
| Câmbio de ~120 kg | Reel de 10/11/2026 |
| Ferramentas específicas e peças originais | Reel de 04/11/2026 |
| Falhas intermitentes | Reel de 06/11/2026 |
| Fotos | Fotos do proprietário no Google Maps (2048 px) e capas de reels do Instagram (360 px, recortadas para tirar o ícone de "play") |
| Logo (marca da engrenagem) | Foto de perfil do Instagram (150 px), recortada e com fundo removido |

Preços foram omitidos de propósito.

## Pendências para o cliente
- **Logo em vetor:** só existe em 150 px. O site usa a marca da engrenagem pequena e o nome em tipografia.
- **Fotos:** várias fotos do Google são da época da Andrelo Garagem (placas "Andrelo"). Uma sessão curta na oficina nova (fachada, elevadores, equipe de frente, diagnóstico no scanner) eleva tudo.
- **Segundo telefone** que aparece num post (11 9967?-0741) ficou de fora por estar ilegível.
- **Link de avaliação do Google** (um cliente pediu nos comentários) pode virar um botão.

## QA (17/11/2026)
v2: `auditoria-layout` e `auditoria-midia` com 0 problemas nas 14 resoluções. Sem seções fixas. Sem erros de console nem overflow ao redimensionar através de 1024px; com movimento reduzido, tudo visível. `checar-menu-ativo` acusa "Por que a 3L" e "Equipe": a ferramenta mede em 60% da tela abaixo do topo, e essas seções são mais baixas que isso (no navegador o menu marca certo).
