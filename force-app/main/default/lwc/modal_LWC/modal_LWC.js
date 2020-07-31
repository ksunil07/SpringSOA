import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
import fetchWrapperData from '@salesforce/apex/Modal_LWC_controller.fetchWrapperData';

const columns = [
  { label: 'Name', fieldName: 'Name' },
  { label: 'Email', fieldName: 'Email', type: 'email' },
  { label: 'Phone', fieldName: 'Phone', type: 'phone' }
];

export default class Modal_LWC extends LightningElement {
  @track columns = columns;   
  @track accountId; 
  @track contactList;
  @track rowOffset = 0;
  @track error;   
  @track btnLabel = '';   
  @track modalHeader = '';
  @track isContact = false;
  @track modalClass = 'slds-modal ';
  @track modalBackdropClass = 'slds-backdrop ';
  @api recordId;  //Stores recordId
  @api objectApiName;   //Stores the current object API Name

  connectedCallback() {   //doInit() function, Dynamically changing the modal header and button label as per sObject, and also assigning the isContact property as per sObject
    if(this.objectApiName === 'Account'){
      this.isContact = false;
      this.modalHeader = 'Related Contacts';
      this.btnLabel = 'See Related Contacts';
    }else if(this.objectApiName === 'Contact'){
      this.isContact = true;
      this.modalHeader = 'Account Details';
      this.btnLabel = 'See Account Details';
    }
  }

  //Adds the classes that shows the Modal and does server calls to show the required data
  openModal() {
    this.modalClass = 'slds-modal slds-fade-in-open';
    this.modalBackdropClass = 'slds-backdrop slds-backdrop_open';
    fetchWrapperData({sObjectId: this.recordId})
      .then(result => {    //Returns the wrapper 
        if(result.accId != null){
          this.accountId = result.accId;
          this.isContact = true;
        }else{
          this.contactList = result.contactList;
          this.isContact = false;
        }
      })
      .catch(error => {
        const event = new ShowToastEvent({
          title: 'Error Occured',
          message: 'Error: '+error.body.message,
          variant: 'error'
         });
        this.dispatchEvent(event);    //To show an error Taost if error occurred while the APEX call
        });
  }

  //Removes the classes that hides the Modal
  closeModal() {
    this.modalClass = 'slds-modal ';
    this.modalBackdropClass = 'slds-backdrop ';
  }
}