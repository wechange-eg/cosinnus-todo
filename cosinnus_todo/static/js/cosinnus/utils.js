function getSelectionText() {
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    return text;
}

function flashView($viewEl, cssClass) {
    $viewEl.hide().toggleClass(cssClass).fadeIn(100, function(){
        setTimeout(function(){
            $viewEl.toggleClass(cssClass)
        }, 100);
    });
}
