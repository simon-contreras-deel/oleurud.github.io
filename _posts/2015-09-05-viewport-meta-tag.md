---
layout:     post
title:      viewport meta tag
date:       2015-09-05 10:13
summary:    Cuando ves tu app en Meteor desde el móvil, ¿ves la versión de escritorio?
categories:
---

Cuando ves tu app en Meteor desde el móvil, ¿ves la versión de escritorio?

El problema es que has olvidado poner los metas adecuados en tu app. En tu layout, dentro de las etiquetas head, tienes que definir el viewport:

{% highlight javascript lineanchors %}
<meta name="viewport" content="width=device-width, initial-scale=1">
{% endhighlight %}

Y listo, problema resuelto.

Más info [en MDN](https://developer.mozilla.org/en-US/docs/Mozilla/Mobile/Viewport_meta_tag)
