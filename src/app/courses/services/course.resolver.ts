import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { Course } from "../model/course";
import { CoursesService } from "./courses.service";

@Injectable()
export class CourseResolver implements Resolve<Course> {

    constructor(private courses: CoursesService) {

    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Course> {

        // from the route ***localhost:4200/courses/angular-router-course*** 
        // I want the final slice, the parameter

        const courseUrl = route.paramMap.get("courseUrl");

        return this.courses.loadCourseByUrl(courseUrl);

        // Como para el Resolver necesito que la emisión se complete, puedo protegerme así: 
        // return this.courses.loadCourseByUrl(courseUrl).pipe(first());
    }
}