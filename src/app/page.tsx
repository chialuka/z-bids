import { getSharePointFiles } from "../server/modules/sharepoint";
import GetSharePointFiles from "./rfp/SharePointFiles";

export default async function Home() {
	const sharePointFiles = await getSharePointFiles();

	return (
		<main className="m-10">
			<h1 className="font-bold text-3xl text-center py-10">Z BIDS</h1>
			<GetSharePointFiles files={sharePointFiles} />
		</main>
	);
}
