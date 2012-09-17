(function () {
    var suggestedItem = $('#popup select option'),
        isSuggestionDisplayed = false,
        converter = new Showdown.converter(),
        ignoreTextChange = false,
        request = undefined,
        timer,
        suggestionList = "#popup select",
        KEYS = {
            ESCAPE:27,
            ENTER:13,
            TAB:9,
            SPACE:32,
            PERIOD:190,
            DOWN_ARROW:40
         };

    $(document).ready(function () {
        initialEventSetup();
        initPreviewMode();
        selectLastUsedLanguage();
    });

    function initialEventSetup() {
        suggestedItem.live('click', function () {
            replaceContent($(this).text());
            ignoreTextChange = true;
        });

        $(suggestionList).keydown(function (event) {
            if (event.keyCode === KEYS.ESCAPE) {
                hidePopup();
                myCodeMirror.focus();
            } else if (isWordBreakKey(event.keyCode)) {
                var text = $(this).find(":selected").text();
                if (text !== undefined && text !== '') {
                    replaceContent(text);
                    if (event.keyCode == KEYS.ENTER) {
                        event.preventDefault();
                        event.stopPropagation();
                        ignoreTextChange = true;
                        return true;
                    }
                }
            }
        });

    }

    function replaceContent(text) {
        var w = getWordUnderCaret(myCodeMirror);
        var linech = w.start;
        var xy = myCodeMirror.charCoords(linech);
        var word = w.word;
        if (word != "") {
            myCodeMirror.replaceRange(text, linech, w.end);
            myCodeMirror.focus();
        }
        hidePopup();
        learnText(text);
    }

    function learnText(text) {
        var lang = $('#selected_lang').data('lang');
        if (lang == undefined || lang === 'en') return;

        $.post("learn", {
            text:text,
            lang:lang
        });
    }

    // Initialize CodeMirror editor with a nice html5 canvas demo.
    var myCodeMirror = CodeMirror.fromTextArea(document.getElementById('code'), {
        mode:'markdown',
        lineNumbers:true,
        lineWrapping:true,
        onChange:textChanged,
        extraKeys:{
            "Ctrl-Space":function (instance) {
                showSuggestion();
            }
        },
        onKeyEvent:processEditorKeyEvent
    });

    function processWordBreaks() {
        var text = $("#popup select").find(":selected").text();
        if (text !== undefined && text !== '') replaceContent(text);
    }

    function isWordBreakKey(keyCode) {
        if (keyCode === KEYS.ENTER || keyCode === KEYS.SPACE || keyCode === KEYS.TAB) {
            return true;
        }
        return false;
    }

    function processEditorKeyEvent(editor, e) {
        var _event = $.event.fix(e);
        if (_event.type != "keydown") {
            return;
        }
        ignoreTextChange = false;

        if (_event.keyCode == KEYS.ESCAPE) {
            hidePopup();
            return
        }

        if (isSuggestionDisplayed) {
            if (_event.keyCode == KEYS.PERIOD) {
                processWordBreaks();
            } else if (_event.keyCode === KEYS.DOWN_ARROW) {
                $("#popup select").focus();
                _event.preventDefault();
                _event.stopPropagation();
                return true;
            } else if (isWordBreakKey(_event.keyCode)) {
                processWordBreaks();
                if (_event.keyCode === KEYS.ENTER) {
                    _event.preventDefault();
                    _event.stopPropagation();
                    ignoreTextChange = true;
                    return true;
                }
            }

        } else if (isWordBreakKey(_event.keyCode)) {
            ignoreTextChange = true;
        }
    }

    function showSuggestion() {
        var linech = getWordUnderCaret(myCodeMirror).start;
        var xy = myCodeMirror.charCoords(linech);
        var word = getWordUnderCaret(myCodeMirror).word;
        if (word != "") showPopup(xy.x, xy.y, word);
        else hidePopup();
    }


    function showPopup(x, y, word) {
        var lang = $('#selected_lang').data('lang');
        if (lang === 'en') return;
        var params = {
            'text':word,
            'lang':lang
        };
        if (request != undefined) request.abort();

        request = $.ajax({
            url:'tl?' + $.param(params),
            dataType:'json',
            crossDomain:'true',
            success:function (data) {
                html = "";
                var textWidth = 0;
                var selectList=$('#popup > select')
                if (getWordUnderCaret(myCodeMirror).word == data.input) {
                    $.each(data.result, function (index, value) {
                        if (index === 0) {
                            html += '<option selected>' + value + '</option>';
                        } else {
                            html += '<option>' + value + '</option>';
                        }
                        if (textWidth < value.length) {
                            textWidth = value.length;
                        }
                        $(selectList).html(html).css('width', (textWidth + 2) + 'em');  
                    });
                    $(selectList).html(html).css('height', (data.result.length+1) + 'em');
                    $('#popup').css('display', "block").css('left', x + "px").css('top', (y + 15) + "px");
                    isSuggestionDisplayed = true;
                }
            }
        });
    }

    function hidePopup() {
        $('#popup').css('display', "none");
        isSuggestionDisplayed = false;
    }

    function isWordBoundary(text) {
        if (text == null || text == "" || text == " " || text == "\n" || text == "." || text == "\t" || text == "\r" || text == "\"" || text == "'" || text == "?" || text == "!" || text == "," || text == "(" || text == ")" || text == "\u000B" || text == "\u000C" || text == "\u0085" || text == "\u2028" || text == "\u2029" || text == "\u000D" || text == "\u000A" || text == ";") return true;

        return false;
    }

    // Finds the word under caret and returns an object {start: {:line, :ch}, end: {:line, :ch}, :word}

    function getWordUnderCaret(editor) {
        var insertionPoint = editor.getCursor(); //{line, ch} object
        var startAt = 0;
        var endsAt = 0;
        var lastPosition = editor.getValue().length + 1;

        // Moving back till we hit a word boundary
        var caretPos = insertionPoint.ch;
        startAt = insertionPoint
        while (caretPos) {
            text = editor.getRange({
                line:insertionPoint.line,
                ch:caretPos - 1
            }, {
                line:insertionPoint.line,
                ch:caretPos
            });
            if (isWordBoundary(text)) {
                break;
            }
            --caretPos;
            startAt = {
                line:insertionPoint.line,
                ch:caretPos
            };

        }

        endsAt = insertionPoint;
        caretPos = insertionPoint.ch;
        while (caretPos < lastPosition) {
            text = editor.getRange({
                line:insertionPoint.line,
                ch:caretPos
            }, {
                line:insertionPoint.line,
                ch:caretPos + 1
            });
            if (isWordBoundary(text)) {
                break;
            }
            ++caretPos;
            endsAt = {
                line:insertionPoint.line,
                ch:caretPos
            }
        }

        return {
            start:startAt,
            end:endsAt,
            word:editor.getRange(startAt, endsAt)
        };
    }


    function textChanged(editor, from, to, text, next) {
        window.clearTimeout(timer);
        updatePreview();
        if (ignoreTextChange) {
            return;
        }

        timer = window.setTimeout(function () {
            showSuggestion();
        }, 10);
    }


    function updatePreview() {
        if (!$("#preview_div").is(':visible')) {
            return;
        }
        var previewFrame = document.getElementById('preview');
        previewFrame.contentWindow.document.body.innerHTML = converter.makeHtml(myCodeMirror.getValue());
    }

    $('button').click(function () {
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

    function logglePreview(mode) {
        $("#" + mode + "Btn").click();
    }

    $('.lang').click(function () {
        $('.dropdown-toggle').html($(this).text() + " <span class='caret'></span>");
        $('#selected_lang').data('lang', $(this).data('lang'));
        if (typeof(Storage) == "undefined") {
            return;
        }
        localStorage.language = JSON.stringify({
            name:$(this).text(),
            code:$(this).data('lang')
        });
    });

    function selectLastUsedLanguage() {
        if (typeof(Storage) != "undefined" && localStorage.language) {
            var data = JSON.parse(localStorage.language);
            $('.dropdown-toggle').html(data.name + " <span class='caret'></span>");
            $('#selected_lang').data('lang', data.code);
        }
    }

    function savePreviewMode(mode) {
        if (typeof(Storage) == "undefined") {
            return;
        }
        localStorage.previewMode = mode;
    }

    function initPreviewMode() {
        if (typeof(Storage) == "undefined") {
            return;
        }
        var mode = localStorage.previewMode || "both";
        logglePreview(mode);
    }

})();