import { LightningElement, track ,wire} from 'lwc';

import getAccounts from '@salesforce/apex/RecentlyCreatedAccounts.getAccounts';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
//define columns of the datatable

const columns = [
    { label: 'Account Name', fieldName: 'accountNameURL',type:'url',typeAttributes: {label: { fieldName: 'Name' },
    target: '_blank'},sortable: true },
    { label: 'Rating', fieldName: 'Rating', type: 'text' },
    { label: 'Industry', fieldName: 'Industry'},
    { label: 'Created Date', fieldName: 'CreatedDateName',type:'Date'},
       
];

let i=0;

export default class recentlyCreated10Accounts extends LightningElement {
   
    @track items = []; 
    @track data = []; 
    @track columns = columns; 
    @track error;

    @wire(getAccounts)
    wiredAccounts({ error, data }) {
        if (data) {
            console.log(data);
            for(i=0; i<data.length; i++) {
                let row = data[i];
                var d = new Date(row.CreatedDate);
                var date_format_str = d.getFullYear().toString()+"-"+((d.getMonth()+1).toString().length==2?(d.getMonth()+1).toString():"0"
                                    +(d.getMonth()+1).toString())+"-"+(d.getDate().toString().length==2?d.getDate().toString():"0"+d.getDate().toString())
                                    +" "+(d.getHours().toString().length==2?d.getHours().toString():"0"+d.getHours().toString())+":"
                                    +((parseInt(d.getMinutes()/5)*5).toString().length==2?(parseInt(d.getMinutes()/5)*5).toString():"0"+(parseInt(d.getMinutes()/5)*5).toString())+":00";
                                    
                        this.items = [
                        ...this.items,
                            Object.assign({
                                accountNameURL:`/${'lightning/r/'+row.Id +'/view'}`,
                                Rating: row.Rating,
                                Industry: row.Industry,
								CreatedDateName : date_format_str ,
                    },
                    row
                )];
                //console.log('created by is displayed'+ this.items.CreatedBy);
            }
            this.data = this.items;
            this.error = undefined;
            const toastEvent = new ShowToastEvent({
                title : ' Accounts loaded',
                message : ' Account records Fetched From Server',
                variant : 'success',
            });
            this.dispatchEvent(toastEvent);
        } else if (error) {
            this.error = error;
            this.data = undefined;
            const toastEvent = new ShowToastEvent({
                title : 'Account Records:',
                message :' No records to display',
                variant : 'info',
            });
            this.dispatchEvent(toastEvent);
        }
    }
    
}