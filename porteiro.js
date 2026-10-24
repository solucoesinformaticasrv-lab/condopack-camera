// Registro de turno: selfie do porteiro com verificação de rosto e envio ao doPost
// (campos: ticket, tipo="PORTEIRO", foto).
(function () {
  "use strict";

  var C = window.CondoCamera;
  var video = document.getElementById("cameraVideo");
  var img = document.getElementById("fotoPreview");
  var placeholder = document.getElementById("placeholder");
  var placeholderTexto = document.getElementById("placeholderTexto");
  var saudacao = document.getElementById("saudacao");
  var statusEl = document.getElementById("status");
  var btnCapturar = document.getElementById("btnCapturar");

  var params = new URLSearchParams(window.location.search);
  var ticket = params.get("ticket");
  var nome = (params.get("nome") || "").trim().slice(0, 60);

  // Mesmo padrão da app no celular
  var MAX_LADO = 600;
  var QUALIDADE = 0.6;
  var MSG_SEM_ROSTO = "Rosto não identificado. Posicione o rosto em frente à câmera.";

  var stream = null;
  var detector = null;
  var verificando = false;
  var enviando = false;

  // O nome é só para exibição: sempre textContent, nunca innerHTML.
  saudacao.textContent = nome ? "Olá, " + nome + "!" : "Olá!";

  function falhar(texto) {
    placeholderTexto.textContent = "Câmera indisponível";
    btnCapturar.disabled = true;
    C.mostrarStatus(statusEl, "error", texto);
  }

  async function carregarDetector() {
    var fd = window.faceDetection;
    if (!fd || !window.tf) throw new Error("Bibliotecas de detecção não carregadas");
    return fd.createDetector(fd.SupportedModels.MediaPipeFaceDetector, {
      runtime: "mediapipe",
      solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4.1646425229",
      modelType: "short",
      maxFaces: 1
    });
  }

  async function iniciar() {
    if (!ticket) {
      falhar("Link inválido: faltam informações no endereço da página. Feche esta janela e inicie o turno novamente pelo CondoPack.");
      return;
    }
    try {
      stream = await C.iniciarCamera(video, "user");
      placeholder.hidden = true;
    } catch (e) {
      console.error(e);
      falhar(C.mensagemErroCamera(e));
      return;
    }
    C.mostrarStatus(statusEl, "info", "Preparando a verificação de rosto…", true);
    try {
      detector = await carregarDetector();
    } catch (e) {
      console.error(e);
      btnCapturar.disabled = true;
      C.mostrarStatus(statusEl, "error", "Não foi possível carregar a verificação de rosto. Verifique a conexão com a internet e recarregue a página.");
      return;
    }
    C.esconderStatus(statusEl);
    btnCapturar.disabled = false;
  }

  btnCapturar.addEventListener("click", async function () {
    if (verificando || enviando || !detector) return;
    var canvas = C.capturarCanvas(video, MAX_LADO);
    if (!canvas) {
      C.mostrarStatus(statusEl, "error", "A câmera ainda não está pronta. Aguarde um instante e tente de novo.");
      return;
    }
    verificando = true;
    btnCapturar.disabled = true;
    C.mostrarStatus(statusEl, "info", "Verificando o rosto…", true);
    var rostos = null;
    try {
      rostos = await detector.estimateFaces(canvas);
    } catch (e) {
      console.error(e);
    }
    verificando = false;
    if (!rostos || rostos.length === 0) {
      // Sem rosto: deixa tirar a foto de novo
      C.mostrarStatus(statusEl, "error", MSG_SEM_ROSTO);
      btnCapturar.disabled = false;
      return;
    }
    // Rosto identificado: envia na hora
    enviando = true;
    var foto = C.fotoDoCanvas(canvas, QUALIDADE);
    img.src = foto;
    img.hidden = false;
    video.hidden = true;
    C.mostrarStatus(statusEl, "info", "Enviando foto…", true);
    C.pararCamera(stream);
    C.enviarFormulario({ ticket: ticket, tipo: "PORTEIRO", foto: foto });
  });

  iniciar();
})();
