import EditorObserver from './editorObserver';

const isDev = process.env.NODE_ENV === 'development';
let observerMap = new Map();
let observer = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    if (mutation.target.classList.contains("editor-instance")) {
      if (mutation.addedNodes && mutation.addedNodes.length > 0) {
        let monaco_editor = mutation.addedNodes[0];
        if (monaco_editor.classList.contains('monaco-editor')) {
          let container = monaco_editor.parentNode;
          if (container) {
            container.style.position = "relative";
            let id = new Date().getTime().toString();
            monaco_editor.setAttribute("id", id);
            let editorObserver = new EditorObserver(monaco_editor, container);
            observerMap.set(id, editorObserver);
            editorObserver.isActive = true;
            editorObserver.loop();
            editorObserver.observe();
          }
        }
      }
      if (mutation.removedNodes && mutation.removedNodes.length > 0) {
        let monaco_editor = mutation.removedNodes[0];
        if (monaco_editor.classList.contains('monaco-editor')) {
          let id = monaco_editor.getAttribute("id");
          let editorObserver = observerMap.get(id);
          if (editorObserver) {
            editorObserver.disconnect();
            editorObserver = null;
            observerMap.delete(id);
          }
        }
      }
    }
  })
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

let trustedTypePolicy = 'trustedTypePolicy4CodeBlast';
if (typeof Symbol !== 'undefined') {
  trustedTypePolicy = Symbol('trustedTypePolicy4CodeBlast');
}

window[trustedTypePolicy] = window.trustedTypes 
  && window.trustedTypes.createPolicy('codeBlastLoader', {
    createScriptURL(value) {
      if (value.indexOf('code.blast.config') !== -1) {
        return value;
      }
      throw new Error(`Invalid script url: ${value}`);
    }
  });

let curConfig = null;
function addScript() {
  setTimeout(() => {
    let script = document.createElement('script');
    script.src = window[trustedTypePolicy].createScriptURL(window._code_blast_settings_path);
    document.body.appendChild(script);
    script.onload = () => {
      if (!curConfig) {
        if (window.__codeBlastConfig) {
          if (isDev) {
            window.history.go(0);
            return;
          }
          if (observerMap.size !== 0) {
            for(let observer of observerMap.values()) {
              observer.resetParticleManager(window.__codeBlastConfig);
            }
          }
          curConfig = window.__codeBlastConfig;
        }
      } else {
        if (window.__codeBlastConfig) {
          if (window.__codeBlastConfig.update_at !== curConfig.update_at) {
            if (isDev) {
              window.history.go(0);
              return;
            }
            if (observerMap.size !== 0) {
              for(let observer of observerMap.values()) {
                observer.resetParticleManager(window.__codeBlastConfig);
              }
            }
          }
          curConfig = window.config;
        }
      }
      script.remove();
      addScript();
    }
    script.onerror = () => {
      script.remove();
      addScript();
    }
  }, 1000);
}
addScript();
