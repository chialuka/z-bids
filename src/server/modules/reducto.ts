// import axios from "axios";
import reducto from '@api/reducto';


export const parseFile = async ({ documentUrl }: { documentUrl: string }) => {
	console.log(process.env.REDUCTO_API_KEY, "the reducto api key", documentUrl);
  if (!process.env.REDUCTO_API_KEY) {
    throw new Error('No reducto api key found');
  }
	// const file = await axios({
	// 	url: "https://platform.reducto.ai/parse",
	// 	method: "POST",
	// 	headers: {
	// 		"Content-Type": "application/json",
	// 		Accept: "application/json",
	// 		Authorization: `Bearer ${process.env.REDUCTO_API_KEY}`,
	// 	},
	// 	data: {
	// 		document_url:
	// 			"https://pa6rt2x38u.ufs.sh/f/4o4hdZi2cLBoNyUss4SEBa4kdGCJl1UK89s5XR0tASPiLoOm",
	// 	},
	// });
  reducto.auth(process.env.REDUCTO_API_KEY);
  const file = await reducto.parse_parse_post({
    document_url: 'https://pa6rt2x38u.ufs.sh/f/4o4hdZi2cLBoOq7FncWuLoSUAvKGdDeCZzxmIb9WT3kFJspQ'
  })
	console.log({ file });
	return file;
};
