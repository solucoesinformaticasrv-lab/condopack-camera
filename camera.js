// Funções comuns das páginas de câmera do CondoPack (index.html e porteiro.html).
(function () {
  "use strict";

  // URL da Web App do Apps Script (doPost)
  var URL_WEBAPP =
    "https://script.google.com/macros/s/AKfycbzX_8RF4Arrnjvc2J-kDUlKPd_UOua9QNrR3UbalvLNZO3Bwh0zmRO3q0Z6mvu1cz34Bw/exec";

  // O servidor aceita no máximo ~6 MB; mantemos uma margem de segurança.
  var MAX_FOTO_CHARS = 5.5 * 1024 * 1024;

  var ICONES = { info: "info", success: "check_circle", error: "error" };

  // Mostra uma mensagem no elemento de status (sempre com textContent).
  function mostrarStatus(el, tipo, texto, carregando) {
    el.hidden = false;
    el.className = "status " + tipo;
    el.textContent = "";
    var icone = document.createElement("span");
    if (carregando) {
      icone.className = "spinner";
    } else {
      icone.className = "material-symbols-rounded";
      icone.textContent = ICONES[tipo] || "info";
    }
    icone.setAttribute("aria-hidden", "true");
    var msg = document.createElement("span");
    msg.textContent = texto;
    el.appendChild(icone);
    el.appendChild(msg);
  }

  function esconderStatus(el) {
    el.hidden = true;
    el.textContent = "";
  }

  // Traduz os erros da câmera para mensagens claras.
  function mensagemErroCamera(err) {
    var nome = err && err.name;
    if (nome === "NotAllowedError" || nome === "SecurityError") {
      return "Permissão da câmera negada. Clique no ícone de câmera na barra de endereço, permita o acesso e recarregue a página.";
    }
    if (nome === "NotFoundError" || nome === "OverconstrainedError" || nome === "DevicesNotFoundError") {
      return "Nenhuma câmera foi encontrada. Conecte uma webcam ao computador e recarregue a página.";
    }
    if (nome === "NotReadableError" || nome === "TrackStartError") {
      return "A câmera está sendo usada por outro programa. Feche o outro programa e recarregue a página.";
    }
    return "Não foi possível acessar a câmera. Verifique a webcam e recarregue a página.";
  }

  async function iniciarCamera(video, facingMode) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      var e = new Error("getUserMedia indisponível");
      e.name = "NotFoundError";
      throw e;
    }
    var stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: facingMode },
      audio: false
    });
    video.srcObject = stream;
    await video.play().catch(function () {});
    return stream;
  }

  function pararCamera(stream) {
    if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
  }

  // Captura o quadro atual do vídeo como data URL JPEG.
  // maxLado: limita o maior lado (0 = tamanho original da câmera).
  function capturar(video, maxLado, qualidade) {
    var w = video.videoWidth;
    var h = video.videoHeight;
    if (!w || !h) return null;
    if (maxLado && Math.max(w, h) > maxLado) {
      var escala = maxLado / Math.max(w, h);
      w = Math.round(w * escala);
      h = Math.round(h * escala);
    }
    var canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d").drawImage(video, 0, 0, w, h);
    var foto = canvas.toDataURL("image/jpeg", qualidade);
    // Se passar do limite do servidor, reduz a qualidade.
    while (foto.length > MAX_FOTO_CHARS && qualidade > 0.3) {
      qualidade -= 0.1;
      foto = canvas.toDataURL("image/jpeg", qualidade);
    }
    return foto;
  }

  // Envia os campos por POST com um formulário oculto (a página navega para a resposta do doPost).
  function enviarFormulario(campos) {
    var form = document.createElement("form");
    form.method = "POST";
    form.action = URL_WEBAPP;
    form.target = "_self";
    Object.keys(campos).forEach(function (nome) {
      var input = document.createElement("input");
      input.type = "hidden";
      input.name = nome;
      input.value = campos[nome];
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
  }

  window.CondoCamera = {
    mostrarStatus: mostrarStatus,
    esconderStatus: esconderStatus,
    mensagemErroCamera: mensagemErroCamera,
    iniciarCamera: iniciarCamera,
    pararCamera: pararCamera,
    capturar: capturar,
    enviarFormulario: enviarFormulario
  };
})();
