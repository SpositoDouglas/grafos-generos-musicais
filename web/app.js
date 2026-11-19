const PASSO_DECADA = 110;
const ALTURA_FAIXA = 150;
const ESPACO_VERTICAL = 56;
const LINHAGEM = "edge[tipo = 'origina'], edge[tipo = 'funde']";

let dados = JSON.parse(JSON.stringify(DADOS_INICIAIS));
let cy;
let visao = "tempo";
let tocando = null;

const $ = id => document.getElementById(id);

function decadas() {
  const lista = dados.generos.map(g => g.decada);
  const menor = Math.min(1900, ...lista);
  const maior = Math.max(2000, ...lista);
  const todas = [];
  for (let d = menor; d <= maior; d += 10) todas.push(d);
  return todas;
}

function posicoes() {
  const grupos = {};
  dados.generos.forEach(g => {
    const chave = g.familia + ":" + g.decada;
    (grupos[chave] = grupos[chave] || []).push(g);
  });
  const resultado = {};
  const inicio = decadas()[0];
  Object.values(grupos).forEach(lista => {
    lista.sort((a, b) => a.nome.localeCompare(b.nome));
    lista.forEach((g, i) => {
      resultado[g.id] = {
        x: (g.decada - inicio) / 10 * PASSO_DECADA,
        y: ORDEM_FAMILIAS.indexOf(g.familia) * ALTURA_FAIXA + (i - (lista.length - 1) / 2) * ESPACO_VERTICAL
      };
    });
  });
  return resultado;
}

function elementosDecoracao() {
  const lista = decadas();
  const largura = (lista.length - 1) * PASSO_DECADA;
  const topoY = -ALTURA_FAIXA / 2 - 10;
  const baseY = (ORDEM_FAMILIAS.length - 0.5) * ALTURA_FAIXA + 10;
  const elementos = [];

  ORDEM_FAMILIAS.forEach((f, i) => {
    elementos.push({
      group: "nodes",
      data: { id: "faixa-" + f, cor: FAMILIAS[f].cor },
      classes: "decor faixa",
      position: { x: largura / 2 - 60, y: i * ALTURA_FAIXA },
      style: { width: largura + 300, height: ALTURA_FAIXA - 12 },
      selectable: false, grabbable: false
    });
    elementos.push({
      group: "nodes",
      data: { id: "rotulo-" + f, rotulo: FAMILIAS[f].nome, cor: FAMILIAS[f].cor },
      classes: "decor rotulo-familia",
      position: { x: -150, y: i * ALTURA_FAIXA },
      selectable: false, grabbable: false
    });
  });

  lista.forEach((d, i) => {
    const x = i * PASSO_DECADA;
    elementos.push({
      group: "nodes",
      data: { id: "linha-" + d },
      classes: "decor linha",
      position: { x, y: (topoY + baseY) / 2 },
      style: { height: baseY - topoY },
      selectable: false, grabbable: false
    });
    elementos.push({
      group: "nodes",
      data: { id: "ano-" + d, rotulo: i === 0 && d === 1900 ? "c. 1900" : String(d), decada: d },
      classes: "decor ano",
      position: { x, y: topoY - 22 },
      selectable: false, grabbable: false
    });
  });
  return elementos;
}

function elementosGrafo() {
  const pos = posicoes();
  const nos = dados.generos.map(g => ({
    group: "nodes",
    data: { ...g, cor: FAMILIAS[g.familia].cor },
    classes: "genero",
    position: pos[g.id]
  }));
  const arestas = dados.relacoes.map(r => ({
    group: "edges",
    data: { id: `${r.de}-${r.tipo}-${r.para}`, source: r.de, target: r.para, tipo: r.tipo }
  }));
  return nos.concat(arestas);
}

function curvatura(aresta) {
  const a = aresta.source().position();
  const b = aresta.target().position();
  const comprimento = Math.hypot(b.x - a.x, b.y - a.y);
  if (comprimento < 140) return 0;
  return -Math.min(90, comprimento * 0.14);
}

function estilo() {
  return [
    { selector: "*", style: { "z-index-compare": "manual" } },
    {
      selector: "node.faixa",
      style: {
        "shape": "round-rectangle",
        "background-color": "data(cor)",
        "background-opacity": 0.06,
        "border-width": 0,
        "events": "no",
        "z-index": 0
      }
    },
    {
      selector: "node.linha",
      style: { "shape": "rectangle", "width": 1, "background-color": "#cfd5dc", "border-width": 0, "events": "no", "z-index": 1 }
    },
    {
      selector: "node.ano",
      style: {
        "label": "data(rotulo)",
        "background-opacity": 0,
        "border-width": 0,
        "width": 1,
        "height": 1,
        "font-family": "'Source Sans 3', 'Segoe UI', sans-serif",
        "font-size": 14,
        "font-weight": 600,
        "color": "#5e6774",
        "events": "no",
        "z-index": 1
      }
    },
    {
      selector: "node.rotulo-familia",
      style: {
        "label": "data(rotulo)",
        "background-opacity": 0,
        "border-width": 0,
        "width": 1,
        "height": 1,
        "text-wrap": "wrap",
        "text-max-width": "120px",
        "text-halign": "center",
        "font-family": "Fraunces, Georgia, serif",
        "font-size": 15,
        "font-weight": 700,
        "color": "data(cor)",
        "events": "no",
        "z-index": 1
      }
    },
    {
      selector: "node.genero",
      style: {
        "shape": "round-rectangle",
        "label": "data(nome)",
        "text-wrap": "wrap",
        "text-max-width": "82px",
        "text-valign": "center",
        "text-halign": "center",
        "font-family": "'Source Sans 3', 'Segoe UI', sans-serif",
        "font-size": 13,
        "font-weight": 600,
        "color": "#1d232b",
        "background-color": "#ffffff",
        "border-width": 2,
        "border-color": "data(cor)",
        "width": "label",
        "height": "label",
        "padding": "9px",
        "z-index": 10,
        "transition-property": "opacity, border-width",
        "transition-duration": "160ms"
      }
    },
    {
      selector: "edge",
      style: {
        "width": 1.8,
        "curve-style": "unbundled-bezier",
        "control-point-distances": curvatura,
        "control-point-weights": 0.5,
        "line-color": "#4a5462",
        "target-arrow-color": "#4a5462",
        "target-arrow-shape": "triangle",
        "arrow-scale": 0.9,
        "z-index": 5,
        "transition-property": "opacity",
        "transition-duration": "160ms"
      }
    },
    {
      selector: "edge[tipo = 'funde']",
      style: { "source-arrow-shape": "diamond", "source-arrow-color": "#4a5462", "source-arrow-fill": "filled" }
    },
    {
      selector: "edge[tipo = 'influencia']",
      style: { "line-style": "dashed", "line-color": "#8f98a5", "target-arrow-color": "#8f98a5", "width": 1.4 }
    },
    { selector: ".apagado", style: { "opacity": 0.12 } },
    { selector: "node.genero.foco", style: { "border-width": 4, "background-color": "#fff7e8" } },
    { selector: "edge.rota", style: { "width": 4.5, "line-color": "#1d232b", "target-arrow-color": "#1d232b", "source-arrow-color": "#1d232b", "z-index": 20 } },
    { selector: "node.genero.rota", style: { "border-width": 4, "background-color": "#fff7e8" } },
    { selector: "node.genero.novo", style: { "border-style": "double", "border-width": 5 } }
  ];
}

function tiposAtivos() {
  return [...document.querySelectorAll("#filtro-tipos input:checked")].map(i => i.value);
}

function familiasAtivas() {
  return [...document.querySelectorAll("#filtro-familias input:checked")].map(i => i.value);
}

function ateDecada() {
  return Number($("ate").value);
}

function aplicarVisibilidade() {
  const tipos = tiposAtivos();
  const familias = familiasAtivas();
  const limite = ateDecada();
  cy.batch(() => {
    cy.nodes(".genero").forEach(n => {
      const ok = familias.includes(n.data("familia")) && n.data("decada") <= limite;
      n.style("display", ok ? "element" : "none");
    });
    cy.edges().forEach(e => {
      const ok = tipos.includes(e.data("tipo")) &&
        e.source().style("display") !== "none" &&
        e.target().style("display") !== "none";
      e.style("display", ok ? "element" : "none");
    });
    cy.nodes(".decor").style("display", visao === "tempo" ? "element" : "none");
  });
}

function visiveis() {
  return cy.elements(".genero, edge").filter(e => e.style("display") !== "none");
}

function arestasDeCadeia() {
  const tipos = tiposAtivos().filter(t => t !== "influencia" || tiposAtivos().includes("influencia"));
  return cy.edges().filter(e => tipos.includes(e.data("tipo")) && e.style("display") !== "none");
}

function cadeia(no, sentido) {
  const arestas = arestasDeCadeia();
  const achados = cy.collection();
  const fila = [no];
  while (fila.length) {
    const atual = fila.shift();
    const proximas = sentido === "antes"
      ? atual.incomers().intersection(arestas).sources()
      : atual.outgoers().intersection(arestas).targets();
    proximas.forEach(p => {
      if (!achados.has(p)) {
        achados.merge(p);
        fila.push(p);
      }
    });
  }
  return achados;
}

function botaoNo(no, tipo) {
  const extra = tipo ? `<span class="tipo">${ROTULO_TIPO[tipo]}</span>` : "";
  return `<button class="no" data-id="${no.id()}" style="border-color:${no.data("cor")}">${no.data("nome")}${extra}</button>`;
}

function listaNos(nos, vazio) {
  if (!nos.length) return `<span class="vazio">${vazio}</span>`;
  return `<div class="lista">${nos.sort((a, b) => a.data("decada") - b.data("decada")).map(n => botaoNo(n)).join("")}</div>`;
}

function diretos(no, sentido) {
  const arestas = arestasDeCadeia();
  const lista = sentido === "antes" ? no.incomers().intersection(arestas) : no.outgoers().intersection(arestas);
  if (!lista.length) return `<span class="vazio">${sentido === "antes" ? "É uma raiz no acervo." : "Nenhum no acervo."}</span>`;
  return `<div class="lista">${lista.map(e => botaoNo(sentido === "antes" ? e.source() : e.target(), e.data("tipo"))).join("")}</div>`;
}

function mostrarResumo() {
  const raizes = cy.nodes(".genero").filter(n => n.incomers(LINHAGEM).length === 0);
  const prolificos = cy.nodes(".genero")
    .map(n => ({ n, total: cadeia(n, "depois").length }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 4);
  $("detalhes").innerHTML = `
    <h2>Acervo</h2>
    <p class="meta">${cy.nodes(".genero").length} gêneros · ${cy.edges().length} relações · ${decadas()[0]} a ${decadas().at(-1)}</p>
    <p>Raízes (sem origem no acervo)</p>
    ${listaNos(raizes, "")}
    <p>Gêneros com mais descendentes</p>
    <div class="lista">${prolificos.map(x => botaoNo(x.n) + `<span class="tipo" style="align-self:center">${x.total}</span>`).join("")}</div>
    <p class="vazio" style="font-weight:400;margin-top:12px">Clique num gênero para ver de onde ele vem e o que gerou.</p>`;
}

function focar(no) {
  limparDestaques();
  const antes = cadeia(no, "antes");
  const depois = cadeia(no, "depois");
  const familia = no.union(antes).union(depois);
  const ligacoes = familia.edgesWith(familia).intersection(arestasDeCadeia());
  cy.elements(".genero, edge").not(familia.union(ligacoes)).addClass("apagado");
  no.addClass("foco");

  $("detalhes").innerHTML = `
    <h2>Gênero</h2>
    <h3>${no.data("nome")}</h3>
    <p class="meta">${no.data("decada") === 1900 ? "c. 1900" : "Anos " + no.data("decada")} · ${no.data("lugar") || "lugar não informado"} · ${FAMILIAS[no.data("familia")].nome}</p>
    <p>Vem de</p>
    ${diretos(no, "antes")}
    <p>Toda a ancestralidade (${antes.length})</p>
    ${listaNos(antes, "Nenhum ancestral.")}
    <p>Deu origem a</p>
    ${diretos(no, "depois")}
    <p>Todos os descendentes (${depois.length})</p>
    ${listaNos(depois, "Nenhum descendente.")}`;
}

function limparDestaques() {
  cy.elements().removeClass("apagado foco rota");
}

function preencherSelects() {
  const ordenados = [...dados.generos].sort((a, b) => a.decada - b.decada || a.nome.localeCompare(b.nome));
  const opcoes = ordenados.map(g => `<option value="${g.id}">${g.nome} (${g.decada})</option>`).join("");
  const atualDe = $("c-de").value || "blues";
  const atualAte = $("c-ate").value || "dubstep";
  $("c-de").innerHTML = opcoes;
  $("c-ate").innerHTML = opcoes;
  $("c-de").value = dados.generos.some(g => g.id === atualDe) ? atualDe : ordenados[0].id;
  $("c-ate").value = dados.generos.some(g => g.id === atualAte) ? atualAte : ordenados.at(-1).id;
  $("n-origem1").innerHTML = opcoes;
  $("n-origem2").innerHTML = `<option value="">(nenhuma)</option>` + opcoes;
  $("n-origem1").value = "trap";
  $("n-origem2").value = "reggaeton";
  $("json").value = JSON.stringify(dados, null, 2);
}

function ancestralComum(a, b) {
  const deA = cadeia(a, "antes").union(a);
  const deB = cadeia(b, "antes").union(b);
  const comuns = deA.intersection(deB);
  if (!comuns.length) return null;
  return comuns.sort((x, y) => y.data("decada") - x.data("decada"))[0];
}

function buscarCaminho() {
  limparDestaques();
  const origem = cy.getElementById($("c-de").value);
  const destino = cy.getElementById($("c-ate").value);
  const saida = $("c-resultado");

  if (origem.same(destino)) {
    saida.innerHTML = `<p class="erro">Escolha dois gêneros diferentes.</p>`;
    return;
  }
  if (origem.style("display") === "none" || destino.style("display") === "none") {
    saida.innerHTML = `<p class="erro">Um dos gêneros está escondido pelos filtros.</p>`;
    return;
  }

  const busca = visiveis().aStar({ root: origem, goal: destino, directed: true });
  if (!busca.found) {
    const comum = ancestralComum(origem, destino);
    saida.innerHTML = `<p class="erro">${destino.data("nome")} não descende de ${origem.data("nome")} pelas relações visíveis.</p>` +
      (comum ? `<p>Ancestral comum mais próximo: <strong>${comum.data("nome")}</strong> (${comum.data("decada")}).</p>` : "<p>Os dois não têm ancestral comum no acervo.</p>");
    return;
  }

  cy.elements(".genero, edge").not(busca.path).addClass("apagado");
  busca.path.addClass("rota");
  const nos = busca.path.nodes();
  const passos = busca.path.edges().map((e, i) =>
    `${i === 0 ? `<strong>${nos[0].data("nome")}</strong>` : ""} → <span class="passo">${ROTULO_TIPO[e.data("tipo")]}</span> → <strong>${nos[i + 1].data("nome")}</strong>`
  ).join("");
  saida.innerHTML = `<p class="ok">${busca.path.edges().length} passos, de ${nos[0].data("decada")} a ${nos.at(-1).data("decada")}.</p>${passos}`;
  cy.animate({ fit: { eles: busca.path, padding: 60 }, duration: 400 });
}

function aplicarVisao() {
  aplicarVisibilidade();
  if (visao === "tempo") {
    const pos = posicoes();
    cy.nodes(".genero").forEach(n => n.position(pos[n.id()]));
    cy.style().update();
    cy.fit(cy.elements().filter(e => e.style("display") !== "none"), 24);
  } else {
    visiveis().layout({
      name: "cose",
      animate: false,
      randomize: true,
      nodeRepulsion: () => 40000,
      idealEdgeLength: () => 90,
      gravity: 0.3,
      numIter: 2500,
      padding: 30
    }).run();
    cy.style().update();
    cy.fit(visiveis(), 30);
  }
  $("v-tempo").classList.toggle("principal", visao === "tempo");
  $("v-afinidade").classList.toggle("principal", visao !== "tempo");
}

function atualizarAte() {
  $("ate-valor").textContent = $("ate").value;
  aplicarVisibilidade();
}

function tocar() {
  if (tocando) {
    clearInterval(tocando);
    tocando = null;
    $("tocar").textContent = "Tocar";
    return;
  }
  limparDestaques();
  const lista = decadas();
  $("ate").min = lista[0];
  $("ate").max = lista.at(-1);
  $("ate").value = lista[0];
  atualizarAte();
  $("tocar").textContent = "Pausar";
  tocando = setInterval(() => {
    const proxima = Number($("ate").value) + 10;
    if (proxima > lista.at(-1)) {
      clearInterval(tocando);
      tocando = null;
      $("tocar").textContent = "Tocar";
      return;
    }
    $("ate").value = proxima;
    atualizarAte();
  }, 1500);
}

function idDe(nome) {
  return nome.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function temCiclo(generos, relacoes) {
  const filhos = {};
  const entrada = {};
  generos.forEach(g => { filhos[g.id] = []; entrada[g.id] = 0; });
  relacoes.filter(r => r.tipo !== "influencia").forEach(r => {
    filhos[r.de].push(r.para);
    entrada[r.para] += 1;
  });
  const fila = generos.filter(g => entrada[g.id] === 0).map(g => g.id);
  let vistos = 0;
  while (fila.length) {
    const atual = fila.shift();
    vistos += 1;
    filhos[atual].forEach(f => {
      entrada[f] -= 1;
      if (entrada[f] === 0) fila.push(f);
    });
  }
  return vistos !== generos.length;
}

function validar(generos, relacoes) {
  const porId = Object.fromEntries(generos.map(g => [g.id, g]));
  const nomes = new Set();
  for (const g of generos) {
    const chave = g.nome.trim().toLowerCase();
    if (nomes.has(chave)) return `O nome "${g.nome}" aparece duas vezes.`;
    nomes.add(chave);
    if (!FAMILIAS[g.familia]) return `"${g.nome}" tem uma família desconhecida: ${g.familia}.`;
  }
  for (const r of relacoes) {
    if (!porId[r.de] || !porId[r.para]) return `Uma relação cita um gênero que não existe (${r.de} → ${r.para}).`;
    if (!ROTULO_TIPO[r.tipo]) return `Tipo de relação desconhecido: ${r.tipo}.`;
    if (porId[r.de].decada > porId[r.para].decada) {
      return `${porId[r.de].nome} (${porId[r.de].decada}) não pode ${r.tipo === "influencia" ? "influenciar" : "originar"} ${porId[r.para].nome} (${porId[r.para].decada}): a origem é mais nova.`;
    }
  }
  if (temCiclo(generos, relacoes)) return "As relações Origina e Funde formariam um ciclo.";
  return null;
}

function recarregar() {
  cy.elements().remove();
  cy.add(elementosDecoracao());
  cy.add(elementosGrafo());
  const lista = decadas();
  $("ate").min = lista[0];
  $("ate").max = lista.at(-1);
  if (Number($("ate").value) > lista.at(-1) || !tocando) $("ate").value = lista.at(-1);
  $("ate-valor").textContent = $("ate").value;
  preencherSelects();
  aplicarVisao();
  mostrarResumo();
}

function cadastrar(evento) {
  evento.preventDefault();
  const msg = $("n-msg");
  msg.className = "erro";
  const nome = $("n-nome").value.trim();
  const tipo = $("n-tipo").value;
  const origens = [$("n-origem1").value, $("n-origem2").value].filter(Boolean);

  if (!nome) { msg.textContent = "Informe o nome do gênero."; return; }
  if (tipo === "funde" && new Set(origens).size < 2) { msg.textContent = "Uma fusão precisa de duas origens diferentes."; return; }
  if (tipo === "origina" && origens.length !== 1) { msg.textContent = "Origina usa só a Origem 1. Deixe a Origem 2 em branco ou escolha Funde."; return; }

  const novo = {
    id: idDe(nome) || "genero" + Date.now(),
    nome,
    decada: Number($("n-decada").value),
    lugar: $("n-lugar").value.trim(),
    familia: $("n-familia").value
  };
  const generos = dados.generos.concat(novo);
  const relacoes = dados.relacoes.concat(origens.map(o => ({ de: o, para: novo.id, tipo })));
  const problema = dados.generos.some(g => g.id === novo.id) ? `Já existe um gênero com o nome "${nome}".` : validar(generos, relacoes);
  if (problema) { msg.textContent = problema; return; }

  dados = { generos, relacoes };
  recarregar();
  cy.getElementById(novo.id).addClass("novo");
  focar(cy.getElementById(novo.id));
  msg.className = "ok";
  msg.textContent = `${nome} cadastrado nos anos ${novo.decada}.`;
  $("novo").reset();
  preencherSelects();
}

async function importar(evento) {
  const msg = $("i-msg");
  msg.className = "erro";
  msg.textContent = "";
  const arquivo = evento.target.files[0];
  if (!arquivo) return;
  try {
    const lido = JSON.parse(await arquivo.text());
    if (!Array.isArray(lido.generos) || !Array.isArray(lido.relacoes)) throw new Error("O arquivo precisa das listas \"generos\" e \"relacoes\".");
    const problema = validar(lido.generos, lido.relacoes);
    if (problema) throw new Error(problema);
    dados = lido;
    recarregar();
    msg.className = "ok";
    msg.textContent = `${lido.generos.length} gêneros importados de ${arquivo.name}.`;
  } catch (falha) {
    msg.textContent = falha instanceof SyntaxError ? "O arquivo não é um JSON válido." : falha.message;
  }
}

function montarControles() {
  $("filtro-familias").insertAdjacentHTML("beforeend", ORDEM_FAMILIAS.map(f =>
    `<label class="chave"><input type="checkbox" value="${f}" checked><i class="bolinha" style="background:${FAMILIAS[f].cor}"></i>${FAMILIAS[f].nome}</label>`
  ).join(""));
  $("n-familia").innerHTML = ORDEM_FAMILIAS.map(f => `<option value="${f}">${FAMILIAS[f].nome}</option>`).join("");
  $("n-familia").value = "caribe";
  const anos = [];
  for (let d = 1900; d <= 2020; d += 10) anos.push(`<option value="${d}">${d}</option>`);
  $("n-decada").innerHTML = anos.join("");
  $("n-decada").value = "2010";
}

function ligarEventos() {
  cy.on("tap", "node.genero", e => focar(e.target));
  cy.on("tap", e => {
    if (e.target === cy) {
      limparDestaques();
      mostrarResumo();
    }
  });
  $("detalhes").addEventListener("click", e => {
    const alvo = e.target.closest("[data-id]");
    if (alvo) focar(cy.getElementById(alvo.dataset.id));
  });
  document.querySelectorAll("#filtro-tipos input, #filtro-familias input").forEach(i =>
    i.addEventListener("change", () => { limparDestaques(); aplicarVisibilidade(); mostrarResumo(); }));
  $("ate").addEventListener("input", atualizarAte);
  $("tocar").addEventListener("click", tocar);
  $("v-tempo").addEventListener("click", () => { visao = "tempo"; aplicarVisao(); });
  $("v-afinidade").addEventListener("click", () => { visao = "afinidade"; aplicarVisao(); });
  $("v-centralizar").addEventListener("click", () => cy.animate({ fit: { eles: cy.elements().filter(e => e.style("display") !== "none"), padding: 24 }, duration: 300 }));
  $("c-buscar").addEventListener("click", buscarCaminho);
  $("novo").addEventListener("submit", cadastrar);
  $("arquivo").addEventListener("change", importar);
  $("copiar").addEventListener("click", async e => {
    try {
      await navigator.clipboard.writeText($("json").value);
      e.target.textContent = "Copiado";
    } catch {
      $("json").select();
      e.target.textContent = "Selecione e copie";
    }
  });
  window.addEventListener("resize", () => cy.resize());
}

function iniciar() {
  montarControles();
  cy = cytoscape({
    container: $("grafo"),
    style: estilo(),
    minZoom: 0.25,
    maxZoom: 3,
    wheelSensitivity: 0.3,
    boxSelectionEnabled: false
  });
  ligarEventos();
  recarregar();
}

document.fonts.ready.then(iniciar);
