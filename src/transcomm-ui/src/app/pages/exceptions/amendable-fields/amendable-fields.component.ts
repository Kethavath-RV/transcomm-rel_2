import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InvoicesView, OrderView } from 'core/viewModels';
import {
  GoodsCondition,
  IncoTermCode,
  UnitOfMeasurement,
} from 'core/valueEnums';
import { Amendment } from 'core/amendments';
import { Routerlinks } from 'src/app/auth/router-links';

import { ExceptionsService } from '../../../services/orderEndpoints/exceptions.service';
import { columns } from './order-line.columns';
@Component({
  selector: 'app-amendable-fields',
  templateUrl: './amendable-fields.component.html',
  styleUrls: ['./amendable-fields.component.css'],
})
export class AmendableFieldsComponent implements OnInit {
  @Input() orderDetails: OrderView;
  @Input() set disabled(isDisabled: boolean) {
    if (this._disabled !== void 0) {
      if (isDisabled) {
        this.amendmentForm.disable();
      } else {
        this.amendmentForm.enable();
      }
    }
    this._disabled = isDisabled;
  }
  get disabled(): boolean {
    return this._disabled;
  }

  get orderLines(): FormArray {
    return this.amendmentForm.get('orderLines') as FormArray;
  }

  invoice: InvoicesView;
  quantities = Object.values(UnitOfMeasurement);
  goodsConditionOptions = Object.values(GoodsCondition);
  incoTermCodes = Object.values(IncoTermCode);
  rejectedDeclarations = [];
  orderLineColumns = columns;
  amendmentForm!: FormGroup;
  initialAmendment: Amendment;

  isLoading = true;
  private _disabled!: boolean;

  constructor(
    private exceptionsService: ExceptionsService,
    private router: Router,
    private readonly fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setRejectedDeclarations();
    this.isLoading = false;
  }

  /**
   * Grabs the fields from the form (they match payload fields) and builds reqBody of order details and lines (only affected fields) that the user changed
   */
  onSubmit(): void {
    const reqBody = {
      ecomBusinessCode: this.invoice.ecomBusinessCode,
      orderNumber: this.invoice.orderNumber,
      invoiceNumber: this.invoice.invoiceNumber,
      orderLines: [],
    };

    const invoiceParams = Object.keys(this.amendmentForm.controls).filter(
      (el) => el !== 'orderLines',
    );
    invoiceParams.forEach((key) => {
      const currControl = this.amendmentForm.controls[key];
      if (
        currControl.dirty &&
        currControl.value !== this.initialAmendment[key]
      ) {
        reqBody[key] = currControl.value;
      }
    });
    const orderLineParams = Object.keys(
      this.orderLines.controls[0].value,
    ).filter((el) => el !== 'lineNo');

    this.orderLines.controls.forEach((el, ind, _arr) => {
      const currOrderLine = { lineNo: el.value.lineNumber };
      orderLineParams.forEach((key) => {
        const currControl = el.get(key);
        if (
          currControl.dirty &&
          currControl.value !== this.initialAmendment.orderLines[ind][key]
        ) {
          currOrderLine[key] = currControl.value;
        }
      });

      if (Object.keys(currOrderLine).length > 1) {
        reqBody.orderLines.push(currOrderLine);
      }
    });

    this.exceptionsService.amendOrder(reqBody).subscribe((order) => {
      this.router.navigate([Routerlinks.exceptions]);
      this.orderDetails = order;
    });
  }

  onCancel(): void {
    this.initForm();
  }
  /**
   * Initialises Amendment FormGroup including variable length FormArray with the initial values set from the response
   * Disables the entire form if parent sets `disabled`
   */
  private initForm(): void {
    this.invoice = this.orderDetails.invoices[0];

    this.amendmentForm = this.fb.group({
      incoTermCode: this.invoice.incoTerm,
      numOfInvoicePages: this.invoice.totalNoOfInvoicePages,
      date: this.invoice.invoiceDate.toString().slice(0, 10),
      orderLines: this.fb.array([]),
    });

    this.orderDetails.invoices[0].orderLine.forEach((line) => {
      const newLine = this.fb.group({
        lineNumber: [line.lineNumber],
        commodityCode: [
          line.hsCode,
          [Validators.required, Validators.pattern('^[0-9]*$')],
        ],
        description: [line.description, Validators.required],
        goodsCondition: [line.goodsCondition, Validators.required],
        quantity: [line.quantity, Validators.required],
        quantityUnit: [line.quantityUOM, Validators.required],
        weight: [line.netWeight, Validators.required],
        weightUnit: [line.netWeightUOM, Validators.required],
        total: [line.total, Validators.required],
        supplQuantity: [line.supplementaryQuantity, Validators.required],
        supplQuantityUnit: [line.supplementaryQuantityUOM, Validators.required],
      });
      this.orderLines.push(newLine);
    });

    this.initialAmendment = this.amendmentForm.value as Amendment;

    if (this.disabled) {
      this.amendmentForm.disable();
    } else {
      this.amendmentForm.enable();
    }
  }
  private setRejectedDeclarations(): void {
    this.orderDetails?.declarations?.forEach((declaration) => {
      if (declaration.clearanceStatus === 'Rejected') {
        this.rejectedDeclarations.push(declaration);
      }
    });
  }
}
