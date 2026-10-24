// Foto da entrega: captura com a webcam e envia ao doPost (campos: ticket, idEncomenda, foto).
(function () {
  "use strict";

  var C = window.CondoCamera;
  var video = document.getElementById("cameraVideo");
  var img = document.getElementById("fotoPreview");
  var placeholder = document.getElementById("placeholder");
  var placeholderTexto = document.getElementById("placeholderTexto");
  var statusEl = document.getElementById("status");
  var btnCapturar = document.getElementById("btnCapturar");
  var btnOutra = document.getElementById("btnOutra");
  var btnEnviar = document.getElementById("btnEnviar");

  var params = new URLSearchParams(window.location.search);
  var ticket = params.get("ticket");
  var idEncomenda = params.get("idEncomenda");

  var stream = null;
  var foto = null;
  var enviando = false;

  function falhar(texto) {
    placeholderTexto.textContent = "Câmera indisponível";
    btnCapturar.disabled = true;
    C.mostrarStatus(statusEl, "error", texto);
  }

  function modoCamera() {
    foto = null;
    img.hidden = true;
    img.removeAttribute("src");
    video.hidden = false;
    btnCapturar.hidden = false;
    btnOutra.hidden = true;
    btnEnviar.hidden = true;
    C.esconderStatus(statusEl);
  }

  function modoRevisao() {
    img.src = foto;
    img.hidden = false;
    video.hidden = true;
    btnCapturar.hidden = true;
    btnOutra.hidden = false;
    btnEnviar.hidden = false;
    C.mostrarStatus(statusEl, "info", "Confira a foto. Se estiver boa, clique em “Enviar foto”.");
  }

  async function iniciar() {
    if (!ticket || !idEncomenda) {
      falhar("Link inválido: faltam informações no endereço da página. Feche esta janela e abra a câmera novamente pelo CondoPack.");
      return;
    }
    try {
      stream = await C.iniciarCamera(video, "environment");
      placeholder.hidden = true;
      btnCapturar.disabled = false;
    } catch (e) {
      console.error(e);
      falhar(C.mensagemErroCamera(e));
    }
  }

  btnCapturar.addEventListener("click", function () {
    foto = C.capturar(video, 0, 0.8);
    if (!foto) {
      C.mostrarStatus(statusEl, "error", "A câmera ainda não está pronta. Aguarde um instante e tente de novo.");
      return;
    }
    modoRevisao();
  });

  btnOutra.addEventListener("click", modoCamera);

  btnEnviar.addEventListener("click", function () {
    if (enviando || !foto) return;
    enviando = true;
    btnOutra.disabled = true;
    btnEnviar.disabled = true;
    C.mostrarStatus(statusEl, "info", "Enviando foto…", true);
    C.pararCamera(stream);
    C.enviarFormulario({ ticket: ticket, idEncomenda: idEncomenda, foto: foto });
  });

  iniciar();
})();
