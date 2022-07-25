import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { first } from 'rxjs/operators';
import { LessonDetail } from "../model/lesson-detail";
import { CoursesService } from "./courses.service";


@Injectable()
export class LessonDetailResolver implements Resolve<LessonDetail> {

    constructor(private courses: CoursesService) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<LessonDetail> {
        const courseId = route.parent.paramMap.get("courseUrl"); 
        const lessonId = route.paramMap.get("lessonSeqNo");
        console.log(courseId, lessonId);
        const lessonDetail$: Observable<LessonDetail> = this.courses.loadLessonDetail(courseId, lessonId)
        return lessonDetail$;
    }
}