public with sharing class Modal_LWC_controller {
    
    @AuraEnabled(cacheable=true)
    public static WrapperClass fetchWrapperData(Id sObjectId){
        WrapperClass wrapperClassVar = new WrapperClass();
        if(sObjectId.getSobjectType() == Schema.Account.SObjectType){
            wrapperClassVar.contactList = Modal_LWC_controller.getRelatedContacts(sObjectId);
        }else if(sObjectId.getSobjectType() == Schema.Contact.SObjectType){
            wrapperClassVar.accId = Modal_LWC_controller.getAccId(sObjectId);
        }
        System.debug('wrapperClassVar-->>'+wrapperClassVar);
        return wrapperClassVar;
    }
    
    public static List<Contact> getRelatedContacts(String accId){
        return [SELECT Id, Name, Phone, Email FROM Contact WHERE AccountId =:accId];
    }
        
    public static String getAccId(String contactId) {
        return [SELECT Id, AccountId FROM Contact WHERE Id=:contactId].AccountId; 
    }
    
    public class WrapperClass {
        @AuraEnabled
        public List<Contact> contactList {get; set;}
        @AuraEnabled
        public Id accId{get; set;}
        
        public wrapperClass() {
            this.contactList = new List<Contact>();
        }
    }
}