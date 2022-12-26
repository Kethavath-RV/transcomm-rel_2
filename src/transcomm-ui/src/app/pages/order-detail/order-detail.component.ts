import { Component, HostBinding, OnInit } from '@angular/core';
import { SafeStyle } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ChainEventView, OrderView } from 'core/viewModels';
import { OverviewService } from '../../services/orderEndpoints/overview.service';
@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css'],
})
export class OrderDetailComponent implements OnInit {
  orderID: string;
  invoiceID: string;
  ecomCode: string;
  isDataAvailable = false;
  eventChain: ChainEventView[];
  orderDetails: OrderView;
  errorsInSidebar: ChainEventView[];

  @HostBinding('style') style: SafeStyle;

  constructor(
    private route: ActivatedRoute,
    private overviewService: OverviewService,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.ecomCode = params.ecomCode;
      this.orderID = params.orderId;
      this.invoiceID = params.invoiceId;
      this.getDetails();
    });
  }

  private getDetails(): void {
    this.overviewService
      .getDetails(`${this.ecomCode}/${this.orderID}/${this.invoiceID}`)
      .subscribe((order) => {
        this.orderDetails = order;
        this.isDataAvailable = true;
        this.eventChain = order.eventChain;
      });
  }

  onShowErrorBundleEvent(event: ChainEventView[]): void {
    this.errorsInSidebar = event;
    this.style = mainWidthFormatter(75);
  }

  onCloseExceptionSidebar(): void {
    this.errorsInSidebar = null;
    this.style = mainWidthFormatter(100);
  }
}

function mainWidthFormatter(percentage: number): string {
  return `--main-width: ${percentage}%`;
}
