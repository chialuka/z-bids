export const syncFileParsing =  async ({ documentUrl }: { documentUrl: string }) => {
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

export const parseFileAsync = async ({ documentUrl, fileName }: { documentUrl: string, fileName: string }) => {
  console.log("Parsing file with reducto");
	const file = await fetch("https://platform.reducto.ai/parse_async", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
			Authorization: `Bearer ${process.env.REDUCTO_API_KEY}`,
		},
		body: JSON.stringify({
			document_url: documentUrl,
      webhook: {
        mode: "svix",
        metadata: {
          fileName,
        }
      }
		}),
	});

  console.log("File parsed async with reducto");
  const data = await file.json();
  console.log(data, "data from reducto");
	return data;
};

export const getJobDetails = async ({ jobId }: { jobId: string }) => {
  const jobDetails = await fetch(`https://platform.reducto.ai/job/${jobId}`, {
    headers: {
      Authorization: `Bearer ${process.env.REDUCTO_API_KEY}`,
    },
  });

  return await jobDetails.json();
};
