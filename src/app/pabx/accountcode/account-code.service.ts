import {Injectable} from "@angular/core";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {UserService} from "@/pages/users/user.service";
import {AccountCode} from "@/pabx/types";
import {executeRequest, httpHeaders} from "@/util/utils";

@Injectable({
    providedIn: 'root'
})
export class AccountCodeService {

    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(
        private readonly http: HttpClient,
        private readonly userService: UserService
    ) {
    }

    findAll(): Promise<AccountCode[]> {
        const user = this.userService.getUser()
        return executeRequest(this.http.get<AccountCode[]>(`${this.BACKEND}/accounts/${user.controlNumber}`, httpHeaders()));
    }

    delete(id: number): Promise<void> {
        const user = this.userService.getUser()
        return executeRequest(this.http.delete<void>(`${this.BACKEND}/accounts/${user.controlNumber}/${id}`, httpHeaders()));
    }

}
