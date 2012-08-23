(function(){

      var delay;
      var items = $('#popup select option');
      isPop = false;
      var converter = new Showdown.converter();
      $(document).ready(function(){
        items.live('click',function(){
          replaceContent($(this).text());
        });

        $("#popup select").keydown(function (event) {
          if (event.keyCode == 27) {
              hidePopup();
            }
          else if (event.keyCode == 13 || event.keyCode == 9 || event.keyCode == 32) {
            var text=$(this).find(":selected").text();
              if(text !== undefined && text!== '') {
                  replaceContent(text);
                  if (event.keyCode == 13) {
                      event.preventDefault();
                      event.stopPropagation();
                      ignoreTextChange = true;
                      return true;
                    }
                }
          }
        });
      });

      function replaceContent(text) {
      var w=getWordUnderCaret(myCodeMirror);
        var linech = w.start;
        var xy = myCodeMirror.charCoords(linech);
        var word = w.word;
        if ( word != ""){
          myCodeMirror.replaceRange(text,linech,w.end);
          myCodeMirror.focus();
        }
        hidePopup();
        // Learning the text
        $.post("learn", {text: text, lang: "ml"});
    }

    var ignoreTextChange = false;
      // Initialize CodeMirror editor with a nice html5 canvas demo.
      var myCodeMirror = CodeMirror.fromTextArea(document.getElementById('code'), {
        mode: 'markdown',
        lineNumbers: true,
        lineWrapping: true,
        onChange: textChanged,
           onKeyEvent : function (editor, e) {
          var _event = $.event.fix(e);
          if (_event.type == "keydown")
          {
            ignoreTextChange = false;
            if ((_event.keyCode == 13 || _event.keyCode == 32) && !isPop) {
              // Enter/Space key pressed when popup is not active
              // Mostly user tries to move text around. So don't send any request
              // and show the popup
              ignoreTextChange = true;
            }
            else if (_event.keyCode == 27) {
              hidePopup();
            }
            else if((_event.keyCode === 13 || _event.keyCode === 32 || _event.keyCode === 40) && isPop) {
              if (_event.keyCode === 40) {
                // Down arrow
                $("#popup select").focus();
              }
              else {
                var text=$("#popup select").find(":selected").text();
                if(text !== undefined && text!== '') {
                  replaceContent(text);
                  if (_event.keyCode == 13) {
                    _event.preventDefault();
                    _event.stopPropagation();
                    ignoreTextChange = true;
                    return true;
                  }

                }

              }
            }
          }
          }
      });

      function showPopup(x, y, word) {
      var params = { 'text':word,'lang':'ml' };
      $.ajax({
        url:'tl?' + $.param(params),
        dataType:'json',
        crossDomain: 'true',
        success:function (data) {
          html = "";
          $.each(data, function(index, value) {
            if(index === 0){
             html += '<option selected>'+ value+'</option>';
           }else{
             html += '<option>'+ value+'</option>';
           }
          });
          $('#popup > select').html(html).css('width','10em');
          $('#popup').css('display', "block")
                .css('left', x + "px")
                .css('top', (y + 15) + "px");
          isPop=true;
        }
      });
    }

    function hidePopup() {
      $('#popup').css('display', "none");
      isPop=false;
    }

    function isWordBoundary(text) {
      if (text == null || text == "" || text == " "
        || text == "\n" || text == "." || text == "\t" || text == "\r" || text == "\"" || text == "'"
        || text == "?" || text == "!" || text == "," || text == "(" || text == ")" || text == "\u000B" || text == "\u000C"
        || text == "\u0085" || text == "\u2028" || text == "\u2029" || text == "\u000D" || text == "\u000A" || text == ";")
        return true;

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
      while(caretPos) {
        text = editor.getRange({line: insertionPoint.line, ch: caretPos - 1}, {line: insertionPoint.line, ch: caretPos});
        if (isWordBoundary(text)) {
          break;
        }
        --caretPos;
        startAt = {line: insertionPoint.line, ch: caretPos};

      }

      endsAt = insertionPoint
      caretPos = insertionPoint.ch;
      while(caretPos < lastPosition) {
        text = editor.getRange({line: insertionPoint.line, ch: caretPos}, {line: insertionPoint.line, ch: caretPos + 1});
        if (isWordBoundary(text)) {
          break;
        }
        ++caretPos;
        endsAt = {line: insertionPoint.line, ch: caretPos}
      }

      return {start: startAt, end: endsAt, word: editor.getRange(startAt, endsAt)};
    }


    var timer;
    function textChanged(editor, from, to, text, next)
    {
      window.clearTimeout(timer);
      updatePreview();

      if (ignoreTextChange) {
        return;
      }

      timer = window.setTimeout(function() {
        var linech = getWordUnderCaret(myCodeMirror).start;
        var xy = myCodeMirror.charCoords(linech);
        var word = getWordUnderCaret(myCodeMirror).word;
        if ( word != "")
          showPopup(xy.x, xy.y,word);
        else
          hidePopup();
      }, 50);
    }


      function updatePreview() {
        var previewFrame = document.getElementById('preview');
        var preview =  previewFrame.contentDocument ||  previewFrame.contentWindow.document;
        preview.open();
        preview.write(converter.makeHtml(myCodeMirror.getValue()));
        preview.close();
      }

      $('button').click(function(){

        switch($(this).data('preview')){
          case "editor":
              $("#editor_div").removeClass("span6").addClass("span12");
              $("#preview_div").hide();
              $("#editor_div").show();
          break;
          case "both":
              $("#editor_div").removeClass("span12").addClass("span6");
              $("#preview_div").show();
              $("#editor_div").show();
              $('#preview_div').css('margin-left',$("#reserve").css('margin-left'));
              $("#preview_div").removeClass("span12").addClass("span6");
          break;
          case "preview":
              $("#editor_div").hide();
              $("#preview_div").show();
              $("#preview_div").removeClass("span6").addClass("span12");
              $('#preview_div').css('margin-left','0');
          break;
        }

      });

      $('.lang').click(function(){
        $('.dropdown-toggle').html($(this).text() + " <span class='caret'></span>");
      });


    })();