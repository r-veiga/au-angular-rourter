## Dos proyectos
Este curso sobre Angular Router tiene dos proyectos como punto de inicio: 
1. Un proyecto Angular (frontend)
2. Un proyecto de backend, un API en Node.js

## Arrancando los proyectos 
```shell
npm start 
npm run server
```
1. El primer comando arranca el proyecto Angular por el puerto 4200 
2. El segundo comando arranca la API de backend por el puerto 9000 

```shell
http://localhost:4200
http://localhost:9000/api/courses
```

Un detalle a tener en cuenta es que `npm start` en realidad arranca el comando `ng serve  --proxy-config ./proxy.json`

Estamos empleando un fichero `proxy`

## Direcciones con la directiva `routerLink`

En el componente HTML donde quiera clicar para navegar, empleo la directiva `routerLink`. 

```javascript
<a class="menu-item" mat-button routerLink="about">...</a>
<a class="menu-item" mat-button [routerLink]="'login'">...</a>
``` 

Tengo a mi disposición dos sintaxis, sin o con binding. 

Lo normal es que la dirección sea relativa, para facilitar el trabajo en una refactorización. Pero en este caso particular de enlaces en el top menú (navbar) quiero que sean **enlaces absolutos**: 

```javascript
<a class="menu-item" mat-button routerLink="/about">...</a>
<a class="menu-item" mat-button routerLink="/login">...</a>
``` 

La directiva `routerLinkActive` permite determinar clases de estilo a aplicar cuando el enlace esté activo. En este ejemplo, la clase `"menu-item-active"`, la defino en el fichero CSS del componente Angular.

```javascript 
<a class="menu-item" mat-button routerLink="/about" routerLinkActive="menu-item-active">...</a>
<a class="menu-item" mat-button routerLink="/login" routerLinkActive="menu-item-active">...</a>
```