/**
 * Implementation for Risk Management service defined in ./risk-service.cds
 */
module.exports = async (srv) => {
    srv.after('READ', 'Risks', (risks) => {

        risks.forEach((risk) => {
            if (risk.impact >= 100000) {
                risk.criticality = 1;
            } else {
                risk.criticality = 2;
            }
        });
    });
    
     const BupaService = await cds.connect.to('API_BUSINESS_PARTNER');
     srv.on('READ', srv.entities.BusinessPartners, async (req) => {
         return await BupaService.tx(req).run(req.query);
     });

     srv.on('READ', 'Risks', async (req, next) => {
         /*
         Check whether the request want an "expand" of the business partner
         As this is not possible, the risk entity and the business partner entity are in different systems (Cloud Platform and S/4 HANA Cloud),
         if there is such an expand, remove it
         */
         const expandIndex = req.query.SELECT.columns.findIndex(({ expand, ref }) => expand && ref[0] === 'bp');
         console.log(req.query.SELECT.columns)
         if (expandIndex < 0) return next();

         req.query.SELECT.columns.splice(expandIndex, 1);
         if (!req.query.SELECT.columns.find( column => column.ref.find( ref => ref == "bp_BusinessPartner" ))) {
             req.query.SELECT.columns.push({ ref: ["bp_BusinessPartner"] });
         }
        
         /*
         Instead of carrying out the expand, issue a separate request for each business partner
         This code could be optimized, instead of having n requests for n business partners, just on bulk request could be created
         */
         const res = await next();
         await Promise.all( 
             res.map( async risk => {
                 const bp = await BupaService
                     .tx(req)
                     .run(SELECT.one(srv.entities.BusinessPartners).where({ BusinessPartner: risk.bp_BusinessPartner })
                     .columns([ "BusinessPartner", "LastName", "FirstName" ]));
                 risk.bp = bp;
                 console.dir(risk.bp)
             }
         ));
         return res;
     });
}