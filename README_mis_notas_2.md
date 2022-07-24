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



