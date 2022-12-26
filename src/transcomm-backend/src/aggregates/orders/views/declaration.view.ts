import { Prisma } from "@prisma/client";
import { Claim, ClaimRequest, DocumentTrackingError, Order, PartyReceiver, PartySender, PartyType } from "core";

export class DeclarationView {

  HydrateDeclarations(
    order: Order
  ): Prisma.DeclarationCreateWithoutOrderInput[] {
    let allDeclarations: Prisma.DeclarationCreateWithoutOrderInput[] = [];
    for (const invoice of order.invoices) {
      if (invoice.declarations) {
        const declarationViews = invoice.declarations.map((x) => {
          const { exporterCode, brokerCode, hlKey, claimRequest, claim, ...rest } = x;
          const errors = this.HydrateDeclarationErrors(x.errors);
          return {
            ...rest,
            hyperledgerKey: hlKey,
            errors: { createMany: { data: errors } },
            claim: claim ? { create: this.HydrateClaim(claim, claimRequest) } : undefined,
            invoiceNumber: invoice.invoiceNumber,
            recipientIdentification: brokerCode,
            exportCodeMirsalTwo: exporterCode
          }
        });
        allDeclarations = allDeclarations.concat(declarationViews);
      }
    }
    return allDeclarations
  }

  private HydrateDeclarationErrors(errors: string): Prisma.DeclarationErrorCreateManyDeclarationInput[] {
    if (!errors || errors === "")
      return []

    let dataErrors: DocumentTrackingError[] = JSON.parse(errors);
    if (!Array.isArray(dataErrors))
      dataErrors = JSON.parse(dataErrors);

    return dataErrors.map(x => ({
      errorCode: x.errorCode,
      errorDescription: x.errorDescription,
      errorType: x.errorType,
      level: x.level
    }));
  }

  private HydrateClaim(claim: Claim, claimRequest?: ClaimRequest): Prisma.ClaimCreateWithoutDeclarationInput {
    const parties = claimRequest ? this.HydrateClaimParty(claimRequest.sender, claimRequest.receiver) : [];
    return {
      accountNumber: claimRequest?.accountNumber ?? '',
      transportDocumentNumber: claim.transportDocumentNumber,
      declarationNumber: claim.declarationNumber ?? '',
      claimNumber: claim.nrClaimNumber,
      claimStatus: claim.claimStatus,
      claimType: claim.claimType,
      currentStage: claim.currentStage,
      orderNumber: claim.orderNumber,
      requestDate: claim.requestDate ? new Date(claim.requestDate) : new Date().toISOString(),
      party: { createMany: { data: parties } }
    }
  }

  private HydrateClaimParty(sender: PartySender, receiver: PartyReceiver): Prisma.PartyCreateWithoutClaimInput[] {
    const parties: Prisma.PartyCreateWithoutClaimInput[] = [];
    //sender 
    parties.push({
      authorizationId: sender.AuthorizationID,
      componentId: sender.ComponentID,
      confirmationCode: sender.ConfirmationCode,
      logicalId: sender.LogicalID,
      referenceId: sender.ReferenceID,
      taskId: sender.TaskID,
      type: PartyType.sender,
    });

    //reciever
    parties.push({
      authorizationId: receiver.AuthorizationID,
      componentId: receiver.ComponentID,
      confirmationCode: receiver.ConfirmationCode,
      logicalId: receiver.LogicalID,
      referenceId: receiver.ReferenceID,
      taskId: receiver.TaskID,
      type: PartyType.receiver,
    });

    return parties;
  }
}
