import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {LessonDetail} from "../model/lesson-detail";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

@Component({
  selector: 'lesson',
  templateUrl: './lesson-detail.component.html',
  styleUrls: ['./lesson-detail.component.css']
})
export class LessonDetailComponent implements OnInit {

  lesson$: Observable<LessonDetail>;

  constructor(private route: ActivatedRoute, private router: Router) {
    console.log("Created LessonDetailComponent...");
  }

  ngOnInit() {
    this.lesson$ = this.route.data.pipe(map(data => data["lesson"]));
  }

  previous(lesson: LessonDetail) {
    // Si estoy en http://localhost:4200/courses/angular-router-course/lessons/3
    //  · accedo a la ruta padre
    //    (http://localhost:4200/courses/angular-router-course)
    //  · le añado 'lessons' y el nuevo número de lección calculado (-1)
    console.log('>>> Previous :: ', this.route.parent.snapshot.url.toString(), lesson)
    const prevLesson = lesson.seqNo - 1;
    this.router.navigate(['lessons', prevLesson], { relativeTo: this.route.parent });
  }
  
  next(lesson: LessonDetail) {
    // Si estoy en http://localhost:4200/courses/angular-router-course/lessons/3
    //  · accedo a la ruta padre
    //    (http://localhost:4200/courses/angular-router-course)
    //  · le añado 'lessons' y el nuevo número de lección calculado (+1)
    console.log('>>> Next :: ', this.route.parent.snapshot.url.toString(), lesson)
    const nextLesson = lesson.seqNo + 1;
    this.router.navigate(['lessons', nextLesson], { relativeTo: this.route.parent });
  }
}
