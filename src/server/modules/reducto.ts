export const parseFile = async ({ documentUrl }: { documentUrl: string }) => {
  console.log("Parsing file with reducto");
	const file = await fetch("https://platform.reducto.ai/parse", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
			Authorization: `Bearer ${process.env.REDUCTO_API_KEY}`,
		},
		body: JSON.stringify({
			document_url: documentUrl,
		}),
	});

  console.log("File parsed with reducto");
  const data = await file.json();
	return data;
};
