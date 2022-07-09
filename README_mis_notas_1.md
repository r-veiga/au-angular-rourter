# Mis notas (1) sobre este curso de Angular Router

### Continúa en [mis notas (2) sobre este curso de Angular Router](./README_mis_notas_2.md)

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

En el proyecto tengo el módulo `CoursesModule` definido en el fichero `./courses/courses.module.ts` y que comprende una serie de componentes dedicados.

Este módulo, `CoursesModule`, será "lazy loaded". 

En el módulo de routing padre `AppModuleRouting` defino la url `/courses` como entrada al módulo `CoursesModule`.
La palabra de Javascript estándar `import` como comando para importar dinámicamente el módulo `CoursesModule` que devuelve una `Promise`, así que usaré la palabra `then()`.

```javascript 
const routes: Routes = [
  { path: "courses", loadChildren: () => import('./courses/courses.module').then(m => m.CoursesModule) },
  { path: "login", component: LoginComponent },
  { path: "about", component: AboutComponent },
];
```

Este módulo, `CoursesModule`, será "lazy loaded". Importa el módulo de routing `CoursesModuleRouting`.

El módulo hijo `CoursesModule`, similar al módulo principal de la aplicación `AppModule` separa el routing, el uso de `RouterModule`, 
* en el módulo principal `RouterModule.forRoot(...)` 
* en el módulo hijo `RouterModule.forChildren(...)`


Similar al módulo principal `AppModule`, el módulo `CoursesModule` contiene **su propio módulo de routing** que aísla la configuración de routing y en él defino un objeto de tipo `Routes` que es un array de rutas, las rutas `courses/**`. 
Este módulo se llama `CoursesRoutingModule`.

```javascript 
const routes: Routes = [
  { path: "", component: HomeComponent }, 
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ],
})
export class CoursesRoutingModule {
```

A su vez tengo también un objeto Routes propio de este módulo de routing, donde debo destacar dos cosas:
* el path es "", pero es `forChild` así que en realidad tiene la ruta base `/courses` tal y como se le ha asociado al `CoursesRoutingModule` en el fichero de routing padre de la aplicación
* estoy definiendo una variable `:courseUrl` de path router

La variable la voy a emplear en el template de las cards que mostrarán los cursos disponibles al usuario.
La URL del curso es un valor dinámico que cambiará en cada card y se asocia al botón "VIEW COURSE". En `routerLink` hago un binding de input con corchetes porque es dinámico.  

```html
<mat-card *ngFor="let course of courses"...>
    <mat-card-header>...{{course.description}}...</>
    <img mat-card-image [src]="course.iconUrl">
    <mat-card-content> <p>{{course.longDescription}}</p> </mat-card-content>

    <mat-card-actions class="course-actions">
        <button [routerLink]="[course.url]...>VIEW COURSE</button>
        <button mat-button class="mat-raised-button mat-accent" (click)="editCourse(course)">EDIT</button>
    </mat-card-actions>
</mat-card>
```

El curso a mostrar al usuario dependerá de la URL (del contenido de la variable) `/courses/:courseUrl`.

Añado este caso de rutas en el objeto `Routes`: 

```javascript 
const routes: Routes = [
  { path: "", component: HomeComponent }, 
  { path: ":courseUrl", component: CourseComponent }, 
];
```

Veamos ahora cómo gestionar esta navegación en el componente asociado `CourseComponent`.

```typescript
@Component({
    selector: 'course',
    templateUrl: './course.component.html',
    styleUrls: ['./course.component.css']
})
export class CourseComponent implements OnInit {
    course: Course;
    couponCode: string;

    constructor() { }
}
``` 

La solución más sencilla sería inyectar un cliente Http en la clase `CourseComponent` y traerse la información del curso.
Sin embargo, un Router Resolver me ofrece unas cuantas ventajas.

Un **Router Resolver** es un servicio especial de routing dedicado a recoger, durante una navegación de ruta, todos los datos que el componente necesita.  
El Router Resolver pasa los datos al componente, resolviendo un par de problemas:
* si hay un problema y no se puede recuperar los datos, entonces la transición de navegación no se completa y nos quedamos en la pantalla original. Podríamos mostrar un mensaje de error, así no se muestra al usuario una pantalla vacía. 
* no muestra el componente hasta que los datos estén completos, así evitamos una presentación a tirones (vacía/llena).

En la carpeta `/service` crearé un nuevo servicio `CourseResolver` que implementa el interfaz `Resolve` con un método a implementar `resolve(...)`.

En el constructor de `CourseResolver` inyecto el servicio `CoursesService` que lee los datos del backend => un DAO, hablando en plata.

```javascript
@Injectable()
export class CourseResolver implements Resolve<Course> {

    constructor(private courses: CoursesService) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Course> {
        const course = extractCourseFromURL(route);
        return this.courses.loadCourseByUrl(course);
        // el Resolver necesita que la emisión se complete, puedo protegerme así: 
        // return this.courses.loadCourseByUrl(course).pipe(first());
    }

    private extractCourseFromURL(route: ActivatedRouteSnapshot) {
      return route.paramMap.get("courseUrl");
    }
}
```

De una ruta como `localhost:4200/courses/angular-router-course`, necesito extraer el parámetro para luego pasárselo a mi método del DAO.

`CourseResolver` obliga unos cambios en el módulo de routing: 

```javascript 
const routes: Routes = [
  { path: "", component: HomeComponent }, 
  { path: ":courseUrl", component: CourseComponent, resolve: { course: CourseResolver } }, 
];

@NgModule({
  imports:    [ RouterModule.forChild(routes) ],
  exports:    [ RouterModule ],
  providers:  [ CourseResolver ],
})
export class CoursesRoutingModule {
```

La ruta indica que antes de mostrar el `CourseComponent` se debe cargar su propiedad `course` con lo que me devuelva el `CourseResolver` (en el método `resolve`). 
Potencialmente, el componente podría definir varias propiedades a resolver, cada una con su propio resolver.

De esta simple manera he enlazado el componente con el resolver. 

Cuando se muestre el componente los datos habrán sido recuperados del backend y estarán disponibles a nivel del Router. Ahora es necesario que el componente acceda a los datos, para eso se inyecta en el constructor del componente un inyectable específico de routing, `ActivatedRoute`. De su propiedad `snapshot` puedo extraer los datos del curso obtenidos por el resolver. 

```typescript 
export class CourseComponent implements OnInit {
    course: Course;
    couponCode: string;

    constructor(private route: ActivatedRoute) { }

    ngOnInit() {
        this.course = this.route.snapshot.data['course'];
    }
}
```

A continuación mostraré un spinner durante las transiciones de routing, si ocurre que:
* se está cargando un módulo de tipo lazy-loading 
* está ejecutándose un Router Resolver y esperando a que los datos estén disponibles

En el componente principal `app.component.html`, donde tengo el `<router-outlet>`, tendré también otro componente `<loading>` que será el spinner.

```html
  . . . 
  </mat-toolbar>
  <messages></messages>
  <loading></loading>
  <router-outlet></router-outlet>
</mat-sidenav-container>
```

Usaré un spinner de Material dentro de mi componente custom Angular que voy a crear y al que se le inyecta un servicio `LoadingService` que monitoriza determinadas acciones del router.  

```typescript 
@Component({
  selector: 'loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css']
})
export class LoadingComponent implements OnInit {
  @Input() routing: boolean = false; 
  constructor(public loadingService: LoadingService) { } 
  ngOnInit() { } 
}
```

El componente aún no está integrado con el routing. 
El spinner se visualiza meramente si es "true" el valor emitido en el observable `loading$` del servicio `LoadingService`.

```html 
<div class="spinner-container" *ngIf="loadingService.loading$ | async">
    <mat-spinner></mat-spinner>
</div>
```

Voy a hacer que el spinner se integre con el routing.
Habilitaré que se monitorice con el servicio si hay una transacción de routing en marcha.

```html
  . . . 
  <loading [detectRoutingOngoing]="true"></loading>
  <router-outlet></router-outlet>
  . . . 
```

Para monitorizar el routing, lo primero que necesito es inyectar el Router. 

```typescript 
@Component({
  selector: 'loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css']
})
export class LoadingComponent implements OnInit {
  @Input() routing: boolean = false; 
  @Input() detectRoutingOngoing = false;

  constructor(public loadingService: , private router: Router ) { }  

  ngOnInit() { 
    if (this.detectRoutingOngoing) {
      this.router.events.subscribe(event => {
        if (event instanceof NavigationStart || 
            event instanceOf Route) {
          this.loadingService.loadingOn();
        }
        else if ( event instanceof NavigationEnd    || 
                  event instanceof NavigationError  || 
                  event instanceof NavigationCancel   ) {
          this.loadingService.loadingOff();
        }
      });
    }
  } 
}
```

Por último, quiero que también se muestre un spinner durante el "lazy loading" de un módulo, así que tendré que detectar eso también. 
En particular, cuando se carga el módulo de cursos, que es el único "lazy loading" definido en este proyecto.

```typescript
  ngOnInit() {
    if (this.detectRoutingOngoing) {
      this.router.events.subscribe(event => { 
        if (... || event instanceof RouteConfigLoadStart ) {
          this.loadingService.loadingOn();
        }
        else if (... || event instanceof RouteConfigLoadEnd  ) {
          this.loadingService.loadingOff();
        }
  }); } }
  ```