import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { UserResponse, UserRole } from "core";
import { GlobalAgGridModule } from "../../components/aggrid/ag-grid.module";
import { DirectivesModule } from "../../helpers/directives/directives.module";

import { UserManagementComponent } from "./user-management.component";

export type InputTypes =
  | string
  | { modalType: string; userRole: UserRole; editUser: UserResponse };
export type OutputTypes = string | 'delete' | 'refresh' | 'none';


@NgModule({
    declarations: [
        UserManagementComponent,
    ],
    imports: [
        GlobalAgGridModule,
        DirectivesModule,
        RouterModule.forChild([
            {
                path: '',
                component: UserManagementComponent
            }
        ])
    ]
  })
  export class UserManagementModule {}
  