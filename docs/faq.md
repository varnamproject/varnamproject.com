{Frequently asked questions about varnam}

# Frequently asked questions

## Why was varnamproject started?

Varnam project was started as a research project. I was researching about predictive transliterators and found no open-source implementation which works like Google's transliterate. My research proved that using predictive transliteration improves the typing speed drastically. Google's predictive transliterator was failing and provided random predictions rather than the correct word. Since there is no way to fix this issue because of the closed nature of Google's transliterator, making a open-source alternative proved to be useful.

Varnam aims at providing consistent input experience across different platforms. It also enables developers to embed varnam together with their application to support input in different languages.

## How is it different from Google transliterate?

Varnam is not that different from Google transliterate in terms of high level functionality. Following are the key points that I think varnam handles better that Google transliterate.

* Fallback to literal transliteration when prediction fails.
* A much better tokenization and learning system leading to better predictions.
* Open source - You can fix Varnam if your favorite word is not getting predicted properly.
* Cross platform - Works on all the major platforms.
* Can be embedded - Varnam can be embedded into other applications. Other applications could use the shared library or statically link varnam.

## What are the usage statistics

* Today, varnam supports Hindi and Malayalam. 
* Varnam knows about more than a million Malayalam words, and 7 million ways to write them.
* The average time it takes to transliterate a word is less than half a second.
* The word corpus obtained from varnam can be used to other statistical analysis.
* Varnam server serves close to 10,000 requests a day.

## Do you track the text that I type in the varnam online editor?

*NO*. We don't. If you are still doubtful, the code is open, go check it out yourself.  Varnam don't track the whole sentence that you write. It learns the individual words sorted in the canonical order. 

## Why is my favorite language not supported on varnam?

If your language is not supported, you can start contributing and add support for it. Read the [adding a new language](/docs/adding-a-new-language) section to get started.

## Why this website's look & feel sucks?

Because I am really bad at designing. Feel free to submit a pull-request with the changes that you wish.

