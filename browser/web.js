var converter = new Showdown.converter();

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

window.onbeforeunload = function(e) {
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

function updatePreview(force) {
    if (!$("#preview_div").is(':visible') && !force) {
        return;
    }
    var previewFrame = document.getElementById('preview');
    previewFrame.contentWindow.document.body.innerHTML = converter.makeHtml(Varnam.editor.getValue());
}

$('button').click(function() {
    var mode = $(this).data('preview');
    switch (mode) {
    case "editor":
        $("#editor_div").removeClass("span6").addClass("span12");
        $("#preview_div").hide();
        $("#editor_div").show();
        break;
    case "both":
        $("#editor_div").removeClass("span12").addClass("span6");
        $("#preview_div").show();
        $("#editor_div").show();
        $('#preview_div').css('margin-left', $("#reserve").css('margin-left'));
        $("#preview_div").removeClass("span12").addClass("span6");
        updatePreview();
        break;
    case "preview":
        $("#editor_div").hide();
        $("#preview_div").show();
        $("#preview_div").removeClass("span6").addClass("span12");
        $('#preview_div').css('margin-left', '0');
        updatePreview();
        break;
    }
    savePreviewMode(mode);
});

$('#printBtn').click(function() {
    updatePreview(true);
    window.print();
});

function savePreviewMode(mode) {
    if (typeof(Storage) == "undefined") {
        return;
    }
    localStorage.previewMode = mode;
}

$('.lang').click(function() {
    $('.dropdown-toggle').html($(this).text() + " <span class='caret'></span>");
    $('#selected_lang').data('lang', $(this).data('lang'));
    Varnam.setLanguage($(this).data('lang'));
    if (typeof(Storage) == "undefined") {
        return;
    }
    localStorage.language = JSON.stringify({
        name: $(this).text(),
        code: $(this).data('lang')
    });
});