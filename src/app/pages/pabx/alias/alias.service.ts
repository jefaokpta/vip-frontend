import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {executeRequest, httpHeaders} from "@/util/utils";
import {Alias} from "@/pages/pabx/types";
import {UserService} from "@/services/user.service";

@Injectable({providedIn: 'root'})
export class AliasService {

    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(
        private readonly http: HttpClient,
        private readonly userService: UserService
    ) {
    }

    findAllAliases(): Promise<Alias[]> {
        const user = this.userService.getUser()
        return executeRequest(this.http.get<Alias[]>(`${this.BACKEND}/aliases/${user.controlNumber}`, httpHeaders()));
    }

    deleteAlias(id: number) {
        return executeRequest(this.http.delete(`${this.BACKEND}/aliases/${id}`, httpHeaders()));
    }
}
