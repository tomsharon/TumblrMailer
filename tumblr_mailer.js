var fs = require("fs"); // fs module provides us functionality so we can read files from our computer
var ejs = require("ejs");
var tumblr = require("tumblr.js")
var mandrill = require('mandrill-api/mandrill');


var mandrill_client = new mandrill.Mandrill('gtcMkrKvFPBZT3vtD8AAhQ');


var csvFile = fs.readFileSync("friend_list.csv", "utf8"); // When fs.readFileSync("friend_list.csv", "utf8") is called, we pass the friend_list.csv file to the fs.readFileSync function. A string of text with the content from friend_list.csv is returned and stored in the variable csvFile.


function csvParse(file) {
	 var arrayFile = file.split("\n")  //arrayFile = ["first,last,lastContact,email", "Scott,Dallas,0,scott@fullstack.com", "Tom,Sharon,1,ts@wes.com", ""]
	 arrayFile.splice(3, 1); // removes the last element, which was an empty string, from arrayFile. Can't prevent csvFile from including an empty line as the last row. So must slice it out here. 
	 for(var i = 0; i < arrayFile.length; i++) {
	 	arrayFile[i] = arrayFile[i].split(",") //arrayFile = [ ["first","last","lastContact","email"], ["Scott","Dallas","0","scott@fullstack.com"], ["Tom","Sharon","1","ts@wes.com"] ]
	 }  
	var titles = arrayFile.shift();  //titles = ["first","last","lastContact","email"] &&& arrayFile = [ ["Scott","Dallas","0","scott@fullstack.com"], ["Tom","Sharon","1","ts@wes.com"] ]
	var convertedFile = arrayFile.map(function(arrayFileElement) {
		var newObj = {}; // create a newObj for every arrayFileElement
		titles.forEach(function(title, index){
			newObj[title] = arrayFileElement[index];
		})
		return newObj; // return newObj into convertedFile.
	})
	return convertedFile;
}



var emailTemplate = fs.readFileSync("email_template.html", "utf8")

var parsedContacts = csvParse(csvFile) //Array of objects, with each contact being one object.


//Original template system, which uses replace:
function templateSystem(contacts) {
	for(var i = 0; i < contacts.length; i++) {
		console.log(emailTemplate.replace("FIRST_NAME", contacts[i].firstName).replace("NUM_MONTHS_SINCE_CONTACT", contacts[i].numMonthsSinceContact));
	}
}

// templateSystem(parsedContacts);








// parsedContacts.forEach(function(contact){
// 		firstName = contact['firstName'],
// 		numMonthsSinceContact = contact['numMonthsSinceContact']
// 		//^^get values for contact

// 		var customizedTemplate = ejs.render(emailTemplate, { 
// 		firstName: firstName,  
//     	numMonthsSinceContact: numMonthsSinceContact,
//     	// latestPosts: 
//     	//^^populate email for contact
//   	});

// 		console.log(customizedTemplate);

// 		//sendEmail
// 	})

// ^^Console logging tmplate w/ EJS rather then Replace



// console.log(customizedTemplate);









var client = tumblr.createClient({
  	consumer_key: 'TxglX9e0Y5NO2PTSELgyeTfPBUYbuwSVCVBdNEN1MbxHkiPgtQ',
  	consumer_secret: 'VErJ2zNhYD6kov230vGUfGFwv8DBXBPCCHgesmRNx0zM94EKj2',
  	token: 'dgwMUqBpGtp7y44jmBQfVgnQsyYu3CUHxAdfn4GNsGxzFN7c58',
  	token_secret: 'YuvInwJuISBw7lWDGmKtUPS4SQU2Z2WrBOyswV6xeoWUwHGsId'
});


//Post request, which seeks to get info from a specificied resource (tomsharon.tumblr.com), determine whether that info (my blog posts) meets a certain condition (check whether posts are more than week old). If less than a week old, push them into the latestPosts array.
client.posts('tomsharon.tumblr.com', function(err, blog){
	// console.log(blog)
	var oneWeekAgo = new Date();
	oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
	var latestPosts = [];
	for(var i = 0; i < blog.posts; i++) {
  		if(oneWeekAgo > blog.posts[i].date) {
  			latestPosts.push(blog.posts[i].url)
  		}
  	}
  	parsedContacts.forEach(function(contact){
		firstName = contact['firstName'],
		numMonthsSinceContact = contact['numMonthsSinceContact']
		//^^get relevant values for each contact

		var customizedTemplate = ejs.render(emailTemplate, { 
		firstName: firstName,  
    	numMonthsSinceContact: numMonthsSinceContact,
    	latestPosts: latestPosts
    	//^^populate an email for each contact. Or, in other words, create a custom email for each contact.
  		});

		// console.log(customizedTemplate); 

		sendEmail(contact['firstName'], contact['emailAddress'], "Tom Sharon", "tsharon@wesleyan.edu", "How's It Going?", customizedTemplate)
		//send email to each contact!
	})
})






//Given to us, as is:
function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
    var message = {
        "html": message_html,
        "subject": subject,
        "from_email": from_email,
        "from_name": from_name,
        "to": [{
                "email": to_email,
                "name": to_name
            }],
        "important": false,
        "track_opens": true,    
        "auto_html": false,
        "preserve_recipients": true,
        "merge": false,
        "tags": [
            "Fullstack_Tumblrmailer_Workshop"
        ]    
    };
    var async = false;
    var ip_pool = "Main Pool";
    mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
        // console.log(message);
        // console.log(result);   
    }, function(e) {
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
    });
 }
