# Mis notas (2) sobre este curso de Angular Router

### Previo en [mis notas (1) sobre este curso de Angular Router](./README_mis_notas_1.md)

En el componente principal de la aplicación `app.component.html` puedo encontrar el `<router-outlet>` principal de mi aplicación. Donde se visualizarán los componentes enrutados en el módulo Router principal: 
```
RouterModule.forRoot(routes)
```

Ahora voy a ver cómo trabajar con rutas hijo (child routes). En las rutas del módulo Router principal veo cómo tengo asociada una ruta (que servirá de base) a un módulo "feature", para que el módulo se cargue lazily.
```
{
    path: "courses", 
    loadChildren: 
        () => import('./courses/courses.module')
            .then(m => m.CoursesModule)
}
```
## Resolver 
Dejo un punto escrito sobre los *Routing Resolvers* porque serán empleados durante el uso de las rutas hijo. 

Para mi uso, un *Resolver* es una propiedad que guarda el Router y a la que puedo acceder. 

Esta propiedad será cargada automáticamente mediante un servicio que extiende el interfaz `Resolve` cuando se active una ruta configurada para ser resuelta.

El servicio que carga el valor en la propiedad es lanzado por el cambio de ruta y hace su proceso para obtener el valor a devolver, p.ej. PODRÍA hacer una llamada REST a mi backend.

## Child routes

Comienzo por modificar las rutas en la configuración de routing del módulo hijo `CoursesModule`.

Así que ahora puedo disponer de unas rutas como: 
* `htpp://localhost:4200/courses/angular-router-course`
* `htpp://localhost:4200/courses/angular-router-course/lessons/17`
```javascript
const routes: Routes = [
  { 
    path: "", component: HomeComponent 
  }, 
  { 
    path: ":courseUrl", component: CourseComponent, 
    children: [
      { path: "", component: LessonsListComponent},
      { path: "lessons/:lessonSeqNo", component: LessonDetailComponent}
    ],
    resolve: { course: CourseResolver } }, 
];
```

La rutas hijo serán visualizadas en un `<router-outlet>` distinto al del módulo principal. 
Es un segundo `<router-outlet>` en mi proyecto que se hallará en el `course.component.html`, 
ya que en las rutas he incluido `children:` en el elemento `CourseComponent`.

```html
<ng-container>
    <div class="course">
        <h2>{{course.description}}</h2>
        <h3 class="discount" *ngIf="couponCode">Use {{couponCode}} for a huge discount!</h3>
        <img class="course-thumbnail" [src]="course.iconUrl" *ngIf="course">

        <router-outlet></router-outlet>

    </div>
</ng-container>
```

Después de configurar las rutas hijo voy a dedicarme al componente LessonsListComponent. 

Veo que su elemento principal es un array de elementos `LessonSummary`.
Reseñaré que dentro de la carpeta del módulo `courses` tengo subcarpetas por cada componente del módulo y además dos subcarpetas llamadas `model` y `services` que me ayudan a ordenar el contenido.
En la carpeta `model` guardo las descripciones de los interfaces que uso en el módulo.

```javascript
export class LessonsListComponent implements OnInit {
    lessons:LessonSummary[];
    constructor(private route:ActivatedRoute) { }
    ngOnInit() { 
        this.lessons = this.route.snapshot.data["lessons"];     
    }
}

export interface LessonSummary {
    id: number;
    description: string;
    duration: string;
    seqNo: number;
    courseId: number;
}
```

Se observa en el método `ngOnInit` que el valor de `this.lessons` se extrae del router. 
Esto me dice que el router obtiene el valor desde el backend mediante el uso de un *Resolver*, que se encarga de poblar la propiedad `lessons`.

Y deberé entonces crear un *Resolver* y conectarlo a mi componente.

Crearé el Resolver `./src/app/courses/services/lesson.resolver.ts` y configuraré el módulo de routing para que la propiedad `lessons` sea cargada por el *Resolver* y esté disponible en emil componente para ser extraida con t`his.route.snapshot.data["lessons"]`.

```typescript
@Injectable()
export class LessonsResolver implements Resolve<LessonSummary[]> {
    constructor(private courses: CoursesService) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<LessonSummary[]> {
        // extrae el valor del parámetro "courseUrl" de la url activa
        // llama al servicio de backend con el parámetro recuperado
        const courseUrl = route.paramMap.get("courseUrl"); 
        return this.courses.loadAllCourseLessonsSummary(courseUrl);
    }
}
```

```javascript
const routes: Routes = [
    . . .  
    { 
        path: ":courseUrl", component: CourseComponent, 
        children: [
            { 
                path: "", 
                component: LessonsListComponent, 
                resolve: { lessons: LessonsResolver } 
            },
            { path: "lessons/:lessonSeqNo", component: LessonDetailComponent}
        ],
        . . .

@NgModule({
    . . .
    providers: [
        ..., LessonsResolver
    ]
})
export class CoursesRoutingModule {}
```

En este punto he conseguido que además de mostrar un detalle de un curso concreto que el usuario haya elegido, se muestre tambíen un listado de las lecciones que componen el curso. 
Este listado se ve en el `<router-outlet>` del componente dedicado al curso, `course.component.html`.

Recordemos que estoy trabajando un escenario de Routing algo más complejo; 
es un *Master-Detail* con navegación *Detail to Detail*. 

Ahora me dedicaré al componente de detalle. 
Cómo hacer que `LessonDetailComponent` esté disponible en la ruta `"lessons/:lessonSeqNo"` tal como ya tengo configurado.

```javascript
    children: [
      { path: "", component: LessonsListComponent},
      { path: "lessons/:lessonSeqNo", component: LessonDetailComponent}
    ],
```    

Ahora mismo, aunque el componente es accesible si introduzco la ruta en la caja del navegador, todavía no hay otros componentes desde los que pueda llegar al `LessonDetailComponent`.

Para poder navegar desde el componente `LessonsListComponent` al `LessonDetailComponent` introduciré la directiva `routerLink`.

```html
<table . . . 

  <tr class="lesson-row" 
      *ngFor="let lesson of lessons"
      [routerLink]="['lessons', lesson.seqNo]">

    <td class="seqno-cell">{{lesson.seqNo}}</td>
    <td class="description-cell">{{lesson.description}}</td>
    <td class="duration-cell">{{lesson.duration}}</td>
  </tr>

</table>
```

Dado que ya tengo como sufijo la URL del componente padre, en `routerLink` usaré una ruta relativa. 
Indico los segementos que voy a añadir: la constante `'lessons'` y el número de la lección es la variable `lesson.seqNo`.

Introducido el enrutamiento al componente, ahora voy a crear la lógica para recuperar la lección seleccionada del curso. 

Necesito crear un *Resolver* para el componente `LessonDetailComponent` que me devuelva un objeto con el detalle de la lección. Entre otras cosas, contendrá el enlace para ver el vídeo de la lección, así que en un futuro querré que esté protegido para los usuarios no premium.

Crearé el resolver `lesson-detail.resolver.ts`. 

👁️👁️ Ojo, que se extraerán dos variables de la URI para ser pasadas al *Resolver* `LessonDetailResolver`, con la particularidad de que una de las variables es del segmento del padre y la otra del hijo, con lo que el método de extracción es ligeramente diferente. 
* `:courseUrl` - pertenece a la ruta padre `route.parent.paramMap.get(..)`
* `:lessonSeqNo` - pertenece a la ruta hijo `route.paramMap.get(...)`
```javascript
const routes: Routes = [
  ... 
  { 
    path: ":courseUrl", component: CourseComponent, 
    children: [
      { 
        path: "", 
        component: LessonsListComponent, 
        resolve: { lessons: LessonsResolver }
      },
      { 
        path: "lessons/:lessonSeqNo", 
        component: LessonDetailComponent, 
        resolve: { lesson: LessonDetailResolver }
      }
    ],
    resolve: { course: CourseResolver } }, 
];
```
Por supuesto, en este módulo de routing se incluye a `LessonDetailResolver` dentro del epígrafe `providers:`.

```typescript
@Injectable()
export class LessonDetailResolver implements Resolve<LessonDetail> {

    constructor(private courses: CoursesService) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<LessonDetail> {
        const courseId = route.parent.paramMap.get("courseUrl"); 
        const lessonId = route.paramMap.get("lessonSeqNo");
        return this.courses.loadLessonDetail(courseId, lessonId);
    }
}
```

Y el componente que necesita el *Resolver*, `LessonDetailComponent` queda de modo que su propiedad `lessonSelected` se obtiene del router extrayendo la propiedad `lesson` cargada por el *Resolver*. 

```typescript
@Component({ . . . })
export class LessonDetailComponent implements OnInit {
  lessonSelected: LessonDetail;

  constructor(private route: ActivatedRoute) {
    console.log("Created LessonDetailComponent...");
  }

  ngOnInit() {
    this.lessonSelected = this.route.snapshot.data["lesson"];
  }
}
```


