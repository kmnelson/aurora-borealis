//
// Simple code to scrape the NOAA northern lights prediction
// and send an email when it is above a given thresold
//
// By adding this to a google sheet, you can also log
// the daily numbers for offline analysis
//
// Be sure to modify the email and threshold as you wish
//
// See README.md for more information on setting up the google sheet
//
// Author: Kevin Nelson
// Date: Sept 10, 2021
//


function getIntBetween(input, prefix, postfix) {
    var prefixPos = input.search(prefix);
    var postfixPos = input.search(postfix)
    if (prefixPos == -1 || postfixPos == -1) return 0;
    
    var result = parseInt(input.substr(prefixPos + prefix.length, postfixPos-prefixPos-prefix.length))
    Logger.log("In my func")
    Logger.log(input.substr(prefixPos + prefix.length, postfixPos-prefixPos-prefix.length))
    return result
}

function getIntByLength(input, prefix, digits) {
    return parseInt(input.substr(input.search(prefix) + prefix.length, digits))
}

function aurora() {
    //----------------------------
    // change to your email:
    //----------------------------
    var email = "YOUR-EMAIL@DOMAIN.COM"

    //-----------------------------------
    // change to desired Kp threshold:
    //
    // In Ann Arbor, MI, 7 is reasonable
    //-----------------------------------
    var threshold = 7 
    
    var url = "https://services.swpc.noaa.gov/text/3-day-forecast.txt"
    
    var websiteContent = UrlFetchApp.fetch(url).getContentText();
    var fetchTime = Utilities.formatDate(new Date(), 'Etc/GMT', "yyyy-MM-dd HH:mm:ssZ"); // "yyyy-MM-dd'T'HH:mm:ss'Z'"
    Logger.log('fetch time: ' + fetchTime);
    
    var start = websiteContent.search("The greatest expected")
    var sentence1 = websiteContent.substr(start, 100)
    var KP_forecast = getIntByLength(sentence1, " is ", 1)
    Logger.log(KP_forecast)
    
    var todayPercent = getIntBetween(websiteContent, "S1 or greater", "%")
    var observedKP = getIntByLength(websiteContent, "over the past 24 hours was ", 1)
    Logger.log(observedKP)
    
    if (KP_forecast >= threshold) {
	Logger.log('Significant storm predicted! Kp=' + KP_forecast)
	GmailApp.sendEmail(email, "Northern Lights alert Kp="+KP_forecast, websiteContent)
    }
    else {
	Logger.log('No significant storm predicted.  Kp=' + KP_forecast)
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[0];
    
    sheet.appendRow([fetchTime, KP_forecast, observedKP, todayPercent])
}
