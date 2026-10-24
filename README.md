# condopack-camera

Páginas de câmera do CondoPack, publicadas com GitHub Pages. A app (Google Apps Script) abre estas páginas numa janela para tirar fotos com a webcam do PC; a foto é enviada por POST (formulário) ao `doPost` da Web App.

| Página | Uso | Campos enviados |
| --- | --- | --- |
| `index.html?ticket=…&idEncomenda=…` | Foto da entrega | `ticket`, `idEncomenda`, `foto` (JPEG, resolução da câmera, qualidade 0.8) |
| `porteiro.html?ticket=…&nome=…` | Selfie do porteiro ao iniciar o turno, com verificação de rosto | `ticket`, `tipo=PORTEIRO`, `foto` (JPEG, máx. 600 px, qualidade 0.6) |
| `index-antigo.html` | Versão anterior da foto da entrega (rollback) | `ticket`, `idEncomenda`, `foto` |

Arquivos comuns: `camera.css` (visual) e `camera.js` (câmera, captura, mensagens e envio; contém a URL `/exec` da Web App).

A verificação de rosto usa `@mediapipe/face_detection@0.4.1646425229`, `@tensorflow/tfjs-core@4.22.0`, `@tensorflow/tfjs-backend-webgl@4.22.0` e `@tensorflow-models/face-detection@1.0.3` (jsDelivr). A detecção roda no navegador.

**Rollback rápido:** copie o conteúdo de `index-antigo.html` para `index.html` e faça commit.
