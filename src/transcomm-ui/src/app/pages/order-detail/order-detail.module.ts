import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LoaderModule } from '../../components/loader/loader.module';
import { OrderDetailTabsModule } from '../../components/navtabs/navtabs.module';
import { OverviewService } from '../../services/orderEndpoints/overview.service';
import { AddressCardsComponent } from './address-cards/address-cards.component';
import { EventChainComponent } from './event-chain/event-chain.component';
import { ExceptionSidebarComponent } from './exception-sidebar/exception-sidebar.component';
import { OrderDetailComponent } from './order-detail.component';

@NgModule({
  declarations: [
    EventChainComponent,
    OrderDetailComponent,
    AddressCardsComponent,
    ExceptionSidebarComponent,
  ],
  imports: [CommonModule, LoaderModule, OrderDetailTabsModule],
  providers: [OverviewService],
})
export class OrderDetailModule {}
