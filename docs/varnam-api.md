{Introduction to varnam API}

# Varnam API

`api.h` defines the public API for `libvarnam`. Take a look at api.h in the source for available functions.

In short, `libvarnam` can be initialized using `varnam_init()`. `varnam_init()` will initialize a handle which needs to be passed to all other functions. `varnam_transliterate()` can transliterate a word. `varnam_learn()` can be used to learn a word. 

Following example shows a simple usage of `libvarnam`.

```c
#include <varnam.h>

int main(int args, char **argv)
{
  int rc, i;
  char *error;
  varnam *handle;
  varray *result;
  vword *word;

  rc = varnam_init("path/to/ml-unicode.vst", &handle, &error);
  if (rc != VARNAM_SUCCESS)
  {
     printf ("Initialization failed. %s\n", error);
     return 1;
  }

  rc = varnam_transliterate (handle, "navaneeth", &result);
  if (rc != VARNAM_SUCCESS)
  {
     printf ("Transliteration failed. %s\n", varnam_get_last_error(handle));
     return 1;
  }

  for (i = 0; i < varray_length (result); i++)
  {
     word = varray_get (result, i);
     printf ("%s\n", word->text);
  }

  return 0;
}
```

On a GNU/Linux machine, above example can be compiled using the following command:

```shell
gcc `pkg-config --cflags --libs varnam` -o example example.c
```