import axios from "axios";

export const parseFile = async ({ documentUrl }: { documentUrl: string }) => {
	console.log(process.env.REDUCTO_API_KEY, "the reducto api key", documentUrl);
	const file = await axios({
		url: "https://platform.reducto.ai/parse",
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
			Authorization: `Bearer ${process.env.REDUCTO_API_KEY}`,
		},
		data: {
			document_url: documentUrl,
		},
	});

	console.log({ file });
	return file;
};
