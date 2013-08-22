function submissionHeader(userProperties, password) {
  if(testMode == true) {
  	var hmrcRef = "AB12345";
  	var senderID = "323412300001";
  } else {
  	var hmrcRef = userProperties.getString("hmrcRef");
  	var senderID = userProperties.getString("senderID");
  }

  return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n\
<GovTalkMessage xmlns=\"http://www.govtalk.gov.uk/CM/envelope\">\n\
	<EnvelopeVersion>2.0</EnvelopeVersion>\n\
	<Header>\n\
		<MessageDetails>\n\
			<Class>HMRC-CHAR-CLM</Class>\n\
			<Qualifier>request</Qualifier>\n\
			<Function>submit</Function>\n\
			<CorrelationID/>\n\
			<Transformation>XML</Transformation>\n" +
(testMode == true ? "			<GatewayTest>1</GatewayTest>\n" : "") +
"		</MessageDetails>\n\
		<SenderDetails>\n\
			<IDAuthentication>\n\
				<SenderID>" + senderID + "</SenderID>\n\
				<Authentication>\n\
					<Method>MD5</Method>\n\
					<Role>principal</Role>\n\
					<Value>" + password + "</Value>\n\
				</Authentication>\n\
			</IDAuthentication>\n\
		</SenderDetails>\n\
	</Header>\n\
	<GovTalkDetails>\n\
		<Keys>\n\
			<Key Type=\"CHARID\">" + hmrcRef + "</Key>\n\
		</Keys>\n\
		<TargetDetails>\n\
			<Organisation>IR</Organisation>\n\
		</TargetDetails>\n\
		<ChannelRouting>\n\
			<Channel>\n\
				<URI>7044</URI>\n\
				<Product>Gift-Aid-O-Matic</Product>\n\
				<Version>1.0</Version>\n\
			</Channel>\n\
		</ChannelRouting>\n\
	</GovTalkDetails>\n\
";
}

function submissionBodyTop(userProperties, latestDate, irmark) {
  if(testMode == true) {
 	var hmrcRef = "AB12345";
  } else {
  	var hmrcRef = userProperties.getString("hmrcRef");
  }
	
  if (userProperties.getString("regulator") == "none") { 
 	var regulatorString = "";
	} else {
		var regulatorString = "<Regulator>\n\
						<RegName>" + userProperties.getString("regulator") + "</RegName>\n\
						<RegNo>" + userProperties.getString("regNum") + "</RegNo>\n\
					</Regulator>\n\
					"
	}

  return (irmark != null ? "	" : "") + "<Body" + (irmark == null ? " xmlns=\"http://www.govtalk.gov.uk/CM/envelope\"" : "") + ">\n\
		<IRenvelope xmlns=\"http://www.govtalk.gov.uk/taxation/charities/r68/1\">\n\
			<IRheader>\n\
				<Keys>\n\
					<Key Type=\"CHARID\">" + hmrcRef + "</Key>\n\
				</Keys>\n\
				<PeriodEnd>" + latestDate + "</PeriodEnd>\n\
				<DefaultCurrency>GBP</DefaultCurrency>\n\
				" + (irmark != null ? "<IRmark Type=\"generic\">" + irmark + "</IRmark>" : "")+ "\n\
				<Sender>Individual</Sender>\n\
			</IRheader>\n\
			<R68>\n\
				<AuthOfficial>\n\
					<OffName>\n\
						<Fore>" + userProperties.getString("settingsAuthOfficialFirstName") + "</Fore>\n\
						<Sur>" + userProperties.getString("settingsAuthOfficialLastName") + "</Sur>\n\
					</OffName>\n\
					<OffID>\n\
						<Postcode>" + userProperties.getString("authOfficialPostcode") + "</Postcode>\n\
					</OffID>\n\
					<Phone>" + userProperties.getString("authOfficialPhone") + "</Phone>\n\
				</AuthOfficial>\n\
				<Declaration>yes</Declaration>\n\
				<Claim>\n\
					<OrgName>" + userProperties.getString("orgName") + "</OrgName>\n\
					<HMRCref>" + hmrcRef + "</HMRCref>\n\
					" + regulatorString + "<Repayment>\n\
";
}


function submissionRow(forename, surname, houseNumber, postcode, amount, date) {
  return "						<GAD>\n\
							<Donor>\n\
								<Fore>" + forename + "</Fore>\n\
								<Sur>" + surname + "</Sur>\n\
								<House>" + houseNumber + "</House>\n\
								<Postcode>" + postcode + "</Postcode>\n\
							</Donor>\n\
							<Date>" + date + "</Date>\n\
							<Total>" + amount + "</Total>\n\
						</GAD>\n\
";
}


function submissionBodyBottom(earliestDate, adjustment, adjustmentExplanation) {
	if(adjustment > '') {
		var adjustmentString = "	<Adjustment>" + adjustment + "</Adjustment>\n\
					";
		var adjustmentExplanationString = "	<OtherInfo>" + adjustmentExplanation + "</OtherInfo>\n\
				";
	} else {
		var adjustmentString = "";
		var adjustmentExplanationString = "";
	}
  // Use quotes here because we can't have a newline at the end when generating IRMark
  return "						<EarliestGAdate>" + earliestDate + "</EarliestGAdate>\n\
  					" + adjustmentString + "</Repayment>\n\
				" + adjustmentExplanationString + "</Claim>\n\
			</R68>\n\
		</IRenvelope>\n\
	</Body>";
}


function submissionFooter() {
	return "\n</GovTalkMessage>\n";
}

function buildPollRequest(data) {
	var correlationID = $(data).find("MessageDetails CorrelationID").first().text();
	return "<?xml version=\"1.0\"?>\n\
<GovTalkMessage xmlns=\"http://www.govtalk.gov.uk/CM/envelope\">\n\
	<EnvelopeVersion>2.0</EnvelopeVersion>\n\
	<Header>\n\
		<MessageDetails>\n\
			<Class>HMRC-CHAR-CLM</Class>\n\
			<Qualifier>poll</Qualifier>\n\
			<Function>submit</Function>\n\
			<CorrelationID>" + correlationID + "</CorrelationID>\n\
			<Transformation>XML</Transformation>\n\
		</MessageDetails>\n\
		<SenderDetails/>\n\
	</Header>\n\
	<GovTalkDetails>\n\
		<Keys/>\n\
	</GovTalkDetails>\n\
	<Body/>\n\
</GovTalkMessage>";
}

function buildDeleteRequest(data) {
	var correlationID = $(data).find("MessageDetails CorrelationID").first().text();
	return "<?xml version=\"1.0\"?>\n\
<GovTalkMessage xmlns=\"http://www.govtalk.gov.uk/CM/envelope\">\n\
	<EnvelopeVersion>2.0</EnvelopeVersion>\n\
	<Header>\n\
		<MessageDetails>\n\
			<Class>MOSWTSC2</Class>\n\
			<Qualifier>request</Qualifier>\n\
			<Function>delete</Function>\n\
			<CorrelationID>" + correlationID + "</CorrelationID>\n\
			<Transformation>XML</Transformation>\n\
			<GatewayTimestamp/>\n\
		</MessageDetails>\n\
		<SenderDetails/>\n\
	</Header>\n\
	<GovTalkDetails>\n\
		<Keys/>\n\
	</GovTalkDetails>\n\
	<Body>\n\
	</Body>\n\
</GovTalkMessage>";
}