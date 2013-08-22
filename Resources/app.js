var menu = Ti.UI.createMenu();

var FileMenu = menu.addItem('File');
var openCSVMenuItem = FileMenu.addItem('Open CSV File...', function () {
	loadCSVFile();
});
var settingsMenuItem = FileMenu.addItem('Settings', function () {
	openSettings();
});

 $(function() {
   $('#settingsButton').tipsy({gravity: 'n', trigger: 'manual', opacity: 1});
   forceSettingsIfNotProvided();
 });

var testMode = false;

if(testMode == true) {
	//var submissionUrl = "http://localhost:5665/LTS/LTSPostServlet";
	var submissionUrl = "https://secure.dev.gateway.gov.uk/submission";
	var pollUrl = "https://secure.dev.gateway.gov.uk/poll";
} else {
	var submissionUrl = "https://secure.gateway.gov.uk/submission";
	var pollUrl = "https://secure.gateway.gov.uk/poll";	
}

//Add menu to the current window
var currentWindow = Ti.UI.getCurrentWindow();
currentWindow.setMenu(menu);
currentWindow.setMinWidth(600);
currentWindow.setTitle("Gift-Aid-O-Matic™");

$('#loadFileButton').click(function() {
	loadCSVFile();
});


function loadCSVFile() {
	var fileName = loadCSV();
	if (fileName) {
		$('#index').hide();
		$('#preview').hide();
		$('#success').hide();
		$('#errors').hide();
		$('#loading').show();
		var importer = Ti.Worker.createWorker('importer.js');
		importer.postMessage({fileName: fileName});
		importer.onmessage = function(event) {
			if(event.message.complete == true) {
				showPreview();
			} else {
				updateIndicator(event.message.progress);
			}
		}
		importer.start();
	}
}

function showPreview() {
	var db = Ti.Database.open('gift_aid_db');
	previewRows = db.execute("SELECT * FROM Rows");
	$('#previewTableBody').empty();
	while (previewRows.isValidRow()) {
		$('#previewTableBody').append("<tr><td>"+previewRows.fieldByName('firstName')+"</td><td>"+previewRows.fieldByName('lastName')+"</td><td>"+previewRows.fieldByName('houseNumber')+"</td><td>"+previewRows.fieldByName('postCode')+"</td><td>"+previewRows.fieldByName('amount')+"</td><td>"+previewRows.fieldByName('date')+"</td></tr>");
    	previewRows.next();    
	}
	$('#loading').hide();
	$('#preview').show();
}

$('#addAdjustmentButton').click(function() {
	$('#adjustment').show();
	$('#addAdjustmentButton').hide();
});

$('#removeAdjustmentButton').click(function() {
	$('#adjustmentAmount').val('');
	$('#adjustmentExplanation').val('');
	$('#adjustment').hide();
	$('#addAdjustmentButton').show();
});

$('#saveSubmissionButton').click(function() {
	finalSubmission = createSubmission();
	saveOutput(finalSubmission, 'submission.xml');
});

$('#submitButton').click(function() {
	var password = 	prompt("Please enter your Charities Online password");
	if(password != null) {
		$('#preview').hide();
		finalSubmission = createSubmission(hash_password(password));
		$('#submitting').show();
		var db = Ti.Database.open('gift_aid_db');
		db.execute("DELETE FROM Rows");
		submitXML(finalSubmission, submissionUrl);
	}
});

function submitXML(data, url) {
	Ti.API.info("POSTing");
	var jqxhr = $.ajax({
		url: url, 
		type: 'POST',
		data: data,
		contentType: 'application/x-binary',
		dataType: 'xml'
	})
	.done(function(data, status) { 
		Ti.API.info(data);
		Ti.API.info((new XMLSerializer()).serializeToString(data));
		var responseType = $(data).find("MessageDetails Qualifier").first().text();
		if(responseType == "response") {
			handleSubmissionSuccess(data);
			sendDeleteRequest(data);
			// success
		} else if(responseType == "acknowledgement") {
			// requires polling
			pollForResponse(data);
		} else {
			// error
			handleSubmissionError(data);
			sendDeleteRequest(data);
		}
	})
	.fail(function(jqxhr, status, error) { 
		Ti.API.info(error);
		alert(status); 
		alert("error");
	});
}

function sendDeleteRequest(data) {
	data = buildDeleteRequest(data);
	var jqxhr = $.ajax({
		url: submissionUrl, 
		type: 'POST',
		data: data,
		contentType: 'application/x-binary',
		dataType: 'xml'
	});

}

function handleSubmissionSuccess(data) {
	Ti.API.info(data);
	$('#submitting').hide();
	showSuccessMessage(data);
}

function pollForResponse(data) {
	setTimeout(function() {
		var pollRequest = buildPollRequest(data);
		submitXML(pollRequest, pollUrl);
	},3000);
}

function handleSubmissionError(data) {
	var errors = [];
	var matches = null;
	$(data).find("GovTalkErrors Error, ErrorResponse Error").each(function() {
		var location = "";
		if($(this).find("Location").text() > '') {
			matches = /r68\:GAD\[(\d+)\]/.exec($(this).find("Location").text());
			if(matches != null && matches[1] != null) {
				location = "row " + matches[1];
			} else {
				location = $(this).find("Location").text();
			}
		} else {
			var location = "";
		}
		errors.push($(this).find("Number").text() + ': ' + $(this).find("Text").text() + ($(this).find("Location").text() > '' ? '<br /><small>@&nbsp;' + location + '</small>' : ''));
	});
	showErrorMessage(errors, data);
}

function showErrorMessage(errors, data) {
	var errorResponse = (new XMLSerializer()).serializeToString(data);
	$('#submitting').hide();
	$('#errors #errorList').empty();
	$('#errorResponse').val(errorResponse);
	$.each(errors, function(index, value) {
		$('<li>' + value + '</li>').appendTo('#errors #errorList');
	});
	$('#errors').show();
}

function showSuccessMessage(data) {
	var receipt = (new XMLSerializer()).serializeToString(data);
	$('#submitting').hide();
	$('#success').show();
	$('#receipt').val(receipt);
}

$('#saveReceiptButton').click(function() {
	saveOutput($('#receipt').val(), 'receipt.xml');
});

$('#saveErrorResponseButton').click(function() {
	saveOutput($('#errorResponse').val(), 'errors.xml');
});

$('#settingsButton').click(function() {
	openSettings();
});

function openSettings() {
	var settingsWindow = Ti.UI.createWindow({
		url: "app://settings.html",
		title: 'Settings',
		width: 700,
		height: 500,
		minWidth: 700,
		maxWidth: 700
	});
	settingsWindow.on('closed', function() {
		forceSettingsIfNotProvided();
	});

	settingsWindow.open();
}

function forceSettingsIfNotProvided() {
	var file = Ti.Filesystem.getFile(Ti.API.application.dataPath, "user.properties");
	var userProperties;
	if(file.exists()) {
    	userProperties = Ti.App.loadProperties(file.nativePath());
    	if(userProperties.getString('senderID') > '') {
    		hideSettingsPrompt();
    	} else {
    		showSettingsPrompt();
    	}
	} else {
		showSettingsPrompt();
	}
	file = null;
}

function hideSettingsPrompt() {
   $('#loadFileButton').show();
   $('#settingsButton').tipsy("hide");
   $('#openHelp').show();
}

function showSettingsPrompt() {
   $('#loadFileButton').hide();
   $('#settingsButton').tipsy("show");
   $('#openHelp').hide();

}


function updateIndicator(progress) {
	var label = progress.toString() + " record" + (progress > 1 ? "s" : "") + " loaded";
	$('#progress').html(label);
}

function loadCSV() {
	var currentWindow = Ti.UI.getCurrentWindow(); 
	var fileName;
	currentWindow.openFileChooserDialog( function(fileResponse) { 
		fileName = fileResponse[0];
	}); 
	return fileName;
}

function createSubmission(password) {
	var db = Ti.Database.open('gift_aid_db');
	var submissionRows = db.execute("SELECT * FROM Rows");
	var earliestDate = db.execute("SELECT * FROM Rows ORDER BY date ASC LIMIT 1").fieldByName('date');
	var latestDate = db.execute("SELECT * FROM Rows ORDER BY date DESC LIMIT 1").fieldByName('date');
	var submissionRowString = "";
	while (submissionRows.isValidRow()) {
		submissionRowString += submissionRow(submissionRows.fieldByName('firstName'),submissionRows.fieldByName('lastName'), submissionRows.fieldByName('houseNumber'), submissionRows.fieldByName('postCode'), submissionRows.fieldByName('amount'), submissionRows.fieldByName('date'));
    	submissionRows.next();    
	}
	var file = Ti.Filesystem.getFile(Ti.API.application.dataPath, "user.properties");
	if(file.exists()) {
		var userProperties = Ti.App.loadProperties(file.nativePath());
	} else {
		var userProperties = Ti.App.createProperties();
	}
	var submissionForIrmark = submissionBodyTop(userProperties, latestDate);
	submissionForIrmark += submissionRowString;
	submissionForIrmark += submissionBodyBottom(earliestDate, $('#adjustmentAmount').val(), $('#adjustmentExplanation').val());
	var irmark = calculate_irmark(submissionForIrmark);
	var finalSubmission = submissionHeader(userProperties, password);
	finalSubmission += submissionBodyTop(userProperties, latestDate, irmark);
	finalSubmission += submissionRowString;
	finalSubmission += submissionBodyBottom(earliestDate, $('#adjustmentAmount').val(), $('#adjustmentExplanation').val());
	finalSubmission += submissionFooter();
	return finalSubmission;
}

function saveOutput(output, filename) {
	var currentWindow = Ti.UI.getCurrentWindow(); 
	currentWindow.openSaveAsDialog( function(fileResponse) { 
		Ti.API.info(fileResponse);
		var fileStream = Ti.Filesystem.getFileStream(fileResponse[0]); 
		if (fileStream.open(Ti.Filesystem.MODE_WRITE)) {
			Ti.API.info(output);
			fileStream.write(output);
			fileStream.close();
		}
	}, {'defaultFile': filename}); 
	
}



