# Parte 1: Tecnologias para trabalhar com grafos

As ferramentas de grafos se dividem em cinco grupos, conforme o que fazem com o grafo: **analisar** (bibliotecas), **guardar e consultar** (bancos de dados), **padronizar a consulta** (linguagens), **processar em larga escala** (computação distribuída) e **mostrar** (visualização).

## Comparação

| Tecnologia | Categoria | Linguagem e forma de uso | Licença | Indicada para |
| --- | --- | --- | --- | --- |
| [NetworkX](https://networkx.org/documentation/stable/) | Biblioteca de análise | Python; o grafo é um objeto `Graph` ou `DiGraph` | BSD de 3 cláusulas | Estudar algoritmos e prototipar análises em grafos pequenos e médios |
| [igraph](https://igraph.org/) | Biblioteca de análise | Núcleo em C, com interfaces para R, Python e Mathematica | GPL-2.0 | Análise de grafos grandes, com desempenho de C |
| [graph-tool](https://graph-tool.skewed.de) | Biblioteca de análise | Python, com núcleo em C++ sobre a Boost Graph Library | LGPLv3 | Análise estatística de redes grandes e detecção de comunidades |
| [Neo4j](https://neo4j.com/docs/operations-manual/current/introduction/) | Banco de dados de grafos | Grafo de propriedades consultado em Cypher | Community: GPLv3; Enterprise: comercial | Guardar dados conectados com transações ACID e consultá-los por padrões |
| [Memgraph](https://github.com/memgraph/memgraph) | Banco de dados de grafos em memória | Escrito em C/C++; compatível com o Cypher do Neo4j | Código aberto | Análise em tempo real e dados vindos de fluxos contínuos |
| [JanusGraph](https://docs.janusgraph.org/) | Banco de dados de grafos distribuído | Consultado em Gremlin (Apache TinkerPop) | Apache 2.0 | Grafos grandes espalhados por vários servidores |
| [Amazon Neptune](https://docs.aws.amazon.com/neptune/latest/userguide/access-graph-queries.html) | Banco de dados de grafos gerenciado | Aceita Gremlin, openCypher e SPARQL | Serviço pago da AWS | Grafos em produção sem administrar servidor; dados RDF |
| [Apache TinkerPop / Gremlin](https://tinkerpop.apache.org/gremlin) | Framework e linguagem de travessia | Gremlin, uma sequência de passos sobre o grafo | Apache 2.0 | Código de consulta portável entre bancos diferentes |
| [GQL](https://en.wikipedia.org/wiki/Graph_Query_Language) | Padrão de linguagem de consulta | Norma ISO/IEC 39075:2024 | Norma ISO | Linguagem comum para bancos de grafos de propriedades |
| [GraphFrames](https://semyonsinchenko.github.io/graphframes) | Processamento distribuído | Grafos sobre DataFrames do Apache Spark; Scala, Java e Python | Apache 2.0 | Grafos enormes processados em cluster |
| [Cytoscape.js](https://js.cytoscape.org/) | Visualização e análise no navegador | JavaScript; elementos em JSON e estilo por seletores | MIT | Páginas web interativas com grafos |
| [Gephi](https://gephi.org/desktop) | Aplicativo de visualização | Programa de computador em Java | GPL | Explorar redes visualmente sem programar |

## O que cada grupo resolve

**Bibliotecas de análise** carregam o grafo inteiro na memória e oferecem algoritmos prontos. O NetworkX é escrito só em Python, o que o torna fácil de ler e ensinar. O igraph e o graph-tool trocam um pouco dessa facilidade por velocidade, porque o trabalho pesado é feito em C ou C++. O graph-tool ainda roda vários algoritmos em paralelo com OpenMP.

**Bancos de dados de grafos** guardam vértices e arestas de forma permanente e respondem a consultas. O Neo4j usa o modelo de grafo de propriedades: vértices e arestas têm rótulos e atributos. A edição Community é completa para uma única instância, com transações ACID e Cypher. O Memgraph segue o mesmo modelo e é compatível com o Cypher, mas guarda tudo na memória para ganhar velocidade. O Amazon Neptune é oferecido como serviço: a AWS cuida do servidor, e o mesmo grafo pode ser consultado em Gremlin ou em openCypher.

**Linguagens de consulta** são a parte que mais mudou nos últimos anos.

- O **Cypher** descreve padrões com uma sintaxe visual, como `(a)-[:ORIGINA]->(b)`, e ganhou uma versão aberta, o openCypher.
- O **Gremlin**, do Apache TinkerPop, descreve o caminho passo a passo e roda em qualquer banco compatível com o TinkerPop.
- Em abril de 2024 a ISO publicou o **GQL** (ISO/IEC 39075:2024). É a primeira linguagem de consulta a banco de dados padronizada pela ISO desde o SQL.

**Processamento distribuído** entra quando o grafo não cabe numa máquina. O GraphFrames roda sobre o Apache Spark e representa vértices e arestas como DataFrames, com algoritmos distribuídos e busca de padrões.

**Visualização** transforma o grafo em algo que se explora com o olho. O Cytoscape.js faz isso dentro do navegador e também traz algoritmos, de busca em largura a PageRank. O Gephi faz o mesmo como programa de computador, e é usado para explorar redes grandes sem escrever código.

## Como escolher

- **O grafo cabe na memória e a pergunta é analítica?** Comece pelo NetworkX. Se ficar lento, troque por igraph ou graph-tool.
- **Os dados mudam, precisam durar e várias aplicações consultam?** Use um banco de grafos, como Neo4j ou Memgraph. Para não cuidar de servidor, use Neptune.
- **O grafo não cabe numa máquina?** Use GraphFrames ou um banco distribuído como o JanusGraph.
- **Alguém precisa ver e explorar o grafo?** Use Cytoscape.js, se for numa página web, ou Gephi, se for no computador.

## Tecnologias usadas neste repositório

| Tecnologia | Papel no projeto | Arquivo |
| --- | --- | --- |
| NetworkX | Validar os dados e calcular gerações, ancestrais, caminhos e centralidade | `python/analise_generos.py` |
| Neo4j (Cypher) | Guardar o grafo como banco e responder às mesmas perguntas por consulta | `neo4j/01-criar-grafo.cypher`, `neo4j/02-consultas.cypher` |
| Cytoscape.js | Mostrar a linha do tempo interativa no navegador | `web/index.html` |

## Fontes

- [NetworkX: documentação e licença](https://networkx.org/documentation/stable/)
- [igraph: site oficial](https://igraph.org/) e [python-igraph no GitHub](https://www.Github.com/igraph/python-igraph)
- [graph-tool: site oficial](https://graph-tool.skewed.de)
- [Neo4j: manual de operações, edições](https://neo4j.com/docs/operations-manual/current/introduction/) e [licenciamento](https://neo4j.com/licensing/?ref=blog)
- [Memgraph no GitHub](https://www.github.com/memgraph/memgraph)
- [JanusGraph: linguagem Gremlin](https://docs.janusgraph.org/v0.2/basics/gremlin/)
- [Amazon Neptune: linguagens de consulta](https://docs.aws.amazon.com/neptune/latest/userguide/access-graph-queries.html)
- [Apache TinkerPop: Gremlin](https://tinkerpop.apache.org/gremlin)
- [GQL (ISO/IEC 39075:2024)](https://webstore.iec.ch/publication/94107) e [The New Stack sobre o GQL](https://thenewstack.io/gql-a-new-iso-standard-for-querying-graph-databases/)
- [GraphFrames: visão geral](https://semyonsinchenko.github.io/graphframes)
- [Cytoscape.js: site oficial](https://js.cytoscape.org/)
- [Gephi Desktop](https://gephi.org/desktop)
