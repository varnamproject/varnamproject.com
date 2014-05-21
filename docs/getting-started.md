{Getting started with varnam}

# Hacking varnam

This guide helps you to setup varnam on your computer for development. If you just need to try it out, then use the [online editor](/editor) or browser addons.

## Configuring libvarnam

If you are not going to modify the source code of libvarnam, you can install the released version. The released version comes with all the scheme files pre-compiled. So it is easy to get started.

```bash
> wget http://download.savannah.gnu.org/releases/varnamproject/libvarnam/source/libvarnam-3.1.1.tar.gz
> tar -xvf libvarnam-3.1.1.tar.gz && cd libvarnam-3.1.1.tar.gz
> cmake . && make && sudo make install
```

For developing libvarnam, it is better to checkout from the git.

```sh
> git clone git@github.com:varnamproject/libvarnam.git
> cd libvarnam
> cmake . && make
> # Compile a scheme file of your choice
> ./varnamc --compile schemes/ml
> sudo make install
```

You can use `varnamc`, a command line utility to communicate with libvarnam. 

NOTE: `varnamc` requires Ruby 1.9.x or later.

```sh
> varnamc -s hi --transliterate "varnam"
> varnamc -s hi --learn "भारत"
```

## Feeding training data to libvarnam

Varnam's learning system loves data. The more data that you feed, the better it will be. You can feed any words into varnam by using the command line utility. Assuming `words.txt` contains a set of words, one word one each line, the below code will learn all the words specified in the file.

```sh
> cat words.txt
भारत
मेरा
प्रतीक
> varnamc -s hi --learn-from words.txt
```

Every month, we release the word corpus that varnam is using. You can use that to feed the training data. 

NOTE: currently only words for Malayalam is available. Hindi word lists are not available for now.

```sh
> wget http://download.savannah.gnu.org/releases/varnamproject/words/ml/word-corpus.tar.gz
> tar -xvf word-corpus.tar.gz
> varnamc -s hi --learn-from word-corpus/0.txt
> varnamc -s hi --learn-from word-corpus/1.txt
> # etc
```

## Configuring libvarnam-ibus

NOTE: This is under development.

You need to install the following dependencies:

* libibus-dev >= 1.5
* glib
* libvarnam

```sh
> git clone git@github.com:varnamproject/libvarnam-ibus.git
> cd libvarnam-ibus
> cmake . && make && sudo make install
```

Restart your IBus daemon and choose varnam from ibus setup. 
