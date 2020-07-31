public class HttpCalloutClass {
    //This is the class.
    public static void makingACallout() {
        String url = 'https://postman-echo.com/get?foo1=bar1&foo2=bar2';
        Http handler = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('callout:SpringSOA/'+url);
        request.setMethod('GET');
        String username = 'SpringSOA';
        String password = 'GoodJob';
        Blob headerValue = Blob.valueOf(username + ':' + password);
        String authorizationHeader = 'BASIC '+ EncodingUtil.base64Encode(headerValue);
        request.setHeader('Authorization', authorizationHeader);
        HttpResponse response = handler.send(request);
        System.debug('Response is :' + response.getBody());    
    }
}