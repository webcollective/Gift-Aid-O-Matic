$('#saveSettingsButton').click(function() {
	saveSettings();
	Ti.UI.getCurrentWindow().close();
});

function saveSettings() {
	var file = Ti.Filesystem.getFile(Ti.API.application.dataPath, "user.properties");
	var userProperties = loadOrCreateProperties(file);
	userProperties.setString("senderID", $('#settingsSenderID').val());
	userProperties.setString("hmrcRef", $('#settingsHmrcRef').val());
	userProperties.setString("orgName", $('#settingsOrgName').val());
	userProperties.setString("regulator", $('#settingsRegulator').val());
	userProperties.setString("regNum", $('#settingsRegNum').val());
	userProperties.setString("settingsAuthOfficialFirstName", $('#settingsAuthOfficialFirstName').val());
	userProperties.setString("settingsAuthOfficialLastName", $('#settingsAuthOfficialLastName').val());
	userProperties.setString("authOfficialPostcode", $('#settingsAuthOfficialPostcode').val());
	userProperties.setString("authOfficialPhone", $('#settingsAuthOfficialPhone').val());
	//userProperties.setString("previewRows", $("input[type='radio'][name='previewRows']:checked").val());
	userProperties.saveTo(file.nativePath());

	//null out file object as pointer not used anymore
	file = null;
}

function loadSettings() {
	var file = Ti.Filesystem.getFile(Ti.API.application.dataPath, "user.properties");
	var userProperties = loadOrCreateProperties(file);
	$('#settingsSenderID').val(userProperties.getString("senderID"));
	$('#settingsHmrcRef').val(userProperties.getString("hmrcRef"));
	$('#settingsOrgName').val(userProperties.getString("orgName"));
	$('#settingsRegulator').val(userProperties.getString("regulator"));
	$('#settingsRegNum').val(userProperties.getString("regNum"));
	$('#settingsAuthOfficialFirstName').val(userProperties.getString("settingsAuthOfficialFirstName"));
	$('#settingsAuthOfficialLastName').val(userProperties.getString("settingsAuthOfficialLastName"));
	$('#settingsAuthOfficialPostcode').val(userProperties.getString("authOfficialPostcode"));
	$('#settingsAuthOfficialPhone').val(userProperties.getString("authOfficialPhone"));
	//$('#settingsPreviewRowsAll').prop('checked',true);	
	//if(userProperties.getString("previewRows") == "1000") {
	//	$('#settingsPreviewRows1000').prop('checked',true);	
	//}
	file = null;
}

loadSettings();

function loadOrCreateProperties(file) {
	var userProperties;

	//if file exists, then load properties.
	if(file.exists()) {
    	userProperties = Ti.App.loadProperties(file.nativePath());
	} else {
		//create new set of properties if file doesn't exist
    	userProperties = Ti.App.createProperties();
	}
	return userProperties;

}