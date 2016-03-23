{Varnam concepts}

# Concepts

Varnam is based on phonetic transliteration, and defines a particular scheme for each language. libvarnam is the core library that all Varnam projects use. It is a shared library that implements a transliterator, a reverse transliterator and a learning subsystem.

Libvarnam is a learning program, that is, it can learn words as you type. It stores the words it has learned, and makes use of this knowledge to provide suggestions while transliterating.

For instance, to input the text "മലയാളം", in other phonetic based transliteration systems, you will have to input "malayaaLam". But in Varnam, just inputting "malayalam" can give you the word "മലയാളം". Varnam knows about half a million Malayalam words as of now, and it gets better with more use. Varnam can ease the input time considerably for beginners, compared to other transliteration systems.

## Scheme files

A scheme file defines how varnam maps patterns to replacements. Scheme file uses a DSL written on Ruby. Technically, scheme file is Ruby code and you can perform any operation that Ruby supports in it. A scheme file needs to be compiled before it can be used with varnam. Compiling will convert the scheme file to a binary format understood by varnam. Varnam uses SQLite for this.

A scheme file can be compiled using the command line utility `varnamc`.

```bash
> varnamc --compile schemefile.txt
```

Compiling a scheme file produces a `vst` (varnam symbol table) file which can be used with varnam. 

```bash
> varnamc -s schemefile.vst --transliterate varnam
```

Look inside [schemes/](https://github.com/varnamproject/libvarnam/tree/master/schemes) directory to understand the structure of a scheme file. 

## libvarnam

This is the core of varnamproject and all components use this shared library.  libvarnam has a fairly simple API and is written using standard C. It can be easily embedded to your application. If you have a standalone application, you can embed the "libvarnam.so" or "libvarnam.dll" or even a statically compiled version of the library. Web applications can use the REST API interface to enable indic input. 

## varnamproject.com

Online editor which uses libvarnam.

## Language bindings

Various language bindings that allows varnam to be used from different programming languages. If you have a NodeJS application, you can use varnam like the following:

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

There is an experimental support for Ruby, Go and Java. Most of the language bindings uses native interop features provided to communicate with varnam library.

## IBus Engine

IBus engine which uses libvarnam and provide offline input for Linux. This is not yet released and the work is in progress. You can track the progress in the [Git repository](https://github.com/varnamproject/libvarnam-ibus).


## Browser addons

Firefox & Chrome addons written using Javascript. This uses varnam's REST API to perform the transliteration.
