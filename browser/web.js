var converter = new Showdown.converter();

$(document).ready(function() {
    selectLastUsedLanguage();
    var options = {
        textArea: document.getElementById('code'),
        mode: 'markdown',
        lineNumbers: true,
        textChangedCallback: function(editor, from, to, text, next) {
            updatePreview();
        },
        language: $('#selected_lang').data('lang'),
        errorCallback: toggleErrorMessageVisibility
    };

    varnam = VarnamIME(options);
    resizeFrame();
    $("#preview_div").hide();

});

jQuery.event.add(window, "resize", resizeFrame);

function resizeFrame() {
    var h = $(window).innerHeight();
    var toolbarHeight = $(".navbar").height();
    var editorHeight = h - toolbarHeight - 30;

    $("#preview").css('height', editorHeight);
    $(".CodeMirror").css('height', editorHeight);
    $(".CodeMirror-scroll").css('height', editorHeight);
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
    previewFrame.contentWindow.document.body.innerHTML = converter.makeHtml(varnam.getValue());
}

$('button').click(function() {
    var mode = $(this).data('preview');
    switch (mode) {
    case "editor":
        //$("#editor_div").removeClass("span6").addClass("span12");
        $("#preview_div").hide();
        $("#editor_div").show();
        break;
    case "both":
        //$("#editor_div").removeClass("span12").addClass("span6");
        $("#preview_div").show();
        $("#editor_div").show();
        $('#preview_div').css('margin-left', $("#reserve").css('margin-left'));
        $("#preview_div").removeClass("span12").addClass("span6");
        updatePreview();
        break;
    case "preview":
        $("#editor_div").hide();
        $("#preview_div").show();
        //$("#preview_div").removeClass("span6").addClass("span12");
        $('#preview_div').css('margin-left', '0');
        updatePreview();
        break;
    }
});

$('#printBtn').click(function() {
    updatePreview(true);
    window.print();
});

$('.lang').click(function() {
    $('.dropdown-toggle').html($(this).text() + " <span class='caret'></span>");
    $('#selected_lang').data('lang', $(this).data('lang'));
    varnam.setLanguage($(this).data('lang'));
    if (typeof(Storage) == "undefined") {
        return;
    }
    localStorage.language = JSON.stringify({
        name: $(this).text(),
        code: $(this).data('lang')
    });
});

function toggleErrorMessageVisibility(visible) {
    if (visible) {
        $('#network-error').fadeIn('slow');
    } else {
        $('#network-error').fadeOut('slow');
    }
}

$('#network-error-close').click(function() {
    toggleErrorMessageVisibility(false);
});
