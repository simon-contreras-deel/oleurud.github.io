---
layout:     post
title:      Autenticacion personalizada con Meteor
date:       2015-08-04 10:21
summary:    He creado el clásico proyecto base, con mi propio sistema de autenticación y algunos detalles más para poder empezar a trabajar sobre él
categories: Javascript, Node.js, Meteor
---

![Meteor](./images/meteor-logo.png)

Aunque meteor ofrece la posibilidad extremadamente simple de crear un sistema completo de autenticación instalando dos paquetes, **accounts-password** y **accounts-ui**, tiene dos inconvenientes claros: al ser tan simple, mucha gente la utiliza nada más comenzar desarrollado con meteor y puede dar a tu app una imagen "poco trabajada" o de "app beta" y por otro lado, no te permite configurar muchos de los elementos, lo que hace que estés "atado" a una solución que quizás no sea la ideal para tu app.

Por ello, me he creado el clásico proyecto base, con mi propio sistema de autenticación y algunos detalles más para poder empezar a trabajar sobre él:

- el registro y el login están en popups accesibles desde cualquier página de la app. De esta manera evitas temas de redirección después del registro/login del usuario
- registro en dos pasos con sus respectivos emails
- primeras configuraciones de rutas, incluyendo las rutas privadas de usuario autenticado
- sistema (cutre) de notificación

Puedes probar la demo en [customauth.meteor.com](customauth.meteor.com) y descargarte el [código en gitHub](https://github.com/oleurud/meteor-starter-with-custom-auth). No dudes en comentarme lo que te apetezca, será bien recibido. Necesitas instalar los siguientes paquetes:

- meteor add accounts-password
- meteor add iron:router
- meteor add twbs:bootstrap
- meteor add jquery

Poco a poco iré escribiendo más sobre meteor (eso espero!), ya que apenas hay documentación en español (incluido un pequeño tutorial sobre las 3 cositas que hace este sistema). Os dejo unos pantallazos del resultado:

La home:

![Meteor](./images/meteor-auth-home.png)

El popup de registro

![Meteor](./images/meteor-auth-signup.png)

El usuario autenticado, justo después de verificar su email

![Meteor](./images/meteor-auth-verify.png)

Y el popup de login

![Meteor](./images/meteor-auth-login.png)
