# Oficina 3L · prévia de redesign

Site-proposta não solicitado da **Verenna Digital** para a Oficina 3L, mecânica em Franco da Rocha (SP). Hoje a oficina não tem site: os clientes chegam pelo Instagram, pelo WhatsApp e pela ficha do Google.

```bash
npm install
npm run dev      # desenvolvimento
npm run images   # regera public/img a partir de assets-src
npm run build    # gera dist/
npm run deploy   # publica no GitHub Pages (Twyck/oficina-3l-preview), só com autorização
```

## Direção
- **Paleta da marca:** preto dos posts, dourado da logo de engrenagem (`#F2B90F`), fita zebrada preta e amarela como a da área dos elevadores, e as cores das luzes de painel (âmbar, vermelho, verde).
- **Tipografia:** Archivo variável (expandida nos títulos, lembrando o letreiro da logo) + JetBrains Mono para os mostradores.
- **Conceito próprio:** o site é um **painel de carro**. Na abertura, as luzes de alerta acendem e o conta-giros varre até o fim e volta, como no autoteste ao girar a chave. Depois o ponteiro "acelera" com a velocidade do scroll. Cada serviço é uma luz do painel. O status (aberto/fechado) é real, pelo horário de São Paulo.

## Roteiro das cenas
1. **Partida:** autoteste do painel + "Transparência e cuidado do início ao fim." + foto dos dois Lucas.
2. **Fita zebrada** com os serviços; acelera com o scroll.
3. **Serviços (fixo no desktop):** seis luzes acendem uma a uma e o serviço troca. No mobile, são cartões cuja luz acende ao chegar.
4. **Do início ao fim:** a ordem de serviço em 5 etapas, cada uma com uma frase real de avaliação. O marcador de combustível enche e as etapas são "ticadas".
5. **A oficina:** a mudança de endereço em julho de 2025, os números e a galeria "Do pequeno ao gigante".
6. **Avaliações:** 5,0, assuntos mais citados e quatro avaliações.
7. **Visite:** relógio ao vivo, status, horários, rotas e WhatsApp.

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
`auditoria-layout` e `auditoria-midia` com 0 problemas nas 14 resoluções. A seção de serviços engata exatamente em 1024, 1280 e 1920. Sem erros de console nem overflow ao redimensionar através de 1024px. Com movimento reduzido, todo o conteúdo fica visível.
