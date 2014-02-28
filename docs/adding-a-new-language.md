{Adding a new language to varnam}

# Adding a new language

A new language can be added to `libvarnam` by adding a new scheme file. A scheme file is a simple Ruby file which can be used to specify the symbols for a language. The best way to write a new scheme file is to refer to an existing one. All the scheme files are stored under `schemes/` directory.

## Metadata

A scheme file often starts with metadata.

<table>
<tr><td>language_code</td><td>Language code for the scheme</td></tr>
<tr><td>identifier</td><td>A unique identifier to identify this scheme</td></tr>
<tr><td>display_name</td><td>Friendly name for this scheme</td></tr>
<tr><td>author</td><td>Author of the scheme file</td></tr>
</table>

## Syntax

```ruby
<symbol-type> options, symbols
```

`options` and `symbols` should be valid Ruby hashes. `options` is optional argument and can contain the following values.

```ruby
options = {:accept_if => starts_with | ends_with | in_between, :priority => 0..9}
```

`symbols` should be a hash with patterns as keys and replacement as values. It can have the following form.

```ruby
'a' => 'a-value', 'b' => 'b-value'
['a', 'aa'] => 'b-value'
```

Given the above mapping, varnam will replace token `a` with `a-value` and token `b` with `b-value`. Multiple patterns can be specified in an array. In this case, both `a` and `aa` will resolve to `b-value`.

## Symbol types

The following functions are available in the scheme files to define different types of symbols. 

* vowels
* consonants - Usually specified with the inherent 'a' sound.
* consonant_vowel_combinations
* anusvara
* visarga
* virama
* symbols
* numbers
* others

## Other functions

Following functions are available in a scheme file.

### infer_dead_consonants

Usage

```ruby
infer_dead_consonants true
```

When this option is set, varnam will infer dead consonant from a consonant definition. Consider the following statements. 

```ruby
infer_dead_consonants true

consonants 'ka' => 'क'
```

In this case, varnam will create a consonant `ka` which will resolve to `क` and a dead consonant `k` which resolves to `क्`.

### generate_cv

When this function is called, varnam will autogenerate consonant-vowel combinations. Consider the following statements.

```ruby
vowels 'aa' => ['आ', 'ा']

consonants 'ka' => 'क'

generate_cv
```
In this case, varnam will generate consonant-vowel combinations like, `kaa` => 'का'

### list

Creates a custom list and adds the tokens into the list.

```ruby
list :consonants_with_inherent_a_sound do
   consonants 'ka' => 'क'
end

# Token 'ka' will be added to the custom list named 'consonants_with_inherent_a_sound'. To read it,
consonants_with_inherent_a_sound.each do |c|
  puts c
end
```

### combine

`combine` function can be used to generate combination of tokens. Consider the following scheme file for *Hindi*.

```ruby
consonants "k" => "क",
           ["kh", ["gh"]] => "ख",
           ["gh", ["kh"]] => "घ",

# Generating ka, kha etc
consonants(combine get_consonants, ["*a"] => ["*1"])
```

It takes a list as the first argument and hash as the second argument. List could be any custom defined lists created using the `list` function or it could be any built-in list. In the above example, `combine` will iterate over the list `get_consonants` and replace the wildcard character `*` with current pattern and `*1` with value1. For values, you can use `*1`, `*2` and `*3` for getting `value1`, `value2` and `value3`.

`combine` function returns a hash that can be passed to token creation functions like `consonants` or `vowels`.

### Setting priority for a token

When defining a token, you can assign some priority to it. When varnam does the tokenization, high priority tokens will appear first in the list.

```ruby
consonants({:priority => :high}, 'ka' => 'क')
```

This will generate consonant `ka` with priority set to `high`.

### Setting accept condition for a token

Each token can have an optional accept condition. Accept condition can have 1 of 3 possible values. `starts_with`, `ends_with` and `in_between`. 

```ruby
consonants({:accept_if => :starts_with}, 'ka' => 'क')
```

In this case, varnam will accept token `ka` only if the pattern starts with `ka`.