
/* eslint-disable @lwc/lwc/no-async-operation */
/* eslint-disable no-console */
import { LightningElement, wire ,track,api } from 'lwc';
import saveAccountsLwc from '@salesforce/apex/dynamicRowsController.saveAccountsLwc';
import getAccounts from '@salesforce/apex/dynamicRowsController.getAccounts';
import deleteAccounts from '@salesforce/apex/dynamicRowsController.deleteAccounts';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';

export default class LwcListEditable extends LightningElement {
    
    @track isEdited = false;
    @track toggleSaveLabel = 'Save';
    @track mainRecord;
    @api objName = 'Account';
    @track recordTypeOptions;
    @track createRecordOpen;
    @track recordTypeSelector;
    @track recordTypeId;
    @track myPadding = 'slds-modal__content';
    @track myList = [{Name : "Kishore", JobType__c : "Birlasoft", key : Math.random().toString(36).substring(2, 15)},
                     {Name : "Suresh", JobType__c : "TCS",  key : Math.random().toString(36).substring(2, 15)}];

    /*--------------------Mapping field values to the list onchange START --------------------*/  
    @wire(getObjectInfo, { objectApiName: 'Account' })
    wiredObjectInfo({ error, data }) {
        if (data) {
            this.record = data;
            this.error = undefined;

            let recordTypeInfos = Object.entries(this.record.recordTypeInfos);
            console.log("ObjectInfo length", recordTypeInfos.length);
            if (recordTypeInfos.length > 1) {
                let temp = [];
                recordTypeInfos.forEach(([key, value]) => {
                    console.log(key);
                    if (value.available === true && value.master !== true) {
                        console.log("Inside ifff",JSON.stringify(key,value));
                        
                        temp.push({"label" : value.name, "value" : value.recordTypeId});
                    }
                });
                this.recordTypeOptions = temp;
                console.log("recordTypeOptions", this.recordTypeOptions);
            } else {
                this.recordTypeId = this.record.defaultRecordTypeId;
            }

            console.log("this.recordTypeOptions", JSON.stringify(this.recordTypeOptions));
        } else if (error) {
            this.error = error;
            this.record = undefined;
            console.log("this.error", this.error);
        }
    }
    renderedCallback() {
        if(this.objName) {
            let temp = this.objName;
            if(temp.includes('__c')){
                let newObjName = temp.replace(/__c/g,"");
                if(newObjName.includes('_')) {
                    let vNewObjName = newObjName.replace(/_/g," ");
                    this.objLabelName = vNewObjName;
                }else {
                    this.objLabelName = newObjName;
                }
                
            }else {
                this.objLabelName = this.objName;
            }
        }

        console.log("In rendered", this.objName);
    }
    createRecordFunc() {
        if (this.recordTypeOptions) {
            this.recordTypeSelector = true;
        }else {
            this.recordTypeSelector = false;
            this.mainRecord = true;
            //stencil before getting data
            this.stencilClass = '';
            this.stencilReplacement = 'slds-hide';
        }
        this.createRecordOpen = true;
    }  
    closeModal() {
        this.stencilClass = '';
        this.stencilReplacement = 'slds-hide';
        this.createRecordOpen = false;
        this.recordTypeSelector = false;
        this.mainRecord = false;
    }   
    createRecordMain() {
        this.recordTypeSelector = false;
        this.mainRecord = true;
        //stencil before getting data
        this.stencilClass = '';
        this.stencilReplacement = 'slds-hide';
    }    
    handleLoad(event) {
        let details = event.detail;

        if(details) {
            setTimeout(() => {
                this.stencilClass = 'slds-hide';
                this.stencilReplacement = '';
                this.myPadding = 'slds-p-around_medium slds-modal__content';
            }, 1000);
        }

    }  
    handleError() {

        this.dispatchEvent(
            new ShowToastEvent({
                title : 'Error',
                message : 'Error saving the record',
                variant : 'error',
            }),
        )
    }   
    handleSuccess(event) {
 
        this.createRecordOpen = false;
        this.mainRecord = false;
        this.stencilClass = '';
        this.stencilReplacement = 'slds-hide';

        let selectedId = event.detail.id;
        let key = this.uniqueKey;
        const valueSelectedEvent = new CustomEvent('valueselect', {
            detail: { selectedId, key },
        });
        this.dispatchEvent(valueSelectedEvent);

        this.dispatchEvent(
            new ShowToastEvent({
                title : 'Success',
                message : `Record saved successfully with id: ${event.detail.id}`,
                variant : 'success',
            }),
        )
    }
    handleNameChange(event) {
        let element = this.myList.find(ele  => ele.Id === event.target.dataset.id);
        element.Name = event.target.value;
        this.myList = [...this.myList];
        console.log(JSON.stringify(this.myList));
    }

    handlePicklistChange(event) {
        let eventData = event.detail;
        let pickValue = event.detail.selectedValue;
        let uniqueKey = event.detail.key;

        let element = this.myList.find(ele  => ele.Id === uniqueKey);
        element.Controlling_Picklist__c = pickValue;
        this.myList = [...this.myList];
    }

    handleDependentPicklistChange(event) {
        let eventData = event.detail;
        let pickValue = event.detail.selectedValue;
        let uniqueKey = event.detail.key;

        let element = this.myList.find(ele  => ele.Id === uniqueKey);
        element.Dependent_Picklist__c = pickValue;
        this.myList = [...this.myList];
    }

    handleSelection(event) {
        let eventData = event.detail;
        let id = event.detail.selectedId;
        let uniqueKey = event.detail.key;
       
        let element = this.myList.find(ele  => ele.Id === uniqueKey);
        element.JobType__c = id;
        this.myList = [...this.myList];
    }
    /*--------------------Mapping field values to the list onchange END --------------------*/    

    add() {
        let newList = this.myList;
        newList.push({Name : "", JobType__c : "",  key : Math.random().toString(36).substring(2, 15)});
        this.myList = newList;
    }

    remove(event) { 
        let indexPosition = event.currentTarget.name;
        const recId = event.currentTarget.dataset.id;
                
        deleteAccounts({toDeleteId : recId})
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title : 'Success',
                    message : `Record deleted succesfully!`,
                    variant : 'success',
                }),
            )
            if(this.myList.length > 1) 
            this.myList.splice(indexPosition, 1);
            this.error = undefined;
        })
        .catch(error => {
            this.error = error;
        })
    }

    handleSave() {
        this.toggleSaveLabel = 'Saving...'
        let toSaveList = this.myList;
        toSaveList.forEach((element, index) => {
            if(element.Name === ''){
                toSaveList.splice(index, 1);
            }
        });

        this.myList = toSaveList;
        saveAccountsLwc({records : toSaveList})
        .then(() => {
            this.toggleSaveLabel = 'Saved';
            
            this.dispatchEvent(
                new ShowToastEvent({
                    title : 'Success',
                    message : `Records saved succesfully!`,
                    variant : 'success',
                }),
            )
            this.getAccountRecords();
            this.isEdited = false;
            this.error = undefined;
        })
        .catch(error => {
            this.error = error;
            this.record = undefined;
            console.log("Error in Save call back:", this.error);
        })
        .finally(() => {
            setTimeout(() => {
                this.toggleSaveLabel = 'Save';
            }, 3000);
        });
    }

    connectedCallback() {
        this.getAccountRecords();
    }

    getAccountRecords() {
        getAccounts()
            .then(result => {
                this.record = result;
                for(let i = 0; i < this.record.length; i++) {
                    if(this.record[i].JobType__c) {
                        this.record[i].JobTypeName = this.record[i].JobType__r.Name;
                        this.record[i].JobTypeUrl = `/${this.record[i].JobType__r.Id}`;
                    }
                    if(this.record[i].Id)
                    this.record[i].recordUrl = `/${this.record[i].Id}`;
                }
                this.myList = this.record;
                this.error = undefined;
            })
            .catch(error => {
                this.error = error;
                this.record = undefined;
            });
    }

    onDoubleClickEdit() {
        this.isEdited = true;
    }

    handleCancel() {
        this.isEdited = false;
    }
}