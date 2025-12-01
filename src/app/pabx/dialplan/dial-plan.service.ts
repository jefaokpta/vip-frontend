import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {executeRequest, httpHeaders} from "@/util/utils";
import {DialPlan} from "@/pabx/types";
import {UserService} from "@/pages/users/user.service";

@Injectable({providedIn: 'root'})
export class DialPlanService {

    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(
        private readonly http: HttpClient,
        private readonly userService: UserService
    ) {
    }

    findAll(): Promise<DialPlan[]> {
        const user = this.userService.getUser()
        return executeRequest(this.http.get<DialPlan[]>(`${this.BACKEND}/dialplans/${user.controlNumber}`, httpHeaders()));
    }

    delete(id: number) {
        const user = this.userService.getUser()
        return executeRequest(this.http.delete(`${this.BACKEND}/dialplans/${user.controlNumber}/${id}`, httpHeaders()));
    }

    create(dialplan: DialPlan) {
        const user = this.userService.getUser()
        return executeRequest(this.http.post(`${this.BACKEND}/dialplans/${user.controlNumber}`, dialplan, httpHeaders()));
    }

    findById(id: number) {
        const user = this.userService.getUser()
        return executeRequest(this.http.get<DialPlan>(`${this.BACKEND}/dialplans/${user.controlNumber}/${id}`, httpHeaders()));
    }

    update(dialplan: DialPlan) {
        const user = this.userService.getUser()
        return executeRequest(this.http.put(`${this.BACKEND}/dialplans/${user.controlNumber}/${dialplan.id}`, dialplan, httpHeaders()));
    }
}
