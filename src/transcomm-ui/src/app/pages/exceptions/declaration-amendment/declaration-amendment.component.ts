import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { finalize, first, map, take } from 'rxjs/operators';

import { InvoicesView, OrderView, UserResponse } from 'core/viewModels';
import { Routerlinks } from 'src/app/auth/router-links';
import { SessionStorageService } from 'src/app/auth/services/session/session-storage.service';
import { ModalService } from 'src/app/services/modal.service';
import { ExceptionsService } from '../../../services/orderEndpoints/exceptions.service';
import { LockedWarningModalComponent } from '../locked-warning-modal/locked-warning-modal.component';

@Component({
  selector: 'app-declaration-amendment',
  templateUrl: './declaration-amendment.component.html',
})
export class DeclarationAmendmentComponent implements OnInit {
  set orderDetails(details: OrderView) {
    this.invoice = details.invoices[0];
    this._orderDetails = details;
  }
  get orderDetails(): OrderView {
    return this._orderDetails;
  }

  invoice: InvoicesView;
  userProfile: UserResponse;
  orderID: string;
  ecomCode: string;
  invoiceID: string;
  isLoading = true;
  isLockDisabled = true;
  fieldsAreDisabled = true;

  private _orderDetails!: OrderView;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private exceptionsService: ExceptionsService,
    private readonly session: SessionStorageService,
    private readonly modalService: ModalService<
      LockedWarningModalComponent,
      void,
      boolean
    >,
  ) {}

  ngOnInit(): void {
    this.userProfile = this.session.getUserProfile();
    this.route.params.subscribe((params) => {
      this.ecomCode = params['ecomCode'];
      this.orderID = params['orderId'];
      this.invoiceID = params['invoiceId'];
      this.initialize();
    });
  }

  setPageToReadOrWrite(): void {
    if (this.editorCanEdit() || this.lockedAndUserIsAdmin()) {
      this.isLockDisabled = false;
    } else {
      this.isLockDisabled = true;
    }

    this.setFieldsStatus();
  }

  setFieldsStatus(): void {
    this.fieldsAreDisabled =
      this.invoice.lockedBy !== this.userProfile.email ||
      this.userProfile.role !== 'editor';
  }

  editorCanEdit(): boolean {
    return this.userIsEditor() && this.unlockedOrLockedByCurrentUser();
  }

  userIsEditor(): boolean {
    return this.userProfile.role === 'editor';
  }

  unlockedOrLockedByCurrentUser(): boolean {
    return (
      !this.invoice.locked || this.invoice.lockedBy === this.userProfile.email
    );
  }

  lockedAndUserIsAdmin(): boolean {
    return this.userProfile.role === 'admin' && this.invoice.locked;
  }

  shouldModalShow(): void {
    if (this.userProfile.role === 'editor' && !this.invoice.locked) {
      this.openModal();
    } else {
      this.setPageToReadOrWrite();
    }
  }

  openModal(): void {
    this.modalService.open(LockedWarningModalComponent);

    this.modalService.modalOutputdata
      .pipe(first())
      .subscribe((isLocking: boolean) => {
        if (isLocking) {
          this.onLock(true);
        } else {
          this.setPageToReadOrWrite();
        }
      });
  }
  onLock(isLocking: boolean): void {
    this.exceptionsService
      .changeOrderLock(isLocking, {
        ecomBusinessCode: this.orderDetails.ecomBusinessCode,
        orderNumber: this.orderDetails.orderNumber,
        invoiceNumber: this.invoice.invoiceNumber,
      })
      .pipe(first())
      .subscribe(() => {
        this.invoice.locked = isLocking;
        this.invoice.lockedBy = isLocking ? this.userProfile.email : '';
        this.setPageToReadOrWrite();
        this.shouldModalShow();
      });
  }

  private initialize(): void {
    const numOfRecords$ = this.exceptionsService
      .getData(
        {
          invoiceNumber: { equals: this.invoiceID },
          ecomCode: { equals: this.ecomCode },
          orderNumber: { equals: this.orderID },
        },
        [],
        1,
      )
      .pipe(
        map((data) => data.numberOfRecords),
        take(1),
      );
    const order$ = this.exceptionsService
      .getDetails(`${this.ecomCode}/${this.orderID}/${this.invoiceID}`)
      .pipe(first());

    forkJoin([numOfRecords$, order$])
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe(([numOfRecords, order]) => {
        if (numOfRecords !== 1) {
          this.router.navigate([Routerlinks.exceptions]);
        } else {
          this.orderDetails = order;
        }
        this.shouldModalShow();
      });
  }
}
