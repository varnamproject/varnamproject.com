function initPreviewMode() {
    if (typeof(Storage) == "undefined") {
        return;
    }
    var mode = localStorage.previewMode || "both";
    logglePreview(mode);
}

function logglePreview(mode) {
    $("#" + mode + "Btn").click();
}

function selectLastUsedLanguage() {
    if (typeof(Storage) != "undefined" && localStorage.language) {
        var data = JSON.parse(localStorage.language);
        $('.dropdown-toggle').html(data.name + " <span class='caret'></span>");
        $('#selected_lang').data('lang', data.code);
    }
}

window.onbeforeunload = function (e) {
    e = e || window.event;
    if ($.trim(myCodeMirror.getValue()) !== "") {
        // For IE and Firefox prior to version 4
        if (e) {
            e.returnValue = 'You will loose the text. Are you sure?';
        }

        // For Safari
        return 'You will loose the text. Are you sure?';
    }
};