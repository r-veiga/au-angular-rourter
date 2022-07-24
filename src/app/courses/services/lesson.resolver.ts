import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { LessonSummary } from "../model/lesson-summary";
import { CoursesService } from "./courses.service";

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