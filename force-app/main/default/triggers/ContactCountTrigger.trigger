trigger ContactCountTrigger on Contact (After insert, After delete, After undelete) {
    Set<Id> parentIds = new Set<Id>();
    List<Account> accountToUpdate = new List<Account>();
    IF(Trigger.IsAfter){
        IF(Trigger.IsInsert || Trigger.IsUndelete){
            FOR(Contact c : Trigger.new){
                if(c.AccountId!=null){   
                   parentIds.add(c.AccountId); 
                }
            }
        }
        IF(Trigger.IsDelete){
            FOR(Contact c : Trigger.Old){
                if(c.AccountId!=null){   
                   parentIds.add(c.AccountId); 
                }
            }
        }
    }
    List<Account> accountList = new List<Account>([SELECT Id ,Name, Number_of_Contacts__c, 
                                                    (SELECT Id, Name 
                                                    FROM Contacts) 
                                                    FROM Account 
                                                    WHERE Id IN:parentIds]);
    FOR(Account acc : accountList){
        List<Contact> contactList = acc.Contacts;
        acc.Number_of_Contacts__c = contactList.size();
        accountToUpdate.add(acc);
    }
    try{
        update accountToUpdate;
    }catch(System.Exception e){
       System.debug('Exception has occured while updating the accounts'); 
    }
}