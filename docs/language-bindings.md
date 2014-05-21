{Use varnam in other programming languages}


## NodeJs

You need to build the NodeJs module before using this.

```bash
> git clone git@github.com:varnamproject/libvarnam-nodejs.git
> cd libvarnam-nodejs
> node-gyp configure && node-gyp build
```

Once the module is compiled, you can use it in JS like:


```js
var v = require('varnam');
var varnam = new v.Varnam("scheme_file", "suggestions_file");
varnam.transliterate ("malayalam", function(err, result) {
	if (err != null) {
        console.log (err);
	}
	else {
        console.log (result);
	}
});
```

## Java

You can get the code from [libvarnam-java](https://github.com/navaneeth/libvarnam-java). 

NOTE: This is just a POC showing the possibility of a Java API. More work needs to be done to make it production quality.

```java
Varnam varnam = new Varnam("/usr/local/share/varnam/vst/hi-unicode.vst");
varnam.enableSuggestions("learnings.varnam.hi");
List<Word> words = varnam.transliterate("hindi");
for (Word word : words) {
  System.out.println(word.getConfidence() + " - " + word.getText());
}
```

