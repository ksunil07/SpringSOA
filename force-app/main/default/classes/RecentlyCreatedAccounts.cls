public with sharing class RecentlyCreatedAccounts {

    @AuraEnabled(cacheable = true)
    public static List<Account> getAccounts(){
        List<Account> accList =[SELECT ID,Name,Rating,Industry,CreatedById,CreatedBy.Name,CreatedDate
                                FROM Account
                                Order by createdDate desc
                                LIMIT 10];
        System.debug('This is account list' + accList)   ;                     
        return accList;
    }
}
//Cotroller will send data to LWC.
