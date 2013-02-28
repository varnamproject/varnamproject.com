var functions = require('../lib')

/*
 * GET home page.
 */

exports.index = function(req, res){
  	res.render('index', { title: 'Express' });
};

app.get('/editor', function(req, res) {
    res.render('editor');
});

// /tl?lang=code&text=text_to_transliterate
app.get('/tl', functions.tl);
app.get('/rtl', functions.rtl);
app.post('/learn', functions.learn);
app.get('/admin', functions.admin);
app.get('/admin/words_learned_last_days', functions.getLearnedWordsForLastDays);
app.post('/admin/delete_word', functions.deleteWord);
app.get('/admin/search_word', functions.searchWord);
