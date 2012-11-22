(function () {

    window.Varnam = {};

    var suggestionDivId         = 'popup',
        suggestionDiv           = '#' + suggestionDivId,
        suggestionList          = suggestionDiv + ' select',
        suggestedItem           = suggestionDiv + suggestionList + ' option',
        isSuggestionDisplayed   = false,
        ignoreTextChange        = false,
        timer                   = null,
        KEYS = {
            ESCAPE:27,
            ENTER:13,
            TAB:9,
            SPACE:32,
            PERIOD:190,
            DOWN_ARROW:40,
            QUESTION:191,
            EXCLAMATION:49,
            COMMA:188,
            LEFT_BRACKET:57,
            RIGHT_BRACKET:48,
            SEMICOLON:59
        },
        WORD_BREAK_CHARS        =  [KEYS.ENTER, KEYS.TAB, KEYS.SPACE,
                                    KEYS.PERIOD, KEYS.QUESTION, KEYS.EXCLAMATION, KEYS.COMMA,
                                    KEYS.LEFT_BRACKET, KEYS.RIGHT_BRACKET, KEYS.SEMICOLON],
        myCodeMirror            = null,
        textChangedCallback     = null,
        lang                    = null,
        errorCallback           = null;

    Varnam.init = function(options) {
        myCodeMirror = CodeMirror.fromTextArea(options.textArea, {
            mode: options.mode,
            lineNumbers: options.lineNumbers,
            lineWrapping: true,
            onChange: textChanged,
            extraKeys:{
                "Ctrl-Space":function (instance) {
                    showSuggestion();
                }
            },
            onKeyEvent: processEditorKeyEvent
        });

        textChangedCallback = options.textChangedCallback;
        Varnam.editor = myCodeMirror;
        Varnam.setLanguage(options.language);
        errorCallback = options.errorCallback;

        createSuggestionsDiv();
        initialEventSetup();
    };

    Varnam.setLanguage = function(language) {
        lang = language;
    };

    function createSuggestionsDiv() {
        var divHtml = '<div id="' + suggestionDivId + '" class="CodeMirror-completions" style="display: none;"><select multiple="false"></select></div>';
        $("body").append(divHtml);
    }

    function initialEventSetup() {
        $("body").on('dblclick', suggestedItem, function () {
            replaceWordUnderCaret(getSelectedSuggestion());
            ignoreTextChange = true;
        });

        $(suggestionList).keydown(function (event) {
            if (event.keyCode === KEYS.ESCAPE) {
                hidePopup();
                myCodeMirror.focus();
            }
            else if (isWordBreakKey(event.keyCode)) {
                var text = $(this).find(":selected").text();
                if (text !== undefined && text !== '') {
                    replaceWordUnderCaret(text);
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

    var to_replace_when_response_available = {};
    function replaceWordUnderCaret(text) {
        var w = getWordUnderCaret(myCodeMirror);
        var linech = w.start;
        var xy = myCodeMirror.charCoords(linech);
        var word = w.word;
        if (word !== "") {
            myCodeMirror.replaceRange(text, linech, w.end);
            myCodeMirror.focus();
        }
        hidePopup();
        learnText(text);
    }

    function learnText(text) {
        if (lang === undefined || lang === 'en') return;
        $.post("learn", {
            text:text,
            lang:lang
        });
    }

    function getSelectedSuggestion() {
        return $(suggestionList).find(":selected").text();
    }

    function processWordBreaks() {
        var text = getSelectedSuggestion();
        if (text !== undefined && text !== '') replaceWordUnderCaret(text);
    }

    function isWordBreakKey(keyCode) {
        var exists = $.inArray(keyCode, WORD_BREAK_CHARS) == -1 ? false : true;
        if (exists) {
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
            return;
        }

        if (isSuggestionDisplayed) {
            if (_event.keyCode === KEYS.DOWN_ARROW) {
                $(suggestionList).focus();
                _event.preventDefault();
                _event.stopPropagation();
                return true;
            }
            else if (isWordBreakKey(_event.keyCode)) {
                processWordBreaks();
                if (_event.keyCode === KEYS.ENTER) {
                    _event.preventDefault();
                    _event.stopPropagation();
                    ignoreTextChange = true;
                    return true;
                }
            }
        }
        else if (_event.keyCode == KEYS.SPACE) {
            ignoreTextChange = true;
            var word = getWordUnderCaret(myCodeMirror);
            to_replace_when_response_available[word.word] = word;
        }
        else if (isWordBreakKey(_event.keyCode)) {
            ignoreTextChange = true;
        }
    }

    function showSuggestion() {
        var wordUnderCaret = getWordUnderCaret(myCodeMirror);
        var xy = myCodeMirror.charCoords(wordUnderCaret.start);
        if (wordUnderCaret.word !== "") showPopup(xy.x, xy.y, wordUnderCaret.word);
        else hidePopup();
    }

    function showPopup(x, y, word) {
        if (lang === 'en') return;
        var params = {
            'text':word,
            'lang':lang
        };

        show_error = false;
        hidePopup();
        request = $.ajax({
            url:'tl?' + $.param(params),
            dataType:'jsonp',
            crossDomain:'true',
            success:function (data) {
                if (errorCallback !== null) {
                    errorCallback(false);
                }
                html = "";
                var textWidth = 0;
                if (to_replace_when_response_available[data.input] !== undefined) {
                    wordToReplace = to_replace_when_response_available[data.input];
                    actualValueAtThatPos = myCodeMirror.getRange(wordToReplace.start, wordToReplace.end);
                    if (actualValueAtThatPos == data.input) {
                        myCodeMirror.replaceRange (data.result[0], wordToReplace.start, wordToReplace.end);
                    }
                    delete to_replace_when_response_available[data.input];
                }
                else if (getWordUnderCaret(myCodeMirror).word == data.input) {
                    $.each(data.result, function (index, value) {
                        if (index === 0) {
                            html += '<option selected>' + value + '</option>';
                        }
                        else {
                            html += '<option>' + value + '</option>';
                        }
                        if (textWidth < value.length) {
                            textWidth = value.length;
                        }
                        $(suggestionList).html(html).css('width', (textWidth + 2) + 'em');
                    });
                    $(suggestionList).html(html).css('height', (data.result.length+1) + 'em');
                    var editor = $('.CodeMirror');
                    var popup=$(suggestionDiv).css('display', "block").css('left', x + "px").css('top', (y + 15) + "px");
                    var popupHeight = popup.height();
                    var popupWidth = popup.width();
                    if((y + popupHeight) > editor.position().top + editor.innerHeight()){
                      popup.css('top',(y - popupHeight) + 'px');
                    }
                    if((x+popupWidth) > editor.position().left + editor.innerWidth()){
                        popup.css('left',(x-popupWidth)+'px');
                    }
                    isSuggestionDisplayed = true;
                }
            },
            error: function(request, status, error) {
                show_error = true;
                window.setTimeout(function () {
                    if (show_error && errorCallback !== null) {
                        errorCallback(true);
                    }
                }, 2000);
            }
        });
    }

    function hidePopup() {
        $(suggestionDiv).css('display', "none");
        isSuggestionDisplayed = false;
    }

    function isWordBoundary(text) {
        if (text === null || text === "" || text == " " || text == "\n" || text == "." || text == "\t" ||
            text == "\r" || text == "\"" || text == "'" || text == "?" || text == "!" || text == "," ||
            text == "(" || text == ")" || text == "\u000B" || text == "\u000C" || text == "\u0085" ||
            text == "\u2028" || text == "\u2029" || text == "\u000D" || text == "\u000A" || text == ";") {
            return true;
        }

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
        startAt = insertionPoint;
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
            };
        }

        return {
            start:startAt,
            end:endsAt,
            word:editor.getRange(startAt, endsAt)
        };
    }

    function textChanged(editor, from, to, text, next) {
        window.clearTimeout(timer);
        if (ignoreTextChange) {
            return;
        }
        timer = window.setTimeout(function () { showSuggestion(); }, 10);
        if (textChangedCallback !== null) {
            textChangedCallback(editor, from, to, text, next);
        }
    }
})();