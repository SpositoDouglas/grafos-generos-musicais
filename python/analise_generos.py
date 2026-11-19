import argparse
import json
from pathlib import Path

import networkx as nx

CAMINHO_DADOS = Path(__file__).resolve().parent.parent / "dados" / "generos.json"
LINHAGEM = {"origina", "funde"}


def carregar(caminho=CAMINHO_DADOS):
    with open(caminho, encoding="utf-8") as arquivo:
        return json.load(arquivo)


def montar_grafo(dados, tipos=None):
    grafo = nx.DiGraph()
    for genero in dados["generos"]:
        grafo.add_node(genero["id"], **genero)
    for relacao in dados["relacoes"]:
        if tipos is None or relacao["tipo"] in tipos:
            grafo.add_edge(relacao["de"], relacao["para"], tipo=relacao["tipo"])
    return grafo


def nome(grafo, no):
    return grafo.nodes[no]["nome"]


def ordenar(grafo, nos):
    return sorted(nos, key=lambda n: (grafo.nodes[n]["decada"], nome(grafo, n)))


def id_por_nome(grafo, texto):
    for no, atributos in grafo.nodes(data=True):
        if no == texto.lower() or atributos["nome"].lower() == texto.lower():
            return no
    raise ValueError(f"Gênero não encontrado: {texto}")


def problemas_de_cronologia(grafo):
    return [
        (a, b) for a, b in grafo.edges
        if grafo.nodes[a]["decada"] > grafo.nodes[b]["decada"]
    ]


def geracoes(linhagem):
    return [ordenar(linhagem, geracao) for geracao in nx.topological_generations(linhagem)]


def ancestrais(linhagem, no):
    return ordenar(linhagem, nx.ancestors(linhagem, no))


def descendentes(linhagem, no):
    return ordenar(linhagem, nx.descendants(linhagem, no))


def caminho(grafo, origem, destino):
    try:
        return nx.shortest_path(grafo, origem, destino)
    except nx.NetworkXNoPath:
        return None


def ancestral_comum(linhagem, a, b):
    comuns = (nx.ancestors(linhagem, a) | {a}) & (nx.ancestors(linhagem, b) | {b})
    if not comuns:
        return None
    return max(comuns, key=lambda n: (linhagem.nodes[n]["decada"], nome(linhagem, n)))


def mais_descendentes(linhagem, quantidade=5):
    contagem = [(no, len(nx.descendants(linhagem, no))) for no in linhagem.nodes]
    contagem.sort(key=lambda item: (-item[1], nome(linhagem, item[0])))
    return contagem[:quantidade]


def pontes(grafo, quantidade=5):
    centralidade = nx.betweenness_centrality(grafo)
    ranking = sorted(centralidade.items(), key=lambda item: (-item[1], nome(grafo, item[0])))
    return ranking[:quantidade]


def descrever_caminho(grafo, nos):
    partes = [nome(grafo, nos[0])]
    for a, b in zip(nos, nos[1:]):
        partes.append(f"--{grafo.edges[a, b]['tipo']}--> {nome(grafo, b)}")
    return " ".join(partes)


def titulo(texto):
    print()
    print(texto)
    print("-" * len(texto))


def main():
    parser = argparse.ArgumentParser(description="Análise da linhagem dos gêneros musicais com NetworkX")
    parser.add_argument("--genero", default="Bossa nova")
    parser.add_argument("--de", default="Blues")
    parser.add_argument("--ate", default="Dubstep")
    parser.add_argument("--comparar", nargs=2, default=["Bossa nova", "Rock and roll"])
    args = parser.parse_args()

    dados = carregar()
    completo = montar_grafo(dados)
    linhagem = montar_grafo(dados, LINHAGEM)

    titulo("1. Resumo do grafo")
    tipos = {}
    for _, _, tipo in completo.edges(data="tipo"):
        tipos[tipo] = tipos.get(tipo, 0) + 1
    print(f"Vértices (gêneros): {completo.number_of_nodes()}")
    print(f"Arestas (relações): {completo.number_of_edges()} -> {tipos}")

    titulo("2. Validação")
    print(f"Linhagem sem ciclos (DAG): {nx.is_directed_acyclic_graph(linhagem)}")
    problemas = problemas_de_cronologia(completo)
    print(f"Relações que voltam no tempo: {len(problemas)}")

    titulo("3. Gerações (ordem topológica da linhagem)")
    for indice, geracao in enumerate(geracoes(linhagem)):
        print(f"{indice}: " + ", ".join(nome(linhagem, n) for n in geracao))

    alvo = id_por_nome(completo, args.genero)
    titulo(f"4. De onde vem e o que gerou: {nome(completo, alvo)}")
    print("Ancestrais: " + (", ".join(nome(linhagem, n) for n in ancestrais(linhagem, alvo)) or "nenhum"))
    print("Descendentes: " + (", ".join(nome(linhagem, n) for n in descendentes(linhagem, alvo)) or "nenhum"))

    origem = id_por_nome(completo, args.de)
    destino = id_por_nome(completo, args.ate)
    titulo(f"5. Caminho de {nome(completo, origem)} até {nome(completo, destino)}")
    for rotulo, grafo in (("Só linhagem", linhagem), ("Com influências", completo)):
        nos = caminho(grafo, origem, destino)
        texto = descrever_caminho(grafo, nos) if nos else "não há caminho"
        passos = f" ({len(nos) - 1} passos)" if nos else ""
        print(f"{rotulo}{passos}: {texto}")

    a = id_por_nome(completo, args.comparar[0])
    b = id_por_nome(completo, args.comparar[1])
    comum = ancestral_comum(linhagem, a, b)
    titulo(f"6. Ancestral comum mais recente: {nome(completo, a)} e {nome(completo, b)}")
    print(f"{nome(linhagem, comum)} ({linhagem.nodes[comum]['decada']})" if comum else "nenhum")

    titulo("7. Gêneros com mais descendentes")
    for no, total in mais_descendentes(linhagem):
        print(f"{nome(linhagem, no)}: {total}")

    titulo("8. Gêneros-ponte (centralidade de intermediação)")
    for no, valor in pontes(completo):
        print(f"{nome(completo, no)}: {valor:.3f}")

    titulo("9. Maior cadeia de linhagem")
    cadeia = nx.dag_longest_path(linhagem)
    print(f"{len(cadeia)} gêneros: " + " -> ".join(nome(linhagem, n) for n in cadeia))


if __name__ == "__main__":
    main()
