MATCH (g:Genero {nome: 'Bossa nova'})<-[:ORIGINA|FUNDE*1..]-(a:Genero)
RETURN DISTINCT a.nome AS ancestral, a.decada AS decada
ORDER BY decada, ancestral;

MATCH (g:Genero {nome: 'Hip-hop'})-[:ORIGINA|FUNDE*1..]->(d:Genero)
RETURN DISTINCT d.nome AS descendente, d.decada AS decada
ORDER BY decada, descendente;

MATCH p = shortestPath((a:Genero {nome: 'Blues'})-[:ORIGINA|FUNDE*]->(b:Genero {nome: 'Dubstep'}))
RETURN [n IN nodes(p) | n.nome] AS caminho,
       [r IN relationships(p) | type(r)] AS relacoes,
       length(p) AS passos;

MATCH (a:Genero {nome: 'Bossa nova'})<-[:ORIGINA|FUNDE*1..]-(c:Genero)-[:ORIGINA|FUNDE*1..]->(b:Genero {nome: 'Rock and roll'})
RETURN DISTINCT c.nome AS ancestral_comum, c.decada AS decada
ORDER BY decada DESC
LIMIT 1;

MATCH (a:Genero)-[:FUNDE]->(f:Genero)<-[:FUNDE]-(b:Genero)
WHERE a.nome < b.nome
RETURN f.nome AS fusao, f.decada AS decada, a.nome + ' + ' + b.nome AS origens
ORDER BY decada, fusao;

MATCH (g:Genero)
OPTIONAL MATCH (g)-[:ORIGINA|FUNDE*1..]->(d:Genero)
RETURN g.nome AS genero, count(DISTINCT d) AS descendentes
ORDER BY descendentes DESC, genero
LIMIT 5;

MATCH (g:Genero)-[:DA_FAMILIA]->(f:Familia)
RETURN f.nome AS familia, count(g) AS generos
ORDER BY generos DESC, familia;

MATCH (g:Genero)
WHERE NOT EXISTS { ()-[:ORIGINA|FUNDE]->(g) }
RETURN g.nome AS raiz, g.decada AS decada
ORDER BY decada, raiz;

MATCH (a:Genero)-[r:ORIGINA|FUNDE|INFLUENCIA]->(b:Genero)
WHERE a.decada > b.decada
RETURN a.nome AS origem, type(r) AS relacao, b.nome AS destino;

MATCH p = (g:Genero)-[:ORIGINA|FUNDE*1..]->(g)
RETURN [n IN nodes(p) | n.nome] AS ciclo
LIMIT 1;
