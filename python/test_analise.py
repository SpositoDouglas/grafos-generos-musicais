import unittest

import networkx as nx

import analise_generos as ag

PEQUENO = {
    "generos": [
        {"id": "a", "nome": "A", "decada": 1900},
        {"id": "b", "nome": "B", "decada": 1910},
        {"id": "c", "nome": "C", "decada": 1920},
    ],
    "relacoes": [
        {"de": "a", "para": "b", "tipo": "origina"},
        {"de": "b", "para": "c", "tipo": "origina"},
    ],
}


class TestAcervo(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        dados = ag.carregar()
        cls.completo = ag.montar_grafo(dados)
        cls.linhagem = ag.montar_grafo(dados, ag.LINHAGEM)

    def test_tamanho(self):
        self.assertEqual(self.completo.number_of_nodes(), 32)
        self.assertEqual(self.completo.number_of_edges(), 43)

    def test_linhagem_sem_ciclos(self):
        self.assertTrue(nx.is_directed_acyclic_graph(self.linhagem))

    def test_nenhuma_relacao_volta_no_tempo(self):
        self.assertEqual(ag.problemas_de_cronologia(self.completo), [])

    def test_ancestrais_da_bossa_nova(self):
        self.assertEqual(ag.ancestrais(self.linhagem, "bossa"), ["blues", "jazz", "samba"])

    def test_caminho_blues_dubstep(self):
        esperado = ["blues", "rnb", "soul", "disco", "house", "ukgarage", "dubstep"]
        self.assertEqual(ag.caminho(self.linhagem, "blues", "dubstep"), esperado)

    def test_sem_caminho_samba_rock(self):
        self.assertIsNone(ag.caminho(self.linhagem, "samba", "rock"))

    def test_ancestral_comum(self):
        self.assertEqual(ag.ancestral_comum(self.linhagem, "bossa", "rockroll"), "jazz")

    def test_busca_por_nome(self):
        self.assertEqual(ag.id_por_nome(self.completo, "hip-hop"), "hiphop")
        with self.assertRaises(ValueError):
            ag.id_por_nome(self.completo, "Polca")


class TestGrafoPequeno(unittest.TestCase):
    def test_geracoes(self):
        grafo = ag.montar_grafo(PEQUENO)
        self.assertEqual(ag.geracoes(grafo), [["a"], ["b"], ["c"]])

    def test_detecta_ciclo(self):
        dados = {
            "generos": PEQUENO["generos"],
            "relacoes": PEQUENO["relacoes"] + [{"de": "c", "para": "a", "tipo": "origina"}],
        }
        self.assertFalse(nx.is_directed_acyclic_graph(ag.montar_grafo(dados)))

    def test_detecta_relacao_que_volta_no_tempo(self):
        dados = {
            "generos": PEQUENO["generos"],
            "relacoes": [{"de": "c", "para": "a", "tipo": "influencia"}],
        }
        self.assertEqual(ag.problemas_de_cronologia(ag.montar_grafo(dados)), [("c", "a")])


if __name__ == "__main__":
    unittest.main()
