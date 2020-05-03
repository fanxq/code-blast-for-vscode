import EditorObserver from './editorObserver';
//var _debugTool = null;
var observerMap = new Map();
let observer = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    if (mutation.target.classList.contains("editor-instance")) {
      if (mutation.addedNodes && mutation.addedNodes.length > 0) {
        //_debugTool = document.querySelector('.debug-toolbar');
        var monaco_editor = mutation.addedNodes[0];
        if (monaco_editor.classList.contains('monaco-editor')) {
          var container = monaco_editor.parentNode;
          if (container) {
            container.style.position = "relative";
            var id = new Date().getTime().toString();
            monaco_editor.setAttribute("id", id);
            var editorObserver = new EditorObserver(monaco_editor, container);
            observerMap.set(id, editorObserver);
            editorObserver.isActive = true;
            editorObserver.loop();
            editorObserver.observe();
          }
        }
      }
      if (mutation.removedNodes && mutation.removedNodes.length > 0) {
        var monaco_editor = mutation.removedNodes[0];
        if (monaco_editor.classList.contains('monaco-editor')) {
          var id = monaco_editor.getAttribute("id");
          var editorObserver = observerMap.get(id);
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