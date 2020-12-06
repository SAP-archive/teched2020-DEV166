namespace sap.ui.riskmanagement;
using { managed } from '@sap/cds/common';

  entity Risks : managed {
    key ID      : UUID  @(Core.Computed : true);
    title       : String(100);
    owner       : String;
    prio        : String(5);
    descr       : String;
    miti        : Association to Mitigations;
    impact      : Integer;
    bp          : Association to BusinessPartners;
    criticality : Integer;
  }

  entity Mitigations : managed {
    key ID       : UUID  @(Core.Computed : true);
    description  : String;
    owner        : String;
    timeline     : String;
    risks        : Association to many Risks on risks.miti = $self;
  }

// using an external service from S/4
  using {  API_BUSINESS_PARTNER as external } from '../srv/external/API_BUSINESS_PARTNER.csn';

  entity BusinessPartnerssS4 as projection on external.A_BusinessPartner {
     key BusinessPartner,
     LastName,
     FirstName
   }

// using a local service instead of the S/4 one with the same type of entity
   entity BusinessPartners  {
    key BusinessPartner:    String(10);
    LastName:               String(40);
    FirstName:              String(40);
  }