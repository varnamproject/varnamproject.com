{Contributing to varnam}

# Contributing

Thank you for your interest. This page explains high level ideas that are planned for Varnam, but still staying in the pending state. If you are interested in any of the ideas, feel free to drop a note to the [mailing list](https://lists.nongnu.org/mailman/listinfo/varnamproject-discuss) and start working on it. The best way to start contributing is by looking at the [bugs](https://savannah.nongnu.org/bugs/?group=varnamproject) and start fixing. This will give you enough information about the codebase and how to hack it.

Following are the rough areas where more work is required. 

## Add new languages to Varnam

Currently Varnam supports only Hindi and Malayalam. Adding support for most of the Indian languages is important. This involves writing scheme files for each language, finding training set for that language and making it live on varnam. 

* Complexity: Beginner
* Knowledge required: Read & Write the language that you are implementing.

## Create a Windows IME

Varnam is cross platform and it can work well on Windows. Create a Windows IME which works similar to how the IBus engine works. 

* Complexity: Advanced
* Knowledge required: C++, Windows programming

## Programming language bindings & varnam-daemon

Varnam is written on C which makes interoperability with other languages easy. There are language bindings available for `NodeJs` and `Ruby`. Supporting Varnam in multiple languages allows projects to use varnam easily to enable Indian language input.

To make using varnam from different languages easier, make a cross platform standalone process which uses `libvarnam` shared library and exposes a RPC API over network. This allows any programming language with a socket support can be used with libvarnam. This also makes language bindings fairly easy because they don't have to work with the native interoperability support. The protocol can be a simple text based protocol for all the commands that `libvarnam` supports. 

* Complexity: Advanced
* Knowledge required: C, knowledge on the language that you are writing the binding
* Savannah task: [13119](https://savannah.nongnu.org/task/index.php?13119)

## Create an Android IME

Android has an extensible input method system. Use that to make a IME which uses varnam internally. This includes, getting `libvarnam` compiled on android first. 

* Complexity: Advanced
* Knowledge required: C, Android, Java
* Savannah task: [13120](https://savannah.nongnu.org/task/index.php?13120)

## Enable varnam's suggestions system to be used from Inscript or any other input system

Varnam has knowledge about lot of words. This idea proposes a method to use these words and provide suggestions for other input systems. Basically, in Varnam, the API call will be something like,

```c
varnam_get_suggestions (handle, "भारत");
```

This will fetch all the suggestions which has the given prefix. 

`varnam_get_suggestions` needs to keep track of the previous words and use [n-gram](http://en.wikipedia.org/wiki/N-gram) based dataset to filter the results. This should also learn the words back into the word corpus that varnam is using. Filtering suggestions won't be just a prefix search, but it will have knowledge about how text can be written in the target language and provide smart filtering. Searching in a large corpus and providing real-time suggestions makes this a challenging task. 

Once this is implemented in `libvarnam`, it can be used in the ibus-engine.

* Complexity: Advanced
* Knowledge required: C
* Savannah task: [13121](https://savannah.nongnu.org/task/index.php?13121)


## Improve the learning system

The main goal of this is to improve how varnam tokenizes when learning words. Today, when a word is learned, varnam takes all the possible prefixes into account and learn all of them to improve future suggestions. But sometimes, this is not enough to predict good suggestions. An improvement is suggested which will try to infer the base form of the word under learning.

Varnam has a learning system built-in which can learn words and it can also learn possible other ways to write a word. Consider the following example. 

```ruby
learn("भारत") = [bharat, bhaarath, bharath]
transliterate("bharat") = भारत
transliterate("bhaarath") = भारत
transliterate("bharath") = भारत
```

Varnam also learns a word's prefixes so that it can produce better predictions for any word which has the same prefix. So in this case, with just learning the word "भारत", varnam can predict "bharateey" = "भारतीय".

The proposed idea talks about making this learn better. One example is infer the word "भारत" when learning भारतीय. Something like a porter stemmer implementation but integrated into the varnam framework so that new language support can be added easily. 

* Complexity: Medium
* Knowledge required: C, Ruby

## Improvements to the REST API

This includes rewrite of the current implementation in `golang` and add support for WebSockets to improve the input experience. This also includes making scripts that would ease embedding input on any webpage.

Current implementation is done on NodeJs which is causing maintainability issues. Rewrite the implementation with Golang & Martini. This involves writing a language binding for Varnam in Golang.

* Complexity: Advanced
* Knowledge required: Go, C

## Word corpus synchronization

Create a cross-platform synchronization tool which can upload/download the word corpus from offline IMEs like varnam-ibus[. This helps to build the online words corpus easily. 

* Complexity: Medium
* Knowledge required: Go

## Finish the crawler

Varnam has a crawler project started sometime back but never reached to a completion. Crawler works by taking website names that needs to be crawled to get the learning training set when adding a new language. Finish the work and start using it when adding new languages.

* Complexity: Advanced
* Knowledge required: Go
