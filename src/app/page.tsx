import { getLists } from "./modules/sharepoint";

type File = {
	name: string;
	webUrl: string;
	id: string;
	createdBy: {
		user: {
			displayName: string;
			email: string;
			id: string;
		};
	};
	createdDateTime: string;
};

export default async function Home() {
	console.log("Getting lists");
	const files = await getLists();
	console.log({ files });
	return (
		<div>
			<h1>RFP</h1>
			{files.length ? (
				<table>
					<thead>
						<tr>
							<th>Name</th>
							<th>Created By</th>
							<th>Created Date</th>
						</tr>
					</thead>
					<tbody>
						{files.map((file: File) => (
							<tr key={file.id}>
								<td><a href={file.webUrl}>{file.name}</a></td>
								<td>{file.createdBy.user.displayName}</td>
								<td>{new Date(file.createdDateTime).toLocaleDateString()}</td>
							</tr>
						))}
					</tbody>
				</table>
			) : (
				<p>No files found.</p>
			)}
		</div>
	);
}
