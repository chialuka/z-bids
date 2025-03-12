// import { spfi } from "@pnp/sp";
// import { SPDefault } from "@pnp/nodejs";
import "@pnp/sp/webs";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import { ClientSecretCredential } from "@azure/identity";
import { Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import { listAllFiles } from "./uploadThing";

export const getSharePointFiles = async () => {
	try {
		if (
			!process.env.TENANT_ID ||
			!process.env.CLIENT_ID ||
			!process.env.CLIENT_SECRET
		) {
			throw new Error(
				"Missing environment variables. Please check your .env file."
			);
		}
		// Authentication setup
		const tenantId = process.env.TENANT_ID;
		const clientId = process.env.CLIENT_ID;
		const clientSecret = process.env.CLIENT_SECRET;
		// const siteUrl = "https://netorgft17745017.sharepoint.com";
		// const scope = "https://netorgft17745017.sharepoint.com/.default";

		// Create a ClientSecretCredential instance
		const credential = new ClientSecretCredential(
			tenantId,
			clientId,
			clientSecret
		);

		// Initialize the SPFI object with SPDefault and the credential
		// const sp = spfi().using(
		// 	SPDefault({
		// 		baseUrl: scope,
		// 		msal: {
		// 			config: {
		// 				auth: {
		// 					clientId,
		// 					authority: `https://login.microsoftonline.com/${tenantId}`,
		// 					clientSecret: clientSecret,
		// 				},
		// 			},
		// 			scopes: [`${siteUrl}/.default`],
		// 		},
		// 	})
		// );

		// const folders = await sp.web.folders();
		// console.log("Files:", folders);
		// return folders;
		// Create authentication provider for Graph
		const authProvider = new TokenCredentialAuthenticationProvider(credential, {
			scopes: ["https://graph.microsoft.com/.default"],
		});

		// Initialize Graph client
		const graphClient = Client.initWithMiddleware({
			authProvider,
		});

		// Get site ID by server-relative URL
		const siteResponse = await graphClient
			.api(`/sites/netorgft17745017.sharepoint.com:/sites/RFP`)
			.get();

		console.log("Site ID:", siteResponse.id);

		// Get drive (document library)
		const drivesResponse = await graphClient
			.api(`/sites/${siteResponse.id}/drives`)
			.get();

		const driveId = drivesResponse.value[0].id; // usually the first one is the Documents library

		// Get files from root of the drive
		const filesResponse = await graphClient
			.api(`/sites/${siteResponse.id}/drives/${driveId}/root/children`)
			.get();

		const allFiles = await listAllFiles();
    console.log({ allFiles });
		console.log("Files:", filesResponse.value);
		return filesResponse.value;
	} catch (error) {
		console.error("Error fetching lists:", error);
	}
};
