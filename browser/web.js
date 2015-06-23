var converter = new Showdown.converter();

$(document).ready(function() {
    hookUnloadEvent();
		loadSupportedLanguages();
    selectLastUsedLanguage();
    var options = {
        textArea: document.getElementById('code'),
        mode: 'markdown',
        lineNumbers: true,
        textChangedCallback: function(editor, from, to, text, next) {
            updatePreview();
        },
        language: $('#selected_lang').data('lang'),
        periodRedefined: $('#selected_lang').data('period-redefined'),
        errorCallback: toggleErrorMessageVisibility
    };

    varnam = VarnamIME(options);
    resizeFrame();
    $("#preview_div").hide();

});

function loadSupportedLanguages() {
	var url = "http://api.varnamproject.com/languages";
	var request = $.ajax({
      url: url,
      crossDomain: 'true',
      success: function(data) {
        var periodRedefinedLangs = ["hi"];
				var supportedLanguages = document.getElementById('supported-languages');
				for (var i = 0; i < data.length; i++) {
					var language = data[i];
					var a = document.createElement('a');
					a.setAttribute('href', '#');
					a.setAttribute('class', 'lang');
					a.setAttribute('data-lang', language.Identifier);
          a.setAttribute('data-period-redefined', $.inArray(language.Identifier, periodRedefinedLangs) == -1 ? false : true);
					a.appendChild(document.createTextNode(language.DisplayName + (!language.IsStable ? " (Experimental)" : "")));
					var li = document.createElement('li');
					li.appendChild(a);
					supportedLanguages.appendChild(li);
				}
      },
      error: function requestFailed(request, status, error) {
             }});
}

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
        $('#selected_lang').data('period-redefined', data.periodRedefined);
    }
}

function hookUnloadEvent() {
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
}

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

$('#supported-languages').on('click', '.lang', function() {
    $('.dropdown-toggle').html($(this).text() + " <span class='caret'></span>");
    $('#selected_lang').data('lang', $(this).data('lang'));
    varnam.setLanguage($(this).data('lang'));
    varnam.setPeriodRedefined($(this).data('period-redefined'));
    if (typeof(Storage) == "undefined") {
        return;
    }
    localStorage.language = JSON.stringify({
        name: $(this).text(),
        code: $(this).data('lang'),
        periodRedefined: $(this).data('period-redefined')
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
