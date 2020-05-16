---
layout:     post
title:      Atributos privados en objectos Javascript
date:       2015-12-27 10:05
summary:    Cómo tener atributos privados en objectos Javascript
categories: e
---

Quizás alguien te haya contado que ciertas cosas no se pueden hacer en Javascript, por ejemplo tener atributos privados. Pero gracias a las closures, podemos crear atributos privados en Javascript.

Veamos un ejemplo simple, donde creamos un objeto Persona con dos atributos, nombre (público) y edad (privado):

{% highlight javascript lineanchors %}
function Persona (nombre, edad){
  this.nombre = nombre;
  var edad_ = edad;

  this.getEdad = function() {
    return edad_;
  }

  this.setEdad = function(edad) {
    edad_ = edad;
  }
};

Persona.prototype.presentate = function(){
  return 'Nombre: ' + this.nombre + ' | Edad: ' + this.getEdad();
};
{% endhighlight %}

Si utilizamos el objeto:

{% highlight javascript lineanchors %}
var persona = new Persona('Simon', 28);
console.log(persona); //no vemos el atributo edad_
persona.presentate(); // devolverá: "Nombre: Simon | Edad: 28"
{% endhighlight %}

Parece que efectivamente, edad_ ha guardado su valor, pero ¿podremos acceder al atributo?

{% highlight javascript lineanchors %}
persona.nombre; //devuelve "Simon"
persona.edad_; // devuelve undefined
{% endhighlight %}

Como buen atributo privado, solo podemos acceder a él desde dentro del propio objeto y no desde fuera. Para poder modificar nuestro atributo edad_, usaremos el método setEdad();

{% highlight javascript lineanchors %}
persona.setEdad(30);
persona.presentate(); //"Nombre: Simon | Edad: 30"
{% endhighlight %}

Y de la misma manera podremos crear métodos privados. Si quisiésemos tener atributos de tipo “Private” y “Protected”, tendríamos que entrar en más detalle, pero como idea inicial creo que es un buen ejemplo.

Si no terminas de ver claro el código, échale un ojo a este artículo de la [MDN sobre las Closures](https://developer.mozilla.org/es/docs/Web/JavaScript/Closures)
