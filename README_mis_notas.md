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

## Setup del lazy loading con Angular Router

En el proyecto tengo el módulo `CoursesModule` que comprende una serie de componentes dedicados, definido en el fichero `./courses/courses.module.ts`.

Este módulo, `CoursesModule`, será cargado lazily. 

Tengo que definirle en el módulo de routing, `app-routing.module.ts` que las rutas `courses/*` corresponden a este módulo. Lo hago en el objeto `Routes` donde tengo definidas las rutas.

Importo dinámicamente el módulo `CoursesModule` empleando la palabra de Javascript estándar `import`, que me devuelve una `Promise`.

```javascript 
const routes: Routes = [
  { path: "courses", loadChildren: () => import('./courses/courses.module').then(m => m.CoursesModule) },
  { path: "login", component: LoginComponent },
  { path: "about", component: AboutComponent },
];
```

Similar al módulo principal `AppModule`, el módulo `CoursesModule` contiene **su propio módulo de routing** que aísla la configuración de routing.
Este módulo se llama `CoursesRoutingModule`.

En el `import` de `CoursesRoutingModule` debo indicar que se trata de un módulo hijo (con sus rutas hijas) y no del módulo principal. Uso la palabra `forChild` que indica que es un módulo hijo, que puede ser cargado indistintamente lazy o no.

```javascript 
const routes: Routes = [
  { path: "", component: HomeComponent }, 
  { path: ":courseUrl", component: CourseComponent }, 
];

@NgModule({
    imports: [ RouterModule.forChild(routes) ], 
    exports: [ RouterModule ], 
    . . . 
})
```

A su vez tengo también un objeto Routes propio de este módulo de routing, donde debo destacar dos cosas:
* el path es "", pero es `forChild` así que en realidad tiene la ruta base `/courses` tal y como se le ha asociado al `CoursesRoutingModule` en el fichero de routing padre de la aplicación
* estoy definiendo una variable `:courseUrl` de path router

La variable la voy a emplear en el template de las cards que mostrarán los cursos disponibles al usuario.
La URL del curso es un valor dinámico que cambiará en cada card y se asocia al botón "VIEW COURSE". En `routerLink` hago un binding, en vez de asociar un valor constante como hasta ahora.

```html
<mat-card *ngFor="let course of courses"...>
    . . .
    <mat-card-header>...{{course.description}}...</>
    <img mat-card-image [src]="course.iconUrl">
    <mat-card-content> <p>{{course.longDescription}}</p> </mat-card-content>

    <mat-card-actions class="course-actions">
        <button [routerLink]="[course.url]...>VIEW COURSE</button>
        <button mat-button class="mat-raised-button mat-accent" (click)="editCourse(course)"> EDIT </button>
    </mat-card-actions>
</mat-card>
```




